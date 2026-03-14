// ─── dashboardShared.tsx ──────────────────────────────────────────────────────
// Shared micro-components, hooks, CSS, NAV used across all dashboard pages

import  { useState, useEffect } from "react";
import { type Page, type ProviderProfile ,BASE} from "./Dashboardtypes";


// ─── Mobile Hook ─────────────────────────────────────────────────────────────
export function useIsMobile() {
  const [mob, setMob] = useState(() => typeof window !== "undefined" && window.innerWidth < 768);
  useEffect(() => {
    const h = () => setMob(window.innerWidth < 768);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);
  return mob;
}

// ─── Global CSS ───────────────────────────────────────────────────────────────
export const DASH_CSS = `
  *{box-sizing:border-box;}
  body{margin:0;-webkit-text-size-adjust:100%;}

  /* Card */
  .ds-card{background:#fff;border-radius:16px;border:1px solid #F3F4F6;box-shadow:0 1px 4px rgba(0,0,0,0.05);}

  /* Grids */
  .ds-grid-4{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;}
  .ds-grid-3{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;}
  .ds-grid-2{display:grid;grid-template-columns:1fr 1fr;gap:16px;}
  .ds-grid-2-1{display:grid;grid-template-columns:2fr 1fr;gap:16px;}

  /* Page layout */
  .ds-page{padding:24px;max-width:1100px;margin:0 auto;}
  .ds-page-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;gap:12px;}
  .ds-page-header h1{font-size:24px;font-weight:700;color:#111827;margin:0;}
  .ds-page-header p{font-size:13px;color:#6B7280;margin:4px 0 0;}
  .ds-header-actions{display:flex;gap:10px;}

  /* Tabs */
  .ds-tabs{display:flex;gap:4px;margin-bottom:20px;border-bottom:1px solid #F3F4F6;padding-bottom:4px;overflow-x:auto;-webkit-overflow-scrolling:touch;}
  .ds-tabs::-webkit-scrollbar{display:none;}
  .ds-tab-btn{padding:8px 14px;border-radius:10px;border:none;cursor:pointer;font-size:13px;font-weight:500;white-space:nowrap;transition:background 0.15s;}

  /* Search row */
  .ds-search-row{display:flex;gap:10px;margin-bottom:16px;}
  .ds-search-row input,.ds-search-row select{border:1px solid #E5E7EB;border-radius:12px;padding:10px 14px;font-size:13px;outline:none;}
  .ds-search-row input[type=text]{flex:1;}

  /* Appointment table → card list on mobile */
  .ds-table-wrap{background:#fff;border-radius:16px;border:1px solid #F3F4F6;box-shadow:0 1px 4px rgba(0,0,0,0.05);overflow:hidden;}
  .ds-table{width:100%;border-collapse:collapse;}
  .ds-table th{text-align:left;font-size:11px;font-weight:600;color:#9CA3AF;text-transform:uppercase;letter-spacing:0.05em;padding:14px 20px;border-bottom:1px solid #F3F4F6;}
  .ds-table td{padding:14px 20px;border-bottom:1px solid #F9FAFB;}
  .ds-table tbody tr{cursor:pointer;transition:background 0.15s;}
  .ds-table tbody tr:hover{background:#FFFBF7;}

  /* Drawer */
  .ds-drawer-backdrop{position:fixed;inset:0;background:rgba(0,0,0,0.35);z-index:200;backdrop-filter:blur(2px);}
  .ds-drawer{position:fixed;top:0;right:0;bottom:0;width:420px;background:#fff;z-index:201;box-shadow:-8px 0 32px rgba(0,0,0,0.12);display:flex;flex-direction:column;font-family:inherit;}

  /* Topbar */
  .ds-topbar{height:56px;border-bottom:1px solid #F3F4F6;background:#fff;display:flex;align-items:center;padding:0 24px;gap:16px;position:sticky;top:0;z-index:10;flex-shrink:0;}
  .ds-topbar-search{flex:1;max-width:380px;display:flex;align-items:center;gap:8px;background:#F9FAFB;border:1px solid #E5E7EB;border-radius:10px;padding:8px 12px;}
  .ds-topbar-search input{background:transparent;border:none;outline:none;font-size:14px;color:#374151;width:100%;}
  .ds-topbar-right{margin-left:auto;display:flex;align-items:center;gap:16px;}
  .ds-avail-row{display:flex;align-items:center;gap:8px;font-size:14px;color:#4B5563;}
  .ds-mobile-menu-btn{display:none;background:none;border:none;cursor:pointer;padding:6px;font-size:22px;color:#374151;}

  /* ─── MOBILE ─────────────────────────────────── */
  @media(max-width:767px){
    .ds-page{padding:16px;padding-bottom:80px;}

    .ds-grid-4{grid-template-columns:repeat(2,1fr);gap:12px;}
    .ds-grid-3{grid-template-columns:1fr;}
    .ds-grid-2{grid-template-columns:1fr;}
    .ds-grid-2-1{grid-template-columns:1fr;}

    .ds-page-header{flex-direction:column;align-items:flex-start;}
    .ds-header-actions{width:100%;}
    .ds-header-actions button{flex:1;font-size:12px !important;padding:8px 10px !important;}

    .ds-search-row{flex-wrap:wrap;}
    .ds-search-row input[type=text]{flex:1 1 100%;}
    .ds-search-row select,.ds-search-row input[type=date]{flex:1;}

    /* Table → cards */
    .ds-table-wrap{background:transparent;border:none;box-shadow:none;overflow:visible;}
    .ds-table thead{display:none;}
    .ds-table tbody tr{display:block;background:#fff;border:1px solid #F3F4F6;border-radius:14px;margin-bottom:10px;padding:14px 16px;box-shadow:0 1px 3px rgba(0,0,0,0.04);}
    .ds-table tbody tr:hover{background:#FFFBF7;}
    .ds-table td{display:flex;justify-content:space-between;align-items:center;padding:4px 0;border:none;font-size:13px;}
    .ds-table td:first-child{padding-bottom:10px;border-bottom:1px solid #F9FAFB;margin-bottom:6px;}
    .ds-table td[data-label]::before{content:attr(data-label);font-size:11px;color:#9CA3AF;font-weight:600;text-transform:uppercase;letter-spacing:0.04em;min-width:76px;}
    .ds-table td:first-child[data-label]::before{display:none;}

    /* Drawer → bottom sheet */
    .ds-drawer{width:100% !important;top:auto !important;border-radius:24px 24px 0 0;box-shadow:0 -8px 40px rgba(0,0,0,0.2);}

    /* Topbar mobile */
    .ds-topbar{padding:0 16px;gap:10px;}
    .ds-topbar-search{max-width:none;flex:1;}
    .ds-topbar-right .ds-avail-row span:first-child{display:none;}
    .ds-topbar-right > div:last-child > div{display:none;}
    .ds-mobile-menu-btn{display:flex !important;}
  }
`;

// ─── Nav items ────────────────────────────────────────────────────────────────
export const NAV: { key: Page; icon: string; label: string }[] = [
  { key: "dashboard",    icon: "📊", label: "Dashboard"    },
  { key: "appointments", icon: "📅", label: "Appointments" },
  { key: "profile",      icon: "👤", label: "Profile"      },
  { key: "reviews",      icon: "⭐", label: "Reviews"      },
  { key: "earnings",     icon: "💵", label: "Earnings"     },
  { key: "settings",     icon: "⚙️", label: "Settings"    },
];

// ─── Micro Components ─────────────────────────────────────────────────────────
export const Avatar = ({ name, color, size = 36 }: { name?: string; color?: string; size?: number }) => (
  <div style={{ width: size, height: size, background: color || "#9CA3AF", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: size * 0.38, flexShrink: 0 }}>
    {name ? name[0].toUpperCase() : "?"}
  </div>
);

export const StatusBadge = ({ status }: { status: string }) => {
  const s = status.charAt(0).toUpperCase() + status.slice(1);
  const colors: Record<string, string> = { Pending: "#F97316", Accepted: "#3b82f6", Ongoing: "#8b5cf6", Completed: "#16a34a", Rejected: "#ef4444" };
  return <span style={{ fontSize: 13, fontWeight: 600, color: colors[s] || "#9CA3AF" }}>{s}</span>;
};

export const Toggle = ({ active, onChange }: { active: boolean; onChange: () => void }) => (
  <div onClick={onChange} style={{ width: 44, height: 24, borderRadius: 12, background: active ? "#22c55e" : "#D1D5DB", position: "relative", cursor: "pointer", transition: "background 0.3s", flexShrink: 0 }}>
    <div style={{ position: "absolute", top: 2, left: active ? 22 : 2, width: 20, height: 20, background: "#fff", borderRadius: "50%", transition: "left 0.3s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
  </div>
);

export const Spinner = () => (
  <div style={{ display: "flex", justifyContent: "center", padding: 40 }}>
    <div style={{ width: 32, height: 32, border: "3px solid #F3F4F6", borderTop: "3px solid #F97316", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
  </div>
);

export const Toast = ({ msg, ok }: { msg: string; ok: boolean }) => (
  <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 9999, background: ok ? "#F0FDF4" : "#FEF2F2", border: `1px solid ${ok ? "#BBF7D0" : "#FECACA"}`, color: ok ? "#16a34a" : "#DC2626", borderRadius: 12, padding: "12px 20px", fontSize: 13, fontWeight: 500, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
    {ok ? "✅" : "⚠️"} {msg}
  </div>
);

// ─── Sidebar (desktop left rail + mobile bottom tab bar) ─────────────────────
export const Sidebar = ({ page, setPage, onLogout, isMobile }: {
  page: Page; setPage: (p: Page) => void; onLogout: () => void; isMobile: boolean;
}) => {
  if (isMobile) {
    return (
      <nav style={{ position: "fixed", bottom: 0, left: 0, right: 0, height: 62, zIndex: 100, background: "#fff", borderTop: "1px solid #F3F4F6", display: "flex", alignItems: "stretch", boxShadow: "0 -2px 12px rgba(0,0,0,0.08)" }}>
        {NAV.map(({ key, icon, label }) => {
          const active = page === key;
          return (
            <button key={key} onClick={() => setPage(key)} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2, border: "none", cursor: "pointer", background: "transparent", color: active ? "#F97316" : "#9CA3AF", position: "relative" }}>
              {active && <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: 28, height: 3, background: "#F97316", borderRadius: "0 0 4px 4px" }} />}
              <span style={{ fontSize: 19, lineHeight: 1 }}>{icon}</span>
              <span style={{ fontSize: 9, fontWeight: 600, letterSpacing: "0.02em" }}>{label}</span>
            </button>
          );
        })}
      </nav>
    );
  }

  return (
    <div style={{ width: 208, minWidth: 208, height: "100vh", background: "#fff", borderRight: "1px solid #F3F4F6", display: "flex", flexDirection: "column", position: "sticky", top: 0, zIndex: 20 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "18px 20px", borderBottom: "1px solid #F3F4F6" }}>
        <div style={{ width: 32, height: 32, background: "#F97316", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 14 }}>S</div>
        <span style={{ fontWeight: 700, color: "#111827", fontSize: 15 }}>SmartServe</span>
      </div>
      <nav style={{ flex: 1, padding: "12px 10px", display: "flex", flexDirection: "column", gap: 2 }}>
        {NAV.map(({ key, icon, label }) => {
          const active = page === key;
          return (
            <button key={key} onClick={() => setPage(key)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 10, border: "none", cursor: "pointer", background: active ? "#F97316" : "transparent", color: active ? "#fff" : "#4B5563", fontWeight: 500, fontSize: 14, textAlign: "left" }}>
              <span style={{ fontSize: 16 }}>{icon}</span>{label}
            </button>
          );
        })}
      </nav>
      <div style={{ padding: "0 10px 20px" }}>
        <button onClick={onLogout} style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 10, border: "none", background: "transparent", color: "#ef4444", fontWeight: 500, fontSize: 14, cursor: "pointer" }}>
          <span>🚪</span> Logout
        </button>
      </div>
    </div>
  );
};

// ─── Topbar ───────────────────────────────────────────────────────────────────
export const Topbar = ({ placeholder, profile, token, isMobile, onAvailabilityChange, onLogout }: {
  placeholder: string; profile: ProviderProfile | null; token: string;
  isMobile: boolean; onAvailabilityChange: (v: boolean) => void; onLogout: () => void;
}) => {

  const [online, setOnline] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => { if (profile) setOnline(profile.is_available); }, [profile]);

  const toggle = async () => {
    const next = !online; setOnline(next); setSaving(true);
    try {
      await fetch(`${BASE}/providers/me/availability`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ isAvailable: next }),
      });
      onAvailabilityChange(next);
    } catch {
      setOnline(!next);
    } finally {
      setSaving(false);
    }
  };

  if (isMobile) {
    return (
      <div className="ds-topbar">
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 30, height: 30, background: "#F97316", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 13 }}>S</div>
          <span style={{ fontWeight: 700, color: "#111827", fontSize: 14 }}>SmartServe</span>
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 12, color: saving ? "#9CA3AF" : online ? "#16a34a" : "#9CA3AF", fontWeight: 600 }}>{online ? "●" : "○"}</span>
          <Toggle active={online} onChange={toggle} />
        </div>
        <button onClick={onLogout} style={{ background: "#FEF2F2", border: "none", borderRadius: 8, padding: "6px 10px", fontSize: 12, color: "#ef4444", fontWeight: 600, cursor: "pointer" }}>Logout</button>
      </div>
    );
  }

  return (
    <div className="ds-topbar">
      <div className="ds-topbar-search">
        <span style={{ color: "#9CA3AF" }}>🔍</span>
        <input placeholder={placeholder} />
      </div>
      <div className="ds-topbar-right">
        <div className="ds-avail-row">
          <span>{saving ? "Saving..." : "Availability:"}</span>
          <Toggle active={online} onChange={toggle} />
          <span style={{ fontWeight: 600, color: online ? "#16a34a" : "#9CA3AF" }}>{online ? "Online" : "Offline"}</span>
        </div>
        <button style={{ position: "relative", background: "none", border: "none", cursor: "pointer", padding: 8, fontSize: 18 }}>
          🔔<span style={{ position: "absolute", top: 2, right: 2, width: 16, height: 16, background: "#ef4444", borderRadius: "50%", color: "#fff", fontSize: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>3</span>
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Avatar name={profile?.full_name || "P"} color="#F97316" size={32} />
          <div>
            {profile && <div style={{ fontSize: 12, lineHeight: 1.4 }}>
              <div style={{ fontWeight: 600, color: "#374151" }}>{profile.full_name}</div>
              <div style={{ color: "#9CA3AF", fontSize: 11 }}>{profile.service_category}</div>
            </div>}
          </div>
        </div>
      </div>
    </div>
  );
};