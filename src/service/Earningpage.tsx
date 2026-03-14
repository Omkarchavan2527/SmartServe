// ─── EarningsPage.tsx ─────────────────────────────────────────────────────────
import React from "react";
import { type Appointment } from "./Dashboardtypes";
import { useIsMobile } from "./Dashboardshared";

const EarningsPage = ({ appointments }: { appointments: Appointment[] }) => {
  const isMobile  = useIsMobile();
  const completed = appointments.filter(a => a.status === "completed");
  const total     = completed.reduce((s,a) => s + a.agreed_price, 0);
  const thisMonth = completed.filter(a => {
    const d = new Date(a.completed_at || a.scheduled_date); const n = new Date();
    return d.getMonth() === n.getMonth() && d.getFullYear() === n.getFullYear();
  });
  const monthEarnings = thisMonth.reduce((s,a) => s + a.agreed_price, 0);

  const last7: { label: string; amount: number }[] = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i));
    const label  = d.toLocaleDateString("en-IN", { weekday: "short" });
    const amount = completed.filter(a => new Date(a.completed_at || a.scheduled_date).toDateString() === d.toDateString()).reduce((s,a) => s + a.agreed_price, 0);
    return { label, amount };
  });
  const maxAmt = Math.max(...last7.map(d => d.amount), 100);
  const fmt    = (s: string) => new Date(s).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  const C: React.CSSProperties = { background: "#fff", borderRadius: 16, border: "1px solid #F3F4F6", boxShadow: "0 1px 4px rgba(0,0,0,0.05)", padding: isMobile ? 16 : 24, marginBottom: 16 };

  return (
    <div className="ds-page" style={{ maxWidth: 900 }}>
      <div className="ds-page-header">
        <div><h1>Earnings</h1><p>Income from your completed appointments</p></div>
      </div>

      {/* Stat cards */}
      <div className="ds-grid-3" style={{ marginBottom: 16 }}>
        {[
          { label: "Total Earned",  value: `₹${total}`,         sub: `${completed.length} jobs`,  color: "#22c55e" },
          { label: "This Month",    value: `₹${monthEarnings}`, sub: `${thisMonth.length} jobs`,   color: "#3b82f6" },
          { label: "Avg per Job",   value: completed.length ? `₹${Math.round(total / completed.length)}` : "₹0", sub: "average", color: "#F97316" },
        ].map(({ label, value, sub, color }) => (
          <div key={label} style={C}>
            <div style={{ fontSize: 13, color: "#6B7280", marginBottom: 8 }}>{label}</div>
            <div style={{ fontSize: isMobile ? 22 : 28, fontWeight: 800, color: "#111827" }}>{value}</div>
            <div style={{ fontSize: 12, color, fontWeight: 600, marginTop: 4 }}>{sub}</div>
          </div>
        ))}
      </div>

      {/* Bar chart */}
      <div style={C}>
        <div style={{ fontWeight: 600, color: "#111827", marginBottom: 18 }}>Last 7 Days</div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: isMobile ? 6 : 12, height: 130 }}>
          {last7.map(({ label, amount }) => (
            <div key={label} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <span style={{ fontSize: 10, color: "#F97316", fontWeight: 600, whiteSpace: "nowrap" }}>{amount > 0 ? `₹${amount}` : ""}</span>
              <div style={{ width: "100%", background: amount > 0 ? "#F97316" : "#F3F4F6", borderRadius: "5px 5px 0 0", height: `${(amount / maxAmt) * 100}px`, minHeight: 4, transition: "height 0.4s" }} />
              <span style={{ fontSize: 10, color: "#9CA3AF" }}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Completed jobs */}
      <div style={C}>
        <div style={{ fontWeight: 600, color: "#111827", marginBottom: 14 }}>Completed Jobs</div>
        {completed.length === 0
          ? <p style={{ fontSize: 13, color: "#9CA3AF", textAlign: "center", padding: 20 }}>No completed jobs yet</p>
          : completed.map(a => (
            <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 0", borderBottom: "1px solid #F9FAFB" }}>
              <div style={{ width: 34, height: 34, borderRadius: "50%", background: "#9CA3AF", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 13 }}>
                {a.customer_name[0]}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#374151", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.customer_name}</div>
                <div style={{ fontSize: 12, color: "#9CA3AF" }}>{a.service_name} · {fmt(a.completed_at || a.scheduled_date)}</div>
              </div>
              <span style={{ fontSize: 14, fontWeight: 700, color: "#16a34a", flexShrink: 0 }}>+₹{a.agreed_price}</span>
            </div>
          ))
        }
      </div>
    </div>
  );
};

export default EarningsPage;