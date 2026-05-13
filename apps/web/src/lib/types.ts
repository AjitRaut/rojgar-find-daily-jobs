export type UserRole = "customer" | "worker" | "admin";

export interface User {
  id: number;
  email: string;
  full_name: string;
  role: UserRole;
}

export interface AuthPayload {
  access_token: string;
  token_type: string;
  user: User;
}

export interface Skill {
  id: number;
  slug: string;
  name: string;
  category: string | null;
}

export interface WorkerSkill {
  skill_id: number;
  skill_slug: string;
  skill_name: string;
  rate_amount: number;
  rate_unit: string;
  notes: string | null;
}

export interface WorkerPublic {
  id: number;
  user_id: number;
  display_name: string | null;
  bio: string;
  experience_years: number;
  base_city: string | null;
  base_pincode: string | null;
  rating_avg: number;
  total_jobs: number;
  verification_status: string;
  skills: WorkerSkill[];
}

export type JobStatus =
  | "requested"
  | "accepted"
  | "rejected"
  | "in_progress"
  | "completed"
  | "cancelled";

export interface Job {
  id: number;
  customer_id: number;
  worker_id: number;
  skill_id: number | null;
  title: string;
  description: string;
  status: JobStatus;
  scheduled_at: string | null;
  budget: number;
  location_text: string;
  created_at: string;
  updated_at: string;
}

export interface Complaint {
  id: number;
  reporter_id: number;
  subject_worker_profile_id: number | null;
  subject_job_id: number | null;
  description: string;
  status: string;
  admin_notes: string | null;
  created_at: string;
  resolved_at: string | null;
}
