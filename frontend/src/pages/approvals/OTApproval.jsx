import React, { useState, useCallback } from "react";
import { RefreshCw, CheckCircle2, RotateCcw, X, AlertTriangle } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";

const fmtDate = (d) => {
  if (!d) return "";
  const dt = new Date(d);
  if (isNaN(dt)) return String(d);
  return dt.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

export default function OTApproval() {
  const { user } = useAuth();
  const [date, setDate]       = useState(() => new Date().toISOString().split("T")[0]);
  const [rows, setRows]       = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  // Approve panel state
  const [panel, setPanel]     = useState(null); // { row, approvedOT }
  const [saving, setSaving]   = useState(false);
  const [confirm, setConfirm] = useState(false); // show confirm dialog when approvedOT > OT

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get(`/dashboard/ot-list?date=${date}`);
      setRows(res.data?.data || []);
    } catch {
      setError("Failed to load OT list.");
    } finally {
      setLoading(false);
    }
  }, [date]);

  const openPanel = (row) => {
    setPanel({ row, approvedOT: String(row.OT ?? row.ot ?? 0) });
    setConfirm(false);
  };

  const closePanel = () => { setPanel(null); setConfirm(false); };

  const handleSave = async () => {
    if (!panel) return;
    const ot         = Number(panel.row.OT ?? panel.row.ot ?? 0);
    const approvedOT = Number(panel.approvedOT);
    if (approvedOT > ot && !confirm) {
      setConfirm(true);
      return;
    }
    setSaving(true);
    try {
      const empCode = panel.row.EmpCode ?? panel.row.empcode ?? panel.row.EMPCODE;
      await api.post("/dashboard/ot-approve", { empCode, date, approvedOT });
      setRows(prev => prev.map(r =>
        (r.EmpCode ?? r.empcode ?? r.EMPCODE) === empCode
          ? { ...r, ApprovedOT: approvedOT }
          : r
      ));
      closePanel();
    } catch {
      setError("Failed to save OT approval.");
    } finally {
      setSaving(false);
    }
  };

  const handleReverse = async (row) => {
    if (!window.confirm("Reverse OT approval for this employee?")) return;
    try {
      const empCode = row.EmpCode ?? row.empcode ?? row.EMPCODE;
      await api.post("/dashboard/ot-approve", { empCode, date, approvedOT: 0 });
      setRows(prev => prev.map(r =>
        (r.EmpCode ?? r.empcode ?? r.EMPCODE) === empCode
          ? { ...r, ApprovedOT: 0 }
          : r
      ));
    } catch {
      setError("Failed to reverse OT approval.");
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* Header card */}
      <div className="card">
        <div className="card-header card-header-red">
          OT List as on : {fmtDate(date)}
        </div>
        <div style={{ padding: "14px 16px", display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <input type="date" value={date} onChange={e => setDate(e.target.value)}
            style={{
              background: "var(--bg)", border: "1px solid var(--border)",
              borderRadius: "var(--radius-xs)", padding: "8px 12px",
              color: "var(--text)", fontSize: 13, minHeight: 40,
            }} />
          <button className="btn btn-primary btn-sm"
            onClick={load}
            style={{ display: "flex", alignItems: "center", gap: 5, minHeight: 40 }}>
            <RefreshCw size={13} /> Load
          </button>
          {loading && <span className="spinner" />}
          {error && <span style={{ fontSize: 12, color: "var(--red)" }}>{error}</span>}
        </div>

        {/* Table */}
        <div style={{ overflowX: "auto" }}>
          {rows.length === 0 && !loading ? (
            <div style={{ padding: "24px", textAlign: "center", color: "var(--text3)", fontSize: 13 }}>
              No records. Select a date and click Load.
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Sl No</th>
                  <th>Emp Code</th>
                  <th>Employee Name</th>
                  <th>Department</th>
                  <th>OT</th>
                  <th>Approved OT</th>
                  <th style={{ color: "var(--primary)" }}>Approve</th>
                  <th>Reverse</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => {
                  const empCode = row.EmpCode ?? row.empcode ?? row.EMPCODE;
                  const empName = row.EmpName ?? row.empname ?? row.EMPNAME;
                  const dept    = row.Department ?? row.department ?? row.DEPARTMENT;
                  const ot      = row.OT ?? row.ot ?? 0;
                  const appOT   = row.ApprovedOT ?? row.approvedot ?? row.APPROVEDOT ?? 0;
                  return (
                    <tr key={i}>
                      <td>{i + 1}</td>
                      <td>{empCode}</td>
                      <td>{empName}</td>
                      <td>{dept}</td>
                      <td>{ot}</td>
                      <td style={{ fontWeight: 600, color: appOT > 0 ? "var(--green)" : "var(--text3)" }}>
                        {appOT}
                      </td>
                      <td>
                        <button
                          className="btn btn-sm"
                          onClick={() => openPanel(row)}
                          style={{
                            background: "var(--primary)", color: "#fff",
                            border: "none", borderRadius: "var(--radius-xs)",
                            padding: "4px 12px", fontSize: 12, fontWeight: 600,
                            display: "inline-flex", alignItems: "center", gap: 4, cursor: "pointer",
                          }}>
                          <CheckCircle2 size={12} /> Approve
                        </button>
                      </td>
                      <td>
                        <button
                          onClick={() => handleReverse(row)}
                          title="Reverse approval"
                          style={{
                            background: "var(--primary)", color: "#fff",
                            border: "none", borderRadius: "var(--radius-xs)",
                            width: 30, height: 30, display: "inline-flex",
                            alignItems: "center", justifyContent: "center",
                            cursor: "pointer",
                          }}>
                          <RotateCcw size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ── Approve side panel ── */}
      {panel && (
        <>
          {/* Backdrop */}
          <div
            onClick={closePanel}
            style={{
              position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)",
              zIndex: 400,
            }}
          />
          {/* Panel */}
          <div style={{
            position: "fixed", top: 0, right: 0, bottom: 0, width: 340,
            background: "var(--surface)", borderLeft: "1px solid var(--border)",
            zIndex: 401, display: "flex", flexDirection: "column",
            boxShadow: "-4px 0 24px rgba(0,0,0,0.12)",
          }}>
            {/* Panel header */}
            <div style={{
              padding: "16px 20px", borderBottom: "1px solid var(--border)",
              display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15, color: "var(--text)" }}>
                  Approve OT
                </div>
                <div style={{ fontSize: 12, color: "var(--text3)", marginTop: 2 }}>
                  {panel.row.EmpName ?? panel.row.empname ?? ""} ({panel.row.EmpCode ?? panel.row.empcode ?? ""})
                </div>
              </div>
              <button onClick={closePanel} style={{
                background: "none", border: "none", cursor: "pointer",
                color: "var(--text3)", display: "flex", padding: 4,
              }}>
                <X size={18} />
              </button>
            </div>

            {/* Panel body */}
            <div style={{ flex: 1, padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>
              <div style={{
                background: "var(--bg)", border: "1px solid var(--border)",
                borderRadius: "var(--radius-sm)", padding: "12px 16px",
                fontSize: 13, color: "var(--text2)",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span>Department</span>
                  <strong style={{ color: "var(--text)" }}>
                    {panel.row.Department ?? panel.row.department ?? "—"}
                  </strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Actual OT</span>
                  <strong style={{ color: "var(--text)", fontSize: 16 }}>
                    {panel.row.OT ?? panel.row.ot ?? 0}
                  </strong>
                </div>
              </div>

              <div>
                <label style={{
                  display: "block", fontSize: 12, fontWeight: 700,
                  color: "var(--text2)", marginBottom: 8,
                  textTransform: "uppercase", letterSpacing: "0.04em",
                }}>
                  Approved OT
                </label>
                <input
                  type="number"
                  min="0"
                  value={panel.approvedOT}
                  onChange={e => {
                    setPanel(p => ({ ...p, approvedOT: e.target.value }));
                    setConfirm(false);
                  }}
                  style={{
                    width: "100%", background: "var(--bg)",
                    border: "1.5px solid var(--border)", borderRadius: "var(--radius-xs)",
                    padding: "11px 14px", fontSize: 18, fontWeight: 700,
                    color: "var(--text)", outline: "none", boxSizing: "border-box",
                  }}
                  onFocus={e => e.target.style.borderColor = "var(--primary)"}
                  onBlur={e => e.target.style.borderColor = "var(--border)"}
                />
              </div>

              {/* Confirmation warning */}
              {confirm && (
                <div style={{
                  background: "var(--yellow-dim)", border: "1px solid var(--yellow)",
                  borderRadius: "var(--radius-xs)", padding: "12px 14px",
                  display: "flex", gap: 10, alignItems: "flex-start",
                }}>
                  <AlertTriangle size={16} style={{ color: "var(--yellow)", flexShrink: 0, marginTop: 1 }} />
                  <div style={{ fontSize: 13 }}>
                    <strong style={{ color: "var(--text)" }}>Approved OT exceeds Actual OT.</strong>
                    <div style={{ color: "var(--text2)", marginTop: 4 }}>
                      Click Save again to confirm this override.
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Panel footer */}
            <div style={{
              padding: "16px 24px", borderTop: "1px solid var(--border)",
              display: "flex", gap: 10,
            }}>
              <button
                onClick={handleSave}
                disabled={saving}
                style={{
                  flex: 1, background: "var(--primary)", color: "#fff",
                  border: "none", borderRadius: "var(--radius-xs)",
                  padding: "11px", fontSize: 14, fontWeight: 700,
                  cursor: saving ? "not-allowed" : "pointer",
                  opacity: saving ? 0.7 : 1,
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                }}>
                {saving
                  ? <span className="spinner" style={{ width: 14, height: 14, borderColor: "#fff3", borderTopColor: "#fff" }} />
                  : <><CheckCircle2 size={14} /> {confirm ? "Confirm Save" : "Save"}</>
                }
              </button>
              <button
                onClick={closePanel}
                style={{
                  flex: 1, background: "var(--surface2)", color: "var(--text)",
                  border: "1px solid var(--border)", borderRadius: "var(--radius-xs)",
                  padding: "11px", fontSize: 14, fontWeight: 600, cursor: "pointer",
                }}>
                Cancel
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
