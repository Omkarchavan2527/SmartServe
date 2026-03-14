import React, { useState } from "react";

// ─── Config ───────────────────────────────────────────────────────────────────
const BASE = "https://smartserve-backend-6dt2.onrender.com/api/v1";

// ─── Types ────────────────────────────────────────────────────────────────────
type AuthPage  = "login" | "signup";
type Role      = "user" | "provider" | null;
type LoginRole = "user" | "provider";

export interface LoginData {
  role:         LoginRole;
  name:         string;
  email:        string;
  accessToken:  string;
  refreshToken: string;
}

interface FormState {
  email:           string;
  password:        string;
  confirmPassword: string;
  fullName:        string;
  phone:           string;
  city:            string;
  // Provider-only
  serviceName:     string;
  serviceCategory: string;
  experience:      string;
  bio:             string;
  serviceAreas:    string;
  basePrice:       string;
  idProof:         string;
  skills:          string;
}

// ─── API Response shapes ──────────────────────────────────────────────────────
interface AuthResponse {
  accessToken:  string;
  refreshToken: string;
  role:         LoginRole;
  userId:       number;
  fullName:     string;
  email:        string;
  error?:       string;
  message?:     string;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const SERVICE_CATEGORIES = [
  "Cleaning","Electrician","Plumber","Salon & Beauty",
  "Spa & Wellness","Pest Control","Car Detailing","Carpentry",
  "Painting","Appliance Repair","AC Service","Other",
];

const CITIES = ["Mumbai","Delhi","Bangalore","Pune","Hyderabad","Chennai","Karad","Kolhapur"];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const Input = ({
  label, placeholder, type = "text", value, onChange, icon, error,
}: {
  label: string; placeholder: string; type?: string;
  value: string; onChange: (v: string) => void; icon?: React.ReactNode; error?: string;
}) => {
  const [focused, setFocused] = useState(false);
  const [show,    setShow]    = useState(false);
  const isPass = type === "password";

  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>{label}</label>
      <div style={{
        display: "flex", alignItems: "center",
        border: `1.5px solid ${error ? "#ef4444" : focused ? "#15803D" : "#E5E7EB"}`,
        borderRadius: 12, background: "#fff", overflow: "hidden",
        transition: "border-color 0.2s", boxShadow: focused ? "0 0 0 3px rgba(21,128,61,0.1)" : "none",
      }}>
        {icon && <span style={{ paddingLeft: 14, color: "#9CA3AF", display: "flex", alignItems: "center" }}>{icon}</span>}
        <input
          type={isPass && !show ? "password" : "text"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          onFocus={() => setFocused(true)}
          onBlur={()  => setFocused(false)}
          style={{ flex: 1, border: "none", outline: "none", padding: "12px 14px", fontSize: 14, color: "#111827", background: "transparent" }}
        />
        {isPass && (
          <button type="button" onClick={() => setShow(!show)}
            style={{ border: "none", background: "none", cursor: "pointer", padding: "0 14px", color: "#9CA3AF", fontSize: 16 }}>
            {show ? "🙈" : "👁️"}
          </button>
        )}
        {!isPass && !icon && <span style={{ padding: "0 14px", color: "#9CA3AF", fontSize: 16 }}>✉️</span>}
      </div>
      {error && <p style={{ margin: "4px 0 0", fontSize: 12, color: "#ef4444" }}>{error}</p>}
    </div>
  );
};

const Select = ({ label, value, onChange, options, placeholder }: {
  label: string; value: string; onChange: (v: string) => void; options: string[]; placeholder: string;
}) => (
  <div style={{ marginBottom: 16 }}>
    <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>{label}</label>
    <select value={value} onChange={(e) => onChange(e.target.value)}
      style={{ width: "100%", border: "1.5px solid #E5E7EB", borderRadius: 12, padding: "12px 14px", fontSize: 14, color: value ? "#111827" : "#9CA3AF", outline: "none", background: "#fff", cursor: "pointer" }}>
      <option value="">{placeholder}</option>
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  </div>
);

const Textarea = ({ label, placeholder, value, onChange }: {
  label: string; placeholder: string; value: string; onChange: (v: string) => void;
}) => (
  <div style={{ marginBottom: 16 }}>
    <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>{label}</label>
    <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={3}
      style={{ width: "100%", border: "1.5px solid #E5E7EB", borderRadius: 12, padding: "12px 14px", fontSize: 14, color: "#111827", outline: "none", resize: "none", fontFamily: "inherit", boxSizing: "border-box" }} />
  </div>
);

// ─── Step indicator ───────────────────────────────────────────────────────────
const StepBar = ({ current, total, labels }: { current: number; total: number; labels: string[] }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 0, marginBottom: 28 }}>
    {Array.from({ length: total }).map((_, i) => (
      <React.Fragment key={i}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
          <div style={{
            width: 30, height: 30, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 13, fontWeight: 700,
            background: i <= current ? "#15803D" : "#E5E7EB",
            color:      i <= current ? "#fff"    : "#9CA3AF",
          }}>
            {i < current ? "✓" : i + 1}
          </div>
          <span style={{ fontSize: 10, color: i === current ? "#15803D" : "#9CA3AF", fontWeight: i === current ? 700 : 400, whiteSpace: "nowrap" as const }}>
            {labels[i]}
          </span>
        </div>
        {i < total - 1 && (
          <div style={{ flex: 1, height: 2, background: i < current ? "#15803D" : "#E5E7EB", margin: "0 6px", marginBottom: 16, transition: "background 0.3s" }} />
        )}
      </React.Fragment>
    ))}
  </div>
);

// ─── Left Panel ───────────────────────────────────────────────────────────────
const LeftPanel = ({ page, role }: { page: AuthPage; role: Role }) => {
  const isLogin    = page === "login";
  const isProvider = role === "provider";

  const features = isProvider
    ? ["Reach 1M+ customers in your city","Manage bookings from a single dashboard","Get paid instantly after each job","Build your professional profile & reviews"]
    : ["Book verified professionals in minutes","Track your service in real-time","Guaranteed satisfaction or money back","24/7 customer support"];

  return (
    <div style={{
      flex: "0 0 48%", background: "linear-gradient(160deg, #064E3B 0%, #065F46 40%, #0F766E 100%)",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      padding: "60px 56px", position: "relative", overflow: "hidden",
    }}>
      <div style={{ position: "absolute", top: -80,  left: -80,  width: 280, height: 280, borderRadius: "50%", background: "rgba(255,255,255,0.04)" }} />
      <div style={{ position: "absolute", bottom: -60, right: -60, width: 220, height: 220, borderRadius: "50%", background: "rgba(255,255,255,0.05)" }} />
      <div style={{ position: "absolute", top: "40%", right: -30, width: 120, height: 120, borderRadius: "50%", background: "rgba(255,255,255,0.04)" }} />

      <div style={{ width: 80, height: 80, borderRadius: "50%", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, marginBottom: 28, boxShadow: "0 8px 32px rgba(0,0,0,0.2)" }}>🔧</div>
      <div style={{ fontSize: 22, fontWeight: 800, color: "#F97316", marginBottom: 4, letterSpacing: "-0.5px" }}>SmartServe</div>

      <h2 style={{ fontSize: 32, fontWeight: 800, color: "#fff", textAlign: "center", lineHeight: 1.2, margin: "16px 0 12px", letterSpacing: "-0.5px" }}>
        {isLogin ? "Welcome Back!" : isProvider ? "Grow Your Business!" : "Get Started Today!"}
      </h2>
      <p style={{ fontSize: 15, color: "rgba(255,255,255,0.7)", textAlign: "center", lineHeight: 1.7, marginBottom: 36 }}>
        {isLogin
          ? "Streamline your workflow with our modern platform. We're glad to see you again."
          : isProvider
          ? "Join thousands of professionals earning more with SmartServe."
          : "Professional home services at your fingertips. Quality guaranteed."}
      </p>

      <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 14, marginBottom: 40 }}>
        {features.map((f, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 24, height: 24, borderRadius: "50%", background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, flexShrink: 0 }}>✓</div>
            <span style={{ fontSize: 14, color: "rgba(255,255,255,0.85)" }}>{f}</span>
          </div>
        ))}
      </div>

      {!isLogin && (
        <div style={{ display: "flex", gap: 32, marginTop: 8 }}>
          {[["1M+","Customers"],["50K+","Providers"],["4.8★","Rating"]].map(([val, lab]) => (
            <div key={lab} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: "#fff" }}>{val}</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", marginTop: 2 }}>{lab}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Login Success Screen ─────────────────────────────────────────────────────
const LoginSuccess = ({
  role, name, onContinue,
}: {
  role:       LoginRole;
  name:       string;
  onContinue: () => void;
}) => (
  <div style={{ width: "100%", maxWidth: 400, textAlign: "center" }}>
    <div style={{ width: 72, height: 72, borderRadius: "50%", background: "#F0FDF4", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, margin: "0 auto 20px" }}>
      {role === "provider" ? "🔧" : "🏠"}
    </div>
    <h2 style={{ fontSize: 24, fontWeight: 800, color: "#111827", marginBottom: 6 }}>Welcome back, {name}!</h2>
    <p style={{ fontSize: 14, color: "#6B7280", marginBottom: 8 }}>
      Signed in as a <strong style={{ color: role === "provider" ? "#F97316" : "#15803D" }}>
        {role === "provider" ? "Service Provider" : "Customer"}
      </strong>
    </p>
    <div style={{ background: role === "provider" ? "#FFF7ED" : "#F0FDF4", border: `1px solid ${role === "provider" ? "#FED7AA" : "#BBF7D0"}`, borderRadius: 14, padding: "16px 20px", margin: "20px 0 28px", textAlign: "left" }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: role === "provider" ? "#92400E" : "#14532D", marginBottom: 8 }}>
        {role === "provider" ? "🔧 Redirecting to Provider Dashboard" : "🏠 Redirecting to Customer Dashboard"}
      </div>
      <div style={{ fontSize: 13, color: "#6B7280", lineHeight: 1.6 }}>
        {role === "provider"
          ? "You'll be taken to manage your appointments, profile, and earnings."
          : "You'll be taken to book services, track appointments, and manage your account."}
      </div>
    </div>
    <div style={{ background: "#F9FAFB", borderRadius: 12, padding: "12px 16px", marginBottom: 24, fontSize: 13, color: "#6B7280", fontFamily: "monospace", textAlign: "left", border: "1px solid #E5E7EB" }}>
      <span style={{ color: "#9CA3AF" }}>→ </span>
      <span style={{ color: "#15803D" }}>{role === "provider" ? "/provider/dashboard" : "/dashboard"}</span>
    </div>
    <button onClick={onContinue} style={{ width: "100%", background: "#15803D", color: "#fff", fontWeight: 700, fontSize: 15, padding: "14px 0", borderRadius: 12, border: "none", cursor: "pointer" }}>
      Go to {role === "provider" ? "Provider" : "Customer"} Dashboard →
    </button>
  </div>
);

// ─── Login Form — calls POST /auth/lookup-email + POST /auth/login ────────────
const LoginForm = ({
  onSwitch, onLoginSuccess,
}: {
  onSwitch:       () => void;
  onLoginSuccess: (data: LoginData) => void;
}) => {
  const [mode,         setMode]         = useState<"auto" | "manual">("auto");
  const [manualRole,   setManualRole]   = useState<LoginRole>("user");
  const [email,        setEmail]        = useState("");
  const [password,     setPassword]     = useState("");
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState("");
  const [detecting,    setDetecting]    = useState(false);
  const [detectedRole, setDetectedRole] = useState<LoginRole | null>(null);
  const [success,      setSuccess]      = useState<{ role: LoginRole; name: string; data: LoginData } | null>(null);

  // ── POST /auth/lookup-email — auto-detect role when email loses focus ──────
  const handleEmailBlur = async () => {
    if (mode !== "auto" || !email.includes("@")) return;
    setDetecting(true);
    setDetectedRole(null);
    try {
      const res  = await fetch(`${BASE}/auth/lookup-email`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email }),
      });
      const data = await res.json() as { found: boolean; role?: LoginRole };
      if (data.found && data.role) setDetectedRole(data.role);
    } catch {
      // If lookup fails, just hide indicator — login will still work
    } finally {
      setDetecting(false);
    }
  };

  // ── POST /auth/login ───────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { setError("Please enter your email and password"); return; }
    setError(""); setLoading(true);

    try {
      const body: Record<string, string> = { email, password };
      // In manual mode, send roleHint so backend can validate + return 403 on mismatch
      if (mode === "manual") body.roleHint = manualRole;

      const res  = await fetch(`${BASE}/auth/login`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(body),
      });
      const data = await res.json() as AuthResponse;

      if (!res.ok) {
        setError(data.error || data.message || "Login failed. Please check your credentials.");
        return;
      }

      const loginData: LoginData = {
        role:         data.role,
        name:         data.fullName,
        email:        data.email,
        accessToken:  data.accessToken,
        refreshToken: data.refreshToken,
      };

      setSuccess({ role: data.role, name: data.fullName, data: loginData });
    } catch (err) {
      setError((err as Error).message || "Network error — is the server running on localhost:5000?");
    } finally {
      setLoading(false);
    }
  };

  if (success) return (
    <LoginSuccess
      role={success.role}
      name={success.name}
      onContinue={() => onLoginSuccess(success.data)}
    />
  );

  return (
    <div style={{ width: "100%", maxWidth: 400 }}>
      <h1 style={{ fontSize: 32, fontWeight: 800, color: "#111827", margin: "0 0 6px", letterSpacing: "-0.5px" }}>welcome</h1>
      <p style={{ fontSize: 14, color: "#6B7280", marginBottom: 24 }}>Please enter your details to access your dashboard.</p>

      {/* Mode switcher */}
      <div style={{ background: "#F3F4F6", borderRadius: 12, padding: 4, display: "flex", marginBottom: 24, gap: 2 }}>
        {([["auto","🔍 Auto-detect role"],["manual","🔘 Choose role manually"]] as const).map(([m, label]) => (
          <button key={m} onClick={() => { setMode(m); setError(""); setDetectedRole(null); }}
            style={{ flex: 1, padding: "9px 0", borderRadius: 10, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700, background: mode === m ? "#fff" : "transparent", color: mode === m ? "#15803D" : "#9CA3AF", boxShadow: mode === m ? "0 1px 4px rgba(0,0,0,0.1)" : "none", transition: "all 0.2s" }}>
            {label}
          </button>
        ))}
      </div>

      {/* Manual role picker */}
      {mode === "manual" && (
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 8 }}>I am signing in as</label>
          <div style={{ display: "flex", gap: 10 }}>
            {([["user","🏠","Customer"],["provider","🔧","Service Provider"]] as const).map(([r, icon, label]) => (
              <button key={r} onClick={() => setManualRole(r)}
                style={{ flex: 1, padding: "12px 0", borderRadius: 12, border: `2px solid ${manualRole === r ? (r === "user" ? "#15803D" : "#F97316") : "#E5E7EB"}`, background: manualRole === r ? (r === "user" ? "#F0FDF4" : "#FFF7ED") : "#fff", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 4, transition: "all 0.2s" }}>
                <span style={{ fontSize: 20 }}>{icon}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: manualRole === r ? (r === "user" ? "#15803D" : "#F97316") : "#6B7280" }}>{label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Email with auto-detect */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Email Address</label>
          <div style={{ position: "relative" }}>
            <input
              type="email" value={email}
              onChange={(e) => { setEmail(e.target.value); setDetectedRole(null); setError(""); }}
              onBlur={handleEmailBlur}
              placeholder="name@company.com"
              style={{ width: "100%", border: `1.5px solid ${detectedRole ? "#15803D" : "#E5E7EB"}`, borderRadius: 12, padding: "12px 48px 12px 14px", fontSize: 14, outline: "none", boxSizing: "border-box", transition: "border-color 0.2s" }}
            />
            <span style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", fontSize: 16 }}>
              {detecting ? "⏳" : detectedRole ? (detectedRole === "provider" ? "🔧" : "🏠") : "✉️"}
            </span>
          </div>
          {mode === "auto" && detectedRole && (
            <div style={{ marginTop: 6, display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#15803D" }} />
              <span style={{ fontSize: 12, color: "#15803D", fontWeight: 600 }}>
                Account found — {detectedRole === "provider" ? "🔧 Service Provider" : "🏠 Customer"}
              </span>
            </div>
          )}
          {mode === "auto" && detecting && (
            <div style={{ marginTop: 6, fontSize: 12, color: "#9CA3AF" }}>Looking up account...</div>
          )}
        </div>

        <Input label="Password" placeholder="••••••••" type="password" value={password} onChange={setPassword} />

        {/* Error */}
        {error && (
          <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 10, padding: "10px 14px", marginBottom: 14, fontSize: 13, color: "#DC2626", display: "flex", gap: 8, alignItems: "flex-start" }}>
            <span>⚠️</span><span>{error}</span>
          </div>
        )}

        {/* Demo hint */}
        <div style={{ background: "#EFF6FF", border: "1px solid #BFDBFE", borderRadius: 10, padding: "10px 14px", marginBottom: 16, fontSize: 12, color: "#3B82F6" }}>
          <strong>Demo accounts (seeded):</strong><br />
          📧 user@smartserve.com / user1234 → Customer<br />
          📧 provider@smartserve.com / password → Provider<br />
          📧 athrav@smartserve.com / password → Provider
        </div>

        <div style={{ textAlign: "right", marginBottom: 16 }}>
          <a href="#" style={{ fontSize: 13, color: "#15803D", fontWeight: 600, textDecoration: "none" }}>Forgot password?</a>
        </div>

        <button type="submit" disabled={loading} style={{
          width: "100%", background: loading ? "#86EFAC" : "#15803D", color: "#fff",
          fontWeight: 700, fontSize: 15, padding: "14px 0", borderRadius: 12, border: "none",
          cursor: loading ? "not-allowed" : "pointer", transition: "background 0.2s", marginBottom: 20,
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
        }}>
          {loading
            ? <><span>⏳</span> Signing in...</>
            : `Log In ${mode === "manual" ? `as ${manualRole === "provider" ? "Provider" : "Customer"}` : ""}`
          }
        </button>
      </form>

      <p style={{ textAlign: "center", fontSize: 14, color: "#6B7280", marginBottom: 24 }}>
        Don't have an account?{" "}
        <button onClick={onSwitch} style={{ color: "#15803D", fontWeight: 700, background: "none", border: "none", cursor: "pointer", fontSize: 14 }}>Sign up for free</button>
      </p>

      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <div style={{ flex: 1, height: 1, background: "#E5E7EB" }} />
        <span style={{ fontSize: 13, color: "#9CA3AF", fontWeight: 500 }}>OR</span>
        <div style={{ flex: 1, height: 1, background: "#E5E7EB" }} />
      </div>

      <button style={{ width: "100%", background: "#fff", border: "1.5px solid #E5E7EB", borderRadius: 12, padding: "12px 0", display: "flex", alignItems: "center", justifyContent: "center", gap: 12, fontSize: 14, fontWeight: 600, color: "#374151", cursor: "pointer" }}>
        <span style={{ fontSize: 18, fontWeight: 800, color: "#4285F4" }}>G</span>
        Continue with Google
      </button>

      <div style={{ marginTop: 20, padding: "12px 16px", background: "#F9FAFB", borderRadius: 12, border: "1px solid #F3F4F6" }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 8 }}>🔐 How role detection works</div>
        <div style={{ fontSize: 12, color: "#6B7280", lineHeight: 1.6 }}>
          <strong>Auto:</strong> Calls <code>/auth/lookup-email</code> to detect your role on blur.<br />
          <strong>Manual:</strong> Sends <code>roleHint</code> to <code>/auth/login</code> — backend returns 403 on mismatch.
        </div>
      </div>
    </div>
  );
};

// ─── Role Selector ────────────────────────────────────────────────────────────
const RoleSelector = ({ onSelect }: { onSelect: (r: Role) => void }) => (
  <div style={{ width: "100%", maxWidth: 420 }}>
    <h1 style={{ fontSize: 28, fontWeight: 800, color: "#111827", margin: "0 0 6px", letterSpacing: "-0.5px" }}>Create your account</h1>
    <p style={{ fontSize: 14, color: "#6B7280", marginBottom: 36 }}>Choose how you want to use SmartServe</p>
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <button onClick={() => onSelect("user")} style={{ background: "#fff", border: "2px solid #E5E7EB", borderRadius: 16, padding: "24px 24px", cursor: "pointer", textAlign: "left", transition: "all 0.2s" }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#15803D"; (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 4px 20px rgba(21,128,61,0.12)"; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#E5E7EB"; (e.currentTarget as HTMLButtonElement).style.boxShadow = "none"; }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: "#F0FDF4", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, flexShrink: 0 }}>🏠</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 17, color: "#111827", marginBottom: 4 }}>I'm a Customer</div>
            <div style={{ fontSize: 13, color: "#6B7280", lineHeight: 1.5 }}>Book professional home services near you.</div>
          </div>
          <span style={{ marginLeft: "auto", fontSize: 20, color: "#9CA3AF" }}>→</span>
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
          {["Book services","Track in real-time","Secure payments"].map((f) => (
            <span key={f} style={{ fontSize: 11, color: "#15803D", background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: 99, padding: "3px 10px", fontWeight: 500 }}>{f}</span>
          ))}
        </div>
      </button>

      <button onClick={() => onSelect("provider")} style={{ background: "#fff", border: "2px solid #E5E7EB", borderRadius: 16, padding: "24px 24px", cursor: "pointer", textAlign: "left", transition: "all 0.2s" }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#F97316"; (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 4px 20px rgba(249,115,22,0.12)"; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#E5E7EB"; (e.currentTarget as HTMLButtonElement).style.boxShadow = "none"; }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: "#FFF7ED", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, flexShrink: 0 }}>🔧</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 17, color: "#111827", marginBottom: 4 }}>I'm a Service Provider</div>
            <div style={{ fontSize: 13, color: "#6B7280", lineHeight: 1.5 }}>List your services, manage appointments & grow.</div>
          </div>
          <span style={{ marginLeft: "auto", fontSize: 20, color: "#9CA3AF" }}>→</span>
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
          {["Earn more","Manage bookings","Instant payouts"].map((f) => (
            <span key={f} style={{ fontSize: 11, color: "#F97316", background: "#FFF7ED", border: "1px solid #FED7AA", borderRadius: 99, padding: "3px 10px", fontWeight: 500 }}>{f}</span>
          ))}
        </div>
      </button>
    </div>
  </div>
);

// ─── User Signup — calls POST /auth/register/user ─────────────────────────────
const UserSignupForm = ({
  onBack, onLogin, onSignupSuccess,
}: {
  onBack:          () => void;
  onLogin:         () => void;
  onSignupSuccess: (data: LoginData) => void;
}) => {
  const [form, setForm] = useState({ fullName: "", email: "", phone: "", city: "", password: "", confirmPassword: "" });
  const [agreed,  setAgreed]  = useState(false);
  const [errors,  setErrors]  = useState<Partial<typeof form>>({});
  const [loading, setLoading] = useState(false);
  const [apiError,setApiError]= useState("");

  const set = (k: keyof typeof form) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

  const validate = () => {
    const e: Partial<typeof form> = {};
    if (!form.fullName)              e.fullName        = "Required";
    if (!form.email.includes("@"))   e.email           = "Valid email required";
    if (form.phone.length < 10)      e.phone           = "Valid phone required";
    if (!form.city)                  e.city            = "Please select a city";
    if (form.password.length < 8)    e.password        = "Min 8 characters";
    if (form.password !== form.confirmPassword) e.confirmPassword = "Passwords don't match";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── POST /auth/register/user ──────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!validate()) return;
    if (!agreed) { setApiError("Please agree to the Terms of Service"); return; }
    setApiError(""); setLoading(true);

    try {
      const res  = await fetch(`${BASE}/auth/register/user`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          fullName: form.fullName,
          email:    form.email,
          phone:    form.phone,
          city:     form.city,
          password: form.password,
        }),
      });
      const data = await res.json() as AuthResponse;

      if (!res.ok) {
        setApiError(data.error || data.message || "Registration failed. Please try again.");
        return;
      }

      onSignupSuccess({
        role:         "user",
        name:         data.fullName || form.fullName,
        email:        data.email    || form.email,
        accessToken:  data.accessToken,
        refreshToken: data.refreshToken,
      });
    } catch (err) {
      setApiError((err as Error).message || "Network error — is the server running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ width: "100%", maxWidth: 400 }}>
      <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", color: "#6B7280", fontSize: 13, fontWeight: 500, padding: 0, marginBottom: 20, display: "flex", alignItems: "center", gap: 6 }}>← Back</button>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
        <div style={{ width: 32, height: 32, borderRadius: 10, background: "#F0FDF4", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🏠</div>
        <span style={{ fontSize: 12, fontWeight: 600, color: "#15803D", background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: 99, padding: "3px 12px" }}>Customer Account</span>
      </div>
      <h1 style={{ fontSize: 26, fontWeight: 800, color: "#111827", margin: "8px 0 4px", letterSpacing: "-0.5px" }}>Create your account</h1>
      <p style={{ fontSize: 14, color: "#6B7280", marginBottom: 24 }}>Book professional services in minutes</p>

      {apiError && (
        <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 10, padding: "10px 14px", marginBottom: 16, fontSize: 13, color: "#DC2626", display: "flex", gap: 8 }}>
          <span>⚠️</span><span>{apiError}</span>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 14px" }}>
        <div style={{ gridColumn: "1/-1" }}>
          <Input label="Full Name"      placeholder="John Doe"         value={form.fullName}        onChange={set("fullName")}        icon="👤" error={errors.fullName}        />
        </div>
        <div style={{ gridColumn: "1/-1" }}>
          <Input label="Email Address"  placeholder="name@email.com"   type="email" value={form.email} onChange={set("email")}       error={errors.email}           />
        </div>
        <Input label="Phone Number"     placeholder="+91 98765 43210"  value={form.phone}           onChange={set("phone")}           icon="📱" error={errors.phone}           />
        <Select label="City" value={form.city} onChange={set("city")} options={CITIES} placeholder="Select city" />
        <div style={{ gridColumn: "1/-1" }}>
          <Input label="Password"         placeholder="Min 8 characters" type="password" value={form.password}        onChange={set("password")}        error={errors.password}        />
        </div>
        <div style={{ gridColumn: "1/-1" }}>
          <Input label="Confirm Password" placeholder="Re-enter password"  type="password" value={form.confirmPassword} onChange={set("confirmPassword")} error={errors.confirmPassword} />
        </div>
      </div>

      <label style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 24, cursor: "pointer" }}>
        <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} style={{ marginTop: 2, accentColor: "#15803D", width: 16, height: 16, cursor: "pointer" }} />
        <span style={{ fontSize: 13, color: "#6B7280", lineHeight: 1.5 }}>
          I agree to the <a href="#" style={{ color: "#15803D", fontWeight: 600 }}>Terms of Service</a> and <a href="#" style={{ color: "#15803D", fontWeight: 600 }}>Privacy Policy</a>
        </span>
      </label>

      <button onClick={handleSubmit} disabled={loading}
        style={{ width: "100%", background: loading ? "#86EFAC" : "#15803D", color: "#fff", fontWeight: 700, fontSize: 15, padding: "14px 0", borderRadius: 12, border: "none", cursor: loading ? "not-allowed" : "pointer", marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
        {loading ? <><span>⏳</span> Creating account...</> : "Create Account →"}
      </button>

      <p style={{ textAlign: "center", fontSize: 13, color: "#6B7280" }}>
        Already have an account?{" "}
        <button onClick={onLogin} style={{ color: "#15803D", fontWeight: 700, background: "none", border: "none", cursor: "pointer", fontSize: 13 }}>Sign in</button>
      </p>
    </div>
  );
};

// ─── Provider Signup (multi-step) — calls POST /auth/register/provider ────────
const PROVIDER_STEPS = ["Account","Service Info","Work Details","Verify"];

const ProviderSignupForm = ({
  onBack, onLogin, onSignupSuccess,
}: {
  onBack:          () => void;
  onLogin:         () => void;
  onSignupSuccess: (data: LoginData) => void;
}) => {
  const [step,      setStep]      = useState(0);
  const [form,      setForm]      = useState<FormState>({
    fullName: "", email: "", phone: "", city: "", password: "", confirmPassword: "",
    serviceName: "", serviceCategory: "", experience: "", bio: "", serviceAreas: "", basePrice: "", idProof: "", skills: "Wiring,Panel Upgrades,Lighting",
  });
  const [agreed,   setAgreed]   = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [apiError, setApiError] = useState("");
  const [submitted,setSubmitted]= useState(false);

  const set = (k: keyof FormState) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

  // ── POST /auth/register/provider ─────────────────────────────────────────
  const handleSubmit = async () => {
    if (!agreed) { setApiError("Please agree to the Terms of Service"); return; }
    setApiError(""); setLoading(true);

    try {
      const res  = await fetch(`${BASE}/auth/register/provider`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          fullName:         form.fullName,
          email:            form.email,
          phone:            form.phone,
          city:             form.city,
          password:         form.password,
          serviceName:      form.serviceName,
          serviceCategory:  form.serviceCategory,
          bio:              form.bio,
          experienceYears:  Number(form.experience) || 0,
          basePricePerHour: Number(form.basePrice)  || 0,
          serviceAreas:     form.serviceAreas,
          skills:           form.skills,
        }),
      });
      const data = await res.json() as AuthResponse;

      if (!res.ok) {
        setApiError(data.error || data.message || "Registration failed. Please try again.");
        setLoading(false);
        return;
      }

      setLoading(false);
      setSubmitted(true);

      // Auto-login after registration (backend returns token)
      if (data.accessToken) {
        setTimeout(() => {
          onSignupSuccess({
            role:         "provider",
            name:         data.fullName || form.fullName,
            email:        data.email    || form.email,
            accessToken:  data.accessToken,
            refreshToken: data.refreshToken,
          });
        }, 3000); // show success screen for 3s
      }
    } catch (err) {
      setApiError((err as Error).message || "Network error — is the server running?");
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 0: return (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 14px" }}>
          <div style={{ gridColumn: "1/-1" }}>
            <Input label="Full Name"      placeholder="Sanket Chavan"   value={form.fullName}        onChange={set("fullName")}        icon="👤" />
          </div>
          <div style={{ gridColumn: "1/-1" }}>
            <Input label="Email Address"  placeholder="name@email.com"  type="email" value={form.email} onChange={set("email")} />
          </div>
          <Input label="Phone Number"     placeholder="+91 98765 43210" value={form.phone}           onChange={set("phone")}           icon="📱" />
          <Select label="City" value={form.city} onChange={set("city")} options={CITIES} placeholder="Select city" />
          <div style={{ gridColumn: "1/-1" }}>
            <Input label="Password"         placeholder="Min 8 characters" type="password" value={form.password}        onChange={set("password")}        />
          </div>
          <div style={{ gridColumn: "1/-1" }}>
            <Input label="Confirm Password" placeholder="Re-enter password"  type="password" value={form.confirmPassword} onChange={set("confirmPassword")} />
          </div>
        </div>
      );
      case 1: return (
        <>
          <Input label="Business / Service Name" placeholder="e.g. Sanket's Electrical Services" value={form.serviceName} onChange={set("serviceName")} icon="🏷️" />
          <Select label="Service Category" value={form.serviceCategory} onChange={set("serviceCategory")} options={SERVICE_CATEGORIES} placeholder="Select your main service" />
          <Textarea label="About You / Bio" placeholder="Describe your expertise, certifications..." value={form.bio} onChange={set("bio")} />
          <Input label="Service Areas (comma-separated)" placeholder="e.g. Andheri, Bandra, Powai" value={form.serviceAreas} onChange={set("serviceAreas")} icon="📍" />
        </>
      );
      case 2: return (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 14px" }}>
            <Input label="Years of Experience" placeholder="e.g. 5"   value={form.experience} onChange={set("experience")} icon="💼" />
            <Input label="Base Price (₹/hr)"   placeholder="e.g. 500" value={form.basePrice}  onChange={set("basePrice")}  icon="₹"  />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 8 }}>Available Days</label>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" as const }}>
              {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map((d) => (
                <button key={d} style={{ padding: "7px 14px", borderRadius: 99, fontSize: 13, fontWeight: 600, background: ["Mon","Tue","Wed","Thu","Fri"].includes(d) ? "#15803D" : "#F3F4F6", color: ["Mon","Tue","Wed","Thu","Fri"].includes(d) ? "#fff" : "#6B7280", border: "none", cursor: "pointer" }}>{d}</button>
              ))}
            </div>
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 8 }}>Skills (comma-separated)</label>
            <input value={form.skills} onChange={(e) => set("skills")(e.target.value)}
              placeholder="e.g. Wiring, Circuit Breakers, Lighting"
              style={{ width: "100%", border: "1.5px solid #E5E7EB", borderRadius: 12, padding: "11px 14px", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
            <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 8, marginTop: 8 }}>
              {form.skills.split(",").map((s) => s.trim()).filter(Boolean).map((s) => (
                <span key={s} style={{ padding: "5px 12px", background: "#F0FDF4", color: "#15803D", border: "1px solid #BBF7D0", borderRadius: 99, fontSize: 12, fontWeight: 500 }}>{s}</span>
              ))}
            </div>
          </div>
          <div style={{ background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: 12, padding: "12px 16px", fontSize: 13, color: "#15803D" }}>
            💡 You can add portfolio photos and certifications after creating your account
          </div>
        </>
      );
      case 3: return (
        <>
          <div style={{ background: "#FFF7ED", border: "1px solid #FED7AA", borderRadius: 14, padding: 20, marginBottom: 20 }}>
            <div style={{ fontWeight: 700, fontSize: 15, color: "#92400E", marginBottom: 6 }}>🔒 Identity Verification Required</div>
            <p style={{ fontSize: 13, color: "#78350F", lineHeight: 1.6, margin: 0 }}>
              To protect our customers, all service providers must verify their identity.
            </p>
          </div>
          <Select label="ID Proof Type" value={form.idProof} onChange={set("idProof")}
            options={["Aadhaar Card","PAN Card","Passport","Voter ID","Driving License"]} placeholder="Select ID type" />
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 8 }}>Upload ID Document</label>
            <div style={{ border: "2px dashed #D1D5DB", borderRadius: 12, padding: "28px 20px", textAlign: "center", cursor: "pointer", background: "#FAFAFA" }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>📎</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#374151", marginBottom: 4 }}>Drop your file here or click to upload</div>
              <div style={{ fontSize: 12, color: "#9CA3AF" }}>PNG, JPG or PDF • Max 5MB</div>
            </div>
          </div>

          {/* Summary of what will be sent to API */}
          <div style={{ background: "#F9FAFB", borderRadius: 14, padding: 16, marginBottom: 16 }}>
            <div style={{ fontWeight: 600, fontSize: 14, color: "#374151", marginBottom: 10 }}>Account Summary</div>
            {[
              ["Name",     form.fullName        || "—"],
              ["Email",    form.email           || "—"],
              ["Service",  form.serviceName     || "—"],
              ["Category", form.serviceCategory || "—"],
              ["City",     form.city            || "—"],
              ["Price",    form.basePrice ? `₹${form.basePrice}/hr` : "—"],
              ["Areas",    form.serviceAreas    || "—"],
            ].map(([k, v]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, padding: "4px 0", borderBottom: "1px solid #F3F4F6" }}>
                <span style={{ color: "#9CA3AF" }}>{k}</span>
                <span style={{ color: "#374151", fontWeight: 500, maxWidth: 220, textAlign: "right" }}>{v}</span>
              </div>
            ))}
          </div>

          {apiError && (
            <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 10, padding: "10px 14px", marginBottom: 14, fontSize: 13, color: "#DC2626", display: "flex", gap: 8 }}>
              <span>⚠️</span><span>{apiError}</span>
            </div>
          )}

          <label style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 8, cursor: "pointer" }}>
            <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} style={{ marginTop: 2, accentColor: "#15803D", width: 16, height: 16 }} />
            <span style={{ fontSize: 13, color: "#6B7280", lineHeight: 1.5 }}>
              I agree to the <a href="#" style={{ color: "#15803D", fontWeight: 600 }}>Terms of Service</a>, <a href="#" style={{ color: "#15803D", fontWeight: 600 }}>Privacy Policy</a> and <a href="#" style={{ color: "#15803D", fontWeight: 600 }}>Provider Code of Conduct</a>
            </span>
          </label>
        </>
      );
      default: return null;
    }
  };

  if (submitted) return (
    <div style={{ width: "100%", maxWidth: 400, textAlign: "center" }}>
      <div style={{ width: 72, height: 72, borderRadius: "50%", background: "#F0FDF4", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, margin: "0 auto 20px" }}>✅</div>
      <h2 style={{ fontSize: 24, fontWeight: 800, color: "#111827", marginBottom: 8 }}>Application Submitted!</h2>
      <p style={{ fontSize: 14, color: "#6B7280", lineHeight: 1.7, marginBottom: 28 }}>
        Your account has been created and your application is under review. You'll receive a confirmation email within <strong>24–48 hours</strong>.
      </p>
      <div style={{ background: "#F0FDF4", borderRadius: 14, padding: 16, marginBottom: 24, textAlign: "left" }}>
        <div style={{ fontWeight: 600, fontSize: 13, color: "#15803D", marginBottom: 8 }}>What happens next?</div>
        {["We verify your identity","Background check completed","Your profile goes live","Start accepting bookings!"].map((s, i) => (
          <div key={i} style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 8 }}>
            <div style={{ width: 22, height: 22, borderRadius: "50%", background: "#15803D", color: "#fff", fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{i + 1}</div>
            <span style={{ fontSize: 13, color: "#374151" }}>{s}</span>
          </div>
        ))}
      </div>
      <p style={{ fontSize: 13, color: "#9CA3AF" }}>Redirecting to dashboard in 3s...</p>
      <button onClick={onLogin} style={{ width: "100%", background: "#15803D", color: "#fff", fontWeight: 700, fontSize: 15, padding: "14px 0", borderRadius: 12, border: "none", cursor: "pointer", marginTop: 12 }}>
        Go to Sign In
      </button>
    </div>
  );

  return (
    <div style={{ width: "100%", maxWidth: 420 }}>
      <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", color: "#6B7280", fontSize: 13, fontWeight: 500, padding: 0, marginBottom: 16, display: "flex", alignItems: "center", gap: 6 }}>← Back</button>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
        <div style={{ width: 32, height: 32, borderRadius: 10, background: "#FFF7ED", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🔧</div>
        <span style={{ fontSize: 12, fontWeight: 600, color: "#F97316", background: "#FFF7ED", border: "1px solid #FED7AA", borderRadius: 99, padding: "3px 12px" }}>Service Provider Account</span>
      </div>
      <h1 style={{ fontSize: 22, fontWeight: 800, color: "#111827", margin: "6px 0 4px" }}>
        {["Account Setup","Service Information","Work & Pricing","Verify & Submit"][step]}
      </h1>
      <p style={{ fontSize: 13, color: "#6B7280", marginBottom: 20 }}>
        {["Basic info to get you started","Tell customers what you offer","Your availability and pricing","Almost done — verify your identity"][step]}
      </p>

      <StepBar current={step} total={4} labels={PROVIDER_STEPS} />

      {renderStep()}

      <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
        {step > 0 && (
          <button onClick={() => setStep((s) => s - 1)} style={{ flex: 1, background: "#F3F4F6", color: "#374151", fontWeight: 700, fontSize: 14, padding: "13px 0", borderRadius: 12, border: "none", cursor: "pointer" }}>
            ← Previous
          </button>
        )}
        <button
          onClick={() => step < 3 ? setStep((s) => s + 1) : handleSubmit()}
          disabled={loading}
          style={{ flex: 2, background: loading ? "#86EFAC" : "#15803D", color: "#fff", fontWeight: 700, fontSize: 14, padding: "13px 0", borderRadius: 12, border: "none", cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
        >
          {loading
            ? <><span>⏳</span> Submitting...</>
            : step < 3 ? "Continue →" : "Submit Application"
          }
        </button>
      </div>

      <p style={{ textAlign: "center", fontSize: 12, color: "#9CA3AF", marginTop: 14 }}>
        Step {step + 1} of 4 • Already have an account?{" "}
        <button onClick={onLogin} style={{ color: "#15803D", fontWeight: 600, background: "none", border: "none", cursor: "pointer", fontSize: 12 }}>Sign in</button>
      </p>
    </div>
  );
};

// ─── Root Export ──────────────────────────────────────────────────────────────
export function SmartServeAuth({
  onLoginSuccess,
}: {
  onLoginSuccess?: (data: LoginData) => void;
} = {}) {
  const [page, setPage] = useState<AuthPage>("login");
  const [role, setRole] = useState<Role>(null);

  const goLogin  = () => { setPage("login");  setRole(null); };
  const goSignup = () => { setPage("signup"); setRole(null); };
  const goBack   = () => setRole(null);

  const handleAuthSuccess = (data: LoginData) => {
    onLoginSuccess?.(data);
  };

  const rightContent = () => {
    if (page === "login")   return <LoginForm   onSwitch={goSignup} onLoginSuccess={handleAuthSuccess} />;
    if (role === null)      return <RoleSelector onSelect={(r) => setRole(r)} />;
    if (role === "user")    return <UserSignupForm     onBack={goBack} onLogin={goLogin} onSignupSuccess={handleAuthSuccess} />;
    return                         <ProviderSignupForm onBack={goBack} onLogin={goLogin} onSignupSuccess={handleAuthSuccess} />;
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", width: "100%", fontFamily: "'Outfit', 'DM Sans', system-ui, sans-serif", background: "#F8FAFC" }}>
      {/* Left */}
      <LeftPanel page={page} role={role} />

      {/* Right */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 60px", background: "#F8FAFC", position: "relative", overflowY: "auto" }}>
        <div style={{ position: "absolute", top: -60, right: -60, width: 200, height: 200, borderRadius: "50%", background: "rgba(6,78,59,0.08)", pointerEvents: "none" }} />

        {/* Tab switcher */}
        <div style={{ position: "absolute", top: 28, right: 32, display: "flex", gap: 6 }}>
          {(["login","signup"] as AuthPage[]).map((p) => (
            <button key={p} onClick={() => { if (p === "login") goLogin(); else goSignup(); }}
              style={{ padding: "8px 20px", borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: "pointer", background: page === p ? "#15803D" : "transparent", color: page === p ? "#fff" : "#6B7280", border: page === p ? "none" : "1.5px solid #E5E7EB", transition: "all 0.2s" }}>
              {p === "login" ? "Sign In" : "Sign Up"}
            </button>
          ))}
        </div>

        {rightContent()}
      </div>
    </div>
  );
}

export default SmartServeAuth;