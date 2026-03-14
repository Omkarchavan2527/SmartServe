import React, { useState, useEffect } from "react";
import { Navigation } from "./components/Navigation";
import { Hero } from "./components/Hero";
import { ServicesSections } from "./components/ServicesSections";
import { HowItWorks } from "./components/HowItWorks";
import { ProviderSection } from "./components/ProviderSection";
import { Testimonials, MOCK_REVIEWS } from "./components/Testimonials";
import { Footer } from "./components/Footer";

const BASE = "https://smartserve-backend-6dt2.onrender.com/api/v1";

// ─── Mobile hook ──────────────────────────────────────────────────────────────
function useIsMobile() {
  const [mob, setMob] = useState(() => typeof window !== "undefined" && window.innerWidth < 768);
  useEffect(() => {
    const h = () => setMob(window.innerWidth < 768);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);
  return mob;
}

// ─── Types ────────────────────────────────────────────────────────────────────
interface Provider {
  id: number; name: string; role: string; rating: number; reviews: number;
  experience: string; price: string; tags: string[]; avatar: string;
  avatarBg: string; badge: string; available: boolean;
}
interface ApiProvider {
  id: number; full_name: string; service_category: string; service_name: string;
  experience_years: number; base_price_per_hour: number; skills: string;
  avg_rating: number; total_reviews: number; is_available: boolean;
  verification_status: string; bio?: string; city?: string;
  service_areas?: string; available_days?: string;
  work_start_time?: string; work_end_time?: string;
}
interface ApiProviderDetail extends ApiProvider { phone?: string; total_jobs?: number; }
interface CustomerAppointment {
  id: number; provider_id: number; service_name: string; location: string;
  area: string; scheduled_date: string; scheduled_start: string;
  agreed_price: number; status: string; provider_name?: string; created_at: string;
}
interface MyReview {
  id: number; rating: number; comment: string; provider_name: string; created_at: string;
}
interface ApiReview {
  id: number; rating: number; comment: string; reviewer_name: string; created_at: string;
}

export interface LandingProps {
  onLoginClick: () => void; onPartnerClick: () => void;
  isLoggedIn?: boolean; userName?: string; accessToken?: string;
  refreshToken?: string; onLogout?: () => void;
  onTokenRefresh?: (data: { accessToken: string; refreshToken: string; name: string; email: string; role: "provider" | "user" }) => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const AVATAR_COLORS = ["#F97316","#8B5CF6","#3B82F6","#EC4899","#10B981","#F59E0B","#06B6D4","#EF4444"];
const BADGES = ["Top Rated","Popular","Verified","Certified","Premium"];

function toProvider(p: ApiProvider, idx: number): Provider {
  const skills = (p.skills || "").split(",").map(s => s.trim()).filter(Boolean).slice(0, 3);
  return {
    id: p.id, name: p.full_name, role: p.service_name || p.service_category,
    rating: Number(p.avg_rating) || 0, reviews: p.total_reviews || 0,
    experience: `${p.experience_years} yrs`, price: `₹${p.base_price_per_hour}/hr`,
    tags: skills.length ? skills : [p.service_category],
    avatar: p.full_name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2),
    avatarBg: AVATAR_COLORS[idx % AVATAR_COLORS.length],
    badge: p.verification_status === "verified" ? "Verified" : BADGES[idx % BADGES.length],
    available: p.is_available,
  };
}





const Spinner = () => (
  <div style={{ display: "flex", justifyContent: "center", padding: 40 }}>
    <div style={{ width: 32, height: 32, border: "3px solid #F3F4F6", borderTop: "3px solid #F97316", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
  </div>
);
const MOCK_PROVIDERS: Provider[] = [
  { id: 1, name: "Sanket Chavan",  role: "Professional Electrician",  rating: 4.9, reviews: 247, experience: "8 yrs",  price: "₹800/hr",  tags: ["Wiring","Panel Upgrades","Lighting"],   avatar: "SC", avatarBg: "#F97316", badge: "Top Rated", available: true  },
  { id: 2, name: "Priya Sharma",   role: "Home Cleaning Expert",      rating: 4.8, reviews: 312, experience: "5 yrs",  price: "₹500/hr",  tags: ["Deep Clean","Kitchen","Bathroom"],       avatar: "PS", avatarBg: "#8B5CF6", badge: "Popular",   available: true  },
  { id: 3, name: "Rajan Mehta",    role: "Licensed Plumber",          rating: 4.7, reviews: 189, experience: "10 yrs", price: "₹700/hr",  tags: ["Pipe Fix","Installation","Leaks"],       avatar: "RM", avatarBg: "#3B82F6", badge: "Verified",  available: false },
  { id: 4, name: "Anjali Desai",   role: "Beauty & Salon Specialist", rating: 4.9, reviews: 423, experience: "6 yrs",  price: "₹600/hr",  tags: ["Hair","Makeup","Threading"],             avatar: "AD", avatarBg: "#EC4899", badge: "Top Rated", available: true  },
  { id: 5, name: "Vikram Singh",   role: "Pest Control Expert",       rating: 4.6, reviews: 156, experience: "7 yrs",  price: "₹900/hr",  tags: ["Bed Bugs","Termites","Rodents"],         avatar: "VS", avatarBg: "#10B981", badge: "Certified", available: true  },
  { id: 6, name: "Meera Nair",     role: "Certified Spa Therapist",   rating: 4.8, reviews: 291, experience: "4 yrs",  price: "₹750/hr",  tags: ["Swedish","Deep Tissue","Aromatherapy"], avatar: "MN", avatarBg: "#F59E0B", badge: "Premium",   available: false },
];

// ─── Global CSS ───────────────────────────────────────────────────────────────
const GLOBAL_CSS = `
  *{box-sizing:border-box;}
  body{margin:0;-webkit-text-size-adjust:100%;}
  .ss-section{max-width:1100px;margin:0 auto;padding:0 40px;}
  .ss-grid-6{display:grid;grid-template-columns:repeat(6,1fr);gap:16px;}
  .ss-grid-4{display:grid;grid-template-columns:repeat(4,1fr);gap:20px;}
  .ss-grid-3{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;}
  .ss-provider-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;}
  .ss-hero-img{flex:0 0 360px;}
  .ss-footer-grid{display:grid;grid-template-columns:2fr 1fr 1fr 1fr;gap:48px;margin-bottom:48px;}
  .ss-nav-links{display:flex;align-items:center;gap:24px;}
  .ss-nav-actions{display:flex;align-items:center;gap:8px;}
  .ss-mobile-menu-btn{display:none!important;}
  .ss-hero-inner{display:flex;align-items:center;gap:60px;}
  @media(max-width:767px){
    .ss-section{padding:0 16px;}
    .ss-grid-6{grid-template-columns:repeat(3,1fr);gap:10px;}
    .ss-grid-4{grid-template-columns:repeat(2,1fr);gap:12px;}
    .ss-grid-3{grid-template-columns:1fr;gap:14px;}
    .ss-provider-grid{grid-template-columns:1fr!important;}
    .ss-hero-img{display:none!important;}
    .ss-hero-inner{flex-direction:column;gap:20px;}
    .ss-footer-grid{grid-template-columns:1fr 1fr;gap:24px;}
    .ss-nav-links{display:none!important;}
    .ss-nav-actions{display:none!important;}
    .ss-mobile-menu-btn{display:flex!important;}
    .ss-modal-wrap{align-items:flex-end!important;}
    .ss-modal-box{border-radius:20px 20px 0 0!important;width:100%!important;max-width:100%!important;max-height:90vh!important;}
  }
`;




// ─── Provider Profile Modal — GET /providers/:id ─────────────────────────────
const ProviderProfileModal = ({
  providerId, onClose, onBook,
}: {
  providerId: number;
  onClose: () => void;
  onBook: (provider: ApiProviderDetail) => void; // passes full detail so parent skips re-fetch
}) => {
  const [data,    setData]    = React.useState<ApiProviderDetail | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [reviews, setReviews] = React.useState<ApiReview[]>([]);

  React.useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch(`${BASE}/providers/${providerId}`).then(r => r.ok ? r.json() : null),
      fetch(`${BASE}/reviews/provider/${providerId}?limit=5`).then(r => r.ok ? r.json() : []),
    ]).then(([prov, revs]) => {
      if (prov) setData(prov as ApiProviderDetail);
      if (Array.isArray(revs)) setReviews(revs);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [providerId]);

  const skills = (data?.skills || "").split(",").map(s => s.trim()).filter(Boolean);

  return (
    <div className="ss-modal-wrap" onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 400, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div className="ss-modal-box" onClick={e => e.stopPropagation()} style={{ background: "#fff", borderRadius: 24, padding: 28, width: 520, maxWidth: "92vw", maxHeight: "88vh", overflowY: "auto", boxShadow: "0 24px 72px rgba(0,0,0,0.2)" }}>
        {/* drag handle for mobile */}
        <div style={{ width: 40, height: 4, background: "#E5E7EB", borderRadius: 2, margin: "0 auto 18px" }} />
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 18 }}>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Provider Profile</h3>
          <button onClick={onClose} style={{ background: "#F3F4F6", border: "none", borderRadius: 8, width: 32, height: 32, cursor: "pointer", fontSize: 16 }}>✕</button>
        </div>
        {loading ? <Spinner /> : data && (
          <>
            <div style={{ display: "flex", gap: 14, alignItems: "flex-start", marginBottom: 18 }}>
              <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#F97316", color: "#fff", fontWeight: 800, fontSize: 20, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {data.full_name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 17, color: "#111827" }}>{data.full_name}</div>
                <div style={{ color: "#6B7280", fontSize: 13 }}>{data.service_name || data.service_category}</div>
                <div style={{ display: "flex", gap: 8, marginTop: 4, flexWrap: "wrap" as const }}>
                  <span style={{ fontSize: 12, color: "#F97316", fontWeight: 600 }}>★ {Number(data.avg_rating).toFixed(1)} ({data.total_reviews} reviews)</span>
                  <span style={{ fontSize: 12, color: "#6B7280" }}>· {data.experience_years} yrs exp</span>
                  {data.city && <span style={{ fontSize: 12, color: "#6B7280" }}>· {data.city}</span>}
                </div>
              </div>
            </div>
            {data.bio && <p style={{ fontSize: 13, color: "#4B5563", lineHeight: 1.7, marginBottom: 14, background: "#F9FAFB", borderRadius: 10, padding: "10px 14px" }}>{data.bio}</p>}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
              <div style={{ background: "#FFF7ED", borderRadius: 10, padding: "12px 14px" }}>
                <div style={{ fontSize: 11, color: "#9CA3AF", fontWeight: 600, textTransform: "uppercase" as const }}>Base Price</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: "#F97316" }}>₹{data.base_price_per_hour}/hr</div>
              </div>
              <div style={{ background: data.is_available ? "#F0FDF4" : "#F9FAFB", borderRadius: 10, padding: "12px 14px" }}>
                <div style={{ fontSize: 11, color: "#9CA3AF", fontWeight: 600, textTransform: "uppercase" as const }}>Status</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: data.is_available ? "#16a34a" : "#9CA3AF" }}>{data.is_available ? "Available Now" : "Busy"}</div>
              </div>
            </div>
            {skills.length > 0 && (
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Skills</div>
                <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 6 }}>
                  {skills.map(s => <span key={s} style={{ fontSize: 12, background: "#F3F4F6", color: "#4B5563", borderRadius: 99, padding: "3px 10px", border: "1px solid #E5E7EB" }}>{s}</span>)}
                </div>
              </div>
            )}
            {reviews.length > 0 && (
              <div style={{ marginBottom: 18 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 8 }}>Recent Reviews</div>
                {reviews.slice(0, 3).map((r, i) => (
                  <div key={i} style={{ padding: "8px 0", borderBottom: "1px solid #F9FAFB" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>{r.reviewer_name}</span>
                      <span style={{ fontSize: 12, color: "#F97316" }}>★ {r.rating}</span>
                    </div>
                    <p style={{ fontSize: 12, color: "#6B7280", margin: 0 }}>{r.comment}</p>
                  </div>
                ))}
              </div>
            )}
            {/* Book button — calls onBook(data.id) which opens BookingModal in parent */}
            <button
              onClick={() => data && onBook(data)}
              style={{ width: "100%", background: "#F97316", color: "#fff", fontWeight: 700, fontSize: 15, padding: "13px 0", borderRadius: 14, border: "none", cursor: "pointer" }}
            >📅 Book {data.full_name.split(" ")[0]}</button>
          </>
        )}
      </div>
    </div>
  );
};

// ─── Booking Modal — POST /appointments ──────────────────────────────────────
const BookingModal = ({
  provider, token, onClose, onBooked,
}: {
  provider: ApiProviderDetail;
  token: string;
  onClose: () => void;
  onBooked: () => void;
}) => {
  const [form, setForm] = React.useState({ location: "", area: "", date: "", start: "09:00", end: "11:00", description: "" });
  const [saving, setSaving] = React.useState(false);
  const [error,  setError]  = React.useState("");

  const price = provider.base_price_per_hour * 2;

  const submit = async () => {
    if (!form.location.trim()) { setError("Please enter a location"); return; }
    if (!form.date)             { setError("Please select a date");     return; }
    setSaving(true); setError("");
    try {
      const res = await fetch(`${BASE}/appointments`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({
          providerId:     provider.id,
          serviceName:    provider.service_name || provider.service_category,
          location:       form.location,
          area:           form.area,
          scheduledDate:  form.date,
          scheduledStart: form.start,
          scheduledEnd:   form.end,
          agreedPrice:    price,
          description:    form.description,
        }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({})) as { error?: string };
        throw new Error(d.error || `HTTP ${res.status}`);
      }
      onBooked();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const inp: React.CSSProperties = { width: "100%", border: "1px solid #E5E7EB", borderRadius: 10, padding: "10px 12px", fontSize: 14, outline: "none", boxSizing: "border-box" };

  return (
    <div className="ss-modal-wrap" onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 500, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div className="ss-modal-box" onClick={e => e.stopPropagation()} style={{ background: "#fff", borderRadius: 24, padding: 28, width: 480, maxWidth: "92vw", maxHeight: "90vh", overflowY: "auto", boxShadow: "0 32px 80px rgba(0,0,0,0.2)" }}>
        <div style={{ width: 40, height: 4, background: "#E5E7EB", borderRadius: 2, margin: "0 auto 18px" }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: "#111827" }}>Book {provider.full_name}</h3>
            <p style={{ margin: "3px 0 0", fontSize: 12, color: "#9CA3AF" }}>{provider.service_name || provider.service_category} · ₹{provider.base_price_per_hour}/hr</p>
          </div>
          <button onClick={onClose} style={{ background: "#F3F4F6", border: "none", borderRadius: "50%", width: 32, height: 32, cursor: "pointer", fontSize: 16 }}>✕</button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div>
            <label style={{ fontSize: 12, color: "#6B7280", display: "block", marginBottom: 5 }}>Location *</label>
            <input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} placeholder="Full address" style={inp} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div>
              <label style={{ fontSize: 12, color: "#6B7280", display: "block", marginBottom: 5 }}>Area</label>
              <input value={form.area} onChange={e => setForm(f => ({ ...f, area: e.target.value }))} placeholder="e.g. Bandra" style={inp} />
            </div>
            <div>
              <label style={{ fontSize: 12, color: "#6B7280", display: "block", marginBottom: 5 }}>Date *</label>
              <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} style={inp} min={new Date().toISOString().split("T")[0]} />
            </div>
            <div>
              <label style={{ fontSize: 12, color: "#6B7280", display: "block", marginBottom: 5 }}>Start Time</label>
              <input value={form.start} onChange={e => setForm(f => ({ ...f, start: e.target.value }))} placeholder="09:00" style={inp} />
            </div>
            <div>
              <label style={{ fontSize: 12, color: "#6B7280", display: "block", marginBottom: 5 }}>End Time</label>
              <input value={form.end} onChange={e => setForm(f => ({ ...f, end: e.target.value }))} placeholder="11:00" style={inp} />
            </div>
          </div>
          <div>
            <label style={{ fontSize: 12, color: "#6B7280", display: "block", marginBottom: 5 }}>Description (optional)</label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3}
              placeholder="Describe what you need..."
              style={{ ...inp, resize: "none" as const }} />
          </div>
        </div>

        <div style={{ background: "#FFF7ED", borderRadius: 12, padding: "12px 14px", margin: "14px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 13, color: "#6B7280" }}>Estimated Total (2 hrs)</span>
          <span style={{ fontSize: 18, fontWeight: 700, color: "#F97316" }}>₹{price}</span>
        </div>

        {error && <p style={{ color: "#DC2626", fontSize: 13, marginBottom: 10, background: "#FEF2F2", padding: "8px 12px", borderRadius: 8 }}>⚠ {error}</p>}

        <button onClick={submit} disabled={saving}
          style={{ width: "100%", background: saving ? "#9CA3AF" : "#F97316", color: "#fff", fontWeight: 700, fontSize: 15, padding: "13px 0", borderRadius: 14, border: "none", cursor: saving ? "not-allowed" : "pointer" }}>
          {saving ? "Submitting..." : "📅 Confirm Booking"}
        </button>
      </div>
    </div>
  );
};

// ─── My Bookings Panel — GET /appointments + DELETE /appointments/:id ─────────
const MyBookingsPanel = ({
  token, onClose, onLeaveReview, onBookAgain,
}: {
  token: string;
  onClose: () => void;
  onLeaveReview: (appt: CustomerAppointment) => void;
  onBookAgain: (providerId: number) => void;
}) => {
  const [appts,    setAppts]   = React.useState<CustomerAppointment[]>([]);
  const [loading,  setLoading] = React.useState(true);
  const [deleting, setDeleting]= React.useState<Record<number, boolean>>({});
  const [toast,    setToast]   = React.useState<{ msg: string; ok: boolean } | null>(null);
  const [tab,      setTab]     = React.useState<"upcoming" | "past">("upcoming");

  const showToast = (msg: string, ok: boolean) => { setToast({ msg, ok }); setTimeout(() => setToast(null), 3000); };

  const fetchAppts = () => {
    setLoading(true);
    // GET /appointments
    fetch(`${BASE}/appointments?limit=50`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : [])
      .then((d: CustomerAppointment[]) => setAppts(Array.isArray(d) ? d : []))
      .catch(() => setAppts([]))
      .finally(() => setLoading(false));
  };
  React.useEffect(() => { fetchAppts(); }, []);

  const cancelAppt = async (id: number) => {
    if (!window.confirm("Cancel this appointment?")) return;
    setDeleting(d => ({ ...d, [id]: true }));
    try {
      // DELETE /appointments/:id
      const res = await fetch(`${BASE}/appointments/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error("Could not cancel");
      showToast("Appointment cancelled", true);
      fetchAppts();
    } catch (e) {
      showToast((e as Error).message, false);
    } finally {
      setDeleting(d => ({ ...d, [id]: false }));
    }
  };

  const upcoming = appts.filter(a => ["pending","accepted","ongoing"].includes(a.status));
  const past      = appts.filter(a => ["completed","rejected","cancelled"].includes(a.status));
  const shown     = tab === "upcoming" ? upcoming : past;

  const statusColor: Record<string, string> = {
    pending: "#F97316", accepted: "#3b82f6", ongoing: "#8b5cf6",
    completed: "#16a34a", rejected: "#ef4444", cancelled: "#9CA3AF",
  };
  const fmt = (s: string) => new Date(s).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

  return (
    <div className="ss-modal-wrap" onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 400, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div className="ss-modal-box" onClick={e => e.stopPropagation()} style={{ background: "#fff", borderRadius: 24, padding: 24, width: 580, maxWidth: "92vw", maxHeight: "88vh", overflowY: "auto", boxShadow: "0 24px 72px rgba(0,0,0,0.2)" }}>
        {toast && <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 999, background: toast.ok ? "#F0FDF4" : "#FEF2F2", border: `1px solid ${toast.ok ? "#BBF7D0" : "#FECACA"}`, color: toast.ok ? "#16a34a" : "#DC2626", borderRadius: 12, padding: "10px 16px", fontSize: 13, fontWeight: 500 }}>{toast.ok ? "✅" : "⚠️"} {toast.msg}</div>}

        <div style={{ width: 40, height: 4, background: "#E5E7EB", borderRadius: 2, margin: "0 auto 16px" }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#111827" }}>My Bookings</h3>
          <button onClick={onClose} style={{ background: "#F3F4F6", border: "none", borderRadius: 8, width: 32, height: 32, cursor: "pointer", fontSize: 16 }}>✕</button>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 4, marginBottom: 18, background: "#F9FAFB", borderRadius: 12, padding: 4 }}>
          {(["upcoming", "past"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              flex: 1, padding: "8px 0", borderRadius: 10, border: "none", cursor: "pointer",
              fontSize: 13, fontWeight: 600,
              background: tab === t ? "#fff" : "transparent",
              color: tab === t ? "#F97316" : "#6B7280",
              boxShadow: tab === t ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
            }}>
              {t === "upcoming" ? `Upcoming (${upcoming.length})` : `Past (${past.length})`}
            </button>
          ))}
        </div>

        {loading ? <Spinner /> : shown.length === 0 ? (
          <p style={{ textAlign: "center", color: "#9CA3AF", padding: 32, fontSize: 14 }}>
            {tab === "upcoming" ? "No upcoming bookings. Book a service to get started!" : "No past bookings yet."}
          </p>
        ) : shown.map(a => (
          <div key={a.id} style={{ border: "1px solid #F3F4F6", borderRadius: 14, padding: "14px 16px", marginBottom: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: "#111827" }}>{a.service_name}</div>
                <div style={{ fontSize: 12, color: "#6B7280", marginTop: 2 }}>
                  {a.provider_name && <>with {a.provider_name} · </>}{fmt(a.scheduled_date)} · {a.scheduled_start}
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#F97316", marginTop: 4 }}>₹{a.agreed_price} · 📍 {a.location}</div>
              </div>
              <span style={{ fontSize: 12, fontWeight: 700, color: statusColor[a.status] || "#9CA3AF", background: `${statusColor[a.status] || "#9CA3AF"}18`, borderRadius: 8, padding: "4px 10px", flexShrink: 0, marginLeft: 8 }}>
                {a.status.charAt(0).toUpperCase() + a.status.slice(1)}
              </span>
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              {/* Cancel — DELETE /appointments/:id */}
              {a.status === "pending" && (
                <button onClick={() => cancelAppt(a.id)} disabled={deleting[a.id]}
                  style={{ flex: 1, background: "#FEF2F2", color: "#ef4444", border: "1px solid #FECACA", fontSize: 12, fontWeight: 700, padding: "8px 0", borderRadius: 10, cursor: deleting[a.id] ? "not-allowed" : "pointer", opacity: deleting[a.id] ? 0.6 : 1 }}>
                  {deleting[a.id] ? "Cancelling..." : "✕ Cancel"}
                </button>
              )}
              {/* Leave Review — POST /reviews */}
              {a.status === "completed" && (
                <button onClick={() => onLeaveReview(a)}
                  style={{ flex: 1, background: "#FFF7ED", color: "#F97316", border: "1px solid #FED7AA", fontSize: 12, fontWeight: 700, padding: "8px 0", borderRadius: 10, cursor: "pointer" }}>
                  ⭐ Leave Review
                </button>
              )}
              {/* Book Again — GET /providers/:id → POST /appointments */}
              {(a.status === "completed" || a.status === "rejected") && (
                <button onClick={() => onBookAgain(a.provider_id)}
                  style={{ flex: 1, background: "#F97316", color: "#fff", border: "none", fontSize: 12, fontWeight: 700, padding: "8px 0", borderRadius: 10, cursor: "pointer" }}>
                  📅 Book Again
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Leave Review Modal — POST /reviews ──────────────────────────────────────
const LeaveReviewModal = ({
  appointment, token, onClose,
}: {
  appointment: CustomerAppointment;
  token: string;
  onClose: (submitted?: boolean) => void;
}) => {
  const [rating,     setRating]     = React.useState(5);
  const [comment,    setComment]    = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [error,      setError]      = React.useState("");

  const submit = async () => {
    setSubmitting(true); setError("");
    try {
      const res = await fetch(`${BASE}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ appointmentId: appointment.id, rating, comment }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({})) as { error?: string };
        throw new Error(d.error || "Failed to submit review");
      }
      onClose(true);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="ss-modal-wrap" onClick={() => onClose()} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 500, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div className="ss-modal-box" onClick={e => e.stopPropagation()} style={{ background: "#fff", borderRadius: 24, padding: 28, width: 440, maxWidth: "92vw", boxShadow: "0 24px 72px rgba(0,0,0,0.2)" }}>
        <div style={{ width: 40, height: 4, background: "#E5E7EB", borderRadius: 2, margin: "0 auto 18px" }} />
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
          <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>Leave a Review</h3>
          <button onClick={() => onClose()} style={{ background: "#F3F4F6", border: "none", borderRadius: 8, width: 32, height: 32, cursor: "pointer", fontSize: 16 }}>✕</button>
        </div>
        <p style={{ fontSize: 13, color: "#6B7280", marginTop: 0, marginBottom: 16 }}>
          How was <strong>{appointment.service_name}</strong>{appointment.provider_name ? ` by ${appointment.provider_name}` : ""}?
        </p>
        <div style={{ display: "flex", gap: 6, marginBottom: 16, justifyContent: "center" }}>
          {[1,2,3,4,5].map(s => (
            <button key={s} onClick={() => setRating(s)}
              style={{ fontSize: 34, background: "none", border: "none", cursor: "pointer", color: s <= rating ? "#F97316" : "#D1D5DB", transition: "color 0.15s", padding: "0 2px" }}>★</button>
          ))}
        </div>
        <textarea value={comment} onChange={e => setComment(e.target.value)} placeholder="Share your experience (optional)..."
          style={{ width: "100%", border: "1px solid #E5E7EB", borderRadius: 12, padding: "12px 14px", fontSize: 13, outline: "none", resize: "vertical" as const, minHeight: 80, boxSizing: "border-box" as const }} />
        {error && <p style={{ color: "#DC2626", fontSize: 13, marginTop: 8 }}>⚠ {error}</p>}
        <button onClick={submit} disabled={submitting}
          style={{ width: "100%", marginTop: 14, background: submitting ? "#9CA3AF" : "#F97316", color: "#fff", fontWeight: 700, fontSize: 15, padding: "13px 0", borderRadius: 14, border: "none", cursor: submitting ? "not-allowed" : "pointer" }}>
          {submitting ? "Submitting..." : "Submit Review"}
        </button>
      </div>
    </div>
  );
};

// ─── My Reviews Panel — GET /reviews/my ──────────────────────────────────────
const MyReviewsPanel = ({ token, onClose }: { token: string; onClose: () => void }) => {
  const [reviews, setReviews] = React.useState<MyReview[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetch(`${BASE}/reviews/my`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : [])
      .then((d: MyReview[]) => setReviews(Array.isArray(d) ? d : []))
      .catch(() => setReviews([]))
      .finally(() => setLoading(false));
  }, []);

  const fmt = (s: string) => new Date(s).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

  return (
    <div className="ss-modal-wrap" onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 400, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div className="ss-modal-box" onClick={e => e.stopPropagation()} style={{ background: "#fff", borderRadius: 24, padding: 24, width: 500, maxWidth: "92vw", maxHeight: "85vh", overflowY: "auto", boxShadow: "0 24px 72px rgba(0,0,0,0.2)" }}>
        <div style={{ width: 40, height: 4, background: "#E5E7EB", borderRadius: 2, margin: "0 auto 16px" }} />
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 18 }}>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>My Reviews</h3>
          <button onClick={onClose} style={{ background: "#F3F4F6", border: "none", borderRadius: 8, width: 32, height: 32, cursor: "pointer", fontSize: 16 }}>✕</button>
        </div>
        {loading ? <Spinner /> : reviews.length === 0
          ? <p style={{ textAlign: "center", color: "#9CA3AF", padding: 32 }}>You haven't left any reviews yet.</p>
          : reviews.map(r => (
            <div key={r.id} style={{ border: "1px solid #F3F4F6", borderRadius: 14, padding: "14px 16px", marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: "#111827" }}>{r.provider_name}</span>
                <span style={{ fontSize: 13, color: "#F97316", fontWeight: 600 }}>{"★".repeat(Math.round(r.rating))} {r.rating}</span>
              </div>
              <p style={{ fontSize: 13, color: "#6B7280", margin: "0 0 6px" }}>{r.comment}</p>
              <div style={{ fontSize: 11, color: "#9CA3AF" }}>{fmt(r.created_at)}</div>
            </div>
          ))
        }
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
export function SmartServeLanding({
  onLoginClick, onPartnerClick,
  isLoggedIn = false, userName,
  accessToken, onLogout,
}: LandingProps) {
  const isMobile = useIsMobile();

  const [city,         setCity]         = useState("Mumbai");
  const [search,       setSearch]       = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [providers,    setProviders]    = useState<Provider[]>(MOCK_PROVIDERS);
  const [siteReviews,  setSiteReviews]  = useState(MOCK_REVIEWS);
  const [loadingProv,  setLoadingProv]  = useState(false);
  const [mobileMenu,   setMobileMenu]   = useState(false);
  const [citiesList,   setCitiesList]   = useState<string[]>([]);

  // ── Customer modal state ─────────────────────────────────────────────────
  const [viewingProviderId, setViewingProviderId] = useState<number | null>(null);
  const [bookingProvider,   setBookingProvider]   = useState<ApiProviderDetail | null>(null);
  const [showBookings,      setShowBookings]      = useState(false);
  const [reviewAppt,        setReviewAppt]        = useState<CustomerAppointment | null>(null);
  const [showMyReviews,     setShowMyReviews]     = useState(false);
  const [toast,             setToast]             = useState<{ msg: string; ok: boolean } | null>(null);

  const showToastMsg = (msg: string, ok: boolean) => { setToast({ msg, ok }); setTimeout(() => setToast(null), 3500); };

  // Opens BookingModal: fetch GET /providers/:id first for full detail
  const handleBookProvider = (providerId: number) => {
    // Try to fetch full provider detail from API
    fetch(`${BASE}/providers/${providerId}`)
      .then(r => r.ok ? r.json() : Promise.reject(new Error("not found")))
      .then((p: ApiProviderDetail) => setBookingProvider(p))
      .catch(() => {
        // API failed or provider not found — build a minimal detail object
        // from the already-loaded providers list so booking still works
        const fallback = providers.find(p => p.id === providerId);
        if (fallback) {
          setBookingProvider({
            id:                  fallback.id,
            full_name:           fallback.name,
            service_name:        fallback.role,
            service_category:    fallback.role,
            base_price_per_hour: parseInt(fallback.price.replace(/[^\d]/g, "")) || 500,
            is_available:        fallback.available,
            avg_rating:          fallback.rating,
            total_reviews:       fallback.reviews,
            experience_years:    parseInt(fallback.experience) || 1,
            skills:              fallback.tags.join(", "),
            bio:                 "",
            service_areas:       "",
            available_days:      "",
            work_start_time:     "09:00",
            work_end_time:       "18:00",
            verification_status: fallback.badge === "Verified" ? "verified" : "pending",
            total_jobs:          0,
          } as ApiProviderDetail);
        } else {
          showToastMsg("Could not load provider details", false);
        }
      });
  };

  // GET /providers
  // Fetch all providers once on mount to extract unique cities
  useEffect(() => {
    fetch(`${BASE}/providers?limit=100`)
      .then(r => r.ok ? r.json() : [])
      .then((data: ApiProvider[]) => {
        if (Array.isArray(data)) {
          const unique = Array.from(new Set(
            data.map(p => (p.city || "").trim()).filter(Boolean)
          )).sort();
          if (unique.length > 0) {
            setCitiesList(unique);
            setCity(unique[0]); // default to first city
          }
          // testimonials from first provider with reviews
          const first = data.find(p => p.total_reviews > 0);
          if (first) {
            fetch(`${BASE}/reviews/provider/${first.id}?limit=3`)
              .then(r => r.ok ? r.json() : null)
              .then((revs: ApiReview[] | null) => {
                if (Array.isArray(revs) && revs.length > 0) {
                  setSiteReviews(revs.map((r, i) => ({
                    name: r.reviewer_name, rating: r.rating, text: r.comment,
                    avatar: r.reviewer_name[0].toUpperCase(), bg: AVATAR_COLORS[i % AVATAR_COLORS.length],
                  })));
                }
              }).catch(() => {});
          }
        }
      }).catch(() => {});
  }, []);

  // Re-fetch providers whenever selected city changes
  useEffect(() => {
    if (!city) return;
    setLoadingProv(true);
    const cityParam = encodeURIComponent(city);
    fetch(`${BASE}/providers?limit=20&city=${cityParam}`)
      .then(r => r.ok ? r.json() : null)
      .then((data: ApiProvider[] | null) => {
        if (Array.isArray(data) && data.length > 0) {
          setProviders(data.map((p, i) => toProvider(p, i)));
        } else {
          setProviders([]); // no providers in this city
        }
      })
      .catch(() => setProviders([]))
      .finally(() => setLoadingProv(false));
  }, [city]);

  const filters = ["All","Electrician","Cleaning","Plumber","Salon","Spa","Pest Control"];
  const filteredProviders = activeFilter === "All"
    ? providers
    : providers.filter(p =>
        p.role.toLowerCase().includes(activeFilter.toLowerCase()) ||
        p.tags.some(t => t.toLowerCase().includes(activeFilter.toLowerCase()))
      );

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", background: "#fff", color: "#111827", overflowX: "hidden" }}>
      <style>{GLOBAL_CSS}</style>

      {/* ── Modals ── */}
      {/* GET /providers/:id */}
      {viewingProviderId !== null && (
        <ProviderProfileModal
          providerId={viewingProviderId}
          onClose={() => setViewingProviderId(null)}
          onBook={(p) => { setViewingProviderId(null); setBookingProvider(p); }}
        />
      )}

      {/* POST /appointments */}
      {bookingProvider !== null && (
        <BookingModal
          provider={bookingProvider}
          token={accessToken ?? ""}
          onClose={() => setBookingProvider(null)}
          onBooked={() => { setBookingProvider(null); showToastMsg("Booking submitted! ✅ Check My Bookings for updates.", true); }}
        />
      )}

      {/* GET /appointments + DELETE /appointments/:id */}
      {showBookings && accessToken && (
        <MyBookingsPanel
          token={accessToken}
          onClose={() => setShowBookings(false)}
          onLeaveReview={appt => { setReviewAppt(appt); setShowBookings(false); }}
          onBookAgain={id => { setShowBookings(false); handleBookProvider(id); }}
        />
      )}

      {/* POST /reviews */}
      {reviewAppt && accessToken && (
        <LeaveReviewModal
          appointment={reviewAppt}
          token={accessToken}
          onClose={(submitted) => { setReviewAppt(null); if (submitted) showToastMsg("Review submitted — thank you! ⭐", true); }}
        />
      )}

      {/* GET /reviews/my */}
      {showMyReviews && accessToken && (
        <MyReviewsPanel token={accessToken} onClose={() => setShowMyReviews(false)} />
      )}

      {toast && (
        <div style={{ position: "fixed", bottom: 24, right: isMobile ? 12 : 24, left: isMobile ? 12 : "auto", zIndex: 9999, background: toast.ok ? "#F0FDF4" : "#FEF2F2", border: `1px solid ${toast.ok ? "#BBF7D0" : "#FECACA"}`, color: toast.ok ? "#16a34a" : "#DC2626", borderRadius: 12, padding: "12px 18px", fontSize: 13, fontWeight: 500, boxShadow: "0 4px 16px rgba(0,0,0,0.12)", textAlign: "center" }}>{toast.msg}</div>
      )}

      <Navigation
        isMobile={isMobile}
        isLoggedIn={isLoggedIn}
        userName={userName}
        onLoginClick={onLoginClick}
        onLogout={onLogout}
        setShowBookings={setShowBookings}
        setShowMyReviews={setShowMyReviews}
        mobileMenu={mobileMenu}
        setMobileMenu={setMobileMenu}
      />

      <Hero
        isMobile={isMobile}
        isLoggedIn={isLoggedIn}
        city={city}
        setCity={setCity}
        search={search}
        setSearch={setSearch}
        citiesList={citiesList}
        onLoginClick={onLoginClick}
        onPartnerClick={onPartnerClick}
        setShowBookings={setShowBookings}
      />

      <ServicesSections
        isMobile={isMobile}
        isLoggedIn={isLoggedIn}
        city={city}
        onLoginClick={onLoginClick}
      />

      <HowItWorks
        isMobile={isMobile}
      />

      <ProviderSection
        isMobile={isMobile}
        city={city}
        setCity={setCity}
        citiesList={citiesList}
        activeFilter={activeFilter}
        setActiveFilter={setActiveFilter}
        filters={filters}
        loadingProv={loadingProv}
        providers={providers}
        filteredProviders={filteredProviders}
        handleBookProvider={handleBookProvider}
        setViewingProviderId={setViewingProviderId}
        onPartnerClick={onPartnerClick}
      />

      <Testimonials
        isMobile={isMobile}
        siteReviews={siteReviews}
      />

      <Footer
        isMobile={isMobile}
      />
    </div>
  );
}

export default SmartServeLanding;