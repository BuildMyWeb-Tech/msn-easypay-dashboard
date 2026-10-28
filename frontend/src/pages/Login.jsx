import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTenant } from "../hooks/useTenant";
import { Eye, EyeOff, LogIn, Users, ClipboardList, CreditCard, BarChart2 } from "lucide-react";

const FEATURES = [
  { Icon: Users,         label: "Employee Management",      desc: "Manage your workforce efficiently" },
  { Icon: ClipboardList, label: "Attendance Tracking",      desc: "Real-time attendance monitoring" },
  { Icon: CreditCard,    label: "Payroll Processing",       desc: "Accurate & timely salary processing" },
  { Icon: BarChart2,     label: "Analytics & Reports",      desc: "Insightful HR & payroll reports" },
];

export default function Login() {
  const { login }      = useAuth();
  const navigate       = useNavigate();
  const { tenant }     = useParams();
  const { config }     = useTenant();

  const [form, setForm]       = useState({ userName: "", password: "" });
  const [showPwd, setShow]    = useState(false);
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.userName || !form.password) {
      setError("User Name and Password are required");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const companyCode = config?.CompanyCode || config?.companyCode || "";
      const companyId   = config?.CompanyId   || config?.companyId   || "";
      await login(form.userName, form.password, companyCode, companyId, tenant);
      navigate(`/${tenant}/attendance`, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const companyName = config?.CompanyName || config?.name || "EasyPay";

  return (
    <>
      <style>{`
        .login-wrap {
          min-height: 100vh;
          display: flex;
          background: var(--bg);
        }
        /* Left branding panel */
        .login-left {
          flex: 0 0 38%;
          max-width: 460px;
          background: var(--primary);
          color: #fff;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 48px 36px;
          min-width: 0;
        }
        .login-left-logo {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 48px;
        }
        .login-left-logo img {
          height: 40px;
          object-fit: contain;
          filter: brightness(0) invert(1);
        }
        .login-left-logo-name {
          font-size: 20px;
          font-weight: 800;
          letter-spacing: -0.02em;
          color: #fff;
        }
        .login-headline {
          font-size: clamp(28px, 4vw, 40px);
          font-weight: 800;
          line-height: 1.15;
          margin-bottom: 16px;
          letter-spacing: -0.02em;
        }
        .login-headline span {
          color: rgba(255,255,255,0.65);
        }
        .login-sub {
          font-size: 15px;
          color: rgba(255,255,255,0.75);
          max-width: 380px;
          line-height: 1.6;
          margin-bottom: 40px;
        }
        .login-features {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .login-feature-row {
          display: flex;
          align-items: center;
          gap: 14px;
          background: rgba(255,255,255,0.1);
          border-radius: 10px;
          padding: 12px 16px;
        }
        .login-feature-icon {
          width: 38px;
          height: 38px;
          border-radius: 8px;
          background: rgba(255,255,255,0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .login-feature-label {
          font-size: 14px;
          font-weight: 700;
          color: #fff;
        }
        .login-feature-desc {
          font-size: 12px;
          color: rgba(255,255,255,0.65);
          margin-top: 2px;
        }
        /* Right form panel */
        .login-right {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 48px 32px;
          background: var(--bg);
          border-left: 1px solid var(--border);
        }
        .login-form-inner {
          width: 100%;
          max-width: 420px;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 40px 36px;
          box-shadow: 0 4px 24px rgba(0,0,0,0.06);
        }
        .login-welcome {
          font-size: 26px;
          font-weight: 800;
          color: var(--text);
          margin-bottom: 4px;
          letter-spacing: -0.02em;
        }
        .login-welcome-sub {
          font-size: 13px;
          color: var(--text3);
          margin-bottom: 28px;
        }
        .login-company-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          font-weight: 700;
          color: var(--primary);
          background: var(--red-dim);
          padding: 4px 12px;
          border-radius: 20px;
          margin-bottom: 24px;
          letter-spacing: 0.04em;
        }
        .login-field-label {
          display: block;
          font-size: 12px;
          font-weight: 700;
          color: var(--text2);
          margin-bottom: 6px;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }
        .login-input {
          width: 100%;
          background: var(--bg);
          border: 1.5px solid var(--border);
          border-radius: 8px;
          padding: 11px 14px;
          font-size: 14px;
          color: var(--text);
          outline: none;
          transition: border-color .15s, box-shadow .15s;
          box-sizing: border-box;
        }
        .login-input:focus {
          border-color: var(--primary);
          box-shadow: 0 0 0 3px var(--red-dim);
        }
        .login-btn {
          width: 100%;
          padding: 12px;
          background: var(--primary);
          color: #fff;
          border: none;
          border-radius: 8px;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: opacity .15s;
          margin-top: 8px;
        }
        .login-btn:disabled { opacity: 0.7; cursor: not-allowed; }
        .login-btn:not(:disabled):hover { opacity: 0.9; }
        .login-error {
          background: var(--red-dim);
          border: 1px solid var(--red);
          border-radius: 8px;
          padding: 10px 14px;
          font-size: 13px;
          color: var(--red);
          margin-bottom: 16px;
        }
        .login-footer {
          margin-top: 28px;
          font-size: 12px;
          color: var(--text3);
          text-align: center;
        }
        /* Mobile: stack vertically, hide left panel */
        @media (max-width: 768px) {
          .login-wrap { flex-direction: column; }
          .login-left {
            padding: 28px 20px 24px;
            flex: none;
          }
          .login-headline { font-size: 22px; margin-bottom: 10px; }
          .login-sub { font-size: 13px; margin-bottom: 20px; }
          .login-features { gap: 10px; }
          .login-feature-row { padding: 10px 12px; gap: 10px; }
          .login-right {
            flex: 1;
            border-left: none;
            border-top: 1px solid var(--border);
            padding: 28px 20px;
            flex: 0 0 auto;
          }
        }
        @media (max-width: 480px) {
          .login-left { display: none; }
          .login-right { border-top: none; padding: 32px 16px; }
        }
      `}</style>

      <div className="login-wrap">
        {/* ── Left branding panel ── */}
        <div className="login-left">
          <div className="login-left-logo">
            <img src="/msn-logo.png" alt="MSN"
              onError={e => e.target.style.display = "none"} />
            <span className="login-left-logo-name">MSN EasyPay</span>
          </div>

          <div className="login-headline">
            Streamline your<br /><span>payroll operations</span>
          </div>
          <div className="login-sub">
            Manage attendance, process payroll, and get real-time HR insights — all in one platform.
          </div>

          <div className="login-features">
            {FEATURES.map(({ Icon, label, desc }) => (
              <div className="login-feature-row" key={label}>
                <div className="login-feature-icon"><Icon size={18} /></div>
                <div>
                  <div className="login-feature-label">{label}</div>
                  <div className="login-feature-desc">{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Right form panel ── */}
        <div className="login-right">
          <div className="login-form-inner">
            <div className="login-welcome">Welcome back</div>
            <div className="login-welcome-sub">Sign in to your account to continue</div>

            {config && (
              <div className="login-company-badge">
                {companyName}
              </div>
            )}

            {error && <div className="login-error">{error}</div>}

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <div>
                <label className="login-field-label">User Name</label>
                <input className="login-input" type="text" value={form.userName}
                  onChange={set("userName")} placeholder="Enter user name"
                  autoComplete="username" autoCapitalize="none" />
              </div>

              <div>
                <label className="login-field-label">Password</label>
                <div style={{ position: "relative" }}>
                  <input className="login-input" type={showPwd ? "text" : "password"}
                    value={form.password} onChange={set("password")}
                    placeholder="Enter password" autoComplete="current-password"
                    style={{ paddingRight: 42 }} />
                  <button type="button" onClick={() => setShow(s => !s)} style={{
                    position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                    background: "none", border: "none", color: "var(--text3)", cursor: "pointer",
                    display: "flex", padding: 0,
                  }}>
                    {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button type="submit" className="login-btn" disabled={loading}>
                {loading
                  ? <span className="spinner" style={{ width: 16, height: 16, borderColor: "#fff3", borderTopColor: "#fff" }} />
                  : <><LogIn size={16} /> Sign In</>}
              </button>
            </form>

            <div className="login-footer">
              MSN Infotec &copy; {new Date().getFullYear()}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
