interface HeroProps {
  isMobile: boolean;
  isLoggedIn: boolean;
  city: string;
  setCity: (city: string) => void;
  search: string;
  setSearch: (search: string) => void;
  citiesList: string[];
  onLoginClick: () => void;
  onPartnerClick: () => void;
  setShowBookings: (show: boolean) => void;
}

export function Hero({
  isMobile, isLoggedIn, city, setCity, search, setSearch, citiesList,
  onLoginClick, onPartnerClick, setShowBookings
}: HeroProps) {
  return (
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
                  style={{ padding: "14px 14px", border: "none", outline: "none", fontSize: 14, color: "#374151", width: 148, borderRight: "1px solid #E5E7EB", background: "#fff", cursor: "pointer" }}>
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
                {/* City selector row on mobile */}
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
                  <button onClick={onPartnerClick}
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
  );
}