import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ArrowRight } from "lucide-react";

export default function CompanySearch() {
  const navigate = useNavigate();
  const [slug, setSlug]     = useState("");
  const [error, setError]   = useState("");
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    const clean = slug.trim().toLowerCase().replace(/[^a-z0-9]/g, "");
    if (!clean) { setError("Please enter your company name or code"); return; }

    setError(""); setLoading(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL || ""}/api/tenants/${clean}`
      );
      if (res.ok) {
        navigate(`/${clean}/login`);
      } else {
        setError("Company not found. Please check the name and try again.");
      }
    } catch {
      setError("Unable to reach the server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "var(--bg)", padding: 16,
    }}>
      <div style={{ width: "100%", maxWidth: 400 }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <img src="/msn-logo.png" alt="MSN" style={{ height: 52, objectFit: "contain" }}
            onError={e => e.target.style.display = "none"} />
          <div style={{ marginTop: 12, fontSize: 24, fontWeight: 800, letterSpacing: "-0.02em" }}>EasyPay</div>
          <div style={{ fontSize: 13, color: "var(--text3)", marginTop: 4 }}>HR &amp; Payroll Dashboard</div>
        </div>

        <form onSubmit={handleSearch} style={{
          background: "var(--surface)", border: "1px solid var(--border)",
          borderRadius: "var(--radius)", padding: 28, display: "flex", flexDirection: "column", gap: 16,
        }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Find Your Company</div>
            <div style={{ fontSize: 13, color: "var(--text3)" }}>
              Enter your company name to access the login page
            </div>
          </div>

          {error && (
            <div style={{
              background: "var(--red-dim)", border: "1px solid var(--red)",
              borderRadius: "var(--radius-xs)", padding: "10px 14px",
              fontSize: 13, color: "var(--red)",
            }}>{error}</div>
          )}

          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text2)", marginBottom: 6 }}>
              Company Name
            </label>
            <div style={{ display: "flex", alignItems: "center", position: "relative" }}>
              <Search size={15} style={{
                position: "absolute", left: 11, color: "var(--text3)", pointerEvents: "none",
              }} />
              <input
                type="text"
                value={slug}
                onChange={e => { setSlug(e.target.value); setError(""); }}
                placeholder="e.g. omtex"
                autoFocus
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                style={{
                  width: "100%", background: "var(--surface2)",
                  border: "1px solid var(--border)", borderRadius: "var(--radius-xs)",
                  padding: "9px 12px 9px 34px",
                  fontSize: 14, color: "var(--text)", outline: "none",
                  transition: "border-color .15s",
                }}
                onFocus={e => e.target.style.borderColor = "var(--primary)"}
                onBlur={e => e.target.style.borderColor = "var(--border)"}
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary"
            style={{ width: "100%", justifyContent: "center", padding: "10px", marginTop: 4 }}
            disabled={loading || !slug.trim()}>
            {loading
              ? <span className="spinner" style={{ width: 16, height: 16 }} />
              : <><ArrowRight size={15} /> Continue</>}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: 20, fontSize: 12, color: "var(--text3)" }}>
          MSN Infotec &copy; {new Date().getFullYear()}
        </div>
      </div>
    </div>
  );
}
