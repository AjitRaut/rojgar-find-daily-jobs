import axios from "axios";
import type { AuthPayload, User } from "@/lib/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export const api = axios.create({
  baseURL: API_URL
});

export function setAuthToken(token: string | null) {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
}

const STORAGE_KEY = "rojgar_find_token";

export function persistToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (token) localStorage.setItem(STORAGE_KEY, token);
  else localStorage.removeItem(STORAGE_KEY);
}

export function readStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(STORAGE_KEY);
}

export async function fetchMe(): Promise<User> {
  const res = await api.get<User>("/auth/me");
  return res.data;
}

export async function loginRequest(email: string, password: string): Promise<AuthPayload> {
  const res = await api.post<AuthPayload>("/auth/login", { email, password });
  return res.data;
}

export async function registerRequest(body: {
  full_name: string;
  email: string;
  password: string;
  role: User["role"];
  city?: string;
  pincode?: string;
}): Promise<AuthPayload> {
  const res = await api.post<AuthPayload>("/auth/register", body);
  return res.data;
}
