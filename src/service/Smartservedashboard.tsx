// ─── SmartServeDashboard.tsx (Root) ──────────────────────────────────────────
// Imports all page components and handles routing, data fetching, token refresh
import { useState, useEffect, useCallback } from "react";
import { type Page,type DashboardProps,type ProviderProfile,type Appointment, api, setRefreshStore } from "./Dashboardtypes";
import { DASH_CSS, Sidebar, Topbar, useIsMobile } from "./Dashboardshared";
import DashboardPage    from "./Dashboard";
import AppointmentsPage from "./Appoinmentspage";
import ProfilePage      from "./profilepage";
import ReviewsPage      from "./reviewspage";
import EarningsPage     from "./Earningpage";
import SettingsPage     from "./settingspage";

export function SmartServeDashboard({
  accessToken, refreshToken, userName, onLogout, onTokenRefresh,
}: DashboardProps) {
  const isMobile = useIsMobile();
  const [page,         setPage]         = useState<Page>("dashboard");
  const [profile,      setProfile]      = useState<ProviderProfile | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [apptLoading,  setApptLoading]  = useState(false);
  const [apptError,    setApptError]    = useState("");

  // Wire module-level token store for auto-refresh
  useEffect(() => {
    setRefreshStore(refreshToken, (tokens) => {
      onTokenRefresh?.({ ...tokens, name: userName, email: "", role: "provider" });
    });
  }, [refreshToken, onTokenRefresh, userName]);

  // GET /providers/me/profile
  const fetchProfile = useCallback(async () => {
    try {
      const p = await api<ProviderProfile>("/providers/me/profile", accessToken);
      setProfile(p);
    } catch { /* new accounts may not have a profile yet */ }
  }, [accessToken]);

  // GET /appointments?limit=100
  const fetchAppointments = useCallback(async () => {
    setApptLoading(true); setApptError("");
    try {
      const data = await api<Appointment[]>("/appointments?limit=100", accessToken);
      setAppointments(Array.isArray(data) ? data : []);
    } catch (e) { setApptError((e as Error).message); }
    finally { setApptLoading(false); }
  }, [accessToken]);

  useEffect(() => {
    fetchProfile();
    fetchAppointments();
  }, [fetchProfile, fetchAppointments]);

  const meta: Record<Page, string> = {
    dashboard: "Search...", appointments: "Search appointments...",
    profile: "Search profile...", reviews: "Search reviews...",
    earnings: "Search earnings...", settings: "Search settings...",
  };

  return (
    <div style={{
      display: "flex", height: "100vh", width: "100%",
      background: "#F9FAFB", overflow: "hidden",
      fontFamily: "'DM Sans', system-ui, sans-serif",
      flexDirection: isMobile ? "column" : "row",
    }}>
      <style>{DASH_CSS}</style>

      {/* Desktop: left sidebar | Mobile: nothing here (bottom nav rendered separately) */}
      {!isMobile && <Sidebar page={page} setPage={setPage} onLogout={onLogout} isMobile={false} />}

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>
        {/* Topbar */}
        <Topbar
          placeholder={meta[page]}
          profile={profile}
          token={accessToken}
          isMobile={isMobile}
          onAvailabilityChange={(v: boolean) => setProfile(p => p ? { ...p, is_available: v } : p)}
          onLogout={onLogout}
        />

        {/* Page content */}
        <main style={{ flex: 1, overflowY: "auto" }}>
          {page === "dashboard"    && <DashboardPage    profile={profile} appointments={appointments} token={accessToken} onRefresh={fetchAppointments} />}
          {page === "appointments" && <AppointmentsPage token={accessToken} appointments={appointments} loading={apptLoading} error={apptError} onRefresh={fetchAppointments} />}
          {page === "profile"      && <ProfilePage      token={accessToken} profile={profile} onProfileUpdate={setProfile} />}
          {page === "reviews"      && <ReviewsPage      token={accessToken} profile={profile} onProfileUpdate={setProfile} />}
          {page === "earnings"     && <EarningsPage     appointments={appointments} />}
          {page === "settings"     && <SettingsPage     token={accessToken} profile={profile} />}
        </main>
      </div>

      {/* Mobile: bottom tab bar */}
      {isMobile && <Sidebar page={page} setPage={setPage} onLogout={onLogout} isMobile={true} />}
    </div>
  );
}

export default SmartServeDashboard;