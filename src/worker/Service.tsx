import React, { useState, useEffect } from "react";

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
  has_review?: boolean;
  _onReviewed?: () => void;
}
interface MyReview {
  id: number; rating: number; comment: string; provider_name: string; created_at: string;
}
interface ApiReview {
  id: number; rating: number; comment: string; reviewer_name: string; created_at: string;
}

export interface LandingProps {
  onLoginClick:     () => void;
  onPartnerClick:   () => void;
  isLoggedIn?:      boolean;
  userName?:        string;
  accessToken?:     string;
  refreshToken?:    string;
  onLogout?:        () => void;
  onOpenChat?:      (appointmentId?: number) => void;
  onTokenRefresh?:  (data: { accessToken: string; refreshToken: string; name: string; email: string; role: "provider" | "user" }) => void;
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

const Stars = ({ rating }: { rating: number }) => (
  <span style={{ display: "flex", alignItems: "center", gap: 3 }}>
    <span style={{ color: "#F97316", fontSize: 13 }}>★</span>
    <span style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>{rating}</span>
  </span>
);

const Spinner = () => (
  <div style={{ display: "flex", justifyContent: "center", padding: 40 }}>
    <div style={{ width: 32, height: 32, border: "3px solid #F3F4F6", borderTop: "3px solid #F97316", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
  </div>
);

// ─── Static Data ──────────────────────────────────────────────────────────────
const MOCK_PROVIDERS: Provider[] = [
  { id: 1, name: "Sanket Chavan",  role: "Professional Electrician",  rating: 4.9, reviews: 247, experience: "8 yrs",  price: "₹800/hr",  tags: ["Wiring","Panel Upgrades","Lighting"],   avatar: "SC", avatarBg: "#F97316", badge: "Top Rated", available: true  },
  { id: 2, name: "Priya Sharma",   role: "Home Cleaning Expert",      rating: 4.8, reviews: 312, experience: "5 yrs",  price: "₹500/hr",  tags: ["Deep Clean","Kitchen","Bathroom"],       avatar: "PS", avatarBg: "#8B5CF6", badge: "Popular",   available: true  },
  { id: 3, name: "Rajan Mehta",    role: "Licensed Plumber",          rating: 4.7, reviews: 189, experience: "10 yrs", price: "₹700/hr",  tags: ["Pipe Fix","Installation","Leaks"],       avatar: "RM", avatarBg: "#3B82F6", badge: "Verified",  available: false },
  { id: 4, name: "Anjali Desai",   role: "Beauty & Salon Specialist", rating: 4.9, reviews: 423, experience: "6 yrs",  price: "₹600/hr",  tags: ["Hair","Makeup","Threading"],             avatar: "AD", avatarBg: "#EC4899", badge: "Top Rated", available: true  },
  { id: 5, name: "Vikram Singh",   role: "Pest Control Expert",       rating: 4.6, reviews: 156, experience: "7 yrs",  price: "₹900/hr",  tags: ["Bed Bugs","Termites","Rodents"],         avatar: "VS", avatarBg: "#10B981", badge: "Certified", available: true  },
  { id: 6, name: "Meera Nair",     role: "Certified Spa Therapist",   rating: 4.8, reviews: 291, experience: "4 yrs",  price: "₹750/hr",  tags: ["Swedish","Deep Tissue","Aromatherapy"], avatar: "MN", avatarBg: "#F59E0B", badge: "Premium",   available: false },
];
const MOCK_REVIEWS = [
  { name: "Saksham Shinde", rating: 4.8, text: "Professional cleaning team, thorough work, and great value for money!",       avatar: "S", bg: "#F97316" },
  { name: "Raj Nikam",      rating: 4.9, text: "Salon at home was amazing — skilled beautician with all equipment brought!",  avatar: "R", bg: "#3B82F6" },
  { name: "Athrav Bhosale", rating: 4.7, text: "Relaxing spa experience at home — therapist was punctual and professional!", avatar: "A", bg: "#10B981" },
];
const TOP_SERVICES = [
  { icon: "🏠", label: "Cleaning",      color: "#FFF7ED" },
  { icon: "✂️", label: "Salon",         color: "#FFF0F6" },
  { icon: "🌿", label: "Spa",           color: "#F0FDF4" },
  { icon: "🔧", label: "Repair",        color: "#EFF6FF" },
  { icon: "🐛", label: "Pest Control",  color: "#FEF2F2" },
  { icon: "🚗", label: "Car Detailing", color: "#FFFBEB" },
];
const OTHER_SERVICES = [
  { icon: "🚿", label: "Bathroom Cleaner",    color: "#F0F9FF" },
  { icon: "🛏️", label: "Bed Bug Control",     color: "#FFF7ED" },
  { icon: "⚡",  label: "Electrician",          color: "#FFFBEB" },
  { icon: "🔩", label: "Plumber",              color: "#EFF6FF" },
  { icon: "💆", label: "Massage",              color: "#FFF0F6" },
  { icon: "🏡", label: "Disinfection",         color: "#F0FDF4" },
];
const POPULAR_SERVICES = [
  { label: "Deep Cleaning",  category: "Home & Office",     price: "₹1,299", rating: 4.8, img: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=300&q=80" },
  { label: "Salon at Home",  category: "Hair & Beauty",     price: "₹899",   rating: 4.9, img: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=300&q=80" },
  { label: "Wellness Spa",   category: "Massage & Therapy", price: "₹1,599", rating: 4.7, img: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=300&q=80" },
  { label: "Pest Control",   category: "Safe & Effective",  price: "₹999",   rating: 4.6, img: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&q=80" },
];
const HOW_IT_WORKS = [
  { step: 1, title: "Book",         desc: "Select service & schedule"  },
  { step: 2, title: "Confirm",      desc: "Get instant confirmation"   },
  { step: 3, title: "Professional", desc: "Certified expert arrives"   },
  { step: 4, title: "Enjoy",        desc: "Quality service guaranteed" },
];
const FOOTER_LINKS = {
  Services: ["Cleaning Services","Beauty Services","Spa Services","Repair Services","Pest Control"],
  Company:  ["About Us","Careers","Blog","Press","Contact"],
  Support:  ["Help Center","Safety Tips","Cancellation Policy","Privacy Policy","Terms of Service"],
};

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

// ─── ProviderCard ─────────────────────────────────────────────────────────────
const ProviderCard = ({
  p, onBook, onViewProfile,
}: {
  p: Provider;
  onBook: (id: number) => void;
  onViewProfile: (id: number) => void;
}) => {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "#fff", borderRadius: 20, border: "1px solid #F3F4F6",
        boxShadow: hovered ? "0 20px 40px rgba(249,115,22,0.12)" : "0 2px 12px rgba(0,0,0,0.06)",
        padding: 24, display: "flex", flexDirection: "column", gap: 14,
        transition: "all 0.3s", transform: hovered ? "translateY(-4px)" : "translateY(0)",
        position: "relative", overflow: "hidden",
      }}
    >
      <div style={{
        position: "absolute", top: 14, right: 14,
        background: p.badge === "Top Rated" ? "#FFF7ED" : p.badge === "Premium" ? "#FAF5FF" : "#F0FDF4",
        color: p.badge === "Top Rated" ? "#F97316" : p.badge === "Premium" ? "#8B5CF6" : "#16a34a",
        fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 99,
        border: `1px solid ${p.badge === "Top Rated" ? "#FED7AA" : p.badge === "Premium" ? "#DDD6FE" : "#BBF7D0"}`,
      }}>{p.badge}</div>

      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ width: 56, height: 56, borderRadius: "50%", background: p.avatarBg, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 18, flexShrink: 0 }}>{p.avatar}</div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 16, color: "#111827" }}>{p.name}</div>
          <div style={{ fontSize: 13, color: "#6B7280", marginTop: 1 }}>{p.role}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
            <Stars rating={p.rating} />
            <span style={{ fontSize: 12, color: "#9CA3AF" }}>({p.reviews})</span>
            <span style={{ width: 3, height: 3, borderRadius: "50%", background: "#D1D5DB" }} />
            <span style={{ fontSize: 12, color: "#9CA3AF" }}>{p.experience}</span>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 6 }}>
        {p.tags.map(tag => (
          <span key={tag} style={{ fontSize: 11, fontWeight: 500, color: "#4B5563", background: "#F9FAFB", border: "1px solid #E5E7EB", borderRadius: 99, padding: "3px 10px" }}>{tag}</span>
        ))}
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 18, fontWeight: 700, color: "#F97316" }}>{p.price}</span>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: p.available ? "#22c55e" : "#9CA3AF" }} />
          <span style={{ fontSize: 12, color: p.available ? "#16a34a" : "#9CA3AF", fontWeight: 500 }}>{p.available ? "Available Now" : "Busy"}</span>
        </div>
      </div>

      <div style={{ display: "flex", gap: 10 }}>
        <button
          onClick={() => onBook(p.id)}
          style={{ flex: 1, background: "#F97316", color: "#fff", fontWeight: 700, fontSize: 14, padding: "11px 0", borderRadius: 12, border: "none", cursor: "pointer", opacity: p.available ? 1 : 0.6 }}
          onMouseEnter={e => (e.currentTarget.style.background = "#EA6C0A")}
          onMouseLeave={e => (e.currentTarget.style.background = "#F97316")}
        >📅 Book Now</button>
        <button
          onClick={() => onViewProfile(p.id)}
          title="View full profile"
          style={{ flex: "0 0 44px", background: "#F9FAFB", color: "#374151", fontSize: 16, padding: "11px 0", borderRadius: 12, border: "1px solid #E5E7EB", cursor: "pointer" }}
        >ℹ️</button>
      </div>
    </div>
  );
};

// ─── Provider Profile Modal ───────────────────────────────────────────────────
const ProviderProfileModal = ({
  providerId, onClose, onBook,
}: {
  providerId: number;
  onClose: () => void;
  onBook: (provider: ApiProviderDetail) => void;
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
  onBooked: (appt?: { id: number; service_name: string; agreed_price: number }) => void;
}) => {
  const [form, setForm] = React.useState({
    location: "", area: "", date: "", start: "09:00", end: "11:00", description: "",
  });
  const [saving, setSaving] = React.useState(false);
  const [error,  setError]  = React.useState("");

  // ── Dynamic hour & price calculation ─────────────────────────────────────
  const calcHours = (start: string, end: string): number => {
    const [sh, sm] = start.split(":").map(Number);
    const [eh, em] = end.split(":").map(Number);
    const diffMins = (eh * 60 + em) - (sh * 60 + sm);
    return diffMins > 0 ? parseFloat((diffMins / 60).toFixed(2)) : 0;
  };

  const hours = calcHours(form.start, form.end);
  const price = Math.round(provider.base_price_per_hour * hours);

  const formatHours = (h: number): string => {
    if (h <= 0) return "—";
    if (h === Math.floor(h)) return `${h} hr${h !== 1 ? "s" : ""}`;
    const whole = Math.floor(h);
    const mins  = Math.round((h - whole) * 60);
    if (whole === 0) return `${mins} min`;
    return `${whole} hr${whole !== 1 ? "s" : ""} ${mins} min`;
  };
  // ─────────────────────────────────────────────────────────────────────────

  const submit = async () => {
    if (!form.location.trim()) { setError("Please enter a location");                return; }
    if (!form.date)             { setError("Please select a date");                   return; }
    if (hours <= 0)             { setError("End time must be after start time");      return; }
    if (hours < 0.5)            { setError("Minimum booking duration is 30 minutes"); return; }

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
          agreedPrice:    price,          // ← uses calculated price
          description:    form.description,
        }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({})) as { error?: string };
        throw new Error(d.error || `HTTP ${res.status}`);
      }
      const apptData = await res.json().catch(() => null) as { id: number; service_name: string; agreed_price: number } | null;
      onBooked(apptData || undefined);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const inp: React.CSSProperties = {
    width: "100%", border: "1px solid #E5E7EB", borderRadius: 10,
    padding: "10px 12px", fontSize: 14, outline: "none", boxSizing: "border-box",
  };

  const timeInp: React.CSSProperties = {
    ...inp,
    cursor: "pointer",
  };

  return (
    <div className="ss-modal-wrap" onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 500, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div className="ss-modal-box" onClick={e => e.stopPropagation()} style={{ background: "#fff", borderRadius: 24, padding: 28, width: 480, maxWidth: "92vw", maxHeight: "90vh", overflowY: "auto", boxShadow: "0 32px 80px rgba(0,0,0,0.2)" }}>
        <div style={{ width: 40, height: 4, background: "#E5E7EB", borderRadius: 2, margin: "0 auto 18px" }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: "#111827" }}>Book {provider.full_name}</h3>
            <p style={{ margin: "3px 0 0", fontSize: 12, color: "#9CA3AF" }}>
              {provider.service_name || provider.service_category} · ₹{provider.base_price_per_hour}/hr
            </p>
          </div>
          <button onClick={onClose} style={{ background: "#F3F4F6", border: "none", borderRadius: "50%", width: 32, height: 32, cursor: "pointer", fontSize: 16 }}>✕</button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {/* Location */}
          <div>
            <label style={{ fontSize: 12, color: "#6B7280", display: "block", marginBottom: 5 }}>Location *</label>
            <input
              value={form.location}
              onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
              placeholder="Full address"
              style={inp}
            />
          </div>

          {/* Area + Date */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div>
              <label style={{ fontSize: 12, color: "#6B7280", display: "block", marginBottom: 5 }}>Area</label>
              <input
                value={form.area}
                onChange={e => setForm(f => ({ ...f, area: e.target.value }))}
                placeholder="e.g. Bandra"
                style={inp}
              />
            </div>
            <div>
              <label style={{ fontSize: 12, color: "#6B7280", display: "block", marginBottom: 5 }}>Date *</label>
              <input
                type="date"
                value={form.date}
                onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                style={inp}
                min={new Date().toISOString().split("T")[0]}
              />
            </div>
          </div>

          {/* Start + End Time — drive the price calculation */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div>
              <label style={{ fontSize: 12, color: "#6B7280", display: "block", marginBottom: 5 }}>Start Time</label>
              <input
                type="time"
                value={form.start}
                onChange={e => setForm(f => ({ ...f, start: e.target.value }))}
                style={timeInp}
              />
            </div>
            <div>
              <label style={{ fontSize: 12, color: "#6B7280", display: "block", marginBottom: 5 }}>End Time</label>
              <input
                type="time"
                value={form.end}
                onChange={e => setForm(f => ({ ...f, end: e.target.value }))}
                style={{
                  ...timeInp,
                  borderColor: hours <= 0 && form.end ? "#FECACA" : "#E5E7EB",
                }}
              />
            </div>
          </div>

          {/* Live duration hint */}
          {hours > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#6B7280", background: "#F9FAFB", borderRadius: 8, padding: "7px 12px" }}>
              <span>⏱</span>
              <span>Duration: <strong style={{ color: "#111827" }}>{formatHours(hours)}</strong></span>
              <span style={{ marginLeft: "auto", color: "#F97316", fontWeight: 700 }}>
                ₹{provider.base_price_per_hour} × {hours} hr{hours !== 1 ? "s" : ""}
              </span>
            </div>
          )}
          {hours <= 0 && form.start && form.end && (
            <div style={{ fontSize: 12, color: "#DC2626", background: "#FEF2F2", borderRadius: 8, padding: "7px 12px" }}>
              ⚠ End time must be after start time
            </div>
          )}

          {/* Description */}
          <div>
            <label style={{ fontSize: 12, color: "#6B7280", display: "block", marginBottom: 5 }}>Description (optional)</label>
            <textarea
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              rows={3}
              placeholder="Describe what you need..."
              style={{ ...inp, resize: "none" as const }}
            />
          </div>
        </div>

        {/* ── Estimated Total — updates live as start/end change ── */}
        <div style={{
          background: hours > 0 ? "#FFF7ED" : "#F9FAFB",
          borderRadius: 12, padding: "12px 14px", margin: "14px 0",
          display: "flex", justifyContent: "space-between", alignItems: "center",
          border: `1px solid ${hours > 0 ? "#FED7AA" : "#E5E7EB"}`,
          transition: "all 0.2s",
        }}>
          <div>
            <div style={{ fontSize: 13, color: "#6B7280" }}>
              Estimated Total
            </div>
            <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 2 }}>
              {hours > 0
                ? `₹${provider.base_price_per_hour}/hr × ${formatHours(hours)}`
                : "Select start & end time to calculate"
              }
            </div>
          </div>
          <span style={{ fontSize: 22, fontWeight: 800, color: hours > 0 ? "#F97316" : "#9CA3AF" }}>
            {hours > 0 ? `₹${price.toLocaleString("en-IN")}` : "—"}
          </span>
        </div>

        {error && (
          <p style={{ color: "#DC2626", fontSize: 13, marginBottom: 10, background: "#FEF2F2", padding: "8px 12px", borderRadius: 8 }}>
            ⚠ {error}
          </p>
        )}

        <button
          onClick={submit}
          disabled={saving || hours <= 0}
          style={{
            width: "100%",
            background: saving || hours <= 0 ? "#9CA3AF" : "#F97316",
            color: "#fff", fontWeight: 700, fontSize: 15, padding: "13px 0",
            borderRadius: 14, border: "none",
            cursor: saving || hours <= 0 ? "not-allowed" : "pointer",
          }}
        >
          {saving
            ? "Submitting..."
            : hours > 0
              ? `📅 Confirm Booking · ₹${price.toLocaleString("en-IN")}`
              : "📅 Confirm Booking"
          }
        </button>
      </div>
    </div>
  );
};

// ─── My Bookings Panel — GET /appointments + DELETE /appointments/:id ─────────
const MyBookingsPanel = ({
  token, onClose, onLeaveReview, onBookAgain, onOpenChat: _onOpenChat, reviewedApptId, onPay, paidApptIds,
}: {
  token: string;
  onClose: () => void;
  onLeaveReview: (appt: CustomerAppointment) => void;
  onBookAgain: (providerId: number) => void;
  onOpenChat: (appointmentId?: number) => void;
  onPay: (appt: CustomerAppointment) => void;
  paidApptIds: Set<number>;
  reviewedApptId?: number | null;
}) => {
  const [appts,       setAppts]       = React.useState<CustomerAppointment[]>([]);
  const [loading,     setLoading]     = React.useState(true);
  const [deleting,    setDeleting]    = React.useState<Record<number,boolean>>({});
  const [reviewedIds, setReviewedIds] = React.useState<Set<number>>(new Set());
  const [toast,       setToast]       = React.useState<{ msg: string; ok: boolean } | null>(null);
  const [myReviews,   setMyReviews]   = React.useState<MyReview[]>([]);
  const [loadingRev,  setLoadingRev]  = React.useState(false);
  const [tab,         setTab]         = React.useState<"upcoming"|"past"|"reviews">("upcoming");

  const showToast = (msg: string, ok: boolean) => { setToast({ msg, ok }); setTimeout(() => setToast(null), 3000); };

  const fetchAppts = () => {
    setLoading(true);
    fetch(`${BASE}/appointments?limit=50`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : [])
      .then((d: CustomerAppointment[]) => {
        const list = Array.isArray(d) ? d : [];
        setAppts(list);
        setReviewedIds(new Set(list.filter(a => a.has_review).map(a => a.id)));
      })
      .catch(() => setAppts([]))
      .finally(() => setLoading(false));
  };
  React.useEffect(() => { fetchAppts(); }, []);

  React.useEffect(() => {
    if (tab !== "reviews" || myReviews.length > 0) return;
    setLoadingRev(true);
    fetch(`${BASE}/reviews/my`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : [])
      .then((d: MyReview[]) => setMyReviews(Array.isArray(d) ? d : []))
      .catch(() => setMyReviews([]))
      .finally(() => setLoadingRev(false));
  }, [tab]);

  const markReviewed = (id: number) => setReviewedIds(prev => new Set([...prev, id]));

  const cancelAppt = async (id: number) => {
    if (!window.confirm("Cancel this appointment?")) return;
    setDeleting(d => ({ ...d, [id]: true }));
    try {
      const res = await fetch(`${BASE}/appointments/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error("Could not cancel");
      showToast("Appointment cancelled", true); fetchAppts();
    } catch (e) { showToast((e as Error).message, false); }
    finally { setDeleting(d => ({ ...d, [id]: false })); }
  };

  const upcoming       = appts.filter(a => ["pending","accepted","ongoing"].includes(a.status));
  const past           = appts.filter(a => ["completed","rejected","cancelled"].includes(a.status));
  const pendingReviews = past.filter(a => a.status === "completed" && !reviewedIds.has(a.id) && !a.has_review && a.id !== reviewedApptId);
  const shown          = tab === "upcoming" ? upcoming : tab === "past" ? past : [];

  const SC: Record<string,string> = { pending:"#F97316", accepted:"#3b82f6", ongoing:"#8b5cf6", completed:"#16a34a", rejected:"#ef4444", cancelled:"#9CA3AF" };
  const fmt = (s: string) => new Date(s).toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" });

  return (
    <div className="ss-modal-wrap" onClick={onClose} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", zIndex:400, display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div className="ss-modal-box" onClick={e => e.stopPropagation()} style={{ background:"#fff", borderRadius:24, padding:24, width:580, maxWidth:"92vw", maxHeight:"88vh", overflowY:"auto", boxShadow:"0 24px 72px rgba(0,0,0,0.2)" }}>
        {toast && <div style={{ position:"fixed", bottom:24, right:24, zIndex:999, background:toast.ok?"#F0FDF4":"#FEF2F2", border:`1px solid ${toast.ok?"#BBF7D0":"#FECACA"}`, color:toast.ok?"#16a34a":"#DC2626", borderRadius:12, padding:"10px 16px", fontSize:13, fontWeight:500 }}>{toast.ok?"✅":"⚠️"} {toast.msg}</div>}

        <div style={{ width:40, height:4, background:"#E5E7EB", borderRadius:2, margin:"0 auto 16px" }} />

        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:14 }}>
          <div>
            <h3 style={{ margin:0, fontSize:18, fontWeight:700, color:"#111827" }}>My Bookings</h3>
            {pendingReviews.length > 0 && (
              <p style={{ margin:"3px 0 0", fontSize:12, color:"#F97316", fontWeight:600 }}>
                ⭐ {pendingReviews.length} job{pendingReviews.length > 1 ? "s" : ""} awaiting your review
              </p>
            )}
          </div>
          <button onClick={onClose} style={{ background:"#F3F4F6", border:"none", borderRadius:8, width:32, height:32, cursor:"pointer", fontSize:16 }}>✕</button>
        </div>

        {tab === "upcoming" && pendingReviews.length > 0 && (
          <div onClick={() => setTab("past")}
            style={{ background:"#FFF7ED", border:"1px solid #FED7AA", borderRadius:12, padding:"12px 14px", marginBottom:14, cursor:"pointer", display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width:36, height:36, background:"#F97316", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, flexShrink:0 }}>⭐</div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:13, fontWeight:700, color:"#92400E" }}>Rate your recent experience</div>
              <div style={{ fontSize:12, color:"#B45309", marginTop:2 }}>
                {pendingReviews[0].service_name}{pendingReviews[0].provider_name ? ` by ${pendingReviews[0].provider_name}` : ""} — tap to review
              </div>
            </div>
            <span style={{ color:"#F97316", fontSize:18 }}>›</span>
          </div>
        )}

        <div style={{ display:"flex", gap:4, marginBottom:16, background:"#F9FAFB", borderRadius:12, padding:4 }}>
          {(["upcoming","past","reviews"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              flex:1, padding:"8px 0", borderRadius:10, border:"none", cursor:"pointer",
              fontSize:13, fontWeight:600, position:"relative",
              background:tab===t?"#fff":"transparent",
              color:tab===t?"#F97316":"#6B7280",
              boxShadow:tab===t?"0 1px 4px rgba(0,0,0,0.08)":"none",
            }}>
              {t==="upcoming" ? `Upcoming (${upcoming.length})` : t==="past" ? `Past (${past.length})` : "⭐ Reviews"}
              {t==="past" && pendingReviews.length > 0 && (
                <span style={{ position:"absolute", top:4, right:6, width:16, height:16, background:"#F97316", borderRadius:"50%", color:"#fff", fontSize:9, display:"inline-flex", alignItems:"center", justifyContent:"center", fontWeight:700 }}>
                  {pendingReviews.length}
                </span>
              )}
              {t==="reviews" && myReviews.length > 0 && (
                <span style={{ position:"absolute", top:4, right:6, width:16, height:16, background:"#6B7280", borderRadius:"50%", color:"#fff", fontSize:9, display:"inline-flex", alignItems:"center", justifyContent:"center", fontWeight:700 }}>
                  {myReviews.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {tab === "reviews" && (
          loadingRev ? <Spinner /> : myReviews.length === 0 ? (
            <div style={{ textAlign:"center", padding:"32px 16px" }}>
              <div style={{ fontSize:40, marginBottom:12 }}>⭐</div>
              <div style={{ fontSize:15, fontWeight:700, color:"#374151", marginBottom:8 }}>No reviews yet</div>
              <p style={{ fontSize:13, color:"#9CA3AF", margin:"0 auto 16px", maxWidth:260 }}>
                Complete a booking and leave a review to share your experience!
              </p>
              <button onClick={() => setTab("past")} style={{ background:"#F97316", color:"#fff", border:"none", borderRadius:10, padding:"10px 20px", fontSize:13, fontWeight:700, cursor:"pointer" }}>
                View Past Bookings
              </button>
            </div>
          ) : (
            <div>
              <p style={{ fontSize:12, color:"#9CA3AF", margin:"0 0 12px" }}>{myReviews.length} review{myReviews.length !== 1 ? "s" : ""} submitted</p>
              {myReviews.map(r => (
                <div key={r.id} style={{ border:"1px solid #F3F4F6", borderRadius:14, padding:"14px 16px", marginBottom:10 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:8 }}>
                    <div>
                      <div style={{ fontWeight:700, fontSize:14, color:"#111827" }}>{r.provider_name}</div>
                      <div style={{ fontSize:11, color:"#9CA3AF", marginTop:2 }}>
                        {new Date(r.created_at).toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" })}
                      </div>
                    </div>
                    <div style={{ display:"flex", gap:1 }}>
                      {[1,2,3,4,5].map(s => (
                        <span key={s} style={{ fontSize:16, color: s <= Math.round(r.rating) ? "#F97316" : "#E5E7EB" }}>★</span>
                      ))}
                    </div>
                  </div>
                  {r.comment && (
                    <p style={{ fontSize:13, color:"#4B5563", margin:0, lineHeight:1.6, background:"#F9FAFB", borderRadius:8, padding:"8px 10px" }}>"{r.comment}"</p>
                  )}
                </div>
              ))}
            </div>
          )
        )}

        {tab !== "reviews" && (loading ? <Spinner /> : shown.length === 0 ? (
          <p style={{ textAlign:"center", color:"#9CA3AF", padding:32, fontSize:14 }}>
            {tab==="upcoming" ? "No upcoming bookings. Book a service to get started!" : "No past bookings yet."}
          </p>
        ) : shown.map(a => {
          const reviewed = reviewedIds.has(a.id) || !!a.has_review || a.id === reviewedApptId;
          return (
            <div key={a.id} style={{ border:`1px solid ${a.status==="completed"&&!reviewed?"#FED7AA":"#F3F4F6"}`, borderRadius:14, padding:"14px 16px", marginBottom:10, background:a.status==="completed"&&!reviewed?"#FFFDF9":"#fff" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                <div style={{ minWidth:0, flex:1 }}>
                  <div style={{ fontWeight:700, fontSize:14, color:"#111827" }}>{a.service_name}</div>
                  <div style={{ fontSize:12, color:"#6B7280", marginTop:2 }}>
                    {a.provider_name && <>with {a.provider_name} · </>}{fmt(a.scheduled_date)} · {a.scheduled_start}
                  </div>
                  <div style={{ fontSize:13, fontWeight:700, color:"#F97316", marginTop:4 }}>₹{a.agreed_price} · 📍 {a.location}</div>
                </div>
                <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:4, flexShrink:0, marginLeft:8 }}>
                  <span style={{ fontSize:12, fontWeight:700, color:SC[a.status]||"#9CA3AF", background:`${SC[a.status]||"#9CA3AF"}18`, borderRadius:8, padding:"4px 10px" }}>
                    {a.status.charAt(0).toUpperCase()+a.status.slice(1)}
                  </span>
                  {reviewed && <span style={{ fontSize:11, color:"#16a34a", fontWeight:600 }}>✅ Reviewed</span>}
                </div>
              </div>

              <div style={{ display:"flex", gap:8, marginTop:12 }}>
                {a.status==="pending" && (
                  <button onClick={() => cancelAppt(a.id)} disabled={deleting[a.id]}
                    style={{ flex:1, background:"#FEF2F2", color:"#ef4444", border:"1px solid #FECACA", fontSize:12, fontWeight:700, padding:"8px 0", borderRadius:10, cursor:deleting[a.id]?"not-allowed":"pointer", opacity:deleting[a.id]?0.6:1 }}>
                    {deleting[a.id]?"Cancelling...":"✕ Cancel"}
                  </button>
                )}
                {a.status==="accepted" && (
                  <div style={{ flex:1, display:"flex", flexDirection:"column", gap:6 }}>
                    <div style={{ background:"#EFF6FF", border:"1px solid #BFDBFE", borderRadius:10, padding:"8px 12px", fontSize:12, color:"#1D4ED8", fontWeight:500 }}>
                      ✅ Provider confirmed! Work will begin soon — you can pay once they start.
                    </div>
                  </div>
                )}
                {a.status==="ongoing" && (
                  <div style={{ flex:1, display:"flex", flexDirection:"column", gap:6 }}>
                    {!paidApptIds.has(a.id) && (
                      <button onClick={() => onPay(a)}
                        style={{ width:"100%", background:"linear-gradient(135deg,#F97316,#ea580c)", color:"#fff", border:"none", fontSize:13, fontWeight:700, padding:"10px 0", borderRadius:10, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>
                        💳 Pay Now — ₹{a.agreed_price.toLocaleString("en-IN")}
                      </button>
                    )}
                    {paidApptIds.has(a.id) && (
                      <div style={{ background:"#F0FDF4", border:"1px solid #BBF7D0", borderRadius:10, padding:"8px 12px", fontSize:12, color:"#16a34a", fontWeight:600, textAlign:"center" }}>
                        ✅ Payment done — provider completing your job
                      </div>
                    )}
                  </div>
                )}
                {a.status==="completed" && !reviewed && (
                  <button onClick={() => onLeaveReview({ ...a, _onReviewed: () => markReviewed(a.id) })}
                    style={{ flex:1, background:"#F97316", color:"#fff", border:"none", fontSize:12, fontWeight:700, padding:"8px 0", borderRadius:10, cursor:"pointer" }}>
                    ⭐ Leave Review
                  </button>
                )}
                {a.status==="completed" && reviewed && (
                  <div style={{ flex:1, background:"#F0FDF4", color:"#16a34a", border:"1px solid #BBF7D0", fontSize:12, fontWeight:600, padding:"8px 0", borderRadius:10, textAlign:"center" }}>
                    ✅ Review Submitted
                  </div>
                )}
                {(a.status==="completed"||a.status==="rejected") && (
                  <button onClick={() => onBookAgain(a.provider_id)}
                    style={{ flex:1, background:reviewed?"#F97316":"#F9FAFB", color:reviewed?"#fff":"#374151", border:reviewed?"none":"1px solid #E5E7EB", fontSize:12, fontWeight:700, padding:"8px 0", borderRadius:10, cursor:"pointer" }}>
                    📅 Book Again
                  </button>
                )}
              </div>
            </div>
          );
        }))}
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
      appointment._onReviewed?.();
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
const MyReviewsPanel = ({ token, onClose, onOpenBookings }: { token: string; onClose: () => void; onOpenBookings?: () => void }) => {
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
        {onOpenBookings && (
          <div onClick={onOpenBookings} style={{ background:"#FFF7ED", border:"1px solid #FED7AA", borderRadius:10, padding:"10px 14px", marginBottom:14, cursor:"pointer", display:"flex", alignItems:"center", gap:8 }}>
            <span style={{ fontSize:16 }}>⭐</span>
            <span style={{ fontSize:13, color:"#92400E", fontWeight:600 }}>Have completed jobs to review? Tap here →</span>
          </div>
        )}
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

// ─── Payment Modal — Razorpay integration ────────────────────────────────────
interface PaymentModalProps {
  appointmentId: number; serviceName: string; amountRupees: number;
  providerName: string; token: string;
  onClose: () => void; onSuccess: (paymentId: string) => void;
}
interface RazorpayResponse { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string; }
declare global { interface Window { Razorpay: new (o: object) => { open: () => void }; } }

function loadRazorpayScript(): Promise<boolean> {
  return new Promise(resolve => {
    if (window.Razorpay) { resolve(true); return; }
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload  = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

const PaymentStep = ({ n, label, active, done }: { n: number; label: string; active: boolean; done: boolean }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
    <div style={{ width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, flexShrink: 0, background: done ? "#16a34a" : active ? "#F97316" : "#F3F4F6", color: done || active ? "#fff" : "#9CA3AF" }}>
      {done ? "✓" : n}
    </div>
    <span style={{ fontSize: 13, fontWeight: active ? 600 : 400, color: active ? "#111827" : done ? "#16a34a" : "#9CA3AF" }}>{label}</span>
  </div>
);

const PaymentModal = ({ appointmentId, serviceName, amountRupees, providerName, token, onClose, onSuccess }: PaymentModalProps) => {
  type PS = "idle"|"creating"|"checkout"|"verifying"|"success"|"failed";
  const [step,  setStep]  = React.useState<PS>("idle");
  const [error, setError] = React.useState("");
  const [payId, setPayId] = React.useState("");
  const stepN = step==="creating"?1:step==="checkout"?2:step==="verifying"?3:step==="success"?4:0;

  const startPayment = async () => {
    setStep("creating"); setError("");
    try {
      const loaded = await loadRazorpayScript();
      if (!loaded) throw new Error("Could not load Razorpay — check your internet connection");

      const res  = await fetch(`${BASE}/payments/create-order`, {
        method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ appointmentId }),
      });
      const data = await res.json() as { orderId:string; amount:number; currency:string; keyId:string; serviceName:string; prefill:{name:string;email:string;phone:string}; error?:string };
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);

      setStep("checkout");
      const rzp = new window.Razorpay({
        key: data.keyId, amount: data.amount, currency: data.currency,
        name: "SmartServe", description: `${data.serviceName} — Booking #${appointmentId}`,
        order_id: data.orderId,
        prefill: { name: data.prefill.name, email: data.prefill.email, contact: data.prefill.phone },
        theme: { color: "#F97316" },
        notes: { appointment_id: String(appointmentId) },
        handler: async (r: RazorpayResponse) => {
          setStep("verifying");
          try {
            const vr = await fetch(`${BASE}/payments/verify`, {
              method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
              body: JSON.stringify({ razorpay_order_id: r.razorpay_order_id, razorpay_payment_id: r.razorpay_payment_id, razorpay_signature: r.razorpay_signature, appointmentId }),
            });
            const vd = await vr.json() as { success:boolean; paymentId:string; error?:string };
            if (!vr.ok || !vd.success) throw new Error(vd.error || "Verification failed");
            setPayId(r.razorpay_payment_id); setStep("success");
          } catch(e) { setError((e as Error).message); setStep("failed"); }
        },
        modal: { ondismiss: () => setStep("idle") },
      });
      rzp.open();
    } catch(e) { setError((e as Error).message); setStep("failed"); }
  };

  const overlay: React.CSSProperties = { position:"fixed", inset:0, background:"rgba(0,0,0,0.55)", zIndex:600, display:"flex", alignItems:"center", justifyContent:"center" };

  if (step === "success") return (
    <div style={overlay}>
      <div style={{ background:"#fff", borderRadius:24, padding:36, width:420, maxWidth:"92vw", textAlign:"center", boxShadow:"0 32px 80px rgba(0,0,0,0.2)" }}>
        <div style={{ width:72, height:72, background:"#F0FDF4", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:36, margin:"0 auto 18px" }}>✅</div>
        <h2 style={{ fontSize:22, fontWeight:800, color:"#111827", margin:"0 0 8px" }}>Payment Successful!</h2>
        <p style={{ fontSize:14, color:"#6B7280", margin:"0 0 22px" }}>₹{amountRupees.toLocaleString("en-IN")} paid for <strong>{serviceName}</strong></p>
        <div style={{ background:"#F9FAFB", borderRadius:12, padding:"12px 16px", marginBottom:22, textAlign:"left" }}>
          {[["Service", serviceName],["Provider", providerName],["Payment ID", payId.slice(-12)]].map(([l,v]) => (
            <div key={l} style={{ display:"flex", justifyContent:"space-between", fontSize:13, color:"#374151", marginBottom:6 }}>
              <span style={{ color:"#9CA3AF" }}>{l}</span>
              <span style={{ fontWeight:600 }}>{v}</span>
            </div>
          ))}
        </div>
        <p style={{ fontSize:12, color:"#9CA3AF", marginBottom:18 }}>📧 Receipt sent to your email address.</p>
        <button onClick={() => onSuccess(payId)} style={{ width:"100%", background:"#F97316", color:"#fff", fontWeight:700, fontSize:15, padding:"14px 0", borderRadius:14, border:"none", cursor:"pointer" }}>
          Continue →
        </button>
      </div>
    </div>
  );

  if (step === "failed") return (
    <div style={overlay}>
      <div style={{ background:"#fff", borderRadius:24, padding:36, width:420, maxWidth:"92vw", textAlign:"center", boxShadow:"0 32px 80px rgba(0,0,0,0.2)" }}>
        <div style={{ width:72, height:72, background:"#FEF2F2", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:36, margin:"0 auto 18px" }}>❌</div>
        <h2 style={{ fontSize:22, fontWeight:800, color:"#111827", margin:"0 0 8px" }}>Payment Failed</h2>
        <p style={{ fontSize:14, color:"#6B7280", margin:"0 0 20px" }}>{error || "Something went wrong."}</p>
        <div style={{ display:"flex", gap:10 }}>
          <button onClick={onClose} style={{ flex:1, background:"#F3F4F6", color:"#374151", fontWeight:600, fontSize:14, padding:"12px 0", borderRadius:12, border:"none", cursor:"pointer" }}>Cancel</button>
          <button onClick={() => { setStep("idle"); setError(""); }} style={{ flex:1, background:"#F97316", color:"#fff", fontWeight:700, fontSize:14, padding:"12px 0", borderRadius:12, border:"none", cursor:"pointer" }}>Try Again</button>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ ...overlay }} onClick={step==="idle"?onClose:undefined}>
      <div onClick={e => e.stopPropagation()} style={{ background:"#fff", borderRadius:24, padding:28, width:440, maxWidth:"92vw", boxShadow:"0 32px 80px rgba(0,0,0,0.2)" }}>
        <div style={{ width:40, height:4, background:"#E5E7EB", borderRadius:2, margin:"0 auto 20px" }} />
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:20 }}>
          <div>
            <h3 style={{ margin:0, fontSize:18, fontWeight:700, color:"#111827" }}>Complete Payment</h3>
            <p style={{ margin:"3px 0 0", fontSize:12, color:"#9CA3AF" }}>Secured by Razorpay · PCI DSS Compliant</p>
          </div>
          {step==="idle" && <button onClick={onClose} style={{ background:"#F3F4F6", border:"none", borderRadius:"50%", width:32, height:32, cursor:"pointer", fontSize:16 }}>✕</button>}
        </div>

        <div style={{ display:"flex", flexDirection:"column", gap:12, padding:14, background:"#F9FAFB", borderRadius:12, marginBottom:20 }}>
          <PaymentStep n={1} label="Create payment order"  active={step==="creating"}  done={stepN>1} />
          <PaymentStep n={2} label="Complete checkout"      active={step==="checkout"}  done={stepN>2} />
          <PaymentStep n={3} label="Verify & confirm"       active={step==="verifying"} done={stepN>3} />
        </div>

        <div style={{ background:"#FFF7ED", borderRadius:12, padding:"14px 16px", marginBottom:18, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div>
            <div style={{ fontSize:11, color:"#9CA3AF", fontWeight:600, textTransform:"uppercase" as const, marginBottom:2 }}>Total Due</div>
            <div style={{ fontSize:12, color:"#6B7280" }}>{serviceName} · {providerName}</div>
          </div>
          <div style={{ fontSize:26, fontWeight:800, color:"#F97316" }}>₹{amountRupees.toLocaleString("en-IN")}</div>
        </div>

        {step==="idle" && (
          <div style={{ marginBottom:20 }}>
            <div style={{ fontSize:11, color:"#9CA3AF", fontWeight:600, marginBottom:8, textTransform:"uppercase" as const }}>Accepted Methods</div>
            <div style={{ display:"flex", gap:6, flexWrap:"wrap" as const }}>
              {["UPI","Credit Card","Debit Card","Net Banking","Wallets"].map(m => (
                <span key={m} style={{ fontSize:11, fontWeight:500, background:"#F3F4F6", color:"#4B5563", borderRadius:8, padding:"4px 10px", border:"1px solid #E5E7EB" }}>{m}</span>
              ))}
            </div>
          </div>
        )}

        {(step==="creating"||step==="verifying") && (
          <div style={{ textAlign:"center", padding:"14px 0", marginBottom:14 }}>
            <div style={{ width:34, height:34, border:"3px solid #F3F4F6", borderTop:"3px solid #F97316", borderRadius:"50%", animation:"spin 0.8s linear infinite", margin:"0 auto 10px" }} />
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            <p style={{ fontSize:13, color:"#6B7280", margin:0 }}>{step==="creating"?"Preparing your payment...":"Verifying your payment..."}</p>
          </div>
        )}

        {step==="checkout" && (
          <div style={{ background:"#EFF6FF", borderRadius:10, padding:"12px 14px", marginBottom:14 }}>
            <p style={{ fontSize:13, color:"#1D4ED8", margin:0, fontWeight:500 }}>💡 Complete your payment in the Razorpay window that opened.</p>
          </div>
        )}

        {step==="idle" && (
          <>
            <button onClick={startPayment} style={{ width:"100%", background:"#F97316", color:"#fff", fontWeight:700, fontSize:15, padding:"14px 0", borderRadius:14, border:"none", cursor:"pointer", marginBottom:10 }}>
              💳 Pay ₹{amountRupees.toLocaleString("en-IN")} Now
            </button>
            <p style={{ fontSize:11, color:"#9CA3AF", textAlign:"center", margin:0 }}>🔒 256-bit SSL encryption · Your data is safe</p>
          </>
        )}
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
export function SmartServeLanding({
  onLoginClick, onPartnerClick: _onPartnerClick,
  isLoggedIn = false, userName,
  accessToken, onLogout, onOpenChat,
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

  const [viewingProviderId, setViewingProviderId] = useState<number | null>(null);
  const [bookingProvider,   setBookingProvider]   = useState<ApiProviderDetail | null>(null);
  const [paymentAppt,       setPaymentAppt]       = useState<{ id: number; serviceName: string; amount: number; providerName: string } | null>(null);
  const [paidApptIds,       setPaidApptIds]       = useState<Set<number>>(new Set());
  const [showBookings,      setShowBookings]      = useState(false);
  const [reviewAppt,        setReviewAppt]        = useState<CustomerAppointment | null>(null);
  const [lastReviewedId,    setLastReviewedId]    = useState<number | null>(null);
  const [showMyReviews,     setShowMyReviews]     = useState(false);
  const [toast,             setToast]             = useState<{ msg: string; ok: boolean } | null>(null);

  const showToastMsg = (msg: string, ok: boolean) => { setToast({ msg, ok }); setTimeout(() => setToast(null), 3500); };

  const handleBookProvider = (providerId: number) => {
    fetch(`${BASE}/providers/${providerId}`)
      .then(r => r.ok ? r.json() : Promise.reject(new Error("not found")))
      .then((p: ApiProviderDetail) => setBookingProvider(p))
      .catch(() => {
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
            setCity(unique[0]);
          }
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
          setProviders([]);
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
      {viewingProviderId !== null && (
        <ProviderProfileModal
          providerId={viewingProviderId}
          onClose={() => setViewingProviderId(null)}
          onBook={(p) => { setViewingProviderId(null); setBookingProvider(p); }}
        />
      )}

      {bookingProvider !== null && (
        <BookingModal
          provider={bookingProvider}
          token={accessToken ?? ""}
          onClose={() => setBookingProvider(null)}
          onBooked={() => {
            setBookingProvider(null);
            showToastMsg("Booking submitted! 🕒 Awaiting provider confirmation.", true);
          }}
        />
      )}

      {paymentAppt && accessToken && (
        <PaymentModal
          appointmentId={paymentAppt.id}
          serviceName={paymentAppt.serviceName}
          amountRupees={paymentAppt.amount}
          providerName={paymentAppt.providerName}
          token={accessToken}
          onClose={() => setPaymentAppt(null)}
          onSuccess={(paymentId) => {
            setPaidApptIds(prev => new Set([...prev, paymentAppt.id]));
            setPaymentAppt(null);
            showToastMsg(`Payment successful! ✅ ID: ${paymentId.slice(-8)}`, true);
          }}
        />
      )}

      {showBookings && accessToken && (
        <MyBookingsPanel
          token={accessToken}
          onClose={() => setShowBookings(false)}
          onLeaveReview={appt => setReviewAppt(appt)}
          onBookAgain={id => { setShowBookings(false); handleBookProvider(id); }}
          onOpenChat={id => { setShowBookings(false); onOpenChat?.(id); }}
          paidApptIds={paidApptIds}
          onPay={(appt) => {
            setShowBookings(false);
            setPaymentAppt({
              id:           appt.id,
              serviceName:  appt.service_name,
              amount:       appt.agreed_price,
              providerName: appt.provider_name || "Provider",
            });
          }}
          reviewedApptId={lastReviewedId}
        />
      )}

      {reviewAppt && accessToken && (
        <LeaveReviewModal
          appointment={reviewAppt}
          token={accessToken}
          onClose={(submitted) => {
            if (submitted) {
              showToastMsg("Review submitted — thank you! ⭐", true);
              setLastReviewedId(reviewAppt?.id ?? null);
            }
            setReviewAppt(null);
          }}
        />
      )}

      {showMyReviews && accessToken && (
        <MyReviewsPanel
          token={accessToken}
          onClose={() => setShowMyReviews(false)}
          onOpenBookings={() => { setShowMyReviews(false); setShowBookings(true); }}
        />
      )}

      {toast && (
        <div style={{ position: "fixed", bottom: 24, right: isMobile ? 12 : 24, left: isMobile ? 12 : "auto", zIndex: 9999, background: toast.ok ? "#F0FDF4" : "#FEF2F2", border: `1px solid ${toast.ok ? "#BBF7D0" : "#FECACA"}`, color: toast.ok ? "#16a34a" : "#DC2626", borderRadius: 12, padding: "12px 18px", fontSize: 13, fontWeight: 500, boxShadow: "0 4px 16px rgba(0,0,0,0.12)", textAlign: "center" }}>{toast.msg}</div>
      )}

      {/* Mobile slide-in menu */}
      {mobileMenu && (
        <div onClick={() => setMobileMenu(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 200 }}>
          <div onClick={e => e.stopPropagation()} style={{ position: "absolute", top: 0, left: 0, width: "75%", maxWidth: 300, height: "100vh", background: "#1A1A2E", padding: "24px 20px", overflowY: "auto" }}>
            <div style={{ fontWeight: 800, fontSize: 20, color: "#F97316", marginBottom: 32 }}>SmartServe</div>
            {["Home","Services","Cities","For Partners","Contact"].map(item => (
              <div key={item} style={{ padding: "14px 0", borderBottom: "1px solid rgba(255,255,255,0.08)", color: "#D1D5DB", fontSize: 15, fontWeight: 500, cursor: "pointer" }}>{item}</div>
            ))}
            <div style={{ marginTop: 28, display: "flex", flexDirection: "column", gap: 10 }}>
              {isLoggedIn ? (
                <>
                  <button onClick={() => { setMobileMenu(false); setShowBookings(true); }}
                    style={{ background: "rgba(249,115,22,0.15)", color: "#F97316", border: "1px solid rgba(249,115,22,0.3)", borderRadius: 10, padding: "12px 0", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>📅 My Bookings</button>
                  <button onClick={() => { setMobileMenu(false); setShowMyReviews(true); }}
                    style={{ background: "rgba(255,255,255,0.08)", color: "#D1D5DB", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 10, padding: "12px 0", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>⭐ My Reviews</button>
                  <button onClick={() => { setMobileMenu(false); onOpenChat?.(); }}
                    style={{ background: "rgba(59,130,246,0.15)", color: "#93C5FD", border: "1px solid rgba(59,130,246,0.3)", borderRadius: 10, padding: "12px 0", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>💬 Messages</button>
                  <button onClick={() => { setMobileMenu(false); onLogout?.(); }}
                    style={{ background: "rgba(239,68,68,0.15)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 10, padding: "12px 0", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>🚪 Logout</button>
                </>
              ) : (
                <button onClick={() => { setMobileMenu(false); onLoginClick(); }}
                  style={{ background: "#F97316", color: "#fff", border: "none", borderRadius: 10, padding: "12px 0", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>📅 Book Now</button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Navbar ── */}
      <nav style={{ background: "#1A1A2E", height: 56, display: "flex", alignItems: "center", padding: isMobile ? "0 16px" : "0 40px", position: "sticky", top: 0, zIndex: 100, boxShadow: "0 2px 12px rgba(0,0,0,0.15)" }}>
        <span style={{ fontWeight: 800, fontSize: 20, color: "#F97316", letterSpacing: "-0.5px", marginRight: "auto" }}>SmartServe</span>
        <div className="ss-nav-links" style={{ marginRight: 24 }}>
          {["Home","Services","Cities","For Partners","Contact"].map(item => (
            <a key={item} href="#" style={{ color: "#D1D5DB", fontSize: 14, fontWeight: 500, textDecoration: "none" }}
              onMouseEnter={e => (e.currentTarget.style.color = "#F97316")}
              onMouseLeave={e => (e.currentTarget.style.color = "#D1D5DB")}
            >{item}</a>
          ))}
        </div>
        <div className="ss-nav-actions">
          {isLoggedIn ? (
            <>
              <span style={{ fontSize: 13, color: "#9CA3AF", marginRight: 4 }}>Hi, <strong style={{ color: "#fff" }}>{userName}</strong></span>
              <button onClick={() => setShowBookings(true)}
                style={{ background: "rgba(249,115,22,0.15)", color: "#F97316", border: "1px solid rgba(249,115,22,0.3)", borderRadius: 10, padding: "7px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                📅 Bookings
              </button>
              <button onClick={() => setShowMyReviews(true)}
                style={{ background: "rgba(255,255,255,0.08)", color: "#D1D5DB", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 10, padding: "7px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                ⭐ Reviews
              </button>
              <button onClick={onLogout}
                style={{ background: "rgba(239,68,68,0.15)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 10, padding: "7px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                Logout
              </button>
            </>
          ) : (
            <>
              <button onClick={onLoginClick} style={{ background: "#F97316", color: "#fff", fontWeight: 700, fontSize: 14, padding: "8px 20px", borderRadius: 10, border: "none", cursor: "pointer" }}>Book Now</button>
              <button onClick={onLoginClick} style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "50%", width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#fff", fontSize: 16 }}>👤</button>
            </>
          )}
        </div>
        <button className="ss-mobile-menu-btn" onClick={() => setMobileMenu(true)}
          style={{ display: "none", background: "rgba(255,255,255,0.1)", border: "none", borderRadius: 8, width: 38, height: 38, alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#fff", fontSize: 20 }}>
          ☰
        </button>
      </nav>

      {/* ── Hero ── */}
      <section style={{ background: "#fff", padding: isMobile ? "28px 0 20px" : "60px 0 50px" }}>
        <div className="ss-section">
          <div className="ss-hero-inner" style={{ display: "flex", alignItems: "center", gap: isMobile ? 20 : 60 }}>
            <div style={{ flex: 1 }}>
              <h1 style={{ fontSize: isMobile ? 28 : 42, fontWeight: 800, color: "#111827", lineHeight: 1.15, margin: "0 0 16px", letterSpacing: "-1px" }}>
                Professional Home<br />Services at Your<br />Fingertips
              </h1>
              <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", gap: 0, boxShadow: "0 2px 16px rgba(0,0,0,0.1)", borderRadius: 12, overflow: "hidden", maxWidth: isMobile ? "100%" : 480 }}>
                {!isMobile && (
                  <select value={city} onChange={e => setCity(e.target.value)}
                    style={{ padding: "14px 14px", border: "none", outline: "none", fontSize: 14, color: "#374151", width: "148px", borderRight: "1px solid #E5E7EB", background: "#fff", cursor: "pointer" }}>
                    {citiesList.length > 0
                      ? citiesList.map(c => <option key={c} value={c}>{c}</option>)
                      : <option value={city}>{city}</option>
                    }
                  </select>
                )}
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search for services..."
                  style={{ flex: 1, padding: isMobile ? "13px 14px" : "14px 18px", border: "none", outline: "none", fontSize: 14, color: "#374151" }} />
                <button onClick={isLoggedIn ? undefined : onLoginClick}
                  style={{ background: "#F97316", color: "#fff", fontWeight: 700, fontSize: 14, padding: isMobile ? "13px 18px" : "14px 24px", border: "none", cursor: "pointer" }}>Search</button>
              </div>
              {isMobile && (
                <>
                  <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 8, background: "#F9FAFB", border: "1px solid #E5E7EB", borderRadius: 12, padding: "10px 14px" }}>
                    <span style={{ fontSize: 16 }}>📍</span>
                    <select value={city} onChange={e => setCity(e.target.value)}
                      style={{ flex: 1, border: "none", outline: "none", fontSize: 14, color: "#374151", background: "transparent", cursor: "pointer", fontWeight: 600 }}>
                      {citiesList.length > 0
                        ? citiesList.map(c => <option key={c} value={c}>{c}</option>)
                        : <option value={city}>{city}</option>
                      }
                    </select>
                    <span style={{ fontSize: 12, color: "#9CA3AF" }}>Showing providers near you</span>
                  </div>
                  <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                    <button onClick={isLoggedIn ? () => setShowBookings(true) : onLoginClick}
                      style={{ flex: 1, background: "#F97316", color: "#fff", fontWeight: 700, fontSize: 14, padding: "12px 0", borderRadius: 12, border: "none", cursor: "pointer" }}>📅 My Bookings</button>
                    <button onClick={() => alert('Partner registration coming soon!')}
                      style={{ flex: 1, background: "#F3F4F6", color: "#374151", fontWeight: 600, fontSize: 13, padding: "12px 0", borderRadius: 12, border: "none", cursor: "pointer" }}>Become Partner</button>
                  </div>
                </>
              )}
            </div>
            <div className="ss-hero-img">
              <div style={{ borderRadius: 20, overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}>
                <img src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=720&q=80" alt="Home Services"
                  style={{ width: "100%", height: 220, objectFit: "cover", display: "block" }} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Top Services ── */}
      <section style={{ padding: isMobile ? "20px 0" : "40px 0" }}>
        <div className="ss-section">
          <h2 style={{ fontSize: isMobile ? 16 : 20, fontWeight: 700, color: "#111827", marginBottom: 16 }}>Top Services in {city}</h2>
          <div className="ss-grid-6">
            {TOP_SERVICES.map(s => (
              <div key={s.label} onClick={isLoggedIn ? undefined : onLoginClick}
                style={{ background: "#fff", border: "1px solid #F3F4F6", borderRadius: 14, padding: isMobile ? "12px 6px" : "18px 10px", display: "flex", flexDirection: "column", alignItems: "center", gap: 8, cursor: "pointer", transition: "box-shadow 0.2s" }}
                onMouseEnter={e => (e.currentTarget.style.boxShadow = "0 4px 16px rgba(249,115,22,0.15)")}
                onMouseLeave={e => (e.currentTarget.style.boxShadow = "none")}
              >
                <div style={{ width: 44, height: 44, background: s.color, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>{s.icon}</div>
                <span style={{ fontSize: 11, color: "#374151", fontWeight: 500, textAlign: "center" }}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Other Services ── */}
      <section style={{ padding: isMobile ? "0 0 20px" : "0 0 40px" }}>
        <div className="ss-section">
          <h2 style={{ fontSize: isMobile ? 16 : 20, fontWeight: 700, color: "#111827", marginBottom: 16 }}>Other Popular Services</h2>
          <div className="ss-grid-6">
            {OTHER_SERVICES.map(s => (
              <div key={s.label} onClick={isLoggedIn ? undefined : onLoginClick}
                style={{ background: "#fff", border: "1px solid #F3F4F6", borderRadius: 14, padding: isMobile ? "12px 6px" : "18px 10px", display: "flex", flexDirection: "column", alignItems: "center", gap: 8, cursor: "pointer" }}>
                <div style={{ width: 44, height: 44, background: s.color, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>{s.icon}</div>
                <span style={{ fontSize: 11, color: "#374151", fontWeight: 500, textAlign: "center" }}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Popular Services ── */}
      <section style={{ padding: isMobile ? "20px 0" : "40px 0", background: "#FAFAFA" }}>
        <div className="ss-section">
          <h2 style={{ fontSize: isMobile ? 16 : 20, fontWeight: 700, color: "#111827", marginBottom: 16 }}>Popular Services</h2>
          <div className="ss-grid-4">
            {POPULAR_SERVICES.map(svc => (
              <div key={svc.label} onClick={isLoggedIn ? undefined : onLoginClick}
                style={{ background: "#fff", borderRadius: 16, overflow: "hidden", border: "1px solid #F3F4F6", cursor: "pointer" }}>
                <img src={svc.img} alt={svc.label} style={{ width: "100%", height: 120, objectFit: "cover", display: "block" }} />
                <div style={{ padding: "12px 14px" }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: "#111827" }}>{svc.label}</div>
                  <div style={{ fontSize: 12, color: "#9CA3AF", marginTop: 2 }}>{svc.category}</div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
                    <span style={{ fontWeight: 700, color: "#F97316", fontSize: 15 }}>{svc.price}</span>
                    <Stars rating={svc.rating} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section style={{ padding: isMobile ? "24px 0" : "60px 0" }}>
        <div className="ss-section">
          <h2 style={{ fontSize: isMobile ? 16 : 20, fontWeight: 700, color: "#111827", marginBottom: 20 }}>How It Works</h2>
          <div className="ss-grid-4">
            {HOW_IT_WORKS.map(({ step, title, desc }) => (
              <div key={step} style={{ background: "#fff", border: "1px solid #F3F4F6", borderRadius: 16, padding: "24px 18px", textAlign: "center" }}>
                <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#F97316", color: "#fff", fontWeight: 800, fontSize: 17, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>{step}</div>
                <div style={{ fontWeight: 700, fontSize: 15, color: "#111827", marginBottom: 6 }}>{title}</div>
                <div style={{ fontSize: 13, color: "#6B7280" }}>{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Provider Cards ── */}
      <section style={{ padding: isMobile ? "24px 0" : "60px 0", background: "linear-gradient(180deg, #FFF7ED 0%, #ffffff 100%)" }}>
        <div className="ss-section">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: isMobile ? "flex-start" : "flex-end", flexDirection: isMobile ? "column" : "row", gap: 12, marginBottom: 20 }}>
            <div>
              <h2 style={{ fontSize: isMobile ? 20 : 28, fontWeight: 800, color: "#111827", margin: 0 }}>
                Service Providers in{" "}
                <span style={{ color: "#F97316" }}>{city}</span>
              </h2>
              <p style={{ fontSize: 13, color: "#6B7280", marginTop: 6 }}>Hand-picked, background-verified experts ready to serve you</p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {!isMobile && citiesList.length > 1 && (
                <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#fff", border: "1px solid #E5E7EB", borderRadius: 10, padding: "7px 12px" }}>
                  <span style={{ fontSize: 14 }}>📍</span>
                  <select value={city} onChange={e => setCity(e.target.value)}
                    style={{ border: "none", outline: "none", fontSize: 13, color: "#374151", background: "transparent", cursor: "pointer", fontWeight: 600 }}>
                    {citiesList.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              )}
            </div>
          </div>

          {citiesList.length > 1 && (
            <div style={{ display: "flex", gap: 8, marginBottom: 16, overflowX: "auto", paddingBottom: 4 }}>
              {citiesList.map(c => (
                <button key={c} onClick={() => setCity(c)} style={{
                  padding: "6px 16px", borderRadius: 99, fontSize: 13, fontWeight: 600,
                  cursor: "pointer", flexShrink: 0, border: "none",
                  background: city === c ? "#F97316" : "#fff",
                  color:      city === c ? "#fff"    : "#4B5563",
                  boxShadow: city === c ? "0 2px 8px rgba(249,115,22,0.3)" : "0 1px 4px rgba(0,0,0,0.06)",
                }}>📍 {c}</button>
              ))}
            </div>
          )}

          <div style={{ display: "flex", gap: 8, marginBottom: 24, overflowX: "auto", paddingBottom: 4 }}>
            {filters.map(f => (
              <button key={f} onClick={() => setActiveFilter(f)} style={{
                padding: "7px 16px", borderRadius: 99, fontSize: 13, fontWeight: 600, cursor: "pointer", flexShrink: 0,
                background: activeFilter === f ? "#F97316" : "#fff",
                color: activeFilter === f ? "#fff" : "#4B5563",
                border: activeFilter === f ? "none" : "1px solid #E5E7EB",
              }}>{f}</button>
            ))}
          </div>

          {loadingProv ? <Spinner /> : providers.length === 0 ? (
            <div style={{ textAlign: "center", padding: "48px 24px", background: "#F9FAFB", borderRadius: 20, border: "1px dashed #E5E7EB" }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: "#374151", marginBottom: 8 }}>No providers in {city}</div>
              <p style={{ fontSize: 14, color: "#9CA3AF", maxWidth: 320, margin: "0 auto 20px" }}>
                We don't have any registered service providers in {city} yet. Try a different city or check back soon!
              </p>
              {citiesList.length > 1 && (
                <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
                  {citiesList.filter(c => c !== city).slice(0, 4).map(c => (
                    <button key={c} onClick={() => setCity(c)}
                      style={{ background: "#F97316", color: "#fff", border: "none", borderRadius: 99, padding: "8px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                      📍 {c}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="ss-provider-grid">
              {filteredProviders.map(p => (
                <ProviderCard
                  key={p.id}
                  p={p}
                  onBook={(id) => handleBookProvider(id)}
                  onViewProfile={(id) => setViewingProviderId(id)}
                />
              ))}
            </div>
          )}

          <div style={{ marginTop: 32, background: "#1A1A2E", borderRadius: 18, padding: isMobile ? "20px 16px" : "28px 36px", display: "flex", flexDirection: isMobile ? "column" : "row", alignItems: isMobile ? "stretch" : "center", justifyContent: "space-between", gap: 16 }}>
            <div>
              <div style={{ fontSize: isMobile ? 16 : 20, fontWeight: 700, color: "#fff" }}>Want to join as a service provider?</div>
              <div style={{ fontSize: 13, color: "#9CA3AF", marginTop: 4 }}>Earn up to ₹50,000/month on SmartServe</div>
            </div>
            <div style={{ display: "flex", gap: 10, flexDirection: isMobile ? "column" : "row" }}>
              <button onClick={() => alert('Partner registration coming soon!')}
                style={{ background: "#F97316", color: "#fff", fontWeight: 700, fontSize: 14, padding: "12px 24px", borderRadius: 12, border: "none", cursor: "pointer" }}>Partner With Us</button>
              <button style={{ background: "transparent", color: "#D1D5DB", fontWeight: 600, fontSize: 14, padding: "12px 18px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.2)", cursor: "pointer" }}>Learn More</button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section style={{ padding: isMobile ? "24px 0" : "60px 0", background: "#FAFAFA" }}>
        <div className="ss-section">
          <h2 style={{ fontSize: isMobile ? 16 : 20, fontWeight: 700, color: "#111827", marginBottom: 20 }}>Trusted by 1M+ Customers</h2>
          <div className="ss-grid-3">
            {siteReviews.map(({ name, rating, text, avatar, bg }) => (
              <div key={name} style={{ background: "#fff", borderRadius: 16, padding: 20, border: "1px solid #F3F4F6" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: "50%", background: bg, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 15 }}>{avatar}</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: "#111827" }}>{name}</div>
                    <Stars rating={rating} />
                  </div>
                </div>
                <p style={{ fontSize: 13, color: "#4B5563", lineHeight: 1.6, margin: 0 }}>"{text}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ background: "#1A1A2E", padding: isMobile ? "32px 0 24px" : "56px 40px 32px", color: "#9CA3AF" }}>
        <div className="ss-section" style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div className="ss-footer-grid">
            <div>
              <div style={{ fontWeight: 800, fontSize: 20, color: "#F97316", marginBottom: 12 }}>SmartServe</div>
              <p style={{ fontSize: 13, lineHeight: 1.7, color: "#6B7280", maxWidth: 220 }}>Professional home services at your fingertips. Quality guaranteed.</p>
            </div>
            {Object.entries(FOOTER_LINKS).map(([heading, links]) => (
              <div key={heading}>
                <div style={{ fontWeight: 700, fontSize: 14, color: "#fff", marginBottom: 14 }}>{heading}</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {links.map(link => (
                    <a key={link} href="#" style={{ fontSize: 13, color: "#6B7280", textDecoration: "none" }}
                      onMouseEnter={e => (e.currentTarget.style.color = "#F97316")}
                      onMouseLeave={e => (e.currentTarget.style.color = "#6B7280")}
                    >{link}</a>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 20, textAlign: "center", fontSize: 13, color: "#4B5563" }}>
            © 2026 SmartServe. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

export default SmartServeLanding;
