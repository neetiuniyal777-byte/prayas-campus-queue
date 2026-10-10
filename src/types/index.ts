/**
 * Core type definitions for Campus Queue & Token System.
 * Matches PRD Section 10 (Database Design).
 */

export type ServiceStatus = "open" | "paused" | "closed";
export type TokenStatus = "waiting" | "called" | "serving" | "completed" | "skipped" | "no_show" | "cancelled";
export type StaffRole = "staff" | "admin";

export interface Service {
  id: string;
  name: string;
  slug: string;
  prefix: string;
  description: string;
  default_duration_min: number;
  status: ServiceStatus;
  daily_cap: number;
  requires_form: boolean;
  instructions?: string;
  sort_order: number;
  is_active: boolean;
}

export interface Counter {
  id: string;
  label: string;
  is_active: boolean;
}

export interface Token {
  id: string;
  service_id: string;
  service_date: string;
  number: number;
  label: string;
  tuf_id: string;
  student_name: string;
  status: TokenStatus;
  tracking_hash: string;
  counter_id?: string;
  issued_at: string;
  called_at?: string;
  started_at?: string;
  completed_at?: string;
  application_id?: string;
}
