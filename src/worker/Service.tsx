import React, { useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Provider {
  id: number;
  name: string;
  role: string;
  rating: number;
  reviews: number;
  experience: string;
  price: string;
  tags: string[];
  avatar: string;
  avatarBg: string;
  badge: string;
  available: boolean;
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const TOP_SERVICES = [
  { icon: "🏠", label: "Cleaning",     color: "#FFF7ED", iconBg: "#FED7AA" },
  { icon: "✂️", label: "Salon",        color: "#FFF0F6", iconBg: "#FBCFE8" },
  { icon: "🌿", label: "Spa",          color: "#F0FDF4", iconBg: "#BBF7D0" },
  { icon: "🔧", label: "Repair",       color: "#EFF6FF", iconBg: "#BFDBFE" },
  { icon: "🐛", label: "Pest Control", color: "#FEF2F2", iconBg: "#FECACA" },
  { icon: "🚗", label: "Car Detailing",color: "#FFFBEB", iconBg: "#FDE68A" },
];

const OTHER_SERVICES = [
  { icon: "🚿", label: "Bathroom Cleaner",      color: "#F0F9FF", iconBg: "#BAE6FD" },
  { icon: "🛏️", label: "Bed Bug Control",       color: "#FFF7ED", iconBg: "#FED7AA" },
  { icon: "⚡", label: "Electrician",           color: "#FFFBEB", iconBg: "#FDE68A" },
  { icon: "🔩", label: "Plumber",               color: "#EFF6FF", iconBg: "#BFDBFE" },
  { icon: "💆", label: "Massage",               color: "#FFF0F6", iconBg: "#FBCFE8" },
  { icon: "🏡", label: "Household Disinfection",color: "#F0FDF4", iconBg: "#BBF7D0" },
];

const POPULAR_SERVICES = [
  { label: "Deep Cleaning",  category: "Home & Office",    price: "₹1,299", rating: 4.8, img: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=300&q=80" },
  { label: "Salon at Home",  category: "Hair & Beauty",    price: "₹899",   rating: 4.9, img: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=300&q=80" },
  { label: "Wellness Spa",   category: "Massage & Therapy",price: "₹1,599", rating: 4.7, img: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=300&q=80" },
  { label: "Pest Control",   category: "Safe & Effective", price: "₹999",   rating: 4.6, img: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&q=80" },
];

const PROVIDERS: Provider[] = [
  { id: 1, name: "Sanket Chavan",    role: "Professional Electrician", rating: 4.9, reviews: 247, experience: "8 yrs", price: "₹800/hr", tags: ["Wiring","Panel Upgrades","Lighting"], avatar: "SC", avatarBg: "#F97316", badge: "Top Rated",  available: true  },
  { id: 2, name: "Priya Sharma",     role: "Home Cleaning Expert",     rating: 4.8, reviews: 312, experience: "5 yrs", price: "₹500/hr", tags: ["Deep Clean","Kitchen","Bathroom"],    avatar: "PS", avatarBg: "#8B5CF6", badge: "Popular",    available: true  },
  { id: 3, name: "Rajan Mehta",      role: "Licensed Plumber",         rating: 4.7, reviews: 189, experience: "10 yrs",price: "₹700/hr", tags: ["Pipe Fix","Installation","Leaks"],    avatar: "RM", avatarBg: "#3B82F6", badge: "Verified",   available: false },
  { id: 4, name: "Anjali Desai",     role: "Beauty & Salon Specialist", rating: 4.9, reviews: 423, experience: "6 yrs", price: "₹600/hr", tags: ["Hair","Makeup","Threading"],          avatar: "AD", avatarBg: "#EC4899", badge: "Top Rated",  available: true  },
  { id: 5, name: "Vikram Singh",     role: "Pest Control Expert",      rating: 4.6, reviews: 156, experience: "7 yrs", price: "₹900/hr", tags: ["Bed Bugs","Termites","Rodents"],      avatar: "VS", avatarBg: "#10B981", badge: "Certified",  available: true  },
  { id: 6, name: "Meera Nair",       role: "Certified Spa Therapist",  rating: 4.8, reviews: 291, experience: "4 yrs", price: "₹750/hr", tags: ["Swedish","Deep Tissue","Aromatherapy"],avatar: "MN", avatarBg: "#F59E0B", badge: "Premium",    available: false },
];

const HOW_IT_WORKS = [
  { step: 1, title: "Book",         desc: "Select service & schedule" },
  { step: 2, title: "Confirm",      desc: "Get instant confirmation" },
  { step: 3, title: "Professional", desc: "Certified expert arrives" },
  { step: 4, title: "Enjoy",        desc: "Quality service guaranteed" },
];

const REVIEWS = [
  { name: "Saksham Shinde", rating: 4.8, text: "Professional cleaning team, thorough work, and great value for money!", avatar: "S", bg: "#F97316" },
  { name: "Raj Nikam",      rating: 4.9, text: "Salon at home was amazing — skilled beautician with all equipment brought!", avatar: "R", bg: "#3B82F6" },
  { name: "Athrav Bhosale", rating: 4.7, text: "Relaxing spa experience at home — therapist was punctual and professional!", avatar: "A", bg: "#10B981" },
];

const FOOTER_LINKS = {
  Services: ["Cleaning Services","Beauty Services","Spa Services","Repair Services","Pest Control"],
  Company:  ["About Us","Careers","Blog","Press","Contact"],
  Support:  ["Help Center","Safety Tips","Cancellation Policy","Privacy Policy","Terms of Service"],
};

// ─── Styles helper ────────────────────────────────────────────────────────────
const S = {
  section: { maxWidth: 1100, margin: "0 auto", padding: "0 40px" } as React.CSSProperties,
};

// ─── Sub-components ───────────────────────────────────────────────────────────
const Stars = ({ rating }: { rating: number }) => (
  <span style={{ display: "flex", alignItems: "center", gap: 3 }}>
    <span style={{ color: "#F97316", fontSize: 13 }}>★</span>
    <span style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>{rating}</span>
  </span>
);

const ServiceIcon = ({ icon, label, color, iconBg }: { icon: string; label: string; color: string; iconBg: string }) => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, cursor: "pointer" }}>
    <div style={{ width: 64, height: 64, background: color, borderRadius: 16, border: "1px solid #F3F4F6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, transition: "transform 0.2s" }}
      onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.transform = "translateY(-3px)"}
      onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)"}
    >{icon}</div>
    <span style={{ fontSize: 12, color: "#374151", fontWeight: 500, textAlign: "center" }}>{label}</span>
  </div>
);

// ─── Provider Card ─────────────────────────────────────────────────────────────
const ProviderCard = ({ p }: { p: Provider }) => {
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
      {/* Badge */}
      <div style={{
        position: "absolute", top: 14, right: 14,
        background: p.badge === "Top Rated" ? "#FFF7ED" : p.badge === "Premium" ? "#FAF5FF" : "#F0FDF4",
        color: p.badge === "Top Rated" ? "#F97316" : p.badge === "Premium" ? "#8B5CF6" : "#16a34a",
        fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 99,
        border: `1px solid ${p.badge === "Top Rated" ? "#FED7AA" : p.badge === "Premium" ? "#DDD6FE" : "#BBF7D0"}`,
      }}>{p.badge}</div>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ width: 56, height: 56, borderRadius: "50%", background: p.avatarBg, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 18, flexShrink: 0 }}>
          {p.avatar}
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 16, color: "#111827" }}>{p.name}</div>
          <div style={{ fontSize: 13, color: "#6B7280", marginTop: 1 }}>{p.role}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
            <Stars rating={p.rating} />
            <span style={{ fontSize: 12, color: "#9CA3AF" }}>({p.reviews} reviews)</span>
            <span style={{ width: 4, height: 4, borderRadius: "50%", background: "#D1D5DB" }} />
            <span style={{ fontSize: 12, color: "#9CA3AF" }}>{p.experience} exp</span>
          </div>
        </div>
      </div>

      {/* Tags */}
      <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 6 }}>
        {p.tags.map((tag) => (
          <span key={tag} style={{ fontSize: 11, fontWeight: 500, color: "#4B5563", background: "#F9FAFB", border: "1px solid #E5E7EB", borderRadius: 99, padding: "3px 10px" }}>{tag}</span>
        ))}
      </div>

      {/* Price + Availability */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <span style={{ fontSize: 18, fontWeight: 700, color: "#F97316" }}>{p.price}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: p.available ? "#22c55e" : "#9CA3AF" }} />
          <span style={{ fontSize: 12, color: p.available ? "#16a34a" : "#9CA3AF", fontWeight: 500 }}>
            {p.available ? "Available Now" : "Busy"}
          </span>
        </div>
      </div>

      {/* Buttons */}
      <div style={{ display: "flex", gap: 10 }}>
        <button style={{
          flex: 1, background: "#F97316", color: "#fff", fontWeight: 700, fontSize: 14,
          padding: "11px 0", borderRadius: 12, border: "none", cursor: "pointer",
          opacity: p.available ? 1 : 0.6, transition: "background 0.2s",
        }}
          onMouseEnter={e => p.available && ((e.currentTarget as HTMLButtonElement).style.background = "#EA6C0A")}
          onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.background = "#F97316")}
        >
          📅 Book Now
        </button>
        <button style={{
          flex: "0 0 44px", background: "#F9FAFB", color: "#374151", fontWeight: 600, fontSize: 14,
          padding: "11px 0", borderRadius: 12, border: "1px solid #E5E7EB", cursor: "pointer", transition: "all 0.2s",
        }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "#EFF6FF"; (e.currentTarget as HTMLButtonElement).style.borderColor = "#BFDBFE"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "#F9FAFB"; (e.currentTarget as HTMLButtonElement).style.borderColor = "#E5E7EB"; }}
        >ℹ️</button>
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
export function SmartServeLanding() {
  const [city, setCity] = useState("Mumbai");
  const [search, setSearch] = useState("");

  return (
    <div style={{ fontFamily: "'Outfit', 'DM Sans', system-ui, sans-serif", background: "#fff", color: "#111827", overflowX: "hidden" }}>

      {/* ── Navbar ── */}
      <nav style={{ background: "#1A1A2E", height: 56, display: "flex", alignItems: "center", padding: "0 40px", position: "sticky", top: 0, zIndex: 100, boxShadow: "0 2px 12px rgba(0,0,0,0.15)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginRight: "auto" }}>
          <span style={{ fontSize: 22 }}>🔧</span>
          <span style={{ fontWeight: 800, fontSize: 20, color: "#F97316", letterSpacing: "-0.5px" }}>SmartServe</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 32, marginRight: 32 }}>
          {["Home","Services","Cities","For Partners","Contact"].map((item) => (
            <a key={item} href="#" style={{ color: "#D1D5DB", fontSize: 14, fontWeight: 500, textDecoration: "none", transition: "color 0.2s" }}
              onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.color = "#F97316"}
              onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.color = "#D1D5DB"}
            >{item}</a>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button style={{ background: "#F97316", color: "#fff", fontWeight: 700, fontSize: 14, padding: "8px 20px", borderRadius: 10, border: "none", cursor: "pointer" }}>Book Now</button>
          <button style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "50%", width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#fff" }}>👤</button>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section style={{ background: "#fff", padding: "60px 0 50px" }}>
        <div style={{ ...S.section, display: "flex", alignItems: "center", gap: 60 }}>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: 42, fontWeight: 800, color: "#111827", lineHeight: 1.15, margin: "0 0 24px", letterSpacing: "-1px" }}>
              Professional Home<br />Services at Your<br />Fingertips
            </h1>
            <div style={{ display: "flex", gap: 0, boxShadow: "0 2px 16px rgba(0,0,0,0.1)", borderRadius: 12, overflow: "hidden", maxWidth: 480 }}>
              <input
                value={city}
                onChange={e => setCity(e.target.value)}
                style={{ padding: "14px 18px", border: "none", outline: "none", fontSize: 14, color: "#374151", width: 140, borderRight: "1px solid #E5E7EB" }}
              />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search for services..."
                style={{ flex: 1, padding: "14px 18px", border: "none", outline: "none", fontSize: 14, color: "#374151" }}
              />
              <button style={{ background: "#F97316", color: "#fff", fontWeight: 700, fontSize: 14, padding: "14px 24px", border: "none", cursor: "pointer" }}>Search</button>
            </div>
          </div>
          <div style={{ flex: "0 0 360px" }}>
            <div style={{ borderRadius: 20, overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}>
              <img
                src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=720&q=80"
                alt="Home Services"
                style={{ width: "100%", height: 220, objectFit: "cover", display: "block" }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Top Services ── */}
      <section style={{ padding: "40px 0" }}>
        <div style={S.section}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: "#111827", marginBottom: 24 }}>Top Services in Karad</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 16 }}>
            {TOP_SERVICES.map((s) => (
              <div key={s.label} style={{ background: "#fff", border: "1px solid #F3F4F6", borderRadius: 16, padding: "20px 12px", display: "flex", flexDirection: "column", alignItems: "center", gap: 10, cursor: "pointer", transition: "box-shadow 0.2s" }}
                onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 20px rgba(249,115,22,0.15)"}
                onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.boxShadow = "none"}
              >
                <div style={{ width: 52, height: 52, background: s.color, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>{s.icon}</div>
                <span style={{ fontSize: 13, color: "#374151", fontWeight: 500 }}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Other Popular Services ── */}
      <section style={{ padding: "0 0 40px" }}>
        <div style={S.section}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: "#111827", marginBottom: 24 }}>Other Popular Services</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 16 }}>
            {OTHER_SERVICES.map((s) => (
              <div key={s.label} style={{ background: "#fff", border: "1px solid #F3F4F6", borderRadius: 16, padding: "20px 12px", display: "flex", flexDirection: "column", alignItems: "center", gap: 10, cursor: "pointer", transition: "box-shadow 0.2s" }}
                onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 20px rgba(249,115,22,0.15)"}
                onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.boxShadow = "none"}
              >
                <div style={{ width: 52, height: 52, background: s.color, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>{s.icon}</div>
                <span style={{ fontSize: 13, color: "#374151", fontWeight: 500, textAlign: "center" }}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Popular Services ── */}
      <section style={{ padding: "40px 0", background: "#FAFAFA" }}>
        <div style={S.section}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: "#111827", marginBottom: 24 }}>Popular Services</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 20 }}>
            {POPULAR_SERVICES.map((svc) => (
              <div key={svc.label} style={{ background: "#fff", borderRadius: 16, overflow: "hidden", border: "1px solid #F3F4F6", cursor: "pointer", transition: "all 0.2s", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = "0 8px 24px rgba(249,115,22,0.12)"; (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = "0 1px 4px rgba(0,0,0,0.05)"; (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)"; }}
              >
                <img src={svc.img} alt={svc.label} style={{ width: "100%", height: 140, objectFit: "cover", display: "block" }} />
                <div style={{ padding: "14px 16px" }}>
                  <div style={{ fontWeight: 700, fontSize: 15, color: "#111827" }}>{svc.label}</div>
                  <div style={{ fontSize: 12, color: "#9CA3AF", marginTop: 2 }}>{svc.category}</div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10 }}>
                    <span style={{ fontWeight: 700, color: "#F97316", fontSize: 16 }}>{svc.price}</span>
                    <Stars rating={svc.rating} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section style={{ padding: "60px 0" }}>
        <div style={S.section}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: "#111827", marginBottom: 32 }}>How It Works</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 20 }}>
            {HOW_IT_WORKS.map(({ step, title, desc }) => (
              <div key={step} style={{ background: "#fff", border: "1px solid #F3F4F6", borderRadius: 16, padding: "30px 20px", textAlign: "center", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
                <div style={{ width: 44, height: 44, borderRadius: "50%", background: "#F97316", color: "#fff", fontWeight: 800, fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>{step}</div>
                <div style={{ fontWeight: 700, fontSize: 16, color: "#111827", marginBottom: 6 }}>{title}</div>
                <div style={{ fontSize: 13, color: "#6B7280" }}>{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Meet Our Service Providers ── */}
      <section style={{ padding: "60px 0", background: "linear-gradient(180deg, #FFF7ED 0%, #ffffff 100%)" }}>
        <div style={S.section}>
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 32 }}>
            <div>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#FFF7ED", border: "1px solid #FED7AA", borderRadius: 99, padding: "4px 12px", marginBottom: 10 }}>
                <span style={{ fontSize: 14 }}>⭐</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: "#F97316" }}>Verified Professionals</span>
              </div>
              <h2 style={{ fontSize: 28, fontWeight: 800, color: "#111827", margin: 0, letterSpacing: "-0.5px" }}>Meet Our Service Providers</h2>
              <p style={{ fontSize: 14, color: "#6B7280", marginTop: 8 }}>Hand-picked, background-verified experts ready to serve you</p>
            </div>
            <button style={{ background: "transparent", border: "2px solid #F97316", color: "#F97316", fontWeight: 700, fontSize: 14, padding: "10px 22px", borderRadius: 12, cursor: "pointer", transition: "all 0.2s" }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "#F97316"; (e.currentTarget as HTMLButtonElement).style.color = "#fff"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; (e.currentTarget as HTMLButtonElement).style.color = "#F97316"; }}
            >View All Providers →</button>
          </div>

          {/* Filter pills */}
          <div style={{ display: "flex", gap: 8, marginBottom: 28, flexWrap: "wrap" as const }}>
            {["All","Electrician","Cleaning","Plumber","Salon","Spa","Pest Control"].map((f, i) => (
              <button key={f} style={{
                padding: "7px 16px", borderRadius: 99, fontSize: 13, fontWeight: 600, cursor: "pointer",
                background: i === 0 ? "#F97316" : "#fff",
                color: i === 0 ? "#fff" : "#4B5563",
                border: i === 0 ? "none" : "1px solid #E5E7EB",
                transition: "all 0.2s",
              }}
                onMouseEnter={e => { if (i !== 0) { (e.currentTarget as HTMLButtonElement).style.borderColor = "#F97316"; (e.currentTarget as HTMLButtonElement).style.color = "#F97316"; } }}
                onMouseLeave={e => { if (i !== 0) { (e.currentTarget as HTMLButtonElement).style.borderColor = "#E5E7EB"; (e.currentTarget as HTMLButtonElement).style.color = "#4B5563"; } }}
              >{f}</button>
            ))}
          </div>

          {/* Provider grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20 }}>
            {PROVIDERS.map((p) => <ProviderCard key={p.id} p={p} />)}
          </div>

          {/* Bottom CTA */}
          <div style={{ marginTop: 40, background: "#1A1A2E", borderRadius: 20, padding: "32px 40px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: 20, fontWeight: 700, color: "#fff" }}>Want to join as a service provider?</div>
              <div style={{ fontSize: 14, color: "#9CA3AF", marginTop: 6 }}>Earn up to ₹50,000/month by offering your services on SmartServe</div>
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <button style={{ background: "#F97316", color: "#fff", fontWeight: 700, fontSize: 14, padding: "12px 28px", borderRadius: 12, border: "none", cursor: "pointer" }}>Partner With Us</button>
              <button style={{ background: "transparent", color: "#D1D5DB", fontWeight: 600, fontSize: 14, padding: "12px 20px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.2)", cursor: "pointer" }}>Learn More</button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Reviews ── */}
      <section style={{ padding: "60px 0", background: "#FAFAFA" }}>
        <div style={S.section}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: "#111827", marginBottom: 28 }}>Trusted by 1M+ Customers</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20 }}>
            {REVIEWS.map(({ name, rating, text, avatar, bg }) => (
              <div key={name} style={{ background: "#fff", borderRadius: 16, padding: 24, border: "1px solid #F3F4F6", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                  <div style={{ width: 44, height: 44, borderRadius: "50%", background: bg, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 16 }}>{avatar}</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15, color: "#111827" }}>{name}</div>
                    <Stars rating={rating} />
                  </div>
                </div>
                <p style={{ fontSize: 14, color: "#4B5563", lineHeight: 1.6, margin: 0 }}>"{text}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ background: "#1A1A2E", padding: "56px 40px 32px", color: "#9CA3AF" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 48, marginBottom: 48 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                <span style={{ fontSize: 20 }}>🔧</span>
                <span style={{ fontWeight: 800, fontSize: 20, color: "#F97316" }}>SmartServe</span>
              </div>
              <p style={{ fontSize: 14, lineHeight: 1.7, color: "#6B7280", maxWidth: 240 }}>Professional home services at your fingertips. Quality guaranteed.</p>
              <div style={{ display: "flex", gap: 14, marginTop: 20 }}>
                {["f","𝕏","📷","in"].map((icon) => (
                  <div key={icon} style={{ width: 34, height: 34, borderRadius: "50%", background: "rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: "#9CA3AF", cursor: "pointer" }}>{icon}</div>
                ))}
              </div>
            </div>
            {Object.entries(FOOTER_LINKS).map(([heading, links]) => (
              <div key={heading}>
                <div style={{ fontWeight: 700, fontSize: 15, color: "#fff", marginBottom: 18 }}>{heading}</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {links.map((link) => (
                    <a key={link} href="#" style={{ fontSize: 14, color: "#6B7280", textDecoration: "none", transition: "color 0.2s" }}
                      onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.color = "#F97316"}
                      onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.color = "#6B7280"}
                    >{link}</a>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 24, textAlign: "center", fontSize: 13, color: "#4B5563" }}>
            © 2026 SmartServe. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

export default SmartServeLanding;