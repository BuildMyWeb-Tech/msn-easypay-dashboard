import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTenant } from "../hooks/useTenant";
import { Eye, EyeOff, LogIn } from "lucide-react";

export default function Login() {
  const { login } = useAuth();
  const navigate     = useNavigate();
  const { tenant }   = useParams();
  const { config }   = useTenant();          // company config from URL slug

  const [form, setForm]    = useState({ userName: "", password: "" });
  const [showPwd, setShow] = useState(false);
  const [error, setError]  = useState("");
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.userName || !form.password) {
      setError("Username and password are required");
      return;
    }
    setError("");
    setLoading(true);
    try {
      // companyCode is implicitly taken from tenant config — user never types it
      const companyCode = config?.CompanyCode || config?.companyCode || "";
      await login(form.userName, form.password, companyCode);
      navigate(`/${tenant}/attendance`, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "var(--bg)", padding: 16,
    }}>
      <div style={{ width: "100%", maxWidth: 380 }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <img src="/msn-logo.png" alt="MSN" style={{ height: 52, objectFit: "contain" }}
            onError={e => e.target.style.display = "none"} />
          <div style={{ marginTop: 12, fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em" }}>EasyPay</div>
          <div style={{ fontSize: 13, color: "var(--text3)", marginTop: 4 }}>HR &amp; Payroll Dashboard</div>
          {config && (
            <div style={{
              marginTop: 8, display: "inline-block",
              fontSize: 12, fontWeight: 700, color: "var(--primary)",
              background: "var(--red-dim)", padding: "3px 12px",
              borderRadius: "var(--radius-xs)", letterSpacing: "0.05em",
            }}>
              {config.CompanyName || config.name}
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit}
          style={{
            background: "var(--surface)", border: "1px solid var(--border)",
            borderRadius: "var(--radius)", padding: 28, display: "flex", flexDirection: "column", gap: 16,
          }}>
          <div style={{ fontSize: 16, fontWeight: 700 }}>Sign In</div>

          {error && (
            <div style={{
              background: "var(--red-dim)", border: "1px solid var(--red)",
              borderRadius: "var(--radius-xs)", padding: "10px 14px",
              fontSize: 13, color: "var(--red)",
            }}>{error}</div>
          )}

          <Field label="User Name" value={form.userName} onChange={set("userName")}
            placeholder="Enter user name" autoComplete="username" />
          <Field label="Password" type={showPwd ? "text" : "password"}
            value={form.password} onChange={set("password")}
            placeholder="Enter password" autoComplete="current-password"
            suffix={
              <button type="button" onClick={() => setShow(s => !s)} style={{
                background: "none", border: "none", color: "var(--text3)", cursor: "pointer",
                display: "flex", padding: 0,
              }}>
                {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            } />

          <button type="submit" className="btn btn-primary"
            style={{ marginTop: 4, width: "100%", justifyContent: "center", padding: "10px" }}
            disabled={loading}>
            {loading
              ? <span className="spinner" style={{ width: 16, height: 16 }} />
              : <><LogIn size={15} /> Sign In</>}
          </button>

        </form>

        <div style={{ textAlign: "center", marginTop: 20, fontSize: 12, color: "var(--text3)" }}>
          MSN Infotec &copy; {new Date().getFullYear()}
        </div>
      </div>
    </div>
  );
}

function Field({ label, suffix, ...props }) {
  return (
    <div>
      <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text2)", marginBottom: 6 }}>
        {label}
      </label>
      <div style={{ display: "flex", alignItems: "center", position: "relative" }}>
        <input {...props} style={{
          width: "100%", background: "var(--surface2)",
          border: "1px solid var(--border)", borderRadius: "var(--radius-xs)",
          padding: suffix ? "9px 36px 9px 12px" : "9px 12px",
          fontSize: 13, color: "var(--text)",
          outline: "none", transition: "border-color .15s",
        }}
        onFocus={e => e.target.style.borderColor = "var(--primary)"}
        onBlur={e => e.target.style.borderColor = "var(--border)"} />
        {suffix && (
          <div style={{ position: "absolute", right: 10, display: "flex", alignItems: "center" }}>
            {suffix}
          </div>
        )}
      </div>
    </div>
  );
}
