// ─── DashboardPage.tsx ────────────────────────────────────────────────────────
import React, { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { BASE, api, type ProviderProfile, type Appointment, type Review } from "./Dashboardtypes";
import { Avatar, StatusBadge, Spinner, Toast, useIsMobile } from "./Dashboardshared";

const EarningsChart = () => {
  const pathRef = useRef<SVGPathElement>(null);
  const values = [200, 220, 200, 250, 300, 430, 390];
  const days   = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
  const W = 500, H = 180, PAD = 30;
  const xStep  = (W - PAD * 2) / (values.length - 1);
  const yScale = (v: number) => H - PAD - (v / 500) * (H - PAD * 2);
  const pts    = values.map((v, i) => [PAD + i * xStep, yScale(v)] as [number, number]);
  const line   = `M ${pts.map(([x,y]) => `${x},${y}`).join(" L ")}`;
  const area   = `${line} L ${pts[pts.length-1][0]},${H-PAD} L ${pts[0][0]},${H-PAD} Z`;

  useEffect(() => {
    if (!pathRef.current) return;
    const len = pathRef.current.getTotalLength();
    gsap.set(pathRef.current, { strokeDasharray: len, strokeDashoffset: len });
    gsap.to(pathRef.current, { strokeDashoffset: 0, duration: 1.6, ease: "power2.out", delay: 0.2 });
  }, []);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: 160 }}>
      <defs>
        <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#F97316" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#F97316" stopOpacity="0"   />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#cg)" />
      <path ref={pathRef} d={line} fill="none" stroke="#F97316" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {pts.map(([x,y], i)   => <circle key={i} cx={x} cy={y} r="3" fill="#F97316" />)}
      {days.map((d, i)      => <text key={d} x={PAD + i * xStep} y={H-8}  textAnchor="middle" fontSize="10" fill="#9CA3AF">{d}</text>)}
      {[0,100,200,300,400].map(v => <text key={v} x={PAD-6} y={yScale(v)+4} textAnchor="end" fontSize="10" fill="#9CA3AF">{v}</text>)}
    </svg>
  );
};

const DashboardPage = ({ profile, appointments, token, onRefresh }: {
  profile: ProviderProfile | null; appointments: Appointment[]; token: string; onRefresh: () => void;
}) => {
  const cardsRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const [reviews,  setReviews]  = useState<Review[]>([]);
  const [loadingR, setLoadingR] = useState(false);
  const [saving,   setSaving]   = useState<Record<number,boolean>>({});
  const [toast,    setToast]    = useState<{ msg: string; ok: boolean } | null>(null);

  const showToast = (msg: string, ok: boolean) => { setToast({ msg, ok }); setTimeout(() => setToast(null), 3000); };

  const updateStatus = async (id: number, status: string) => {
    setSaving(s => ({ ...s, [id]: true }));
    try {
      await api(`/appointments/${id}/status`, token, { method: "PATCH", body: JSON.stringify({ status }) });
      showToast(`Appointment ${status}`, true); onRefresh();
    } catch (e) { showToast((e as Error).message, false); }
    finally { setSaving(s => ({ ...s, [id]: false })); }
  };

  useEffect(() => {
    const kids = cardsRef.current?.children;
    if (kids) gsap.fromTo(kids, { y: 20, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.08, duration: 0.45, ease: "power2.out" });
  }, []);

  useEffect(() => {
    if (!profile?.id) return;
    setLoadingR(true);
    fetch(`${BASE}/reviews/provider/${profile.id}?limit=3`)
      .then(r => r.json()).then(d => setReviews(Array.isArray(d) ? d : [])).catch(() => setReviews([]))
      .finally(() => setLoadingR(false));
  }, [profile?.id]);

  const fmt      = (s: string) => new Date(s).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  const pending  = appointments.filter(a => a.status === "pending");
  const completed= appointments.filter(a => a.status === "completed");
  const earnings = completed.reduce((s,a) => s + a.agreed_price, 0);
  const todayC   = appointments.filter(a => new Date(a.scheduled_date).toDateString() === new Date().toDateString()).length;

  const statCards = [
    { icon: "📅", value: String(todayC || appointments.length), label: "Today's Appts",    badge: "Live",               bc: "#3b82f6" },
    { icon: "⏰", value: String(pending.length),                label: "Pending Requests", badge: `${pending.length} New`, bc: "#F97316" },
    { icon: "✅", value: String(completed.length),              label: "Completed Jobs",   badge: "Total",              bc: "#22c55e" },
    { icon: "💵", value: `₹${earnings}`,                        label: "Total Earnings",   badge: "Earned",             bc: "#22c55e" },
  ];

  const C: React.CSSProperties = { background: "#fff", borderRadius: 16, padding: isMobile ? 14 : 20, border: "1px solid #F3F4F6", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" };

  return (
    <div className="ds-page">
      {toast && <Toast msg={toast.msg} ok={toast.ok} />}

      {/* Welcome */}
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: isMobile ? 20 : 24, fontWeight: 700, color: "#111827", margin: 0 }}>
          Welcome, {profile?.full_name?.split(" ")[0] ?? "Provider"}! 👋
        </h1>
        <p style={{ fontSize: 13, color: "#6B7280", marginTop: 4 }}>Here's what's happening today.</p>
      </div>

      {/* Stat Cards */}
      <div ref={cardsRef} className="ds-grid-4" style={{ marginBottom: 20 }}>
        {statCards.map(({ icon, value, label, badge, bc }) => (
          <div key={label} style={C}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
              <div style={{ width: 36, height: 36, background: "#FFF7ED", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>{icon}</div>
              <span style={{ fontSize: 11, fontWeight: 700, color: bc }}>{badge}</span>
            </div>
            <div style={{ fontSize: isMobile ? 22 : 26, fontWeight: 700, color: "#111827" }}>{value}</div>
            <div style={{ fontSize: 12, color: "#6B7280", marginTop: 2 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Chart + Quick Stats */}
      <div className="ds-grid-2-1" style={{ marginBottom: 16 }}>
        <div style={C}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <span style={{ fontWeight: 600, color: "#111827" }}>Earnings Overview</span>
            <select style={{ fontSize: 12, color: "#6B7280", border: "1px solid #E5E7EB", borderRadius: 8, padding: "4px 8px", outline: "none" }}><option>Last 7 days</option></select>
          </div>
          <EarningsChart />
        </div>
        <div style={{ ...C, display: "flex", flexDirection: "column", gap: 12 }}>
          <span style={{ fontWeight: 600, color: "#111827" }}>Quick Stats</span>
          {[
            { l: "Total Jobs",    v: String(profile?.total_jobs    ?? 0)                  },
            { l: "Avg Rating",    v: `${profile?.avg_rating        ?? "—"} ⭐`             },
            { l: "Total Reviews", v: String(profile?.total_reviews ?? 0)                  },
            { l: "Base Price",    v: `₹${profile?.base_price_per_hour ?? 0}/hr`, g: true  },
          ].map(({ l, v, g }) => (
            <div key={l} style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: 13, color: "#6B7280" }}>{l}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: g ? "#16a34a" : "#111827" }}>{v}</span>
            </div>
          ))}
          <div style={{ background: "#F97316", borderRadius: 12, padding: 14, color: "#fff", marginTop: "auto" }}>
            <div style={{ fontWeight: 600, fontSize: 12, marginBottom: 4 }}>Performance Bonus 🎯</div>
            <div style={{ fontSize: 11, opacity: 0.9, marginBottom: 8 }}>Complete 5 more jobs to earn ₹500</div>
            <div style={{ background: "rgba(255,255,255,0.3)", borderRadius: 99, height: 5 }}>
              <div style={{ background: "#fff", borderRadius: 99, height: 5, width: `${Math.min(((profile?.total_jobs ?? 0) % 5) / 5 * 100, 100)}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Today's appts + Pending */}
      <div className="ds-grid-2" style={{ marginBottom: 16 }}>
        <div style={C}>
          <div style={{ fontWeight: 600, color: "#111827", marginBottom: 14 }}>Today's Appointments</div>
          {appointments.length === 0
            ? <p style={{ fontSize: 13, color: "#9CA3AF", textAlign: "center", padding: 16 }}>No appointments yet</p>
            : appointments.slice(0, 3).map(a => (
              <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <Avatar name={a.customer_name} color="#9CA3AF" />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#374151", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{a.customer_name}</div>
                  <div style={{ fontSize: 11, color: "#9CA3AF" }}>{a.service_name} · {fmt(a.scheduled_date)}</div>
                </div>
                <StatusBadge status={a.status} />
              </div>
            ))
          }
        </div>

        <div style={C}>
          <div style={{ fontWeight: 600, color: "#111827", marginBottom: 14 }}>Pending Requests</div>
          {pending.length === 0
            ? <p style={{ fontSize: 13, color: "#9CA3AF", textAlign: "center", padding: 16 }}>No pending requests 🎉</p>
            : pending.slice(0, 2).map(a => (
              <div key={a.id} style={{ border: "1px solid #F3F4F6", borderRadius: 12, padding: 12, marginBottom: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <Avatar name={a.customer_name} color="#9CA3AF" size={28} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#374151", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.customer_name}</div>
                    <div style={{ fontSize: 11, color: "#9CA3AF" }}>{a.service_name} · {fmt(a.scheduled_date)}</div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button disabled={saving[a.id]} onClick={() => updateStatus(a.id, "accepted")}
                    style={{ flex: 1, background: saving[a.id] ? "#9CA3AF" : "#22c55e", color: "#fff", fontSize: 12, fontWeight: 700, padding: "8px 0", borderRadius: 8, border: "none", cursor: saving[a.id] ? "not-allowed" : "pointer" }}>
                    {saving[a.id] ? "..." : "✓ Accept"}
                  </button>
                  <button disabled={saving[a.id]} onClick={() => updateStatus(a.id, "rejected")}
                    style={{ flex: 1, background: "#F3F4F6", color: "#374151", fontSize: 12, fontWeight: 700, padding: "8px 0", borderRadius: 8, border: "none", cursor: saving[a.id] ? "not-allowed" : "pointer" }}>
                    ✕ Reject
                  </button>
                </div>
              </div>
            ))
          }
        </div>
      </div>

      {/* Recent Reviews */}
      <div style={C}>
        <div style={{ fontWeight: 600, color: "#111827", marginBottom: 14 }}>Recent Reviews</div>
        {loadingR ? <Spinner /> : reviews.length === 0
          ? <p style={{ fontSize: 13, color: "#9CA3AF", textAlign: "center", padding: 16 }}>No reviews yet</p>
          : reviews.map(r => (
            <div key={r.id} style={{ borderBottom: "1px solid #F3F4F6", paddingBottom: 12, marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>{r.reviewer_name}</span>
                <span style={{ fontSize: 12, color: "#F97316" }}>{"⭐".repeat(Math.round(r.rating))} {r.rating}</span>
              </div>
              <p style={{ fontSize: 13, color: "#6B7280", margin: 0 }}>{r.comment}</p>
            </div>
          ))
        }
      </div>
    </div>
  );
};

export default DashboardPage;