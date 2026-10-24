import React, { useState, useEffect, useCallback } from "react";
import { Plus, Save, ToggleLeft, ToggleRight, Shield } from "lucide-react";
import api from "../../services/api";

const EMPTY = { slug: "", companyCode: "", companyId: "", companyName: "", logoUrl: "" };

export default function AdminCompanies() {
  const [adminKey, setAdminKey]   = useState(() => { try { return sessionStorage.getItem("ep-admin-key") || ""; } catch { return ""; } });
  const [authed, setAuthed]       = useState(false);
  const [keyInput, setKeyInput]   = useState("");
  const [companies, setCompanies] = useState([]);
  const [form, setForm]           = useState(EMPTY);
  const [editSlug, setEditSlug]   = useState(null);
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState("");
  const [success, setSuccess]     = useState("");

  const headers = { "x-admin-key": adminKey };

  const load = useCallback(async () => {
    if (!adminKey) return;
    try {
      const res = await api.get("/tenants/", { headers });
      setCompanies(res.data.data || []);
      setAuthed(true);
    } catch (e) {
      if (e.response?.status === 401) setAuthed(false);
    }
  }, [adminKey]);

  useEffect(() => { if (adminKey) load(); }, [load]);

  const verifyKey = async () => {
    setError("");
    try {
      await api.get("/tenants/", { headers: { "x-admin-key": keyInput } });
      setAdminKey(keyInput);
      try { sessionStorage.setItem("ep-admin-key", keyInput); } catch {}
      setAuthed(true);
    } catch (e) {
      setError(e.response?.data?.message || "Invalid admin key");
    }
  };

  const handleSave = async () => {
    setError(""); setSuccess("");
    if (!form.slug || !form.companyCode || !form.companyId) {
      setError("Slug, Company Code and Company ID are required");
      return;
    }
    setSaving(true);
    try {
      await api.post("/tenants/", form, { headers });
      setSuccess(`Company "${form.companyName || form.slug}" saved successfully`);
      setForm(EMPTY); setEditSlug(null);
      load();
    } catch (e) {
      setError(e.response?.data?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (c) => {
    setForm({ slug: c.Slug, companyCode: c.CompanyCode, companyId: String(c.CompanyId), companyName: c.CompanyName, logoUrl: c.LogoUrl || "" });
    setEditSlug(c.Slug);
    setError(""); setSuccess("");
  };

  const handleToggle = async (c) => {
    try {
      await api.patch(`/tenants/${c.Slug}`, { active: !c.IsActive }, { headers });
      load();
    } catch (e) {
      setError(e.response?.data?.message || "Update failed");
    }
  };

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  if (!authed) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)", padding: 16 }}>
      <div style={{ width: "100%", maxWidth: 360 }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <Shield size={40} style={{ color: "var(--primary)", marginBottom: 8 }} />
          <div style={{ fontSize: 20, fontWeight: 700 }}>Admin Access</div>
          <div style={{ fontSize: 13, color: "var(--text3)", marginTop: 4 }}>Enter your ADMIN_KEY to manage companies</div>
        </div>
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: 24, display: "flex", flexDirection: "column", gap: 14 }}>
          {error && <div style={{ background: "var(--red-dim)", border: "1px solid var(--red)", borderRadius: "var(--radius-xs)", padding: "10px 14px", fontSize: 13, color: "var(--red)" }}>{error}</div>}
          <input type="password" placeholder="Admin key" value={keyInput}
            onChange={e => setKeyInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && verifyKey()}
            style={{ background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: "var(--radius-xs)", padding: "9px 12px", fontSize: 13, color: "var(--text)", outline: "none" }} />
          <button className="btn btn-primary" style={{ justifyContent: "center", padding: 10 }} onClick={verifyKey}>
            Verify Key
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", padding: 24 }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
          <Shield size={22} style={{ color: "var(--primary)" }} />
          <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Company Configuration</h1>
          <span style={{ fontSize: 12, color: "var(--text3)", marginLeft: "auto" }}>
            Changes take effect immediately — no code changes needed
          </span>
        </div>

        {error   && <div style={{ background: "var(--red-dim)",   border: "1px solid var(--red)",   borderRadius: "var(--radius-xs)", padding: "10px 14px", fontSize: 13, color: "var(--red)",   marginBottom: 16 }}>{error}</div>}
        {success && <div style={{ background: "var(--green-dim)", border: "1px solid var(--green)", borderRadius: "var(--radius-xs)", padding: "10px 14px", fontSize: 13, color: "var(--green)", marginBottom: 16 }}>{success}</div>}

        {/* Add / Edit Form */}
        <div className="card" style={{ marginBottom: 24 }}>
          <div className="card-header card-header-red">
            {editSlug ? `Edit: ${editSlug}` : "Add New Company"}
          </div>
          <div className="card-body" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
            <FormField label="Slug (URL path)" value={form.slug} onChange={set("slug")}
              placeholder="e.g. kct" disabled={!!editSlug}
              hint="payroll.msninfotec.com/kct" />
            <FormField label="Company Code" value={form.companyCode} onChange={set("companyCode")}
              placeholder="e.g. 5146688" hint="Used for login API" />
            <FormField label="Company ID (integer)" value={form.companyId} onChange={set("companyId")}
              placeholder="e.g. 51" type="number" hint="@COMPID in SPs" />
            <FormField label="Company Name" value={form.companyName} onChange={set("companyName")}
              placeholder="e.g. KCT Textiles" />
            <FormField label="Logo URL (optional)" value={form.logoUrl} onChange={set("logoUrl")}
              placeholder="/msn-logo.png" hint="Leave blank for default" />
          </div>
          <div style={{ padding: "0 16px 16px", display: "flex", gap: 8 }}>
            <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={saving}
              style={{ display: "flex", alignItems: "center", gap: 5 }}>
              {saving ? <span className="spinner" style={{ width: 14, height: 14 }} /> : <Save size={14} />}
              {editSlug ? "Update Company" : "Add Company"}
            </button>
            {editSlug && (
              <button className="btn btn-ghost btn-sm" onClick={() => { setForm(EMPTY); setEditSlug(null); }}>
                Cancel
              </button>
            )}
          </div>
        </div>

        {/* Companies Table */}
        <div className="card">
          <div className="card-header card-header-red">All Companies ({companies.length})</div>
          <div style={{ overflowX: "auto" }}>
            <table className="data-table">
              <thead><tr>
                <th>Slug</th><th>Company Name</th><th>Code</th><th>ID</th><th>Status</th><th>Actions</th>
              </tr></thead>
              <tbody>
                {companies.length === 0 && (
                  <tr><td colSpan={6} style={{ textAlign: "center", color: "var(--text3)", padding: 24 }}>No companies configured</td></tr>
                )}
                {companies.map(c => (
                  <tr key={c.Slug}>
                    <td style={{ fontWeight: 700, color: "var(--primary)", fontFamily: "monospace" }}>/{c.Slug}</td>
                    <td>{c.CompanyName || "—"}</td>
                    <td style={{ fontFamily: "monospace" }}>{c.CompanyCode}</td>
                    <td>{c.CompanyId}</td>
                    <td>
                      <span style={{
                        fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: "var(--radius-xs)",
                        background: c.IsActive ? "var(--green-dim)" : "var(--surface2)",
                        color: c.IsActive ? "var(--green)" : "var(--text3)",
                      }}>
                        {c.IsActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td style={{ display: "flex", gap: 6 }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => handleEdit(c)}
                        style={{ color: "var(--blue)", border: "1px solid var(--blue)", padding: "3px 10px", fontSize: 12 }}>
                        Edit
                      </button>
                      <button className="btn btn-ghost btn-sm" onClick={() => handleToggle(c)}
                        style={{ padding: "3px 8px", color: c.IsActive ? "var(--text3)" : "var(--green)" }}
                        title={c.IsActive ? "Deactivate" : "Activate"}>
                        {c.IsActive ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div style={{ marginTop: 16, fontSize: 12, color: "var(--text3)", textAlign: "center" }}>
          URL format: <code style={{ background: "var(--surface2)", padding: "2px 6px", borderRadius: 4 }}>payroll.msninfotec.com/&#123;slug&#125;</code>
          &nbsp;— company code is auto-passed to login, no code changes needed
        </div>
      </div>
    </div>
  );
}

function FormField({ label, hint, ...props }) {
  return (
    <div>
      <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text2)", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.05em" }}>
        {label}
      </label>
      <input {...props} style={{
        width: "100%", background: "var(--surface2)", border: "1px solid var(--border)",
        borderRadius: "var(--radius-xs)", padding: "8px 10px", fontSize: 13, color: "var(--text)",
        outline: "none", boxSizing: "border-box",
        opacity: props.disabled ? 0.6 : 1,
      }}
      onFocus={e => { if (!props.disabled) e.target.style.borderColor = "var(--primary)"; }}
      onBlur={e => e.target.style.borderColor = "var(--border)"} />
      {hint && <div style={{ fontSize: 10, color: "var(--text3)", marginTop: 3 }}>{hint}</div>}
    </div>
  );
}
