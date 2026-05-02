// ─── EarningsPage.tsx ─────────────────────────────────────────────────────────
// Full earnings + bank details management for providers.
// Sections:
//   1. Summary cards (total earned, received, pending, this month)
//   2. Bar chart (last 7 days)
//   3. Bank account details — add / view / edit / delete
//   4. Payout history (all transfers with status)
//   5. Completed jobs list

import React, { useState, useEffect, useCallback } from "react";
import { api,type Appointment } from "./Dashboardtypes";
import { Spinner, Toast, useIsMobile } from "./Dashboardshared";
// ─── EarningsPage.tsx ─────────────────────────────────────────────────────────
// Full earnings + bank details management for providers.
// Sections:
//   1. Summary cards (total earned, received, pending, this month)
//   2. Bar chart (last 7 days)
//   3. Bank account details — add / view / edit / delete
//   4. Payout history (all transfers with status)
//   5. Completed jobs list

// import React, { useState, useEffect, useCallback } from "react";
// import { api, type Appointment } from "./dashboardTypes";
// import { Spinner, Toast, useIsMobile } from "./dashboardShared";

// BASE URL is handled by api() from Dashboardtypes

// ─── Types ────────────────────────────────────────────────────────────────────
interface BankDetails {
  hasDetails:    boolean;
  accountHolder?: string;
  accountNumber?: string;   // masked e.g. ****4321
  ifscCode?:      string;
  bankName?:      string;
  branchName?:    string;
  accountType?:   string;
  upiId?:         string;
  isVerified?:    boolean;
  updatedAt?:     string;
}

interface Payout {
  id:                  number;
  status:              string;
  net_amount_paise:    number;
  gross_amount_paise:  number;
  platform_fee_paise:  number;
  transfer_mode?:      string;
  transfer_reference?: string;
  service_name:        string;
  scheduled_date:      string;
  created_at:          string;
  completed_at?:       string;
  held_reason?:        string;
  failure_reason?:     string;
}

interface Summary {
  total_payouts:    number;
  total_earned_paise: number;
  received_paise:   number;
  pending_paise:    number;
  held_count:       number;
  processing_count: number;
  completed_count:  number;
}

interface EarningsPageProps {
  appointments: Appointment[];
  token:        string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt      = (s: string) => new Date(s).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
const fmtRupee = (paise: number) => `₹${(paise / 100).toLocaleString("en-IN")}`;

const STATUS_COLOR: Record<string, string> = {
  held:             "#F97316",
  pending_transfer: "#3b82f6",
  processing:       "#8b5cf6",
  completed:        "#16a34a",
  failed:           "#ef4444",
};
const STATUS_LABEL: Record<string, string> = {
  held:             "Held — add bank details",
  pending_transfer: "Queued for transfer",
  processing:       "Transfer in progress",
  completed:        "Received",
  failed:           "Transfer failed",
};

const inp: React.CSSProperties = {
  width: "100%", border: "1px solid #E5E7EB", borderRadius: 10,
  padding: "11px 14px", fontSize: 14, outline: "none",
  boxSizing: "border-box" as const,
};

// ─── BankForm — inline add/edit form ─────────────────────────────────────────
const BankForm = ({ token, existing, onSaved, onCancel }: {
  token: string;
  existing: BankDetails | null;
  onSaved: () => void;
  onCancel: () => void;
}) => {
  const [form, setForm] = useState({
    accountHolder: existing?.accountHolder || "",
    accountNumber: "",
    confirmNumber: "",
    ifscCode:      existing?.ifscCode || "",
    bankName:      existing?.bankName  || "",
    branchName:    existing?.branchName || "",
    accountType:   existing?.accountType || "savings",
    upiId:         existing?.upiId || "",
  });
  const [saving,    setSaving]    = useState(false);
  const [error,     setError]     = useState("");
  const [ifscValid, setIfscValid] = useState<boolean | null>(null);
  const [focused,   setFocused]   = useState<string | null>(null);

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));
  const f   = (k: string) => focused === k;

  const validateIfsc = (code: string) =>
    setIfscValid(/^[A-Z]{4}0[A-Z0-9]{6}$/.test(code.toUpperCase()));

  const submit = async () => {
    if (!form.accountHolder.trim()) return setError("Account holder name required");
    if (!form.accountNumber.trim()) return setError("Account number required");
    if (!form.confirmNumber.trim()) return setError("Please confirm your account number");
    if (form.accountNumber !== form.confirmNumber) return setError("Account numbers do not match");
    if (!form.ifscCode.trim())      return setError("IFSC code required");
    if (ifscValid === false)        return setError("Invalid IFSC format — example: SBIN0001234");
    if (!form.bankName.trim())      return setError("Bank name required");

    setSaving(true); setError("");
    try {
      await api("/payouts/bank-details", token, {
        method: "POST",
        body: JSON.stringify({
          accountHolder: form.accountHolder.trim(),
          accountNumber: form.accountNumber.trim(),
          confirmNumber: form.confirmNumber.trim(),
          ifscCode:      form.ifscCode.toUpperCase().trim(),
          bankName:      form.bankName.trim(),
          branchName:    form.branchName.trim() || undefined,
          accountType:   form.accountType,
          upiId:         form.upiId.trim() || undefined,
        }),
      });
      onSaved();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const Field = ({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) => (
    <div>
      <label style={{ fontSize: 12, color: "#6B7280", display: "block", marginBottom: 5, fontWeight: 600 }}>{label}</label>
      {children}
      {hint && <p style={{ fontSize: 11, color: "#9CA3AF", margin: "4px 0 0" }}>{hint}</p>}
    </div>
  );

  return (
    <div style={{ background: "#F9FAFB", borderRadius: 16, padding: 20, marginTop: 16 }}>
      <div style={{ fontWeight: 700, fontSize: 15, color: "#111827", marginBottom: 16 }}>
        {existing?.hasDetails ? "Update Bank Details" : "Add Bank Details"}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

        <Field label="Account Holder Name *">
          <input value={form.accountHolder}
            onChange={e => set("accountHolder", e.target.value)}
            onFocus={() => setFocused("accountHolder")} onBlur={() => setFocused(null)}
            placeholder="Exactly as on your bank passbook"
            style={{ ...inp, border: `1px solid ${f("accountHolder") ? "#F97316" : "#E5E7EB"}` }} />
        </Field>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Field label="Account Number *">
            <input
              type="text"
              inputMode="numeric"
              value={form.accountNumber}
              onChange={e => set("accountNumber", e.target.value.replace(/\D/g, ""))}
              onFocus={() => setFocused("accountNumber")}
              onBlur={() => setFocused(null)}
              placeholder="Enter account number"
              autoComplete="off"
              style={{
                ...inp,
                border: `1px solid ${f("accountNumber") ? "#F97316" : "#E5E7EB"}`,
                WebkitTextSecurity: "disc"
              } as any} />
          </Field>
          <Field label="Confirm Account Number *">
            <input value={form.confirmNumber}
              onChange={e => set("confirmNumber", e.target.value.replace(/\D/g, ""))}
              onFocus={() => setFocused("confirmNumber")} onBlur={() => setFocused(null)}
              placeholder="Re-enter to confirm" autoComplete="off"
              style={{ ...inp, border: `1px solid ${
                form.confirmNumber && form.confirmNumber !== form.accountNumber ? "#ef4444"
                : f("confirmNumber") ? "#F97316" : "#E5E7EB"
              }` }} />
          </Field>
        </div>

        {form.confirmNumber && form.accountNumber !== form.confirmNumber && (
          <p style={{ fontSize: 12, color: "#ef4444", margin: "-8px 0 0" }}>⚠ Account numbers do not match</p>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Field label="IFSC Code *" hint="11-char code on cheque book">
            <input value={form.ifscCode}
              onChange={e => { set("ifscCode", e.target.value.toUpperCase()); setIfscValid(null); }}
              onFocus={() => setFocused("ifscCode")}
              onBlur={() => { setFocused(null); validateIfsc(form.ifscCode); }}
              placeholder="e.g. SBIN0001234" maxLength={11}
              style={{ ...inp, border: `1px solid ${
                ifscValid === false ? "#ef4444" : ifscValid === true ? "#22c55e"
                : f("ifscCode") ? "#F97316" : "#E5E7EB"
              }` }} />
            {ifscValid === true  && <p style={{ fontSize: 11, color: "#22c55e", margin: "4px 0 0" }}>✓ Valid IFSC format</p>}
            {ifscValid === false && <p style={{ fontSize: 11, color: "#ef4444", margin: "4px 0 0" }}>⚠ Invalid — example: SBIN0001234</p>}
          </Field>
          <Field label="Bank Name *">
            <input value={form.bankName}
              onChange={e => set("bankName", e.target.value)}
              onFocus={() => setFocused("bankName")} onBlur={() => setFocused(null)}
              placeholder="e.g. State Bank of India"
              style={{ ...inp, border: `1px solid ${f("bankName") ? "#F97316" : "#E5E7EB"}` }} />
          </Field>
        </div>

        <Field label="Branch Name (optional)">
          <input value={form.branchName}
            onChange={e => set("branchName", e.target.value)}
            onFocus={() => setFocused("branchName")} onBlur={() => setFocused(null)}
            placeholder="e.g. Karad Main Branch"
            style={{ ...inp, border: `1px solid ${f("branchName") ? "#F97316" : "#E5E7EB"}` }} />
        </Field>

        <Field label="Account Type">
          <div style={{ display: "flex", gap: 10 }}>
            {(["savings", "current"] as const).map(t => (
              <button key={t} onClick={() => set("accountType", t)} style={{
                flex: 1, padding: "10px 0", borderRadius: 10,
                border: `1.5px solid ${form.accountType === t ? "#F97316" : "#E5E7EB"}`,
                background: form.accountType === t ? "#FFF7ED" : "#fff",
                color: form.accountType === t ? "#F97316" : "#6B7280",
                fontWeight: 600, fontSize: 13, cursor: "pointer",
                textTransform: "capitalize" as const,
              }}>{t}</button>
            ))}
          </div>
        </Field>

        <Field label="UPI ID (optional)" hint="Backup for faster transfers — e.g. name@ybl">
          <input value={form.upiId}
            onChange={e => set("upiId", e.target.value)}
            onFocus={() => setFocused("upiId")} onBlur={() => setFocused(null)}
            placeholder="yourname@upi"
            style={{ ...inp, border: `1px solid ${f("upiId") ? "#F97316" : "#E5E7EB"}` }} />
        </Field>
      </div>

      <div style={{ background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: 10, padding: "10px 14px", margin: "16px 0" }}>
        <p style={{ fontSize: 12, color: "#14532D", margin: 0 }}>
          🔒 Your details are stored securely and used only to transfer your earnings.
          Payouts are transferred automatically via Razorpay within minutes of job completion.
        </p>
      </div>

      {error && (
        <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 10, padding: "10px 14px", marginBottom: 14 }}>
          <p style={{ color: "#DC2626", fontSize: 13, margin: 0 }}>⚠️ {error}</p>
        </div>
      )}

      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={onCancel}
          style={{ flex: 1, background: "#F3F4F6", color: "#374151", border: "none", borderRadius: 12, padding: "12px 0", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>
          Cancel
        </button>
        <button onClick={submit} disabled={saving}
          style={{ flex: 2, background: saving ? "#9CA3AF" : "#F97316", color: "#fff", border: "none", borderRadius: 12, padding: "12px 0", fontWeight: 700, fontSize: 14, cursor: saving ? "not-allowed" : "pointer" }}>
          {saving ? "Saving..." : existing?.hasDetails ? "Update Bank Details" : "Save Bank Details"}
        </button>
      </div>
    </div>
  );
};

// ─── Main EarningsPage ────────────────────────────────────────────────────────
const EarningsPage = ({ appointments, token }: EarningsPageProps) => {
  const isMobile = useIsMobile();
  const [bank,      setBank]      = useState<BankDetails | null>(null);
  const [payouts,   setPayouts]   = useState<Payout[]>([]);
  const [summary,   setSummary]   = useState<Summary | null>(null);
  const [loading,   setLoading]   = useState(true);
  const [showForm,  setShowForm]  = useState(false);
  const [showDel,   setShowDel]   = useState(false);
  const [deleting,  setDeleting]  = useState(false);
  const [toast,     setToast]     = useState<{ msg: string; ok: boolean } | null>(null);
  const [testMode,  setTestMode]  = useState(false);

  const showToast = (msg: string, ok: boolean) => {
    setToast({ msg, ok }); setTimeout(() => setToast(null), 3500);
  };

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      // Use api() helper — handles 401 + auto token refresh automatically
      const [bd, po] = await Promise.all([
        api<BankDetails>("/payouts/bank-details", token).catch(() => ({ hasDetails: false } as BankDetails)),
        api<{ payouts: Payout[]; summary: Summary; testMode: boolean }>("/payouts/my", token).catch(() => null),
      ]);

      setBank(bd);
      if (po) {
        setPayouts(po.payouts   || []);
        setSummary(po.summary   || null);
        if (po.testMode) setTestMode(true);
      }
    } catch (err) {
      console.error("[EarningsPage] fetchAll error:", err);
      setBank({ hasDetails: false });
    } finally { setLoading(false); }
  }, [token]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const deleteBank = async () => {
    setDeleting(true);
    try {
      await api("/payouts/bank-details", token, { method: "DELETE" });
      showToast("Bank details removed", true);
      fetchAll();
      setShowDel(false);
    } catch { showToast("Could not remove bank details", false); }
    finally { setDeleting(false); }
  };

  // Earnings from appointments (local fallback)
  const completed    = appointments.filter(a => a.status === "completed");
  const total        = completed.reduce((s, a) => s + a.agreed_price, 0);
  const thisMonth    = completed.filter(a => {
    const d = new Date(a.completed_at || a.scheduled_date); const n = new Date();
    return d.getMonth() === n.getMonth() && d.getFullYear() === n.getFullYear();
  });
  const monthTotal   = thisMonth.reduce((s, a) => s + a.agreed_price, 0);

  const last7: { label: string; amount: number }[] = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i));
    const label  = d.toLocaleDateString("en-IN", { weekday: "short" });
    const amount = completed.filter(a =>
      new Date(a.completed_at || a.scheduled_date).toDateString() === d.toDateString()
    ).reduce((s, a) => s + a.agreed_price, 0);
    return { label, amount };
  });
  const maxAmt = Math.max(...last7.map(d => d.amount), 100);
  const C: React.CSSProperties = {
    background: "#fff", borderRadius: 16, border: "1px solid #F3F4F6",
    boxShadow: "0 1px 4px rgba(0,0,0,0.05)", padding: isMobile ? 16 : 24, marginBottom: 16,
  };

  return (
    <div className="ds-page" style={{ maxWidth: 900 }}>
      {toast && <Toast msg={toast.msg} ok={toast.ok} />}

      <div className="ds-page-header">
        <div><h1>Earnings & Payouts</h1><p>Track income and manage your bank account</p></div>
      </div>

      {/* ── Test mode banner ── */}
      {testMode && (
        <div style={{ background: "#FEF9C3", border: "1px solid #FDE047", borderRadius: 12, padding: "10px 16px", marginBottom: 16, display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 18 }}>🧪</span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#713F12" }}>Test Mode Active</div>
            <div style={{ fontSize: 12, color: "#92400E" }}>Payouts are simulated — no real money is transferred. Switch to live Razorpay keys for real payouts.</div>
          </div>
        </div>
      )}

      {/* ── Summary cards ── */}
      <div className="ds-grid-3" style={{ marginBottom: 16 }}>
        {[
          { label: "Total Earned",  value: `₹${total}`,      sub: `${completed.length} jobs`, color: "#22c55e" },
          { label: "This Month",    value: `₹${monthTotal}`, sub: `${thisMonth.length} jobs`,  color: "#3b82f6" },
          { label: "Avg per Job",   value: completed.length ? `₹${Math.round(total / completed.length)}` : "₹0", sub: "per job", color: "#F97316" },
        ].map(({ label, value, sub, color }) => (
          <div key={label} style={C}>
            <div style={{ fontSize: 13, color: "#6B7280", marginBottom: 8 }}>{label}</div>
            <div style={{ fontSize: isMobile ? 22 : 28, fontWeight: 800, color: "#111827" }}>{value}</div>
            <div style={{ fontSize: 12, color, fontWeight: 600, marginTop: 4 }}>{sub}</div>
          </div>
        ))}
      </div>

      {/* Payout summary from API */}
      {summary && (
        <div style={{ ...C, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 16 }}>
          {[
            { label: "Received",    value: fmtRupee(summary.received_paise),  color: "#22c55e", count: summary.completed_count },
            { label: "Pending",     value: fmtRupee(summary.pending_paise),   color: "#3b82f6", count: (summary.held_count || 0) + (summary.processing_count || 0) },
            { label: "Held",        value: `${summary.held_count} payout${summary.held_count !== 1 ? "s" : ""}`, color: "#F97316", count: null },
          ].map(({ label, value, color, count }) => (
            <div key={label} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 11, color: "#9CA3AF", fontWeight: 600, textTransform: "uppercase", marginBottom: 4 }}>{label}</div>
              <div style={{ fontSize: 18, fontWeight: 800, color }}>{value}</div>
              {count !== null && <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 2 }}>{count} jobs</div>}
            </div>
          ))}
        </div>
      )}

      {/* ── Bar chart ── */}
      <div style={C}>
        <div style={{ fontWeight: 700, fontSize: 14, color: "#111827", marginBottom: 18 }}>Last 7 Days</div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: isMobile ? 6 : 12, height: 130 }}>
          {last7.map(({ label, amount }) => (
            <div key={label} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <span style={{ fontSize: 10, color: "#F97316", fontWeight: 600 }}>{amount > 0 ? `₹${amount}` : ""}</span>
              <div style={{ width: "100%", background: amount > 0 ? "#F97316" : "#F3F4F6", borderRadius: "5px 5px 0 0", height: `${(amount / maxAmt) * 100}px`, minHeight: 4, transition: "height 0.4s" }} />
              <span style={{ fontSize: 10, color: "#9CA3AF" }}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Bank Account Details ── */}
      <div style={C}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, color: "#111827" }}>Bank Account</div>
            <div style={{ fontSize: 12, color: "#9CA3AF", marginTop: 2 }}>Earnings are transferred to this account</div>
          </div>
          {bank?.hasDetails && !showForm && (
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => setShowForm(true)}
                style={{ background: "#FFF7ED", color: "#F97316", border: "1px solid #FED7AA", borderRadius: 8, padding: "6px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                ✏️ Edit
              </button>
              <button onClick={() => setShowDel(true)}
                style={{ background: "#FEF2F2", color: "#ef4444", border: "1px solid #FECACA", borderRadius: 8, padding: "6px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                🗑
              </button>
            </div>
          )}
        </div>

        {loading ? <Spinner /> : bank?.hasDetails && !showForm ? (
          // View mode
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {[
                ["Account Holder", bank.accountHolder!],
                ["Account Number", bank.accountNumber!],
                ["IFSC Code",      bank.ifscCode!],
                ["Bank",           bank.bankName!],
                ["Branch",         bank.branchName || "—"],
                ["Type",           bank.accountType || "savings"],
              ].map(([label, value]) => (
                <div key={label} style={{ background: "#F9FAFB", borderRadius: 10, padding: "12px 14px" }}>
                  <div style={{ fontSize: 11, color: "#9CA3AF", fontWeight: 600, textTransform: "uppercase" as const, marginBottom: 4 }}>{label}</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#111827", textTransform: "capitalize" as const }}>{value}</div>
                </div>
              ))}
            </div>
            {bank.upiId && (
              <div style={{ background: "#F9FAFB", borderRadius: 10, padding: "12px 14px", marginTop: 12 }}>
                <div style={{ fontSize: 11, color: "#9CA3AF", fontWeight: 600, textTransform: "uppercase" as const, marginBottom: 4 }}>UPI ID</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>{bank.upiId}</div>
              </div>
            )}
            <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 6 }}>
              {bank.isVerified
                ? <span style={{ fontSize: 12, color: "#16a34a", fontWeight: 600 }}>✅ Verified by admin</span>
                : <span style={{ fontSize: 12, color: "#F97316", fontWeight: 600 }}>⏳ Pending admin verification</span>
              }
            </div>
          </div>
        ) : !showForm ? (
          // No bank details yet
          <div style={{ textAlign: "center", padding: "24px 0" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🏦</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#374151", marginBottom: 6 }}>No bank account added</div>
            <p style={{ fontSize: 13, color: "#9CA3AF", marginBottom: 16, maxWidth: 320, margin: "0 auto 16px" }}>
              Add your bank account to receive earnings. Payouts are transferred automatically via Razorpay within minutes of job completion.
            </p>
            <button onClick={() => setShowForm(true)}
              style={{ background: "#F97316", color: "#fff", border: "none", borderRadius: 12, padding: "12px 24px", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
              + Add Bank Account
            </button>
          </div>
        ) : null}

        {showForm && (
          <BankForm
            token={token}
            existing={bank}
            onSaved={async () => {
              await fetchAll();          // reload data first
              setShowForm(false);        // then close form — no flicker
              showToast("Bank details saved successfully ✅", true);
            }}
            onCancel={() => setShowForm(false)}
          />
        )}

        {/* Delete confirmation */}
        {showDel && (
          <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 12, padding: 16, marginTop: 16 }}>
            <div style={{ fontWeight: 700, color: "#DC2626", marginBottom: 8 }}>Remove Bank Details?</div>
            <p style={{ fontSize: 13, color: "#7F1D1D", margin: "0 0 14px" }}>
              Any pending payouts will go on hold until you add new bank details.
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setShowDel(false)}
                style={{ flex: 1, background: "#F3F4F6", color: "#374151", border: "none", borderRadius: 10, padding: "10px 0", fontWeight: 600, cursor: "pointer" }}>
                Cancel
              </button>
              <button onClick={deleteBank} disabled={deleting}
                style={{ flex: 1, background: "#ef4444", color: "#fff", border: "none", borderRadius: 10, padding: "10px 0", fontWeight: 700, cursor: "pointer" }}>
                {deleting ? "Removing..." : "Yes, Remove"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Payout History ── */}
      <div style={C}>
        <div style={{ fontWeight: 700, fontSize: 15, color: "#111827", marginBottom: 14 }}>Payout History</div>
        {payouts.length === 0 ? (
          <p style={{ fontSize: 13, color: "#9CA3AF", textAlign: "center", padding: 20 }}>No payouts yet</p>
        ) : payouts.map(p => (
          <div key={p.id} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "12px 0", borderBottom: "1px solid #F9FAFB" }}>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: STATUS_COLOR[p.status] || "#9CA3AF", marginTop: 5, flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 3 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>{p.service_name}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: STATUS_COLOR[p.status], flexShrink: 0, marginLeft: 8 }}>
                  {fmtRupee(p.net_amount_paise)}
                </div>
              </div>
              <div style={{ fontSize: 11, color: "#9CA3AF", marginBottom: 3 }}>
                {fmt(p.scheduled_date)} · Job #{p.id}
                {p.transfer_reference && ` · Ref: ${p.transfer_reference}`}
              </div>
              <span style={{
                fontSize: 11, fontWeight: 600,
                color: STATUS_COLOR[p.status] || "#9CA3AF",
                background: `${STATUS_COLOR[p.status] || "#9CA3AF"}18`,
                borderRadius: 6, padding: "2px 8px",
              }}>
                {STATUS_LABEL[p.status] || p.status}
              </span>
              {p.failure_reason && (
                <div style={{ fontSize: 11, color: "#ef4444", marginTop: 3 }}>⚠️ {p.failure_reason}</div>
              )}
              {p.completed_at && (
                <div style={{ fontSize: 11, color: "#16a34a", marginTop: 3 }}>Transferred {fmt(p.completed_at)}</div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* ── Completed Jobs List ── */}
      <div style={C}>
        <div style={{ fontWeight: 700, fontSize: 15, color: "#111827", marginBottom: 14 }}>Completed Jobs</div>
        {completed.length === 0 ? (
          <p style={{ fontSize: 13, color: "#9CA3AF", textAlign: "center", padding: 20 }}>No completed jobs yet</p>
        ) : completed.map(a => (
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
        ))}
      </div>
    </div>
  );
};

export default EarningsPage;
