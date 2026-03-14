// Assuming these are defined elsewhere, I'll import them or define here
const TOP_SERVICES = [
  { icon: "🧹", label: "Cleaning", color: "#EFF6FF" },
  { icon: "🔧", label: "Repair", color: "#FFFBEB" },
  { icon: "🐛", label: "Pest Control", color: "#FEF2F2" },
  { icon: "🚗", label: "Car Detailing", color: "#FFFBEB" },
  { icon: "💆", label: "Massage", color: "#FFF0F6" },
  { icon: "🏡", label: "Disinfection", color: "#F0FDF4" },
];
const OTHER_SERVICES = [
  { icon: "🚿", label: "Bathroom Cleaner", color: "#F0F9FF" },
  { icon: "🛏️", label: "Bed Bug Control", color: "#FFF7ED" },
  { icon: "⚡", label: "Electrician", color: "#FFFBEB" },
  { icon: "🔩", label: "Plumber", color: "#EFF6FF" },
  { icon: "💆", label: "Massage", color: "#FFF0F6" },
  { icon: "🏡", label: "Disinfection", color: "#F0FDF4" },
];
const POPULAR_SERVICES = [
  { label: "Deep Cleaning", category: "Home & Office", price: "₹1,299", rating: 4.8, img: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=300&q=80" },
  { label: "Salon at Home", category: "Hair & Beauty", price: "₹899", rating: 4.9, img: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=300&q=80" },
  { label: "Wellness Spa", category: "Massage & Therapy", price: "₹1,599", rating: 4.7, img: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=300&q=80" },
  { label: "Pest Control", category: "Safe & Effective", price: "₹999", rating: 4.6, img: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&q=80" },
];

function Stars({ rating }: { rating: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
      {[1,2,3,4,5].map(i => (
        <span key={i} style={{ fontSize: 10, color: i <= rating ? "#F97316" : "#E5E7EB" }}>★</span>
      ))}
      <span style={{ fontSize: 11, color: "#9CA3AF", marginLeft: 4 }}>{rating}</span>
    </div>
  );
}

interface ServicesSectionsProps {
  isMobile: boolean;
  isLoggedIn: boolean;
  city: string;
  onLoginClick: () => void;
}

export function ServicesSections({ isMobile, isLoggedIn, city, onLoginClick }: ServicesSectionsProps) {
  return (
    <>
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
    </>
  );
}