import { useState,useEffect,useCallback  } from "react";



import Navbar from "./Landing-page/components/NavBar";
import Hero from "./Landing-page/components/Hero";
import Services from "./Landing-page/components/Services";
import TopRated from "./Landing-page/components/Toprated";
import Feedback from "./Landing-page/components/Feedback";
import Questions from "./Landing-page/components/Questions";
import { Footer } from "./worker/components/Footer";

import { SmartServeAuth, type LoginData } from "./Landing-page/components/login";
import { SmartServeDashboard } from "./service/Smartservedashboard";
import { SmartServeLanding } from "./worker/Service";
import './App.css';

const BASE = "https://smartserve-backend-6dt2.onrender.com/api/v1";

// ─── Persist helpers ──────────────────────────────────────────────────────────
const STORAGE_KEY = "ss_auth";
const saveAuth = (d: LoginData) => localStorage.setItem(STORAGE_KEY, JSON.stringify(d));
const clearAuth = () => localStorage.removeItem(STORAGE_KEY);
const loadAuth = (): LoginData | null => {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "null"); }
  catch { return null; }
};

export default function App() {
  const [auth, setAuth] = useState<LoginData | null>(null);
  const [showLogin, setShowLogin] = useState(false);
  const [booting, setBooting] = useState(true);   // true while verifying stored token


    useEffect(() => {
    const stored = loadAuth();
    if (!stored) { setBooting(false); return; }
 
    // Verify the stored access token is still valid
    fetch(`${BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${stored.accessToken}` },
    })
      .then(async (res) => {
        if (res.ok) {
          // Token still valid — restore session
          setAuth(stored);
        } else if (res.status === 401 && stored.refreshToken) {
          // Access token expired — try POST /auth/refresh
          const rr = await fetch(`${BASE}/auth/refresh`, {
            method:  "POST",
            headers: { "Content-Type": "application/json" },
            body:    JSON.stringify({ refreshToken: stored.refreshToken }),
          });
          if (rr.ok) {
            const { accessToken, refreshToken } = await rr.json() as { accessToken: string; refreshToken: string };
            const refreshed: LoginData = { ...stored, accessToken, refreshToken };
            saveAuth(refreshed);
            setAuth(refreshed);
          } else {
            clearAuth(); // refresh token expired — go to landing
          }
        } else {
          clearAuth();
        }
      })
      .catch(() => {
        // Network error — restore session optimistically so user isn't logged out on bad wifi
        setAuth(stored);
      })
      .finally(() => setBooting(false));
  }, []);

  const handleLogout = () => {
    clearAuth();
    setAuth(null);
    setShowLogin(false); // go back to landing page
  };
   const handleTokenRefresh = useCallback((data: LoginData) => {
    saveAuth(data);
    setAuth(data);
  }, []);

  if (booting) {
    return (
      <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#fff", fontFamily: "system-ui" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
          <div style={{ width: 40, height: 40, border: "3px solid #F3F4F6", borderTop: "3px solid #F97316", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          <span style={{ fontSize: 14, color: "#9CA3AF" }}>Loading SmartServe...</span>
        </div>
      </div>
    );
  }
  // Provider dashboard
  if (auth?.role === "provider") {
    return (
      <SmartServeDashboard
        accessToken={auth.accessToken}
        refreshToken={auth.refreshToken}
        userName={auth.name}
        userEmail={auth.email}
        onLogout={handleLogout}
      />
    );
  }

  // Customer dashboard
  if (auth?.role === "user") {
    return (
      <SmartServeLanding
        onLoginClick={() => setShowLogin(true)}
        onPartnerClick={() => { }}
        isLoggedIn={true}
        userName={auth.name}
        accessToken={auth.accessToken}
        refreshToken={auth.refreshToken}
        onLogout={handleLogout}
        onTokenRefresh={handleTokenRefresh}
      />
    );
  }

  // Show login page
  if (showLogin) {
    return (
      <SmartServeAuth
        onLoginSuccess={(data) => {
          saveAuth(data);
          setAuth(data);
          setShowLogin(false);
        }}
      />
    );
  }

  // DEFAULT LANDING PAGE
  // Simple mobile detection
  const isMobile = window.innerWidth <= 768;
  return (
    <div className="App">
      {/* <SmartServeAPITester /> */}
      <Navbar onLoginClick={() => setShowLogin(true)} onLogoClick={() => setShowLogin(false)} />
      <Hero />
      <Services />
      <TopRated />
      <Feedback />
      <Questions />
      <Footer isMobile={isMobile} />
    </div>
  );
}