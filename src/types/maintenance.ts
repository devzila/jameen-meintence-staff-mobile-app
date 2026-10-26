import type { BriefUser, Property } from '@/types/api';

/** Mirrors `Maintenance::Request` enum `status` in jameen-api. */
export type RequestStatus =
  | 'requested'
  | 'in_progress'
  | 'cancelled'
  | 'resolved'
  | 'reopen'
  | 'closed'
  | 'draft'
  | 'acknowledged'
  | 'assigned'
  | 'on_hold';

export type RequestPriority = 'low' | 'normal' | 'high' | 'urgent';

export type HoldReason = 'awaiting_resident_response' | 'awaiting_parts' | 'awaiting_vendor_visit';

export type RequestAttachment = {
  url: string;
  name?: string | null;
  content_type?: string | null;
  byte_size?: number | null;
  kind?: 'photo' | 'file';
};

export type Maintainable = {
  id: number;
  name?: string | null;
  unit_no?: string | null;
  building?: { id: number; name?: string | null } | null;
};

export type MaintenanceRequest = {
  id: number;
  request_number?: string | null;
  title: string;
  description?: string | null;
  status: RequestStatus;
  priority?: RequestPriority | null;
  category?: { id: number; name?: string | null } | null;
  available_date?: string | null;
  available_time?: string | null;
  initiation_date?: string | null;
  due_date?: string | null;
  start_date?: string | null;
  completion_date?: string | null;
  resolved_at?: string | null;
  acknowledged_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  raised_via?: string | null;
  hold_reason?: HoldReason | null;
  location_note?: string | null;
  is_common_area?: boolean | null;
  sla_response_due_at?: string | null;
  sla_resolution_due_at?: string | null;
  sla_breached?: boolean | null;
  estimated_cost?: string | number | null;
  actual_cost?: string | number | null;
  is_chargeable_to_resident?: boolean | null;
  reopen_count?: number | null;
  attachment?: RequestAttachment | null;
  assigned_user_id?: number | null;
  assigned_user?: BriefUser | null;
  created_by?: BriefUser | null;
  maintainable_type?: string | null;
  maintainable?: Maintainable | null;
  property?: Property | null;
};

export type RequestComment = {
  id: number;
  comment: string;
  userable_type?: string | null;
  userable?: BriefUser | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type TicketUpdateType = 'comment' | 'status_change' | 'internal_note' | 'vendor_update';

export type TicketUpdate = {
  id: number;
  request_id: number;
  author_type?: string | null;
  author_id?: number | null;
  update_type: TicketUpdateType;
  body?: string | null;
  is_internal?: boolean | null;
  metadata?: { from_state?: string; to_state?: string; event?: string } | null;
  created_at: string;
};

export type RequestAction = 'acknowledge' | 'start' | 'hold' | 'resume' | 'resolve';
