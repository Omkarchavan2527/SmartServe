// ─── ProfilePage.tsx ──────────────────────────────────────────────────────────
import React, { useState, useEffect } from "react";
import { api, type ProviderProfile } from "./Dashboardtypes";
import { Avatar, Toggle, Spinner, Toast, useIsMobile } from "./Dashboardshared";

const ProfilePage = ({ token, profile, onProfileUpdate }: {
  token: string; profile: ProviderProfile | null; onProfileUpdate: (p: ProviderProfile) => void;
}) => {
  const [form,   setForm]   = useState<Partial<ProviderProfile>>({});
  const [saving, setSaving] = useState(false);
  const [toast,  setToast]  = useState<{ msg: string; ok: boolean } | null>(null);
  const isMobile = useIsMobile();

  useEffect(() => { if (profile) setForm(profile); }, [profile]);
  const showToast = (msg: string, ok: boolean) => { setToast({ msg, ok }); setTimeout(() => setToast(null), 3000); };

  const save = async () => {
    setSaving(true);
    try {
      const updated = await api<ProviderProfile>("/providers/me/profile", token, {
        method: "PUT",
        body: JSON.stringify({ bio: form.bio, serviceAreas: form.service_areas, skills: form.skills, basePricePerHour: form.base_price_per_hour, workStartTime: form.work_start_time, workEndTime: form.work_end_time }),
      });
      onProfileUpdate(updated);
      showToast("Profile saved successfully!", true);
    } catch (e) { showToast((e as Error).message, false); }
    finally { setSaving(false); }
  };

  const skills = (form.skills || "").split(",").map(s => s.trim()).filter(Boolean);
  const areas  = (form.service_areas || "").split(",").map(s => s.trim()).filter(Boolean);
  const days   = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
  const C: React.CSSProperties = { background: "#fff", borderRadius: 16, border: "1px solid #F3F4F6", boxShadow: "0 1px 4px rgba(0,0,0,0.05)", padding: isMobile ? 16 : 20 };
  const chip: React.CSSProperties = { padding: "5px 12px", background: "#FFF7ED", color: "#F97316", fontSize: 12, fontWeight: 500, borderRadius: 8, border: "1px solid #FFEDD5" };
  const inp: React.CSSProperties = { width: "100%", border: "1px solid #E5E7EB", borderRadius: 12, padding: "10px 14px", fontSize: 13, color: "#374151", outline: "none", boxSizing: "border-box" };

  const Field = ({ label, value, onChange, textarea, readOnly }: { label: string; value: string; onChange?: (v: string) => void; textarea?: boolean; readOnly?: boolean }) => (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: "block", fontSize: 12, color: "#9CA3AF", fontWeight: 500, marginBottom: 6 }}>{label}</label>
      {textarea
        ? <textarea value={value} onChange={e => onChange?.(e.target.value)} rows={3} readOnly={readOnly} style={{ ...inp, resize: "none", background: readOnly ? "#F9FAFB" : "#fff" }} />
        : <input value={value} onChange={e => onChange?.(e.target.value)} readOnly={readOnly} style={{ ...inp, background: readOnly ? "#F9FAFB" : "#fff" }} />}
    </div>
  );

  if (!profile) return <Spinner />;

  return (
    <div className="ds-page" style={{ maxWidth: 1000 }}>
      {toast && <Toast msg={toast.msg} ok={toast.ok} />}

      {/* Header card */}
      <div style={{ ...C, display: "flex", alignItems: isMobile ? "flex-start" : "center", gap: isMobile ? 14 : 20, marginBottom: 16, flexDirection: isMobile ? "column" : "row" }}>
        <div style={{ position: "relative" }}>
          <Avatar name={profile.full_name} color="#9CA3AF" size={isMobile ? 60 : 72} />
          <div style={{ position: "absolute", bottom: -2, right: -2, width: 22, height: 22, background: "#F97316", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10 }}>📷</div>
        </div>
        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: isMobile ? 18 : 20, fontWeight: 700, color: "#111827", margin: 0 }}>
            {profile.full_name}{" "}
            {profile.verification_status === "verified" && <span style={{ color: "#22c55e", fontSize: 13 }}>✓ Verified</span>}
          </h2>
          <div style={{ color: "#F97316", fontWeight: 500, fontSize: 14, marginTop: 2 }}>{profile.service_category}</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: isMobile ? 8 : 16, marginTop: 4, fontSize: 13, color: "#6B7280" }}>
            <span>📍 {profile.city}</span>
            <span>💼 {profile.experience_years} Yrs</span>
            <span>⭐ {profile.avg_rating} ({profile.total_reviews})</span>
          </div>
        </div>
      </div>

      {/* Personal + Skills */}
      <div className="ds-grid-2" style={{ marginBottom: 16 }}>
        <div style={C}>
          <div style={{ fontWeight: 600, color: "#111827", marginBottom: 14 }}>👤 Personal Info</div>
          <Field label="Full Name"     value={profile.full_name} readOnly />
          <Field label="Email"         value={profile.email}     readOnly />
          <Field label="Phone"         value={profile.phone}     readOnly />
          <Field label="City"          value={profile.city}      readOnly />
          <Field label="Bio"           value={form.bio || ""}    onChange={v => setForm(f => ({ ...f, bio: v }))} textarea />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={C}>
            <div style={{ fontWeight: 600, color: "#111827", marginBottom: 12 }}>🔧 Skills</div>
            <div style={{ fontSize: 11, color: "#9CA3AF", marginBottom: 6 }}>SKILLS (comma-separated)</div>
            <input value={form.skills || ""} onChange={e => setForm(f => ({ ...f, skills: e.target.value }))}
              placeholder="e.g. Wiring, Lighting" style={{ ...inp, marginBottom: 10 }} />
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {skills.map(s => <span key={s} style={chip}>{s}</span>)}
            </div>
          </div>
          <div style={C}>
            <div style={{ fontWeight: 600, color: "#111827", marginBottom: 12 }}>📍 Service Areas</div>
            <input value={form.service_areas || ""} onChange={e => setForm(f => ({ ...f, service_areas: e.target.value }))}
              placeholder="e.g. Andheri, Bandra" style={{ ...inp, marginBottom: 10 }} />
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {areas.map(a => <span key={a} style={chip}>{a}</span>)}
            </div>
          </div>
        </div>
      </div>

      {/* Hours + Pricing */}
      <div className="ds-grid-2" style={{ marginBottom: 20 }}>
        <div style={C}>
          <div style={{ fontWeight: 600, color: "#111827", marginBottom: 12 }}>⏰ Working Hours</div>
          {days.map((day, i) => {
            const active = i < 5;
            return (
              <div key={day} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 0", borderBottom: i < days.length - 1 ? "1px solid #F9FAFB" : "none" }}>
                <Toggle active={active} onChange={() => {}} />
                <span style={{ fontSize: 13, color: "#374151", width: isMobile ? 70 : 90 }}>{isMobile ? day.slice(0,3) : day}</span>
                {active
                  ? <div style={{ display: "flex", gap: 6, fontSize: 12, color: "#6B7280", alignItems: "center" }}>
                      <span style={{ border: "1px solid #E5E7EB", borderRadius: 8, padding: "3px 8px" }}>{form.work_start_time || "09:00"}</span>
                      <span>–</span>
                      <span style={{ border: "1px solid #E5E7EB", borderRadius: 8, padding: "3px 8px" }}>{form.work_end_time || "18:00"}</span>
                    </div>
                  : <span style={{ fontSize: 13, color: "#9CA3AF" }}>Closed</span>
                }
              </div>
            );
          })}
        </div>
        <div style={C}>
          <div style={{ fontWeight: 600, color: "#111827", marginBottom: 14 }}>₹ Pricing</div>
          <label style={{ fontSize: 12, color: "#9CA3AF", display: "block", marginBottom: 6 }}>Base Price/hr (₹)</label>
          <input type="number" value={form.base_price_per_hour || 0}
            onChange={e => setForm(f => ({ ...f, base_price_per_hour: Number(e.target.value) }))}
            style={{ ...inp, marginBottom: 14 }} />
          <input type="range" min={300} max={2000} value={form.base_price_per_hour || 800}
            onChange={e => setForm(f => ({ ...f, base_price_per_hour: Number(e.target.value) }))}
            style={{ width: "100%", accentColor: "#F97316", marginBottom: 6 }} />
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#9CA3AF" }}>
            <span>₹300</span>
            <span style={{ color: "#F97316", fontWeight: 600 }}>₹{form.base_price_per_hour || 800}/hr</span>
            <span>₹2000</span>
          </div>
        </div>
      </div>

      <button onClick={save} disabled={saving}
        style={{ width: "100%", background: saving ? "#9CA3AF" : "#F97316", color: "#fff", fontWeight: 700, fontSize: 15, padding: "15px 0", borderRadius: 16, border: "none", cursor: saving ? "not-allowed" : "pointer" }}>
        {saving ? "⏳ Saving..." : "💾 Save Changes"}
      </button>
    </div>
  );
};

export default ProfilePage;