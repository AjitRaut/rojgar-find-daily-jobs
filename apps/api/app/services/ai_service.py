"""AI helpers: OpenAI when configured, deterministic fallbacks otherwise."""

from __future__ import annotations

import hashlib
import json
import logging
import re
import time
from collections.abc import Callable
from typing import Any

from sqlalchemy.orm import Session, joinedload

from app.core.config import settings
from app.models.entities import Skill, VerificationStatus, WorkerProfile, WorkerSkill

logger = logging.getLogger(__name__)

try:
    from openai import OpenAI
except ImportError:  # pragma: no cover
    OpenAI = None  # type: ignore[misc, assignment]


class SimpleRateLimiter:
    """In-process rate limit for AI endpoints (MVP)."""

    def __init__(self, max_calls: int = 20, window_seconds: int = 60) -> None:
        self.max_calls = max_calls
        self.window_seconds = window_seconds
        self._hits: dict[str, list[float]] = {}

    def check(self, key: str) -> bool:
        now = time.monotonic()
        window_start = now - self.window_seconds
        hits = [t for t in self._hits.get(key, []) if t > window_start]
        if len(hits) >= self.max_calls:
            self._hits[key] = hits
            return False
        hits.append(now)
        self._hits[key] = hits
        return True


ai_rate_limiter = SimpleRateLimiter(max_calls=15, window_seconds=60)


def _client() -> Any | None:
    if not settings.openai_api_key or OpenAI is None:
        return None
    return OpenAI(api_key=settings.openai_api_key)


class AIService:
    def get_chat_reply(self, message: str, user_id: int | None = None) -> str:
        msg = message.strip()
        client = _client()
        if client:
            try:
                resp = client.chat.completions.create(
                    model="gpt-4o-mini",
                    messages=[
                        {
                            "role": "system",
                            "content": (
                                "You are Rojgar Find – Daily Jobs assistant for hiring electricians, "
                                "plumbers, painters, and local workers in India. "
                                "Give concise, practical advice. No PII. English or Hinglish."
                            ),
                        },
                        {"role": "user", "content": msg},
                    ],
                    max_tokens=400,
                    temperature=0.4,
                )
                return (resp.choices[0].message.content or "").strip()
            except Exception as e:  # pragma: no cover
                logger.warning("OpenAI chat failed: %s", e)
        return self._chat_fallback(msg)

    def _chat_fallback(self, message: str) -> str:
        m = message.lower()
        if "plumb" in m or "pipe" in m or "tap" in m:
            return (
                "For plumbing, mention leak location, pipe type if known, "
                "and whether water supply should be shut. Add pincode for local matching."
            )
        if "electric" in m or "wire" in m or "switch" in m:
            return (
                "For electrical work, note single-phase/three-phase if known, "
                "safety urgency, and whether fittings are accessible."
            )
        if "paint" in m:
            return "For painting, share room size, interior/exterior, and timeline."
        return (
            "I can help you describe the job clearly (scope, location, budget) "
            "and choose the right worker category."
        )

    def recommend_workers(
        self,
        db: Session,
        job_text: str,
        city: str | None,
        pincode: str | None,
        skill_slug: str | None = None,
    ) -> list[dict[str, Any]]:
        profiles = (
            db.query(WorkerProfile)
            .options(joinedload(WorkerProfile.user))
            .filter(WorkerProfile.verification_status == VerificationStatus.verified)
            .all()
        )
        scored: list[tuple[WorkerProfile, float, str]] = []
        for wp in profiles:
            score, reason = self._deterministic_score(
                db, wp, job_text, city, pincode, skill_slug
            )
            scored.append((wp, score, reason))
        scored.sort(key=lambda x: x[1], reverse=True)
        top = scored[:10]
        explanations = self._llm_rank_explanations(job_text, top)
        out = []
        for i, (wp, score, reason) in enumerate(top):
            uid = wp.user_id
            expl = explanations[i] if i < len(explanations) else reason
            dn: str | None
            if wp.display_name:
                dn = wp.display_name
            elif wp.user is not None:
                dn = wp.user.full_name
            else:
                dn = None
            out.append(
                {
                    "worker_profile_id": wp.id,
                    "user_id": uid,
                    "score": round(score, 3),
                    "explanation": expl,
                    "display_name": dn,
                    "base_city": wp.base_city,
                    "rating_avg": wp.rating_avg,
                }
            )
        return out

    def _deterministic_score(
        self,
        db: Session,
        wp: WorkerProfile,
        job_text: str,
        city: str | None,
        pincode: str | None,
        skill_slug: str | None,
    ) -> tuple[float, str]:
        score = 0.0
        reasons: list[str] = []
        low = job_text.lower()
        if city and wp.base_city and city.lower() in (wp.base_city or "").lower():
            score += 2.0
            reasons.append("same city")
        if pincode and wp.base_pincode == pincode:
            score += 3.0
            reasons.append("pincode match")

        if skill_slug:
            sk = db.query(Skill).filter(Skill.slug == skill_slug).first()
            if sk:
                has = (
                    db.query(WorkerSkill)
                    .filter(
                        WorkerSkill.worker_profile_id == wp.id,
                        WorkerSkill.skill_id == sk.id,
                    )
                    .first()
                )
                if has:
                    score += 4.0
                    reasons.append(f"has skill {skill_slug}")

        for ws in (
            db.query(WorkerSkill)
            .join(Skill)
            .filter(WorkerSkill.worker_profile_id == wp.id)
            .all()
        ):
            slug = ws.skill.slug
            if slug and (slug.replace("_", " ") in low or slug in low):
                score += 1.5
                reasons.append(f"text mentions {ws.skill.name}")

        score += min(5.0, (wp.rating_avg or 0) * 1.0)
        score += min(3.0, (wp.total_jobs or 0) * 0.05)
        reason = ", ".join(reasons) if reasons else "general fit"
        return score, reason

    def _llm_rank_explanations(
        self,
        job_text: str,
        ranked: list[tuple[WorkerProfile, float, str]],
    ) -> list[str]:
        client = _client()
        if not client or not ranked:
            return [r[2] for r in ranked]
        payload = [
            {
                "worker_profile_id": r[0].id,
                "city": r[0].base_city,
                "rating": r[0].rating_avg,
                "reason": r[2],
            }
            for r in ranked
        ]
        try:
            resp = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {
                        "role": "system",
                        "content": (
                            "Return JSON array of strings, same length as input workers. "
                            "Each string is one short reason (max 25 words) why the worker "
                            "fits the job text. Language: English or Hinglish."
                        ),
                    },
                    {
                        "role": "user",
                        "content": json.dumps(
                            {"job": job_text[:1200], "workers": payload}, ensure_ascii=False
                        ),
                    },
                ],
                max_tokens=500,
                temperature=0.3,
            )
            text = (resp.choices[0].message.content or "").strip()
            parsed = json.loads(text)
            if isinstance(parsed, list) and len(parsed) == len(ranked):
                return [str(x) for x in parsed]
        except Exception as e:  # pragma: no cover
            logger.warning("LLM explanations failed: %s", e)
        return [r[2] for r in ranked]

    def analyze_job_description(self, text: str) -> dict[str, Any]:
        client = _client()
        if client:
            try:
                resp = client.chat.completions.create(
                    model="gpt-4o-mini",
                    messages=[
                        {
                            "role": "system",
                            "content": (
                                'Respond with JSON only: {"skills":[],"risk_flags":[],'
                                '"clarifying_questions":[]} keys arrays of short strings.'
                            ),
                        },
                        {"role": "user", "content": text[:3000]},
                    ],
                    max_tokens=400,
                    temperature=0.2,
                )
                raw = (resp.choices[0].message.content or "").strip()
                m = re.search(r"\{[\s\S]*\}", raw)
                if m:
                    return json.loads(m.group())
            except Exception as e:  # pragma: no cover
                logger.warning("OpenAI analyze failed: %s", e)
        return self._analyze_fallback(text)

    def _analyze_fallback(self, text: str) -> dict[str, Any]:
        t = text.lower()
        skills: list[str] = []
        if any(x in t for x in ("wire", "switch", "fan", "mcb")):
            skills.append("electrician")
        if any(x in t for x in ("pipe", "tap", "drain", "leak")):
            skills.append("plumber")
        if "paint" in t:
            skills.append("painter")
        if not skills:
            skills = ["laborer"]
        risks: list[str] = []
        if "open wire" in t or "spark" in t:
            risks.append("possible electrical hazard")
        qs = [
            "What is the exact location / pincode?",
            "What is your preferred budget range?",
        ]
        return {"skills": skills, "risk_flags": risks, "clarifying_questions": qs}

    def profile_suggestions(self, bio: str, years: int) -> list[str]:
        client = _client()
        if client:
            try:
                resp = client.chat.completions.create(
                    model="gpt-4o-mini",
                    messages=[
                        {
                            "role": "system",
                            "content": "Return JSON array of 3-5 short bullet suggestions to improve a worker profile.",
                        },
                        {
                            "role": "user",
                            "content": json.dumps(
                                {"bio": bio[:2000], "years": years}, ensure_ascii=False
                            ),
                        },
                    ],
                    max_tokens=300,
                    temperature=0.4,
                )
                raw = (resp.choices[0].message.content or "").strip()
                m = re.search(r"\[[\s\S]*\]", raw)
                if m:
                    arr = json.loads(m.group())
                    if isinstance(arr, list):
                        return [str(x) for x in arr][:8]
            except Exception as e:  # pragma: no cover
                logger.warning("OpenAI profile tips failed: %s", e)
        out: list[str] = []
        if len(bio.strip()) < 60:
            out.append(
                "Expand your bio with services offered, areas covered, and years of experience."
            )
        if years < 2:
            out.append("List 2–3 completed job types to build trust with new customers.")
        out.append("Add clear per-day or per-job rates for your main skills.")
        out.append("Complete verification documents when available.")
        return out


def ai_prompt_hash(*parts: str) -> str:
    h = hashlib.sha256()
    for p in parts:
        h.update(p.encode("utf-8", errors="ignore"))
    return h.hexdigest()[:16]


def with_ai_rate_limit(user_id: int, fn: Callable[..., Any], *args: Any, **kwargs: Any) -> Any:
    key = f"u{user_id}"
    if not ai_rate_limiter.check(key):
        from fastapi import HTTPException, status

        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail={"code": "rate_limit", "message": "Too many AI requests. Try shortly."},
        )
    return fn(*args, **kwargs)
