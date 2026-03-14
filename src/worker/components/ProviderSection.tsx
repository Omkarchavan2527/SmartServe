
interface Provider {
  id: number; name: string; role: string; rating: number; reviews: number;
  experience: string; price: string; tags: string[]; avatar: string;
  avatarBg: string; badge: string; available: boolean;
}

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

function Spinner() {
  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "48px 0" }}>
      <div style={{ width: 32, height: 32, border: "3px solid #F3F4F6", borderTop: "3px solid #F97316", borderRadius: "50%", animation: "spin 1s linear infinite" }}></div>
    </div>
  );
}

function ProviderCard({ p, onBook, onViewProfile }: { p: Provider; onBook: (id: number) => void; onViewProfile: (id: number) => void }) {
  return (
    <div style={{
      background: "#fff", borderRadius: 16, border: "1px solid #F3F4F6",
      padding: 20, position: "relative", overflow: "hidden",
    }}>
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

      <div style={{ marginTop: 16 }}>
        <div style={{ fontWeight: 700, fontSize: 18, color: "#F97316", marginBottom: 8 }}>₹{p.price}</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
          {p.tags.map(tag => (
            <span key={tag} style={{ background: "#F3F4F6", color: "#374151", fontSize: 11, fontWeight: 500, padding: "4px 8px", borderRadius: 6 }}>{tag}</span>
          ))}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => onViewProfile(p.id)}
            style={{ flex: 1, background: "#fff", color: "#374151", border: "1px solid #E5E7EB", borderRadius: 10, padding: "10px 0", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
            View Profile
          </button>
          <button onClick={() => onBook(p.id)}
            style={{ flex: 1, background: "#F97316", color: "#fff", border: "none", borderRadius: 10, padding: "10px 0", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
            Book Now
          </button>
        </div>
      </div>
    </div>
  );
}

interface ProviderSectionProps {
  isMobile: boolean;
  city: string;
  setCity: (city: string) => void;
  citiesList: string[];
  activeFilter: string;
  setActiveFilter: (filter: string) => void;
  filters: string[];
  loadingProv: boolean;
  providers: Provider[];
  filteredProviders: Provider[];
  handleBookProvider: (id: number) => void;
  setViewingProviderId: (id: number | null) => void;
  onPartnerClick: () => void;
}

export function ProviderSection({
  isMobile, city, setCity, citiesList, activeFilter, setActiveFilter, filters,
  loadingProv, providers, filteredProviders, handleBookProvider, setViewingProviderId, onPartnerClick
}: ProviderSectionProps) {
  return (
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
          {/* Desktop city picker in provider section */}
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

        {/* City pills — quick switch */}
        {citiesList.length > 1 && (
          <div style={{ display: "flex", gap: 8, marginBottom: 16, overflowX: "auto", paddingBottom: 4, WebkitOverflowScrolling: "touch" as unknown as undefined }}>
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

        {/* Filter chips */}
        <div style={{ display: "flex", gap: 8, marginBottom: 24, overflowX: "auto", paddingBottom: 4, WebkitOverflowScrolling: "touch" as unknown as undefined }}>
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
            <button onClick={onPartnerClick}
              style={{ background: "#F97316", color: "#fff", fontWeight: 700, fontSize: 14, padding: "12px 24px", borderRadius: 12, border: "none", cursor: "pointer" }}>Partner With Us</button>
            <button style={{ background: "transparent", color: "#D1D5DB", fontWeight: 600, fontSize: 14, padding: "12px 18px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.2)", cursor: "pointer" }}>Learn More</button>
          </div>
        </div>
      </div>
    </section>
  );
}