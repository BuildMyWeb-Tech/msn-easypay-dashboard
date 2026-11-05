import React, { useState, useCallback, useEffect } from "react";
import { RefreshCw, CheckCircle2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";

const fmtDate = (d) => {
  if (!d) return "";
  const dt = new Date(d);
  if (isNaN(dt)) return String(d);
  return dt.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

export default function IrregularPunchApproval() {
  const { user } = useAuth();
  const [date, setDate]       = useState(() => new Date().toISOString().split("T")[0]);
  const [rows, setRows]       = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [approving, setApproving] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get(`/dashboard/irregular-punch?date=${date}`);
      setRows(res.data?.data || []);
    } catch {
      setError("Failed to load irregular punch list.");
    } finally {
      setLoading(false);
    }
  }, [date]);

  // Auto-load on date change
  useEffect(() => { load(); }, [load]);

  const handleApprove = async (row) => {
    const empName = row.EmpName ?? row.empname ?? "this employee";
    const empCode = row.EmpCode ?? row.empcode ?? row.EMPCODE;
    if (!window.confirm(`Approve irregular punch for ${empName}?`)) return;
    setApproving(empCode);
    setError("");
    try {
      await api.post("/dashboard/irregular-punch-approve", { empCode, date });
      // Reload grid after approval
      const res2 = await api.get(`/dashboard/irregular-punch?date=${date}`);
      setRows(res2.data?.data || []);
    } catch {
      setError("Failed to approve. Please try again.");
    } finally {
      setApproving(null);
    }
  };

  return (
    <div className="card" style={{ marginBottom: 0 }}>
      {/* Header */}
      <div className="card-header card-header-red">
        Irregular Punch Approval
      </div>

      {/* Date + Load */}
      <div style={{
        padding: "14px 16px",
        display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap",
        borderBottom: "1px solid var(--border)",
      }}>
        <label style={{ fontSize: 13, fontWeight: 700, color: "var(--text2)" }}>Date</label>
        <input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          style={{
            background: "var(--bg)", border: "1px solid var(--border)",
            borderRadius: "var(--radius-xs)", padding: "8px 12px",
            color: "var(--text)", fontSize: 13, minHeight: 40,
          }}
        />
        <button
          className="btn btn-primary btn-sm"
          onClick={load}
          style={{ display: "flex", alignItems: "center", gap: 5, minHeight: 40 }}>
          <RefreshCw size={13} /> Show
        </button>
        {loading && <span className="spinner" />}
        {error && <span style={{ fontSize: 12, color: "var(--red)" }}>{error}</span>}
      </div>

      {/* Table */}
      <div style={{ overflowX: "auto" }}>
        {rows.length === 0 && !loading ? (
          <div style={{ padding: "32px", textAlign: "center", color: "var(--text3)", fontSize: 13 }}>
            Select a date and click Show.
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Sl No</th>
                <th>Emp Code</th>
                <th>Employee Name</th>
                <th>Department</th>
                <th>M/C In</th>
                <th>M/C Out</th>
                <th>Manual In</th>
                <th>Manual Out</th>
                <th>Approve</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => {
                // Case-insensitive column lookup
                const ci = (keys) => { for (const k of keys) { const v = Object.entries(row).find(([rk]) => rk.toLowerCase() === k.toLowerCase()); if (v && v[1] != null) return v[1]; } return undefined; };
                const empCode   = ci(["empcode","empno","emp_code","employeecode"]);
                const empName   = ci(["empname","employeename","emp_name","name"]);
                const dept      = ci(["deptname","department","dept"]);
                const mcIn      = ci(["mcin","machinein","machinepunchin","m_c_in","mcintime"]);
                const mcOut     = ci(["mcout","machineout","machinepunchout","m_c_out","mcouttime"]);
                const manIn     = ci(["manualin","manin","manual_in","manualintime"]);
                const manOut    = ci(["manualout","manout","manual_out","manualouttime"]);
                const isApproved = row._approved;
                const isBusy    = approving === empCode;
                return (
                  <tr key={i} style={{ opacity: isApproved ? 0.6 : 1 }}>
                    <td>{i + 1}</td>
                    <td>{empCode ?? "—"}</td>
                    <td>{empName ?? "—"}</td>
                    <td>{dept ?? "—"}</td>
                    <td>{mcIn ?? "—"}</td>
                    <td>{mcOut ?? "—"}</td>
                    <td style={{ color: manIn != null ? "var(--text)" : "var(--text3)" }}>{manIn ?? "—"}</td>
                    <td style={{ color: manOut != null ? "var(--text)" : "var(--text3)" }}>{manOut ?? "—"}</td>
                    <td>
                      {isApproved ? (
                        <span style={{ fontSize: 12, color: "var(--green)", fontWeight: 600 }}>✓ Approved</span>
                      ) : (
                        <button
                          onClick={() => handleApprove(row)}
                          disabled={isBusy}
                          style={{
                            background: "var(--primary)", color: "#fff",
                            border: "none", borderRadius: "var(--radius-xs)",
                            padding: "4px 12px", fontSize: 12, fontWeight: 600,
                            display: "inline-flex", alignItems: "center", gap: 4,
                            cursor: isBusy ? "not-allowed" : "pointer",
                            opacity: isBusy ? 0.7 : 1,
                          }}>
                          {isBusy
                            ? <span className="spinner" style={{ width: 10, height: 10, borderColor: "#fff3", borderTopColor: "#fff" }} />
                            : <><CheckCircle2 size={12} /> Approve</>}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
