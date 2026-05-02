// ─── ProfilePage.tsx ──────────────────────────────────────────────────────────
import React, { useState, useEffect, useCallback } from "react";
import { api, type ProviderProfile } from "./Dashboardtypes";
import { Avatar, Spinner, Toast, useIsMobile } from "./Dashboardshared";

const DAYS = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];

const ProfilePage = ({ token, profile, onProfileUpdate }: {
  token: string;
  profile: ProviderProfile | null;
  onProfileUpdate: (p: ProviderProfile) => void;
}) => {
  const [form,     setForm]     = useState<Partial<ProviderProfile>>({});
  const [editMode, setEditMode] = useState(false);
  const [activeDays, setActiveDays] = useState<Set<string>>(new Set());
  const [saving,   setSaving]   = useState(false);
  const [toast,    setToast]    = useState<{ msg: string; ok: boolean } | null>(null);
  const isMobile = useIsMobile();

  // ── Initialise form ONCE when profile loads ──────────────────────────────
  useEffect(() => {
    if (profile && Object.keys(form).length === 0) {
      setForm(profile);
      setActiveDays(
        new Set((profile.available_days || "").split(",").map(d => d.trim()).filter(Boolean))
      );
    }
  }, [profile]);

  const showToast = (msg: string, ok: boolean) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  };

  // ── Enter edit – snapshot current profile into form ──────────────────────
  const enterEdit = () => {
    if (!profile) return;
    setForm({ ...profile });
    setActiveDays(
      new Set((profile.available_days || "").split(",").map(d => d.trim()).filter(Boolean))
    );
    setEditMode(true);
  };

  // ── Cancel – restore from profile ────────────────────────────────────────
  const cancelEdit = () => {
    if (!profile) return;
    setForm({ ...profile });
    setActiveDays(
      new Set((profile.available_days || "").split(",").map(d => d.trim()).filter(Boolean))
    );
    setEditMode(false);
  };

  const toggleDay = (day: string) => {
    if (!editMode) return;
    setActiveDays(prev => {
      const next = new Set(prev);
      next.has(day) ? next.delete(day) : next.add(day);
      return next;
    });
  };

  // ── Save ─────────────────────────────────────────────────────────────────
  const save = async () => {
    setSaving(true);
    try {
      const updated = await api<ProviderProfile>("/providers/me/profile", token, {
        method: "PUT",
        body: JSON.stringify({
          bio:                 form.bio,
          service_areas:       form.service_areas,
          skills:              form.skills,
          base_price_per_hour: form.base_price_per_hour,
          work_start_time:     form.work_start_time,
          work_end_time:       form.work_end_time,
          available_days:      [...activeDays].join(","),
        }),
      });
      onProfileUpdate(updated);
      setEditMode(false);
      showToast("✅ Profile saved successfully!", true);
    } catch (e) {
      showToast((e as Error).message, false);
    } finally {
      setSaving(false);
    }
  };

  // ── Styles ───────────────────────────────────────────────────────────────
  const C: React.CSSProperties = {
    background: "#fff", borderRadius: 14, border: "1px solid #F3F4F6",
    boxShadow: "0 1px 4px rgba(0,0,0,0.05)", padding: isMobile ? 16 : 20,
  };

  const inp = (editable: boolean): React.CSSProperties => ({
    width: "100%", border: `1.5px solid ${editable && editMode ? "#FED7AA" : "#E5E7EB"}`,
    borderRadius: 10, padding: "9px 13px", fontSize: 13, color: "#374151",
    background: editable && editMode ? "#FFFBF7" : "#F9FAFB",
    outline: "none", boxSizing: "border-box", fontFamily: "inherit",
    cursor: editable && editMode ? "text" : "default",
  });

  const chip: React.CSSProperties = {
    padding: "4px 12px", background: "#FFF7ED", color: "#F97316",
    fontSize: 12, fontWeight: 500, borderRadius: 8, border: "1px solid #FFEDD5",
  };

  const labelStyle: React.CSSProperties = {
    display: "block", fontSize: 11, color: "#9CA3AF",
    fontWeight: 600, marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.05em",
  };

  // ── Sub-components ───────────────────────────────────────────────────────

  const Field = ({
    label, value, onChange, textarea, readOnly = false,
  }: {
    label: string; value: string;
    onChange?: (v: string) => void;
    textarea?: boolean; readOnly?: boolean;
  }) => {
    const editable = !readOnly && editMode;
    return (
      <div style={{ marginBottom: 14 }}>
        <label style={labelStyle}>{label}</label>
        {textarea ? (
          <textarea
            value={value}
            onChange={e => onChange?.(e.target.value)}
            readOnly={!editable}
            rows={3}
            style={{ ...inp(editable), resize: "none" }}
          />
        ) : (
          <input
            value={value}
            onChange={e => onChange?.(e.target.value)}
            readOnly={!editable}
            style={inp(editable)}
          />
        )}
      </div>
    );
  };

  if (!profile) return <Spinner />;

  const skills = (form.skills || "").split(",").map(s => s.trim()).filter(Boolean);
  const areas  = (form.service_areas || "").split(",").map(s => s.trim()).filter(Boolean);

  return (
    <div className="ds-page" style={{ maxWidth: 1000 }}>
      {toast && <Toast msg={toast.msg} ok={toast.ok} />}

      {/* ── Header card ── */}
      <div style={{
        ...C, display: "flex", marginBottom: 16, gap: 20,
        flexDirection: isMobile ? "column" : "row",
        alignItems: isMobile ? "flex-start" : "center",
      }}>
        <div style={{ position: "relative" }}>
          <Avatar name={profile.full_name} color="#9CA3AF" size={isMobile ? 60 : 72} />
          <div style={{
            position: "absolute", bottom: -2, right: -2, width: 22, height: 22,
            background: "#F97316", borderRadius: "50%",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10,
            border: "2px solid white",
          }}>📷</div>
        </div>
        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: isMobile ? 18 : 20, fontWeight: 700, color: "#111827", margin: 0 }}>
            {profile.full_name}
            {profile.verification_status === "verified" &&
              <span style={{ color: "#22c55e", fontSize: 13, marginLeft: 6 }}>✓ Verified</span>}
          </h2>
          <div style={{ color: "#F97316", fontWeight: 600, fontSize: 14, marginTop: 2 }}>
            {profile.service_category}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 16, marginTop: 4, fontSize: 13, color: "#6B7280" }}>
            <span>📍 {profile.city}</span>
            <span>💼 {profile.experience_years} Yrs</span>
            <span>⭐ {profile.avg_rating} ({profile.total_reviews})</span>
          </div>
        </div>

        {/* ── Edit / Cancel button ── */}
        {editMode ? (
          <button onClick={cancelEdit} style={{
            padding: "10px 20px", borderRadius: 12, border: "1.5px solid #E5E7EB",
            background: "#F3F4F6", color: "#6B7280", fontWeight: 600,
            fontSize: 13, cursor: "pointer", flexShrink: 0,
          }}>✕ Cancel</button>
        ) : (
          <button onClick={enterEdit} style={{
            padding: "10px 20px", borderRadius: 12,
            border: "1.5px solid #FFEDD5", background: "#FFF7ED",
            color: "#F97316", fontWeight: 600, fontSize: 13,
            cursor: "pointer", flexShrink: 0,
          }}>✏️ Edit Profile</button>
        )}
      </div>

      {/* ── Edit mode banner ── */}
      {editMode && (
        <div style={{
          background: "linear-gradient(135deg,#FFF7ED,#FFEDD5)",
          border: "1.5px solid #FED7AA", borderRadius: 12,
          padding: "12px 18px", marginBottom: 16,
          fontSize: 13, color: "#9a3412", fontWeight: 500,
          display: "flex", alignItems: "center", gap: 8,
        }}>
          ✏️ <strong>Edit mode active</strong> — make your changes and click Save when done.
        </div>
      )}

      {/* ── Personal + Skills ── */}
      <div className="ds-grid-2" style={{ marginBottom: 16 }}>
        <div style={C}>
          <div style={{ fontWeight: 700, color: "#111827", marginBottom: 16 }}>👤 Personal Info</div>
          <Field label="Full Name" value={profile.full_name} readOnly />
          <Field label="Email"     value={profile.email}     readOnly />
          <Field label="Phone"     value={profile.phone}     readOnly />
          <Field label="City"      value={profile.city}      readOnly />
          <Field
            label="Bio" textarea
            value={form.bio || ""}
            onChange={v => setForm(f => ({ ...f, bio: v }))}
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={C}>
            <div style={{ fontWeight: 700, color: "#111827", marginBottom: 12 }}>🔧 Skills</div>
            <label style={labelStyle}>Skills (comma-separated)</label>
            <input
              value={form.skills || ""}
              onChange={e => setForm(f => ({ ...f, skills: e.target.value }))}
              readOnly={!editMode}
              placeholder="e.g. Wiring, Lighting"
              style={{ ...inp(editMode), marginBottom: 10 }}
            />
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {skills.map(s => <span key={s} style={chip}>{s}</span>)}
            </div>
          </div>
          <div style={C}>
            <div style={{ fontWeight: 700, color: "#111827", marginBottom: 12 }}>📍 Service Areas</div>
            <label style={labelStyle}>Areas (comma-separated)</label>
            <input
              value={form.service_areas || ""}
              onChange={e => setForm(f => ({ ...f, service_areas: e.target.value }))}
              readOnly={!editMode}
              placeholder="e.g. Andheri, Bandra"
              style={{ ...inp(editMode), marginBottom: 10 }}
            />
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {areas.map(a => <span key={a} style={chip}>{a}</span>)}
            </div>
          </div>
        </div>
      </div>

      {/* ── Working Hours + Pricing ── */}
      <div className="ds-grid-2" style={{ marginBottom: 20 }}>
        {/* Working Hours */}
        <div style={C}>
          <div style={{ fontWeight: 700, color: "#111827", marginBottom: 12 }}>⏰ Working Hours</div>
          {DAYS.map((day, i) => {
            const active = activeDays.has(day);
            return (
              <div key={day} style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "8px 0",
                borderBottom: i < DAYS.length - 1 ? "1px solid #F9FAFB" : "none",
              }}>
                {/* Toggle */}
                <div
                  onClick={() => toggleDay(day)}
                  style={{
                    width: 34, height: 20, borderRadius: 10, flexShrink: 0,
                    background: active ? "#F97316" : "#E5E7EB",
                    position: "relative", cursor: editMode ? "pointer" : "default",
                    transition: "background 0.2s",
                    opacity: editMode ? 1 : 0.7,
                  }}
                >
                  <div style={{
                    position: "absolute", top: 3, left: active ? 17 : 3,
                    width: 14, height: 14, borderRadius: "50%", background: "#fff",
                    transition: "left 0.2s",
                  }} />
                </div>

                <span style={{ fontSize: 13, color: "#374151", width: isMobile ? 70 : 90, fontWeight: 500 }}>
                  {isMobile ? day.slice(0, 3) : day}
                </span>

                {active ? (
                  <div style={{ display: "flex", gap: 6, alignItems: "center", flex: 1 }}>
                    <input
                      type="time"
                      value={form.work_start_time || "09:00"}
                      disabled={!editMode}
                      onChange={e => setForm(f => ({ ...f, work_start_time: e.target.value }))}
                      style={{
                        border: "1.5px solid #E5E7EB", borderRadius: 8,
                        padding: "3px 8px", fontSize: 12, outline: "none",
                        background: editMode ? "#FFFBF7" : "#F9FAFB",
                        color: editMode ? "#374151" : "#9CA3AF",
                        width: 100,
                      }}
                    />
                    <span style={{ color: "#9CA3AF", fontSize: 12 }}>–</span>
                    <input
                      type="time"
                      value={form.work_end_time || "18:00"}
                      disabled={!editMode}
                      onChange={e => setForm(f => ({ ...f, work_end_time: e.target.value }))}
                      style={{
                        border: "1.5px solid #E5E7EB", borderRadius: 8,
                        padding: "3px 8px", fontSize: 12, outline: "none",
                        background: editMode ? "#FFFBF7" : "#F9FAFB",
                        color: editMode ? "#374151" : "#9CA3AF",
                        width: 100,
                      }}
                    />
                  </div>
                ) : (
                  <span style={{ fontSize: 13, color: "#9CA3AF" }}>Closed</span>
                )}
              </div>
            );
          })}
        </div>

        {/* Pricing */}
        <div style={C}>
          <div style={{ fontWeight: 700, color: "#111827", marginBottom: 14 }}>₹ Pricing</div>

          <div style={{
            textAlign: "center", padding: 16,
            background: "#FFF7ED", borderRadius: 12, marginBottom: 14,
          }}>
            <div style={{ fontSize: 36, fontWeight: 700, color: "#F97316", fontFamily: "monospace" }}>
              ₹{form.base_price_per_hour || 800}
            </div>
            <div style={{ fontSize: 13, color: "#6B7280" }}>per hour</div>
          </div>

          <input
            type="range" min={300} max={2000}
            value={form.base_price_per_hour || 800}
            disabled={!editMode}
            onChange={e => setForm(f => ({ ...f, base_price_per_hour: Number(e.target.value) }))}
            style={{ width: "100%", accentColor: "#F97316", marginBottom: 4, opacity: editMode ? 1 : 0.5 }}
          />
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#9CA3AF", marginBottom: 14 }}>
            <span>₹300</span><span>₹2000</span>
          </div>

          <label style={labelStyle}>Base Price / hr (₹)</label>
          <input
            type="number" min={300} max={2000}
            value={form.base_price_per_hour || 800}
            readOnly={!editMode}
            onChange={e => setForm(f => ({ ...f, base_price_per_hour: Number(e.target.value) }))}
            style={inp(editMode)}
          />
        </div>
      </div>

      {/* ── Save bar — only visible in edit mode ── */}
      {editMode && (
        <div style={{ display: "flex", gap: 12 }}>
          <button
            onClick={cancelEdit}
            style={{
              padding: "15px 24px", borderRadius: 14, border: "1.5px solid #E5E7EB",
              background: "#fff", color: "#6B7280", fontWeight: 600,
              fontSize: 14, cursor: "pointer",
            }}
          >Discard Changes</button>
          <button
            onClick={save}
            disabled={saving}
            style={{
              flex: 1, padding: "15px 0", borderRadius: 14, border: "none",
              background: saving ? "#9CA3AF" : "#F97316",
              color: "#fff", fontWeight: 700, fontSize: 15,
              cursor: saving ? "not-allowed" : "pointer",
            }}
          >{saving ? "⏳ Saving..." : "💾 Save Changes"}</button>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
