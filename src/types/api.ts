export type Pagination = {
  current_page?: number;
  next_page?: number | null;
  previous_page?: number | null;
  total_pages?: number;
  per_page?: number;
  total_entries?: number;
};

export type ApiListResponse<T> = {
  data: T[];
  pagination?: Pagination | null;
  message?: string;
};

export type ApiItemResponse<T> = {
  data: T;
  message?: string;
};

export type CompanyInfo = {
  id: number;
  name: string;
  slug: string;
  active?: boolean;
  logo_url?: string | null;
};

export type Property = {
  id?: number;
  name?: string | null;
  short_name?: string | null;
  address?: string | null;
  city?: string | null;
};

export type BriefUser = {
  id: number;
  name?: string | null;
  avatar_url?: string | null;
};

export type Staff = {
  id: number;
  name?: string | null;
  email?: string | null;
  mobile_number?: string | null;
  avatar_url?: string | null;
  active?: boolean;
  properties?: Property[];
  company?: CompanyInfo | null;
};

export type AuthPayload = {
  token?: string;
  access_token?: string;
  refresh_token?: string;
  exp?: string;
  access_expires_at?: string;
  refresh_expires_at?: string;
  session_id?: string;
  object?: Staff;
  staff?: Staff;
  message?: string;
};

export type DeviceSession = {
  id: string;
  device_name?: string | null;
  ip_address?: string | null;
  user_agent?: string | null;
  last_used_at?: string | null;
  expires_at?: string | null;
  created_at?: string | null;
  revoked_at?: string | null;
  active?: boolean;
  risk_level?: string | null;
  current?: boolean;
};
