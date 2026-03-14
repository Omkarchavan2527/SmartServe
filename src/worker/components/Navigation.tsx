import React from "react";

interface NavigationProps {
  isMobile: boolean;
  isLoggedIn: boolean;
  userName?: string;
  onLoginClick: () => void;
  onLogout?: () => void;
  setShowBookings: (show: boolean) => void;
  setShowMyReviews: (show: boolean) => void;
  mobileMenu: boolean;
  setMobileMenu: (show: boolean) => void;
}

export function Navigation({
  isMobile, isLoggedIn, userName, onLoginClick, onLogout,
  setShowBookings, setShowMyReviews, mobileMenu, setMobileMenu
}: NavigationProps) {
  return (
    <>
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

        {/* Desktop nav links */}
        <div className="ss-nav-links" style={{ marginRight: 24 }}>
          {["Home","Services","Cities","For Partners","Contact"].map(item => (
            <a key={item} href="#" style={{ color: "#D1D5DB", fontSize: 14, fontWeight: 500, textDecoration: "none" }}
              onMouseEnter={e => (e.currentTarget.style.color = "#F97316")}
              onMouseLeave={e => (e.currentTarget.style.color = "#D1D5DB")}
            >{item}</a>
          ))}
        </div>

        {/* Desktop action buttons */}
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

        {/* Mobile hamburger */}
        <button className="ss-mobile-menu-btn" onClick={() => setMobileMenu(true)}
          style={{ display: "none", background: "rgba(255,255,255,0.1)", border: "none", borderRadius: 8, width: 38, height: 38, alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#fff", fontSize: 20 }}>
          ☰
        </button>
      </nav>
    </>
  );
}