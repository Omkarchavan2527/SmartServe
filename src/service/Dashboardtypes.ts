// ─── dashboardTypes.ts ────────────────────────────────────────────────────────
export const BASE = "https://smartserve-backend-6dt2.onrender.com/api/v1";

export type Page = "dashboard" | "appointments" | "profile" | "reviews" | "earnings" | "settings";

export interface DashboardProps {
  accessToken:     string;
  refreshToken:    string;
  userName:        string;
  userEmail:       string;
  onLogout:        () => void;
  onTokenRefresh?: (data: { accessToken: string; refreshToken: string; name: string; email: string; role: "provider" | "user" }) => void;
}

export interface ProviderProfile {
  id:                  number;
  user_id:             number;
  service_name:        string;
  service_category:    string;
  bio:                 string;
  experience_years:    number;
  base_price_per_hour: number;
  service_areas:       string;
  skills:              string;
  available_days:      string;
  work_start_time:     string;
  work_end_time:       string;
  is_available:        boolean;
  avg_rating:          number;
  total_reviews:       number;
  total_jobs:          number;
  verification_status: string;
  full_name:           string;
  email:               string;
  phone:               string;
  city:                string;
}

export interface Appointment {
  id:              number;
  customer_id:     number;
  provider_id:     number;
  service_name:    string;
  description:     string;
  location:        string;
  area:            string;
  scheduled_date:  string;
  scheduled_start: string;
  scheduled_end:   string;
  agreed_price:    number;
  status:          string;
  customer_name:   string;
  rejection_note:  string | null;
  completion_note: string | null;
  created_at:      string;
  accepted_at:     string | null;
  completed_at:    string | null;
}

export interface Review {
  id:            number;
  rating:        number;
  comment:       string;
  reviewer_name: string;
  created_at:    string;
}

// ─── module-level token store for auto-refresh ───────────────────────────────
export let _refreshTokenStore = "";
export let _onTokenRefreshCb: ((tokens: { accessToken: string; refreshToken: string }) => void) | null = null;

export function setRefreshStore(token: string, cb: typeof _onTokenRefreshCb) {
  _refreshTokenStore = token;
  _onTokenRefreshCb  = cb;
}

export async function api<T>(path: string, token: string, options: RequestInit = {}): Promise<T> {
  const doFetch = (t: string) =>
    fetch(`${BASE}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization:  `Bearer ${t}`,
        ...(options.headers as Record<string, string>),
      },
    });

  let res = await doFetch(token);

  if (res.status === 401 && _refreshTokenStore) {
    const rr = await fetch(`${BASE}/auth/refresh`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ refreshToken: _refreshTokenStore }),
    });
    if (rr.ok) {
      const { accessToken: newAccess, refreshToken: newRefresh } = await rr.json() as { accessToken: string; refreshToken: string };
      _refreshTokenStore = newRefresh;
      _onTokenRefreshCb?.({ accessToken: newAccess, refreshToken: newRefresh });
      res = await doFetch(newAccess);
    }
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText })) as { error: string };
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  if (res.status === 204) return {} as T;
  return res.json() as Promise<T>;
}