import { useState, useEffect, useRef } from "react";
import { api } from "./Dashboardtypes";
import type { Appointment } from "./Dashboardtypes";
import { Avatar, StatusBadge, Spinner, Toast, useIsMobile } from "./Dashboardshared";

// ─── MapModal — Leaflet + OpenStreetMap (no API key needed) ──────────────────
// Uses:
//   • Leaflet.js loaded via CDN script tag
//   • Nominatim (OpenStreetMap) for geocoding customer address → lat/lng
//   • navigator.geolocation for provider's current position
//   • Drawn as a full-screen overlay with animated route line between both pins
declare global {
  interface Window {
    L: any; // Leaflet global from CDN
  }
}

interface LatLng { lat: number; lng: number; }

// ── Load Leaflet CSS + JS from CDN (idempotent) ───────────────────────────────
function loadLeaflet(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.L) { resolve(); return; }

    // CSS
    if (!document.getElementById("leaflet-css")) {
      const link  = document.createElement("link");
      link.id     = "leaflet-css";
      link.rel    = "stylesheet";
      link.href   = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    // JS
    if (!document.getElementById("leaflet-js")) {
      const script    = document.createElement("script");
      script.id       = "leaflet-js";
      script.src      = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      script.onload   = () => resolve();
      script.onerror  = () => reject(new Error("Failed to load Leaflet"));
      document.body.appendChild(script);
    } else {
      // Script tag exists but may still be loading
      const existing = document.getElementById("leaflet-js") as HTMLScriptElement;
      existing.onload = () => resolve();
    }
  });
}

// ── Geocode address via Nominatim ─────────────────────────────────────────────
async function geocode(address: string): Promise<LatLng | null> {
  try {
    const q   = encodeURIComponent(address);
    const url = `https://nominatim.openstreetmap.org/search?q=${q}&format=json&limit=1`;
    const res = await fetch(url, { headers: { "Accept-Language": "en" } });
    const data = await res.json() as { lat: string; lon: string }[];
    if (!data.length) return null;
    return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
  } catch { return null; }
}

// ── Haversine distance (km) ───────────────────────────────────────────────────
function haversineKm(a: LatLng, b: LatLng): number {
  const R  = 6371;
  const dLat = (b.lat - a.lat) * Math.PI / 180;
  const dLng = (b.lng - a.lng) * Math.PI / 180;
  const h = Math.sin(dLat/2)**2 + Math.cos(a.lat*Math.PI/180) * Math.cos(b.lat*Math.PI/180) * Math.sin(dLng/2)**2;
  return R * 2 * Math.asin(Math.sqrt(h));
}

// ── MapModal component ────────────────────────────────────────────────────────
interface MapModalProps {
  appointment: Appointment;
  onClose: () => void;
}

export const MapModal = ({ appointment, onClose }: MapModalProps) => {
  const mapRef     = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<any>(null);

  const [status,    setStatus]    = useState<"loading"|"locating"|"geocoding"|"ready"|"error">("loading");
  const [errorMsg,  setErrorMsg]  = useState("");
  const [providerLL, setProviderLL] = useState<LatLng | null>(null);
  const [customerLL, setCustomerLL] = useState<LatLng | null>(null);
  const [distanceKm, setDistanceKm] = useState<number | null>(null);
  const [travelMin,  setTravelMin]  = useState<number | null>(null);

  // ── Step 1: Load Leaflet → Step 2: Get provider GPS → Step 3: Geocode address
  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        // Load Leaflet
        setStatus("loading");
        await loadLeaflet();
        if (cancelled) return;

        // Get provider current location
        setStatus("locating");
        const provPos = await new Promise<GeolocationPosition>((res, rej) => {
          if (!navigator.geolocation) return rej(new Error("Geolocation not supported by your browser"));
          navigator.geolocation.getCurrentPosition(res, rej, { timeout: 10000, enableHighAccuracy: true });
        });
        if (cancelled) return;

        const pLL: LatLng = { lat: provPos.coords.latitude, lng: provPos.coords.longitude };
        setProviderLL(pLL);

        // Geocode customer address
        setStatus("geocoding");
        const address = [appointment.location, appointment.area].filter(Boolean).join(", ");
        const cLL = await geocode(address);
        if (cancelled) return;

        if (!cLL) throw new Error(`Could not find location: "${address}". Try editing the address.`);
        setCustomerLL(cLL);

        const km = haversineKm(pLL, cLL);
        setDistanceKm(Math.round(km * 10) / 10);
        setTravelMin(Math.round((km / 25) * 60)); // ~25 km/h avg city speed

        setStatus("ready");
      } catch (e) {
        if (!cancelled) {
          setErrorMsg((e as Error).message || "Could not load map");
          setStatus("error");
        }
      }
    }

    init();
    return () => { cancelled = true; };
  }, [appointment]);

  // ── Step 4: Render map once status = ready ────────────────────────────────
  useEffect(() => {
    if (status !== "ready" || !mapRef.current || !providerLL || !customerLL) return;
    if (leafletMap.current) { leafletMap.current.remove(); leafletMap.current = null; }

    const L   = window.L;
    const mid = { lat: (providerLL.lat + customerLL.lat) / 2, lng: (providerLL.lng + customerLL.lng) / 2 };
    const map = L.map(mapRef.current, { zoomControl: true }).setView([mid.lat, mid.lng], 12);
    leafletMap.current = map;

    // OpenStreetMap tiles (free, no key)
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
      maxZoom: 19,
    }).addTo(map);

    // Custom provider pin (orange)
    const provIcon = L.divIcon({
      className: "",
      html: `<div style="width:36px;height:36px;background:#F97316;border:3px solid #fff;border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 2px 8px rgba(0,0,0,0.3)"><div style="transform:rotate(45deg);display:flex;align-items:center;justify-content:center;width:100%;height:100%;font-size:16px">🧑‍🔧</div></div>`,
      iconSize: [36, 36], iconAnchor: [18, 36],
    });

    // Custom customer pin (blue)
    const custIcon = L.divIcon({
      className: "",
      html: `<div style="width:36px;height:36px;background:#3b82f6;border:3px solid #fff;border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 2px 8px rgba(0,0,0,0.3)"><div style="transform:rotate(45deg);display:flex;align-items:center;justify-content:center;width:100%;height:100%;font-size:16px">🏠</div></div>`,
      iconSize: [36, 36], iconAnchor: [18, 36],
    });

    // Add markers
    L.marker([providerLL.lat, providerLL.lng], { icon: provIcon })
      .addTo(map)
      .bindPopup("<b>📍 Your Location</b><br>You are here")
      .openPopup();

    L.marker([customerLL.lat, customerLL.lng], { icon: custIcon })
      .addTo(map)
      .bindPopup(`<b>🏠 Customer Location</b><br>${appointment.location}${appointment.area ? ", " + appointment.area : ""}`);

    // Dashed route line between both points
    L.polyline([[providerLL.lat, providerLL.lng], [customerLL.lat, customerLL.lng]], {
      color: "#F97316", weight: 3, dashArray: "8 6", opacity: 0.8,
    }).addTo(map);

    // Fit both markers in view with padding
    map.fitBounds([
      [providerLL.lat, providerLL.lng],
      [customerLL.lat, customerLL.lng],
    ], { padding: [50, 50] });

    return () => { if (leafletMap.current) { leafletMap.current.remove(); leafletMap.current = null; } };
  }, [status, providerLL, customerLL, appointment]);

  // ── Status labels ────────────────────────────────────────────────────────
  const statusLabel: Record<string,string> = {
    loading:   "Loading map...",
    locating:  "Getting your current location...",
    geocoding: "Finding customer address...",
    ready:     "",
    error:     "",
  };

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div onClick={e => e.stopPropagation()} style={{ background: "#fff", borderRadius: 20, overflow: "hidden", width: "min(860px, 96vw)", maxHeight: "90vh", display: "flex", flexDirection: "column", boxShadow: "0 32px 80px rgba(0,0,0,0.3)" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", borderBottom: "1px solid #F3F4F6", background: "#fff", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 22 }}>🗺️</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, color: "#111827" }}>Route to Customer</div>
              <div style={{ fontSize: 12, color: "#9CA3AF" }}>{appointment.customer_name} · {appointment.location}{appointment.area ? `, ${appointment.area}` : ""}</div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: "#F3F4F6", border: "none", borderRadius: "50%", width: 32, height: 32, cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
        </div>

        {/* Stats bar (shown when ready) */}
        {status === "ready" && distanceKm !== null && (
          <div style={{ display: "flex", gap: 0, borderBottom: "1px solid #F3F4F6", flexShrink: 0 }}>
            {[
              { icon: "📍", label: "Distance", value: `${distanceKm} km` },
              { icon: "🕐", label: "Est. Travel", value: travelMin! < 60 ? `${travelMin} min` : `${Math.floor(travelMin!/60)}h ${travelMin!%60}m` },
              { icon: "🏠", label: "Customer", value: appointment.customer_name },
              { icon: "📅", label: "Date", value: new Date(appointment.scheduled_date).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) },
            ].map(({ icon, label, value }) => (
              <div key={label} style={{ flex: 1, padding: "10px 14px", borderRight: "1px solid #F3F4F6", textAlign: "center" }}>
                <div style={{ fontSize: 16, marginBottom: 2 }}>{icon}</div>
                <div style={{ fontSize: 11, color: "#9CA3AF", fontWeight: 600, textTransform: "uppercase" as const }}>{label}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#111827", marginTop: 1 }}>{value}</div>
              </div>
            ))}
          </div>
        )}

        {/* Map area */}
        <div style={{ flex: 1, position: "relative", minHeight: 400 }}>
          {/* Loading / error overlay */}
          {status !== "ready" && (
            <div style={{ position: "absolute", inset: 0, background: "#F9FAFB", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", zIndex: 10, gap: 16 }}>
              {status === "error" ? (
                <>
                  <div style={{ fontSize: 48 }}>📍</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: "#374151" }}>Could not load map</div>
                  <div style={{ fontSize: 13, color: "#9CA3AF", maxWidth: 320, textAlign: "center" }}>{errorMsg}</div>
                  {errorMsg.includes("ermission") && (
                    <div style={{ background: "#FFF7ED", border: "1px solid #FED7AA", borderRadius: 10, padding: "10px 16px", fontSize: 12, color: "#92400E", maxWidth: 320, textAlign: "center" }}>
                      💡 Allow location access in your browser settings and refresh.
                    </div>
                  )}
                  <button onClick={onClose} style={{ background: "#F97316", color: "#fff", border: "none", borderRadius: 10, padding: "10px 20px", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>Close</button>
                </>
              ) : (
                <>
                  <div style={{ width: 40, height: 40, border: "3px solid #F3F4F6", borderTop: "3px solid #F97316", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                  <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
                  <div style={{ fontSize: 14, color: "#6B7280", fontWeight: 500 }}>{statusLabel[status]}</div>
                  <div style={{ display: "flex", gap: 8 }}>
                    {(["loading","locating","geocoding"] as const).map(s => (
                      <div key={s} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: status === s ? "#F97316" : ["loading","locating","geocoding"].indexOf(status) > ["loading","locating","geocoding"].indexOf(s) ? "#22c55e" : "#E5E7EB" }} />
                        <span style={{ fontSize: 11, color: "#9CA3AF" }}>{s}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
          {/* Map container */}
          <div ref={mapRef} style={{ width: "100%", height: "100%", minHeight: 400 }} />
        </div>

        {/* Footer */}
        <div style={{ padding: "10px 20px", borderTop: "1px solid #F3F4F6", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
          <div style={{ display: "flex", gap: 16, fontSize: 12, color: "#9CA3AF" }}>
            <span>🧑‍🔧 Your location</span>
            <span>🏠 Customer location</span>
            <span style={{ color: "#F97316" }}>— Route (approx.)</span>
          </div>
          <div style={{ fontSize: 11, color: "#9CA3AF" }}>Powered by OpenStreetMap · No API key required</div>
        </div>
      </div>
    </div>
  );
};

// ─── AppointmentsPage.tsx ─────────────────────────────────────────────────────

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
const AppointmentsPage = ({ token, appointments, loading, error, onRefresh, onOpenChat: _onOpenChat }: {
  token: string; appointments: Appointment[]; loading: boolean; error: string;
  onRefresh: () => void; onOpenChat?: (appointmentId: number) => void;
}) => {
  type TabFilter = "All" | "pending" | "accepted" | "ongoing" | "completed" | "rejected";
  const [tab,    setTab]    = useState<TabFilter>("All");
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState<Record<number,boolean>>({});
  const [toast,  setToast]  = useState<{ msg: string; ok: boolean } | null>(null);
  const [drawer,   setDrawer]   = useState<number | null>(null);
  const [mapAppt,  setMapAppt]  = useState<Appointment | null>(null);
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
    if (appt.status === "accepted") return (
      <div style={{ display: "flex", gap: 5 }}>
        {btn("▶ Start","#3b82f6","ongoing")}
        {/* <button onClick={e => { e.stopPropagation(); onOpenChat?.(appt.id); }}
          style={{ padding: "6px 11px", background: "#F97316", color: "#fff", fontSize: 12, fontWeight: 700, border: "none", borderRadius: 8, cursor: "pointer" }}
          title="Open chat with customer">
          💬
        </button> */}
        <button onClick={e => { e.stopPropagation(); setMapAppt(appt); }}
          style={{ padding: "6px 11px", background: "#3b82f6", color: "#fff", fontSize: 12, fontWeight: 700, border: "none", borderRadius: 8, cursor: "pointer" }}
          title="View route to customer">
          🗺️
        </button>
      </div>
    );
    if (appt.status === "ongoing")  return (
      <div style={{ display: "flex", flexDirection: "column", gap: 5, alignItems: "flex-start" }}>
        <div style={{ display: "flex", gap: 5 }}>
          {/* <button onClick={e => { e.stopPropagation(); onOpenChat?.(appt.id); }}
            style={{ padding: "6px 11px", background: "#F97316", color: "#fff", fontSize: 12, fontWeight: 700, border: "none", borderRadius: 8, cursor: "pointer" }}
            title="Chat with customer">💬</button> */}
          <button onClick={e => { e.stopPropagation(); setMapAppt(appt); }}
            style={{ padding: "6px 11px", background: "#3b82f6", color: "#fff", fontSize: 12, fontWeight: 700, border: "none", borderRadius: 8, cursor: "pointer" }}
            title="Route to customer">🗺️</button>
        </div>
        <span style={{ fontSize: 11, color: "#8b5cf6", fontWeight: 600, background: "#F5F3FF", padding: "3px 8px", borderRadius: 6, border: "1px solid #DDD6FE" }}>
          💳 Awaiting customer payment
        </span>
      </div>
    );
    return <span style={{ padding: "6px 11px", background: "#F3F4F6", color: "#9CA3AF", fontSize: 12, fontWeight: 700, borderRadius: 8 }}>{appt.status.charAt(0).toUpperCase() + appt.status.slice(1)}</span>;
  };

  return (
    <div className="ds-page">
      {toast && <Toast msg={toast.msg} ok={toast.ok} />}
      {drawer  !== null && <AppointmentDrawer appointmentId={drawer} token={token} onClose={() => setDrawer(null)} />}
      {mapAppt !== null && <MapModal appointment={mapAppt} onClose={() => setMapAppt(null)} />}

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
                  <tr key={a.id} onClick={() => setDrawer(a.id)}
                    style={{ background: a.status === "ongoing" ? "#FDFAFF" : undefined }}>
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