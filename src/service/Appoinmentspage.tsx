// ─── AppointmentsPage.tsx ─────────────────────────────────────────────────────
import { useState, useEffect } from "react";
import { api, type Appointment } from "./Dashboardtypes";
import { Avatar, StatusBadge, Spinner, Toast, useIsMobile } from "./Dashboardshared";

// ─── Appointment Drawer (GET /appointments/:id) ───────────────────────────────
const AppointmentDrawer = ({ appointmentId, token, onClose }: {
  appointmentId: number; token: string; onClose: () => void;
}) => {
  const [appt,    setAppt]    = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");

  useEffect(() => {
    setLoading(true); setError("");
    api<Appointment>(`/appointments/${appointmentId}`, token)
      .then(setAppt).catch(e => setError((e as Error).message)).finally(() => setLoading(false));
  }, [appointmentId, token]);

  const fmt = (s: string) => new Date(s).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
  const SC: Record<string,string> = { pending: "#F97316", accepted: "#3b82f6", ongoing: "#8b5cf6", completed: "#16a34a", rejected: "#ef4444" };

  return (
    <>
      <div onClick={onClose} className="ds-drawer-backdrop" />
      <div className="ds-drawer">
        {/* Drag handle (visible on mobile) */}
        <div style={{ width: 36, height: 4, background: "#E5E7EB", borderRadius: 2, margin: "12px auto 0" }} />
        <div style={{ padding: "16px 20px", borderBottom: "1px solid #F3F4F6", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontWeight: 700, fontSize: 16, color: "#111827" }}>Appointment Details</span>
          <button onClick={onClose} style={{ background: "#F3F4F6", border: "none", borderRadius: "50%", width: 32, height: 32, cursor: "pointer", fontSize: 16 }}>✕</button>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: 20 }}>
          {loading && <Spinner />}
          {error   && <p style={{ color: "#ef4444", fontSize: 13 }}>⚠️ {error}</p>}
          {appt && (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
                <span style={{ fontSize: 13, color: "#9CA3AF" }}>#{appt.id}</span>
                <span style={{ padding: "5px 14px", borderRadius: 99, fontSize: 13, fontWeight: 700, background: `${SC[appt.status]}18`, color: SC[appt.status] }}>
                  {appt.status.charAt(0).toUpperCase() + appt.status.slice(1)}
                </span>
              </div>
              <div style={{ background: "#F9FAFB", borderRadius: 12, padding: 14, marginBottom: 14 }}>
                <div style={{ fontSize: 11, color: "#9CA3AF", fontWeight: 600, letterSpacing: "0.05em", marginBottom: 8 }}>CUSTOMER</div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#9CA3AF", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 16 }}>
                    {appt.customer_name[0].toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#111827" }}>{appt.customer_name}</div>
                    <div style={{ fontSize: 12, color: "#9CA3AF" }}>Customer #{appt.customer_id}</div>
                  </div>
                </div>
              </div>
              {[
                { label: "SERVICE",  value: appt.service_name },
                { label: "LOCATION", value: `${appt.location}${appt.area ? `, ${appt.area}` : ""}` },
                { label: "DATE",     value: fmt(appt.scheduled_date) },
                { label: "TIME",     value: `${appt.scheduled_start} – ${appt.scheduled_end}` },
                { label: "PRICE",    value: `₹${appt.agreed_price}` },
              ].map(({ label, value }) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "11px 0", borderBottom: "1px solid #F9FAFB" }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: "#9CA3AF", letterSpacing: "0.05em" }}>{label}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#374151", textAlign: "right", maxWidth: "60%" }}>{value}</span>
                </div>
              ))}
              {appt.description && (
                <div style={{ marginTop: 14 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: "#9CA3AF", letterSpacing: "0.05em", marginBottom: 6 }}>DESCRIPTION</div>
                  <p style={{ fontSize: 13, color: "#4B5563", lineHeight: 1.6, background: "#F9FAFB", borderRadius: 10, padding: 12, margin: 0 }}>{appt.description}</p>
                </div>
              )}
              {appt.rejection_note && (
                <div style={{ marginTop: 14, background: "#FEF2F2", borderRadius: 10, padding: 12, border: "1px solid #FECACA" }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: "#ef4444", marginBottom: 4 }}>REJECTION NOTE</div>
                  <p style={{ fontSize: 13, color: "#374151", margin: 0 }}>{appt.rejection_note}</p>
                </div>
              )}
              {appt.completion_note && (
                <div style={{ marginTop: 14, background: "#F0FDF4", borderRadius: 10, padding: 12, border: "1px solid #BBF7D0" }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: "#16a34a", marginBottom: 4 }}>COMPLETION NOTE</div>
                  <p style={{ fontSize: 13, color: "#374151", margin: 0 }}>{appt.completion_note}</p>
                </div>
              )}
              <div style={{ marginTop: 18 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: "#9CA3AF", letterSpacing: "0.05em", marginBottom: 8 }}>TIMELINE</div>
                {[{ label: "Booked", val: appt.created_at }, { label: "Accepted", val: appt.accepted_at }, { label: "Completed", val: appt.completed_at }]
                  .filter(t => t.val).map(({ label, val }) => (
                    <div key={label} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#6B7280", marginBottom: 6 }}>
                      <span>{label}</span>
                      <span style={{ color: "#374151", fontWeight: 500 }}>{fmt(val!)}</span>
                    </div>
                  ))}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

// ─── AppointmentsPage ─────────────────────────────────────────────────────────
const AppointmentsPage = ({ token, appointments, loading, error, onRefresh }: {
  token: string; appointments: Appointment[]; loading: boolean; error: string; onRefresh: () => void;
}) => {
  type TabFilter = "All" | "pending" | "accepted" | "ongoing" | "completed" | "rejected";
  const [tab,    setTab]    = useState<TabFilter>("All");
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState<Record<number,boolean>>({});
  const [toast,  setToast]  = useState<{ msg: string; ok: boolean } | null>(null);
  const [drawer, setDrawer] = useState<number | null>(null);
  const isMobile = useIsMobile();

  const showToast = (msg: string, ok: boolean) => { setToast({ msg, ok }); setTimeout(() => setToast(null), 3000); };

  const tabs: TabFilter[] = ["All","pending","accepted","ongoing","completed","rejected"];
  const counts = Object.fromEntries(tabs.map(t => [t, t === "All" ? appointments.length : appointments.filter(a => a.status === t).length]));
  const filtered = appointments.filter(a => {
    const matchTab    = tab === "All" || a.status === tab;
    const matchSearch = a.customer_name.toLowerCase().includes(search.toLowerCase()) || a.service_name.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  const updateStatus = async (id: number, status: string, note?: string) => {
    setSaving(s => ({ ...s, [id]: true }));
    try {
      await api(`/appointments/${id}/status`, token, { method: "PATCH", body: JSON.stringify({ status, note }) });
      showToast(`Appointment ${status}`, true); onRefresh();
    } catch (e) { showToast((e as Error).message, false); }
    finally { setSaving(s => ({ ...s, [id]: false })); }
  };

  const fmt = (d: string) => new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

  const ActionBtn = ({ appt }: { appt: Appointment }) => {
    const busy = saving[appt.id] ?? false;
    const btn = (label: string, bg: string, next: string, note?: string) => (
      <button disabled={busy} onClick={e => { e.stopPropagation(); updateStatus(appt.id, next, note); }}
        style={{ padding: "6px 11px", background: busy ? "#9CA3AF" : bg, color: "#fff", fontSize: 12, fontWeight: 700, border: "none", borderRadius: 8, cursor: busy ? "not-allowed" : "pointer" }}>
        {busy ? "..." : label}
      </button>
    );
    if (appt.status === "pending")  return <div style={{ display: "flex", gap: 5 }}>{btn("✓ Accept","#22c55e","accepted")}{btn("✕ Reject","#ef4444","rejected","Unavailable")}</div>;
    if (appt.status === "accepted") return btn("▶ Start","#3b82f6","ongoing");
    if (appt.status === "ongoing")  return btn("✓ Done","#22c55e","completed","Job completed");
    return <span style={{ padding: "6px 11px", background: "#F3F4F6", color: "#9CA3AF", fontSize: 12, fontWeight: 700, borderRadius: 8 }}>{appt.status.charAt(0).toUpperCase() + appt.status.slice(1)}</span>;
  };

  return (
    <div className="ds-page">
      {toast && <Toast msg={toast.msg} ok={toast.ok} />}
      {drawer !== null && <AppointmentDrawer appointmentId={drawer} token={token} onClose={() => setDrawer(null)} />}

      <div className="ds-page-header">
        <div>
          <h1>Appointments</h1>
          <p>Manage your service appointments</p>
        </div>
        <div className="ds-header-actions">
          <button onClick={onRefresh} style={{ background: "#F97316", color: "#fff", fontSize: 13, fontWeight: 600, padding: "9px 16px", borderRadius: 12, border: "none", cursor: "pointer" }}>
            📅 {appointments.length} Total
          </button>
        </div>
      </div>

      {error && (
        <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 12, padding: "12px 16px", color: "#DC2626", fontSize: 13, marginBottom: 16, display: "flex", justifyContent: "space-between" }}>
          <span>⚠️ {error}</span>
          <button onClick={onRefresh} style={{ background: "#DC2626", color: "#fff", border: "none", borderRadius: 8, padding: "4px 12px", fontSize: 12, cursor: "pointer" }}>Retry</button>
        </div>
      )}

      {/* Tabs */}
      <div className="ds-tabs">
        {tabs.map(t => (
          <button key={t} className="ds-tab-btn" onClick={() => setTab(t)}
            style={{ background: tab === t ? "#F97316" : "transparent", color: tab === t ? "#fff" : "#6B7280" }}>
            {t === "All" ? "All" : t.charAt(0).toUpperCase() + t.slice(1)} ({counts[t]})
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="ds-search-row">
        <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search customers or services..." />
        {!isMobile && <select><option>All Services</option></select>}
        {!isMobile && <input type="date" />}
      </div>

      {/* Table → cards on mobile */}
      {loading ? <Spinner /> : (
        <div className="ds-table-wrap">
          <table className="ds-table">
            <thead>
              <tr>
                {["Customer","Service","Date & Time","Location","Price","Status","Actions"].map(h => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0
                ? <tr><td colSpan={7} style={{ textAlign: "center", padding: 40, color: "#9CA3AF" }}>No appointments found</td></tr>
                : filtered.map(a => (
                  <tr key={a.id} onClick={() => setDrawer(a.id)}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <Avatar name={a.customer_name} color="#9CA3AF" size={34} />
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>{a.customer_name}</div>
                          <div style={{ fontSize: 11, color: "#9CA3AF" }}>#{a.id}</div>
                        </div>
                      </div>
                    </td>
                    <td data-label="Service"><span style={{ fontSize: 13, color: "#4B5563" }}>{a.service_name}</span></td>
                    <td data-label="Date">
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 500, color: "#374151" }}>{fmt(a.scheduled_date)}</div>
                        <div style={{ fontSize: 11, color: "#9CA3AF" }}>{a.scheduled_start} – {a.scheduled_end}</div>
                      </div>
                    </td>
                    <td data-label="Location">
                      <div>
                        <div style={{ fontSize: 13, color: "#374151" }}>{a.location}</div>
                        <div style={{ fontSize: 11, color: "#9CA3AF" }}>{a.area}</div>
                      </div>
                    </td>
                    <td data-label="Price"><span style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>₹{a.agreed_price}</span></td>
                    <td data-label="Status"><StatusBadge status={a.status} /></td>
                    <td data-label="Action"><ActionBtn appt={a} /></td>
                  </tr>
                ))
              }
            </tbody>
          </table>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 20px", borderTop: "1px solid #F3F4F6" }}>
            <span style={{ fontSize: 13, color: "#9CA3AF" }}>Showing {filtered.length} of {appointments.length}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentsPage;