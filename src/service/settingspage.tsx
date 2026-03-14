// ─── SettingsPage.tsx ─────────────────────────────────────────────────────────
import React, { useState } from "react";
import { api, type ProviderProfile } from "./Dashboardtypes";
import { Toggle, Toast, useIsMobile } from "./Dashboardshared";

const SettingsPage = ({ token, profile }: { token: string; profile: ProviderProfile | null }) => {
  const [notifs, setNotifs] = useState({ bookings: true, appointments: true, cancellations: true, payments: true, reviews: false });
  const [online, setOnline] = useState(profile?.is_available ?? true);
  const [active, setActive] = useState(true);
  const [toast,  setToast]  = useState<{ msg: string; ok: boolean } | null>(null);
  const isMobile = useIsMobile();

  const showToast = (msg: string, ok: boolean) => { setToast({ msg, ok }); setTimeout(() => setToast(null), 3000); };

  const toggleOnline = async (val: boolean) => {
    setOnline(val);
    try {
      await api("/providers/me/availability", token, { method: "PATCH", body: JSON.stringify({ isAvailable: val }) });
      showToast(`You are now ${val ? "Online" : "Offline"}`, true);
    } catch (e) { setOnline(!val); showToast((e as Error).message, false); }
  };

  const C: React.CSSProperties = { background: "#fff", borderRadius: 16, border: "1px solid #F3F4F6", boxShadow: "0 1px 4px rgba(0,0,0,0.05)", padding: isMobile ? 16 : 24, marginBottom: 16 };
  const inp: React.CSSProperties = { width: "100%", border: "1px solid #E5E7EB", borderRadius: 12, padding: "10px 14px", fontSize: 13, outline: "none", boxSizing: "border-box" };

  return (
    <div className="ds-page" style={{ maxWidth: 740 }}>
      {toast && <Toast msg={toast.msg} ok={toast.ok} />}
      <div className="ds-page-header">
        <div><h1>Settings</h1><p>Manage your account preferences</p></div>
      </div>

      {/* Security */}
      <div style={C}>
        <div style={{ fontWeight: 600, color: "#111827", marginBottom: 4 }}>🔒 Account Security</div>
        <p style={{ fontSize: 13, color: "#9CA3AF", marginBottom: 16 }}>Update your password to keep your account secure</p>
        {[["Old Password","Current password"],["New Password","New password"],["Confirm Password","Re-enter password"]].map(([label, ph]) => (
          <div key={label} style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 12, color: "#9CA3AF", display: "block", marginBottom: 6 }}>{label}</label>
            <input type="password" placeholder={ph} style={inp} />
          </div>
        ))}
        <button onClick={() => showToast("Password update — connect to /auth/change-password", false)}
          style={{ background: "#F97316", color: "#fff", fontWeight: 600, fontSize: 13, padding: "10px 20px", borderRadius: 12, border: "none", cursor: "pointer", marginTop: 4 }}>
          Update Password
        </button>
      </div>

      {/* Availability */}
      <div style={C}>
        <div style={{ fontWeight: 600, color: "#111827", marginBottom: 4 }}><span style={{ color: "#22c55e" }}>●</span> Availability Settings</div>
        <p style={{ fontSize: 13, color: "#9CA3AF", marginBottom: 16 }}>Changes are saved instantly</p>
        {[
          { label: "Online Status",  sub: `Currently ${online ? "available" : "unavailable"}`, val: online, fn: (v: boolean) => toggleOnline(v) },
          { label: "Service Active", sub: "Accept new service requests",                         val: active, fn: (v: boolean) => setActive(v)   },
        ].map(({ label, sub, val, fn }, i, arr) => (
          <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: i < arr.length - 1 ? "1px solid #F3F4F6" : "none" }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 500, color: "#374151" }}>{label}</div>
              <div style={{ fontSize: 12, color: "#9CA3AF" }}>{sub}</div>
            </div>
            <Toggle active={val} onChange={() => fn(!val)} />
          </div>
        ))}
      </div>

      {/* Notifications */}
      <div style={C}>
        <div style={{ fontWeight: 600, color: "#111827", marginBottom: 4 }}>🔔 Notifications</div>
        <p style={{ fontSize: 13, color: "#9CA3AF", marginBottom: 16 }}>Choose which notifications you receive</p>
        {([
          { icon: "📅", label: "New Booking Alerts",    key: "bookings"      as const },
          { icon: "⚙️", label: "Appointment Updates",   key: "appointments"  as const },
          { icon: "✕",  label: "Cancellation Messages", key: "cancellations" as const },
          { icon: "💵", label: "Payment Notifications", key: "payments"      as const },
          { icon: "⭐", label: "Review Alerts",          key: "reviews"       as const },
        ]).map(({ icon, label, key }, i, arr) => (
          <div key={key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: i < arr.length - 1 ? "1px solid #F3F4F6" : "none" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, color: "#374151" }}>
              <span style={{ color: "#9CA3AF" }}>{icon}</span>{label}
            </div>
            <Toggle active={notifs[key]} onChange={() => setNotifs(n => ({ ...n, [key]: !n[key] }))} />
          </div>
        ))}
      </div>

      {/* Service settings */}
      <div style={C}>
        <div style={{ fontWeight: 600, color: "#111827", marginBottom: 4 }}>🔧 Service Settings</div>
        <p style={{ fontSize: 13, color: "#9CA3AF", marginBottom: 14 }}>Configure your service area and hours</p>
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 12, color: "#9CA3AF", display: "block", marginBottom: 8 }}>Service Areas</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {(profile?.service_areas || "").split(",").map(a => a.trim()).filter(Boolean).map(a => (
              <span key={a} style={{ padding: "5px 12px", background: "#FFF7ED", color: "#F97316", fontSize: 12, fontWeight: 500, borderRadius: 8, border: "1px solid #FFEDD5" }}>{a}</span>
            ))}
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
          {[["Start Time", profile?.work_start_time || "09:00"],["End Time", profile?.work_end_time || "18:00"]].map(([label, val]) => (
            <div key={label}>
              <label style={{ fontSize: 12, color: "#9CA3AF", display: "block", marginBottom: 6 }}>{label}</label>
              <select style={{ ...inp }}><option>{val}</option></select>
            </div>
          ))}
        </div>
        <input type="range" min={300} max={2000} defaultValue={profile?.base_price_per_hour || 800} style={{ width: "100%", accentColor: "#F97316" }} />
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#9CA3AF", marginTop: 4 }}>
          <span>₹300/hr</span>
          <span style={{ color: "#F97316", fontWeight: 600 }}>₹{profile?.base_price_per_hour || 800}/hr</span>
          <span>₹2000/hr</span>
        </div>
      </div>

      <div style={{ ...C, display: "flex", justifyContent: "space-between", alignItems: "center", flexDirection: isMobile ? "column" : "row", gap: 12 }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: "#374151" }}>Ready to save?</div>
          <div style={{ fontSize: 12, color: "#9CA3AF", marginTop: 2 }}>Availability changes are saved in real-time</div>
        </div>
        <button onClick={() => showToast("Preferences saved!", true)} style={{ background: "#F97316", color: "#fff", fontWeight: 600, fontSize: 13, padding: "12px 24px", borderRadius: 12, border: "none", cursor: "pointer", width: isMobile ? "100%" : "auto" }}>
          💾 Save Preferences
        </button>
      </div>
    </div>
  );
};

export default SettingsPage;