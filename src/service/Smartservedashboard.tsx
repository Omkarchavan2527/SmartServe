import React, { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";

// ─── Types ────────────────────────────────────────────────────────────────────
type Page = "dashboard" | "appointments" | "profile" | "settings";
type AppStatus = "Pending" | "Accepted" | "Ongoing" | "Completed" | "Rejected";

interface Appointment {
  id: number;
  customer: string;
  phone: string;
  service: string;
  serviceIcon: string;
  date: string;
  time: string;
  location: string;
  area: string;
  status: AppStatus;
  initials?: string;
  initialsColor?: string;
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const APPOINTMENTS: Appointment[] = [
  { id: 1, customer: "Saksham Shinde", phone: "+1 (555) 123-4567", service: "Plumbing Repair", serviceIcon: "🔧", date: "Dec 15, 2024", time: "2:00 PM - 4:00 PM", location: "123 Oak Street", area: "Downtown, NY", status: "Pending", initials: "S", initialsColor: "#F97316" },
  { id: 2, customer: "Miya Magic", phone: "+1 (555) 987-6543", service: "Electrical Work", serviceIcon: "⚡", date: "Dec 16, 2024", time: "10:00 AM - 12:00 PM", location: "456 Pine Ave", area: "Midtown, NY", status: "Accepted" },
  { id: 3, customer: "Swapnil Chauhan", phone: "+1 (555) 246-8135", service: "House Cleaning", serviceIcon: "🧹", date: "Dec 14, 2024", time: "9:00 AM - 11:00 AM", location: "789 Elm Street", area: "Uptown, NY", status: "Ongoing" },
  { id: 4, customer: "Dada Patil", phone: "+1 (555) 369-2580", service: "Home Repair", serviceIcon: "🔨", date: "Dec 13, 2024", time: "1:00 PM - 5:00 PM", location: "321 Maple Dr", area: "Suburbs, NY", status: "Completed" },
  { id: 5, customer: "Rohan Mali", phone: "+1 (555) 111-2233", service: "Pipe Fixing", serviceIcon: "🔧", date: "Dec 12, 2024", time: "3:00 PM - 5:00 PM", location: "654 Cedar Ln", area: "Downtown, NY", status: "Rejected" },
  { id: 6, customer: "Sahil Lohar", phone: "+1 (555) 444-5566", service: "Water Heater Repair", serviceIcon: "🌡️", date: "Dec 17, 2024", time: "9:00 AM", location: "321 Elm Street", area: "Midtown, NY", status: "Pending" },
];

// ─── NAV — key is null for non-routable items ─────────────────────────────────
const NAV: { key: Page | null; icon: string; label: string }[] = [
  { key: "dashboard",    icon: "📊", label: "Dashboard" },
  { key: "appointments", icon: "📅", label: "Appointments" },
  { key: "profile",      icon: "👤", label: "Profile" },
  { key: null,           icon: "⭐", label: "Reviews" },
  { key: null,           icon: "💵", label: "Earnings" },
  { key: "settings",     icon: "⚙️", label: "Settings" },
];

// ─── Micro Components ─────────────────────────────────────────────────────────
const Avatar = ({ name, color, size = 36 }: { name?: string; color?: string; size?: number }) => (
  <div style={{
    width: size, height: size, background: color || "#9CA3AF", borderRadius: "50%",
    display: "flex", alignItems: "center", justifyContent: "center",
    color: "#fff", fontWeight: 700, fontSize: size * 0.38, flexShrink: 0,
  }}>
    {name ? name[0].toUpperCase() : "?"}
  </div>
);

const StatusBadge = ({ status }: { status: AppStatus }) => {
  const colors: Record<AppStatus, string> = {
    Pending: "#F97316", Accepted: "#3b82f6",
    Ongoing: "#8b5cf6", Completed: "#16a34a", Rejected: "#ef4444",
  };
  return <span style={{ fontSize: 13, fontWeight: 600, color: colors[status] }}>{status}</span>;
};

const Toggle = ({ active, onChange }: { active: boolean; onChange: () => void }) => (
  <div
    onClick={onChange}
    style={{
      width: 44, height: 24, borderRadius: 12, background: active ? "#22c55e" : "#D1D5DB",
      position: "relative", cursor: "pointer", transition: "background 0.3s", flexShrink: 0,
    }}
  >
    <div style={{
      position: "absolute", top: 2, left: active ? 22 : 2, width: 20, height: 20,
      background: "#fff", borderRadius: "50%", transition: "left 0.3s",
      boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
    }} />
  </div>
);

// ─── Sidebar ──────────────────────────────────────────────────────────────────
const Sidebar = ({ page, setPage }: { page: Page; setPage: (p: Page) => void }) => (
  <div style={{
    width: 208, minWidth: 208, height: "100vh", background: "#ffffff",
    borderRight: "1px solid #F3F4F6", display: "flex", flexDirection: "column",
    position: "sticky", top: 0, zIndex: 20,
  }}>
    {/* Logo */}
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "18px 20px", borderBottom: "1px solid #F3F4F6" }}>
      <div style={{ width: 32, height: 32, background: "#F97316", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 14 }}>S</div>
      <span style={{ fontWeight: 700, color: "#111827", fontSize: 15 }}>SmartServe</span>
    </div>

    {/* Nav items */}
    <nav style={{ flex: 1, padding: "12px 10px", display: "flex", flexDirection: "column", gap: 2 }}>
      {NAV.map(({ key, icon, label }) => {
        const isActive = key !== null && page === key;
        const isClickable = key !== null;
        return (
          <button
            key={label}
            onClick={() => { if (isClickable) setPage(key!); }}
            style={{
              width: "100%", display: "flex", alignItems: "center", gap: 12,
              padding: "10px 12px", borderRadius: 10, border: "none",
              cursor: isClickable ? "pointer" : "default",
              background: isActive ? "#F97316" : "transparent",
              color: isActive ? "#ffffff" : isClickable ? "#4B5563" : "#9CA3AF",
              fontWeight: 500, fontSize: 14, textAlign: "left",
            }}
          >
            <span style={{ fontSize: 16 }}>{icon}</span>
            {label}
          </button>
        );
      })}
    </nav>

    {/* Logout */}
    <div style={{ padding: "0 10px 20px" }}>
      <button style={{
        width: "100%", display: "flex", alignItems: "center", gap: 12,
        padding: "10px 12px", borderRadius: 10, border: "none",
        background: "transparent", color: "#ef4444", fontWeight: 500, fontSize: 14, cursor: "pointer",
      }}>
        <span>🚪</span> Logout
      </button>
    </div>
  </div>
);

// ─── Topbar ───────────────────────────────────────────────────────────────────
const Topbar = ({ placeholder, name }: { placeholder: string; name?: string }) => {
  const [online, setOnline] = useState(true);
  return (
    <div style={{
      height: 56, borderBottom: "1px solid #F3F4F6", background: "#ffffff",
      display: "flex", alignItems: "center", padding: "0 24px", gap: 16,
      position: "sticky", top: 0, zIndex: 10, flexShrink: 0,
    }}>
      <div style={{ flex: 1, maxWidth: 380 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#F9FAFB", border: "1px solid #E5E7EB", borderRadius: 10, padding: "8px 12px" }}>
          <span style={{ color: "#9CA3AF" }}>🔍</span>
          <input style={{ background: "transparent", border: "none", outline: "none", fontSize: 14, color: "#374151", width: "100%" }} placeholder={placeholder} />
        </div>
      </div>
      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: "#4B5563" }}>
          <span>Availability:</span>
          <Toggle active={online} onChange={() => setOnline(!online)} />
          <span style={{ fontWeight: 600, color: online ? "#16a34a" : "#9CA3AF" }}>{online ? "Online" : "Offline"}</span>
        </div>
        <button style={{ position: "relative", background: "none", border: "none", cursor: "pointer", padding: 8, fontSize: 18 }}>
          🔔
          <span style={{ position: "absolute", top: 2, right: 2, width: 16, height: 16, background: "#ef4444", borderRadius: "50%", color: "#fff", fontSize: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>3</span>
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Avatar name={name || "A"} color="#F97316" size={32} />
          {name && (
            <div style={{ fontSize: 12, lineHeight: 1.4 }}>
              <div style={{ fontWeight: 600, color: "#374151" }}>{name}</div>
              <div style={{ color: "#9CA3AF" }}>Service Provider</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Earnings Chart ───────────────────────────────────────────────────────────
const EarningsChart = () => {
  const pathRef = useRef<SVGPathElement>(null);
  const values = [200, 220, 200, 250, 300, 430, 390];
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const W = 500, H = 180, PAD = 30;
  const xStep = (W - PAD * 2) / (values.length - 1);
  const yScale = (v: number) => H - PAD - (v / 500) * (H - PAD * 2);
  const pts = values.map((v, i) => [PAD + i * xStep, yScale(v)] as [number, number]);
  const linePath = `M ${pts.map(([x, y]) => `${x},${y}`).join(" L ")}`;
  const areaPath = `${linePath} L ${pts[pts.length - 1][0]},${H - PAD} L ${pts[0][0]},${H - PAD} Z`;

  useEffect(() => {
    if (!pathRef.current) return;
    const len = pathRef.current.getTotalLength();
    gsap.set(pathRef.current, { strokeDasharray: len, strokeDashoffset: len });
    gsap.to(pathRef.current, { strokeDashoffset: 0, duration: 1.6, ease: "power2.out", delay: 0.2 });
  }, []);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: 180 }}>
      <defs>
        <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F97316" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#F97316" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill="url(#cg)" />
      <path ref={pathRef} d={linePath} fill="none" stroke="#F97316" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {pts.map(([x, y], i) => <circle key={i} cx={x} cy={y} r="3" fill="#F97316" />)}
      {days.map((d, i) => <text key={i} x={PAD + i * xStep} y={H - 8} textAnchor="middle" fontSize="10" fill="#9CA3AF">{d}</text>)}
      {[0, 100, 200, 300, 400].map((v) => <text key={v} x={PAD - 6} y={yScale(v) + 4} textAnchor="end" fontSize="10" fill="#9CA3AF">{v}</text>)}
    </svg>
  );
};

// ─── Dashboard ────────────────────────────────────────────────────────────────
const DashboardPage = () => {
  const cardsRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const kids = cardsRef.current?.children;
    if (kids) gsap.fromTo(kids, { y: 20, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.08, duration: 0.45, ease: "power2.out" });
  }, []);

  const statCards = [
    { icon: "📅", value: "8",      label: "Today's Appointments", badge: "+12%", bc: "#22c55e" },
    { icon: "⏰", value: "5",      label: "Pending Requests",      badge: "3 New", bc: "#F97316" },
    { icon: "✅", value: "23",     label: "Completed Jobs",        badge: "+8%",  bc: "#22c55e" },
    { icon: "💵", value: "$1,250", label: "This Week's Earnings",  badge: "+15%", bc: "#22c55e" },
  ];
  const todayApps = [
    { name: "Saksham patil", service: "Kitchen Sink Repair", time: "10:30 AM · 123 Oak Street", status: "Confirmed",  color: "#22c55e" },
    { name: "Miiya mafgic",  service: "Bathroom Installation", time: "2:00 PM · 456 Pine Ave",   status: "In Progress", color: "#3b82f6" },
    { name: "Mohan Shinde",  service: "Pipe Leak Fix",         time: "4:30 PM · 789 Maple Dr",   status: "Upcoming",   color: "#F97316" },
  ];
  const pendingReqs = [
    { name: "Sahil Lohar", service: "Water Heater Repair", time: "Tomorrow, 9:00 AM · 321 Elm Street", ago: "2 hours ago" },
    { name: "Rohan Mali",  service: "Toilet Installation", time: "Friday, 11:00 AM · 654 Cedar Ln",    ago: "4 hours ago" },
  ];

  const C: React.CSSProperties = { background: "#fff", borderRadius: 16, padding: 20, border: "1px solid #F3F4F6", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" };

  return (
    <div style={{ padding: 24, maxWidth: 1100, margin: "0 auto" }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: "#111827", margin: 0 }}>Welcome back, Athrav! 👋</h1>
        <p style={{ fontSize: 14, color: "#6B7280", marginTop: 4 }}>Here's what's happening with your services today.</p>
      </div>

      <div ref={cardsRef} style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 24 }}>
        {statCards.map(({ icon, value, label, badge, bc }) => (
          <div key={label} style={C}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
              <div style={{ width: 40, height: 40, background: "#FFF7ED", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>{icon}</div>
              <span style={{ fontSize: 12, fontWeight: 700, color: bc }}>{badge}</span>
            </div>
            <div style={{ fontSize: 26, fontWeight: 700, color: "#111827" }}>{value}</div>
            <div style={{ fontSize: 13, color: "#6B7280", marginTop: 2 }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16, marginBottom: 24 }}>
        <div style={C}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <span style={{ fontWeight: 600, color: "#111827" }}>Earnings Overview</span>
            <select style={{ fontSize: 13, color: "#6B7280", border: "1px solid #E5E7EB", borderRadius: 8, padding: "6px 10px", outline: "none" }}>
              <option>Last 7 days</option>
            </select>
          </div>
          <EarningsChart />
        </div>
        <div style={{ ...C, display: "flex", flexDirection: "column", gap: 14 }}>
          <span style={{ fontWeight: 600, color: "#111827" }}>Quick Stats</span>
          {[
            { l: "Total Jobs", v: "156", g: false },
            { l: "Avg Rating", v: "4.8 ⭐", g: false },
            { l: "Hours Worked", v: "42h", g: false },
            { l: "Monthly Income", v: "$4,680", g: true },
          ].map(({ l, v, g }) => (
            <div key={l} style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: 13, color: "#6B7280" }}>{l}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: g ? "#16a34a" : "#111827" }}>{v}</span>
            </div>
          ))}
          <div style={{ background: "#F97316", borderRadius: 14, padding: 16, color: "#fff" }}>
            <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>Performance Bonus 🎯</div>
            <div style={{ fontSize: 12, opacity: 0.9, marginBottom: 10 }}>Complete 5 more jobs to earn a $50 bonus</div>
            <div style={{ background: "rgba(255,255,255,0.3)", borderRadius: 99, height: 6 }}>
              <div style={{ background: "#fff", borderRadius: 99, height: 6, width: "60%" }} />
            </div>
            <div style={{ fontSize: 11, marginTop: 6, opacity: 0.8 }}>3 of 5 completed</div>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div style={C}>
          <div style={{ fontWeight: 600, color: "#111827", marginBottom: 16 }}>Today's Appointments</div>
          {todayApps.map(({ name, service, time, status, color }) => (
            <div key={name} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
              <Avatar name={name} color="#9CA3AF" />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>{name}</div>
                <div style={{ fontSize: 12, color: "#9CA3AF" }}>{service}</div>
                <div style={{ fontSize: 12, color: "#9CA3AF" }}>{time}</div>
              </div>
              <span style={{ fontSize: 12, fontWeight: 600, color }}>{status}</span>
            </div>
          ))}
        </div>
        <div style={C}>
          <div style={{ fontWeight: 600, color: "#111827", marginBottom: 16 }}>Pending Requests</div>
          {pendingReqs.map(({ name, service, time, ago }) => (
            <div key={name} style={{ border: "1px solid #F3F4F6", borderRadius: 12, padding: 12, marginBottom: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                <Avatar name={name} color="#9CA3AF" size={28} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>{name}</div>
                  <div style={{ fontSize: 12, color: "#9CA3AF" }}>{service}</div>
                </div>
                <span style={{ fontSize: 11, color: "#9CA3AF" }}>{ago}</span>
              </div>
              <div style={{ fontSize: 12, color: "#9CA3AF", marginBottom: 10, paddingLeft: 38 }}>{time}</div>
              <div style={{ display: "flex", gap: 8 }}>
                <button style={{ flex: 1, background: "#22c55e", color: "#fff", fontSize: 12, fontWeight: 700, padding: "8px 0", borderRadius: 8, border: "none", cursor: "pointer" }}>Accept</button>
                <button style={{ flex: 1, background: "#F3F4F6", color: "#374151", fontSize: 12, fontWeight: 700, padding: "8px 0", borderRadius: 8, border: "none", cursor: "pointer" }}>Reject</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── Appointments ─────────────────────────────────────────────────────────────
const AppointmentsPage = () => {
  type TabFilter = "All" | AppStatus;
  const [tab, setTab] = useState<TabFilter>("All");
  const [statuses, setStatuses] = useState<Record<number, AppStatus>>(
    Object.fromEntries(APPOINTMENTS.map((a) => [a.id, a.status]))
  );

  const tabs: TabFilter[] = ["All", "Pending", "Accepted", "Ongoing", "Completed", "Rejected"];
  const counts = Object.fromEntries(
    tabs.map((t) => [t, t === "All" ? APPOINTMENTS.length : APPOINTMENTS.filter((a) => statuses[a.id] === t).length])
  );
  const filtered = tab === "All" ? APPOINTMENTS : APPOINTMENTS.filter((a) => statuses[a.id] === tab);

  const ActionBtn = ({ id, status }: { id: number; status: AppStatus }) => {
    const btn = (label: string, bg: string, next: AppStatus) => (
      <button onClick={() => setStatuses((s) => ({ ...s, [id]: next }))}
        style={{ padding: "6px 12px", background: bg, color: "#fff", fontSize: 12, fontWeight: 700, border: "none", borderRadius: 8, cursor: "pointer" }}>
        {label}
      </button>
    );
    if (status === "Pending") return <div style={{ display: "flex", gap: 6 }}>{btn("Accept", "#22c55e", "Accepted")}{btn("Reject", "#ef4444", "Rejected")}</div>;
    if (status === "Accepted") return btn("Start Work", "#3b82f6", "Ongoing");
    if (status === "Ongoing")  return btn("Complete", "#22c55e", "Completed");
    return <span style={{ padding: "6px 12px", background: "#F3F4F6", color: "#9CA3AF", fontSize: 12, fontWeight: 700, borderRadius: 8 }}>{status}</span>;
  };

  return (
    <div style={{ padding: 24, maxWidth: 1100, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: "#111827", margin: 0 }}>Appointments</h1>
          <p style={{ fontSize: 13, color: "#6B7280", marginTop: 4 }}>Manage your service appointments</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button style={{ background: "#F97316", color: "#fff", fontSize: 13, fontWeight: 600, padding: "9px 16px", borderRadius: 12, border: "none", cursor: "pointer" }}>
            📅 {APPOINTMENTS.length} Total Appointments
          </button>
          <button style={{ border: "1px solid #E5E7EB", color: "#4B5563", fontSize: 13, padding: "9px 16px", borderRadius: 12, background: "#fff", cursor: "pointer" }}>
            🔽 Filter
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: 20, borderBottom: "1px solid #F3F4F6", paddingBottom: 4 }}>
        {tabs.map((t) => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: "8px 14px", borderRadius: 10, border: "none", cursor: "pointer",
            fontSize: 13, fontWeight: 500, background: tab === t ? "#F97316" : "transparent",
            color: tab === t ? "#fff" : "#6B7280",
          }}>{t} ({counts[t]})</button>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
        <input placeholder="Search customers..." style={{ flex: 1, border: "1px solid #E5E7EB", borderRadius: 12, padding: "10px 16px", fontSize: 13, outline: "none" }} />
        <select style={{ border: "1px solid #E5E7EB", borderRadius: 12, padding: "10px 14px", fontSize: 13, outline: "none" }}><option>All Status</option></select>
        <select style={{ border: "1px solid #E5E7EB", borderRadius: 12, padding: "10px 14px", fontSize: 13, outline: "none" }}><option>All Services</option></select>
        <input type="date" style={{ border: "1px solid #E5E7EB", borderRadius: 12, padding: "10px 14px", fontSize: 13, outline: "none" }} />
      </div>

      {/* Table */}
      <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #F3F4F6", boxShadow: "0 1px 4px rgba(0,0,0,0.05)", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #F3F4F6" }}>
              {["Customer", "Service", "Date & Time", "Location", "Status", "Actions"].map((h) => (
                <th key={h} style={{ textAlign: "left", fontSize: 11, fontWeight: 600, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.05em", padding: "14px 20px" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((a) => (
              <tr key={a.id} style={{ borderBottom: "1px solid #F9FAFB" }}>
                <td style={{ padding: "14px 20px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <Avatar name={a.initials || a.customer} color={a.initialsColor} size={36} />
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>{a.customer}</div>
                      <div style={{ fontSize: 12, color: "#9CA3AF" }}>{a.phone}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: "14px 20px", fontSize: 13, color: "#4B5563" }}>{a.serviceIcon} {a.service}</td>
                <td style={{ padding: "14px 20px" }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: "#374151" }}>{a.date}</div>
                  <div style={{ fontSize: 12, color: "#9CA3AF" }}>{a.time}</div>
                </td>
                <td style={{ padding: "14px 20px" }}>
                  <div style={{ fontSize: 13, color: "#374151" }}>{a.location}</div>
                  <div style={{ fontSize: 12, color: "#9CA3AF" }}>{a.area}</div>
                </td>
                <td style={{ padding: "14px 20px" }}><StatusBadge status={statuses[a.id]} /></td>
                <td style={{ padding: "14px 20px" }}><ActionBtn id={a.id} status={statuses[a.id]} /></td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 20px", borderTop: "1px solid #F3F4F6" }}>
          <span style={{ fontSize: 13, color: "#9CA3AF" }}>Showing 1–{filtered.length} of {filtered.length} appointments</span>
          <div style={{ display: "flex", gap: 4 }}>
            {["Previous", "1", "2", "3", "Next"].map((p) => (
              <button key={p} style={{ padding: "6px 12px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 500, background: p === "1" ? "#F97316" : "transparent", color: p === "1" ? "#fff" : "#6B7280" }}>{p}</button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Profile ──────────────────────────────────────────────────────────────────
const ProfilePage = () => {
  const skills = ["Wiring", "Circuit Breakers", "Lighting", "Panel Upgrades", "Troubleshooting"];
  const areas  = ["Powai", "Andheri East", "Andheri West", "Bandra", "Juhu", "Versova"];
  const days   = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];

  const C: React.CSSProperties = { background: "#fff", borderRadius: 16, border: "1px solid #F3F4F6", boxShadow: "0 1px 4px rgba(0,0,0,0.05)", padding: 20 };
  const chip: React.CSSProperties = { padding: "6px 12px", background: "#FFF7ED", color: "#F97316", fontSize: 12, fontWeight: 500, borderRadius: 8, border: "1px solid #FFEDD5" };

  const Field = ({ label, value, textarea }: { label: string; value: string; textarea?: boolean }) => (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: "block", fontSize: 12, color: "#9CA3AF", fontWeight: 500, marginBottom: 6 }}>{label}</label>
      {textarea
        ? <textarea defaultValue={value} rows={3} style={{ width: "100%", border: "1px solid #E5E7EB", borderRadius: 12, padding: "10px 14px", fontSize: 13, color: "#374151", outline: "none", resize: "none", boxSizing: "border-box" }} />
        : <input defaultValue={value} style={{ width: "100%", border: "1px solid #E5E7EB", borderRadius: 12, padding: "10px 14px", fontSize: 13, color: "#374151", outline: "none", boxSizing: "border-box" }} />
      }
    </div>
  );

  return (
    <div style={{ padding: 24, maxWidth: 1000, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ ...C, display: "flex", alignItems: "center", gap: 20, marginBottom: 16 }}>
        <div style={{ position: "relative" }}>
          <Avatar name="S" color="#9CA3AF" size={72} />
          <div style={{ position: "absolute", bottom: -2, right: -2, width: 24, height: 24, background: "#F97316", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, cursor: "pointer" }}>📷</div>
        </div>
        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: "#111827", margin: 0 }}>Sanket Chavan <span style={{ color: "#22c55e", fontSize: 13 }}>●</span></h2>
          <div style={{ color: "#F97316", fontWeight: 500, fontSize: 14, marginTop: 2 }}>Professional Electrician</div>
          <div style={{ display: "flex", gap: 16, marginTop: 4, fontSize: 13, color: "#6B7280" }}>
            <span>📍 Mumbai, Maharashtra</span>
            <span>💼 8 Years Experience</span>
            <span>⭐ 4.8 (247 reviews)</span>
          </div>
        </div>
        <button style={{ border: "2px solid #F97316", color: "#F97316", background: "none", fontWeight: 600, fontSize: 13, padding: "9px 18px", borderRadius: 12, cursor: "pointer" }}>✏️ Edit Profile</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
        <div style={C}>
          <div style={{ fontWeight: 600, color: "#111827", marginBottom: 16 }}>👤 Personal Information</div>
          <Field label="Full Name" value="Sanket Chavan" />
          <Field label="Email Address" value="sanketchavan@smartserve.com" />
          <Field label="Phone Number" value="+91 98765 03010" />
          <Field label="Address / City" value="Andheri West, Mumbai, Maharashtra" />
          <Field label="About / Bio" value="Certified electrician with 8+ years of experience in residential and commercial electrical work. Specialized in installations, repairs, and maintenance." textarea />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={C}>
            <div style={{ fontWeight: 600, color: "#111827", marginBottom: 12 }}>🔧 Skills & Services</div>
            <div style={{ fontSize: 11, color: "#9CA3AF", marginBottom: 6 }}>SERVICE CATEGORIES</div>
            <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
              {["Home Repairs","Installation"].map((c) => <span key={c} style={{ padding: "6px 12px", border: "1px solid #E5E7EB", borderRadius: 8, fontSize: 13, color: "#4B5563" }}>{c}</span>)}
            </div>
            <div style={{ fontSize: 11, color: "#9CA3AF", marginBottom: 6 }}>SKILLS</div>
            <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 8 }}>
              {skills.map((s) => <span key={s} style={chip}>{s}</span>)}
              <button style={{ padding: "6px 12px", border: "1px dashed #D1D5DB", borderRadius: 8, fontSize: 12, color: "#9CA3AF", background: "none", cursor: "pointer" }}>+ Add Skill</button>
            </div>
          </div>
          <div style={C}>
            <div style={{ fontWeight: 600, color: "#111827", marginBottom: 12 }}>📍 Service Areas</div>
            <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 8, marginBottom: 12 }}>
              {areas.map((a) => <span key={a} style={chip}>{a}</span>)}
            </div>
            <button style={{ width: "100%", border: "1px dashed #E5E7EB", borderRadius: 12, padding: "10px 0", fontSize: 13, color: "#9CA3AF", background: "none", cursor: "pointer" }}>+ Add Location</button>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
        <div style={C}>
          <div style={{ fontWeight: 600, color: "#111827", marginBottom: 12 }}>⏰ Working Hours</div>
          {days.map((day, i) => {
            const active = i < 5;
            return (
              <div key={day} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: i < days.length - 1 ? "1px solid #F9FAFB" : "none" }}>
                <Toggle active={active} onChange={() => {}} />
                <span style={{ fontSize: 13, color: "#374151", width: 90 }}>{day}</span>
                {active
                  ? <div style={{ display: "flex", gap: 8, fontSize: 13, color: "#6B7280", alignItems: "center" }}>
                      <span style={{ border: "1px solid #E5E7EB", borderRadius: 8, padding: "3px 10px" }}>09:00</span>
                      <span>–</span>
                      <span style={{ border: "1px solid #E5E7EB", borderRadius: 8, padding: "3px 10px" }}>18:00</span>
                    </div>
                  : <span style={{ fontSize: 13, color: "#9CA3AF" }}>Closed</span>
                }
              </div>
            );
          })}
        </div>
        <div style={C}>
          <div style={{ fontWeight: 600, color: "#111827", marginBottom: 14 }}>₹ Pricing</div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12, color: "#9CA3AF", display: "block", marginBottom: 6 }}>Base Service Price</label>
            <input defaultValue="500" style={{ width: "100%", border: "1px solid #E5E7EB", borderRadius: 12, padding: "10px 14px", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12, color: "#9CA3AF", display: "block", marginBottom: 8 }}>Hourly Rate Range</label>
            <input type="range" min={300} max={2000} defaultValue={800} style={{ width: "100%", accentColor: "#F97316" }} />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#9CA3AF", marginTop: 4 }}>
              <span>₹300</span><span style={{ color: "#F97316", fontWeight: 600 }}>₹800/hr</span><span>₹2000</span>
            </div>
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12, color: "#9CA3AF", display: "block", marginBottom: 6 }}>Additional Charges</label>
            <input placeholder="e.g., Material cost, Travel charges" style={{ width: "100%", border: "1px solid #E5E7EB", borderRadius: 12, padding: "10px 14px", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
          </div>
          <div style={{ background: "#EFF6FF", borderRadius: 12, padding: 12, border: "1px solid #DBEAFE" }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#1D4ED8", marginBottom: 4 }}>💡 Pricing Tips</div>
            <div style={{ fontSize: 12, color: "#3B82F6" }}>Set competitive rates based on your experience and market standards.</div>
          </div>
        </div>
      </div>

      <button style={{ width: "100%", background: "#F97316", color: "#fff", fontWeight: 700, fontSize: 15, padding: "16px 0", borderRadius: 16, border: "none", cursor: "pointer" }}>
        💾 Save Changes
      </button>
    </div>
  );
};

// ─── Settings ─────────────────────────────────────────────────────────────────
const SettingsPage = () => {
  const [notifs, setNotifs] = useState({ bookings: true, appointments: true, cancellations: true, payments: true, reviews: false });
  const [avail, setAvail]  = useState({ online: true, active: true });

  const C: React.CSSProperties = { background: "#fff", borderRadius: 16, border: "1px solid #F3F4F6", boxShadow: "0 1px 4px rgba(0,0,0,0.05)", padding: 24, marginBottom: 16 };

  return (
    <div style={{ padding: 24, maxWidth: 740, margin: "0 auto" }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: "#111827", margin: 0 }}>Settings</h1>
        <p style={{ fontSize: 13, color: "#6B7280", marginTop: 4 }}>Manage your account preferences and service settings</p>
      </div>

      <div style={C}>
        <div style={{ fontWeight: 600, color: "#111827", marginBottom: 4 }}>🔒 Account Security</div>
        <p style={{ fontSize: 13, color: "#9CA3AF", marginBottom: 16 }}>Update your password to keep your account secure</p>
        {[["Old Password","Enter current password"],["New Password","Enter new password"],["Confirm Password","Re-enter new password"]].map(([label, ph]) => (
          <div key={label} style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 12, color: "#9CA3AF", display: "block", marginBottom: 6 }}>{label}</label>
            <input type="password" placeholder={ph} style={{ width: "100%", border: "1px solid #E5E7EB", borderRadius: 12, padding: "10px 14px", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
          </div>
        ))}
        <button style={{ background: "#F97316", color: "#fff", fontWeight: 600, fontSize: 13, padding: "10px 20px", borderRadius: 12, border: "none", cursor: "pointer", marginTop: 4 }}>Update Password</button>
      </div>

      <div style={C}>
        <div style={{ fontWeight: 600, color: "#111827", marginBottom: 4 }}><span style={{ color: "#22c55e" }}>●</span> Availability Settings</div>
        <p style={{ fontSize: 13, color: "#9CA3AF", marginBottom: 16 }}>Control your online status and service availability</p>
        {[
          { label: "Online Status",  sub: "You are currently available for bookings", key: "online" as const },
          { label: "Service Active", sub: "Accept new service requests",              key: "active" as const },
        ].map(({ label, sub, key }, i, arr) => (
          <div key={key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: i < arr.length - 1 ? "1px solid #F3F4F6" : "none" }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 500, color: "#374151" }}>{label}</div>
              <div style={{ fontSize: 12, color: "#9CA3AF" }}>{sub}</div>
            </div>
            <Toggle active={avail[key]} onChange={() => setAvail((a) => ({ ...a, [key]: !a[key] }))} />
          </div>
        ))}
      </div>

      <div style={C}>
        <div style={{ fontWeight: 600, color: "#111827", marginBottom: 4 }}>🔔 Notification Preferences</div>
        <p style={{ fontSize: 13, color: "#9CA3AF", marginBottom: 16 }}>Choose which notifications you want to receive</p>
        {([
          { icon: "📅", label: "New Booking Alerts",     key: "bookings"      as const },
          { icon: "⚙️", label: "Appointment Updates",    key: "appointments"  as const },
          { icon: "✕",  label: "Cancellation Messages",  key: "cancellations" as const },
          { icon: "💵", label: "Payment Notifications",  key: "payments"      as const },
          { icon: "⭐", label: "Review Alerts",           key: "reviews"       as const },
        ]).map(({ icon, label, key }, i, arr) => (
          <div key={key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: i < arr.length - 1 ? "1px solid #F3F4F6" : "none" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, color: "#374151" }}>
              <span style={{ color: "#9CA3AF" }}>{icon}</span>{label}
            </div>
            <Toggle active={notifs[key]} onChange={() => setNotifs((n) => ({ ...n, [key]: !n[key] }))} />
          </div>
        ))}
      </div>

      <div style={C}>
        <div style={{ fontWeight: 600, color: "#111827", marginBottom: 4 }}>🔧 Service Settings</div>
        <p style={{ fontSize: 13, color: "#9CA3AF", marginBottom: 16 }}>Configure your service area and working hours</p>
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 12, color: "#9CA3AF", display: "block", marginBottom: 8 }}>Service Area</label>
          <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 8 }}>
            {["Downtown","Midtown","Suburbs"].map((a) => (
              <span key={a} style={{ padding: "6px 12px", background: "#FFF7ED", color: "#F97316", fontSize: 12, fontWeight: 500, borderRadius: 8, border: "1px solid #FFEDD5" }}>{a}</span>
            ))}
            <button style={{ padding: "6px 12px", border: "1px dashed #D1D5DB", borderRadius: 8, fontSize: 12, color: "#9CA3AF", background: "none", cursor: "pointer" }}>+ Add Area</button>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
          {[["Start Time","08:00 AM"],["End Time","05:00 PM"]].map(([label, val]) => (
            <div key={label}>
              <label style={{ fontSize: 12, color: "#9CA3AF", display: "block", marginBottom: 6 }}>{label}</label>
              <select style={{ width: "100%", border: "1px solid #E5E7EB", borderRadius: 12, padding: "10px 14px", fontSize: 13, outline: "none" }}>
                <option>{val}</option>
              </select>
            </div>
          ))}
        </div>
        <div>
          <label style={{ fontSize: 12, color: "#9CA3AF", display: "block", marginBottom: 8 }}>Price Range</label>
          <input type="range" min={50} max={200} defaultValue={120} style={{ width: "100%", accentColor: "#F97316" }} />
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#9CA3AF", marginTop: 4 }}>
            <span>$50/hr</span><span style={{ color: "#F97316", fontWeight: 600 }}>$120/hr</span><span>$200/hr</span>
          </div>
        </div>
      </div>

      <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #F3F4F6", boxShadow: "0 1px 4px rgba(0,0,0,0.05)", padding: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: "#374151" }}>Ready to save your changes?</div>
          <div style={{ fontSize: 12, color: "#9CA3AF", marginTop: 2 }}>Make sure all settings are configured correctly</div>
        </div>
        <button style={{ background: "#F97316", color: "#fff", fontWeight: 600, fontSize: 13, padding: "12px 24px", borderRadius: 12, border: "none", cursor: "pointer" }}>
          💾 Save Preferences
        </button>
      </div>
    </div>
  );
};

// ─── Root Export ──────────────────────────────────────────────────────────────
// Usage in App.tsx:
//   import { SmartServeDashboard } from "./SmartServeDashboard";
//   function App() { return <SmartServeDashboard />; }
export function Smart() {
  const [page, setPage] = useState<Page>("dashboard");

  const meta: Record<Page, { placeholder: string; name: string }> = {
    dashboard:    { placeholder: "Search...",             name: "Athrav" },
    appointments: { placeholder: "Search appointments...", name: "Athrav bhosale" },
    profile:      { placeholder: "Search...",             name: "Sanket" },
    settings:     { placeholder: "Search settings...",   name: "" },
  };

  const pageMap: Record<Page, React.ReactNode> = {
    dashboard:    <DashboardPage />,
    appointments: <AppointmentsPage />,
    profile:      <ProfilePage />,
    settings:     <SettingsPage />,
  };

  return (
    <div style={{
      display: "flex",
      height: "100vh",
      width: "100%",
      background: "#F9FAFB",
      overflow: "hidden",
      fontFamily: "'DM Sans', system-ui, sans-serif",
    }}>
      <Sidebar page={page} setPage={setPage} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>
        <Topbar placeholder={meta[page].placeholder} name={meta[page].name} />
        <main style={{ flex: 1, overflowY: "auto" }}>
          {pageMap[page]}
        </main>
      </div>
    </div>
  );
}