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

// Case-insensitive column getter — works for any SP column naming convention
const col = (row, keys) => {
  for (const k of keys) {
    const entry = Object.entries(row).find(([rk]) => rk.toLowerCase() === k.toLowerCase());
    if (entry && entry[1] != null) return entry[1];
  }
  return undefined;
};

const getEmpCode = (row) => col(row, ["Empcode", "empcode", "EmpCode", "empno", "emp_code", "employeecode"]);
const getEmpName = (row) => col(row, ["Empname", "empname", "EmpName", "employeename", "emp_name", "name"]);
const getDept    = (row) => col(row, ["Department", "deptname", "department", "dept"]);
const getMcIn    = (row) => col(row, ["McIn", "mcin", "machinein", "machinepunchin", "m_c_in"]);
const getMcOut   = (row) => col(row, ["McOut", "mcout", "machineout", "machinepunchout", "m_c_out"]);
const getManIn   = (row) => col(row, ["ManualIn", "manualin", "manin", "manual_in"]);
const getManOut  = (row) => col(row, ["Manualout", "manualout", "manout", "manual_out"]);
const getIsApproved = (row) => {
  if (row._approved) return "yes";
  const v = col(row, ["IsApproved", "isapproved", "is_approved"]);
  if (v == null) return "no";
  const s = String(v).toLowerCase().trim();
  return (s === "yes" || s === "1" || s === "true") ? "yes" : "no";
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
    const empCode = getEmpCode(row);
    const empName = getEmpName(row) ?? "this employee";
    if (!window.confirm(`Approve irregular punch for ${empName}?`)) return;
    setApproving(empCode);
    setError("");
    try {
      await api.post("/dashboard/irregular-punch-approve", { empCode, date });
      // Mark approved locally immediately, then reload grid from DB
      setRows(prev => prev.map(r => getEmpCode(r) === empCode ? { ...r, _approved: true } : r));
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
            No records for selected date.
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
                const empCode    = getEmpCode(row);
                const empName    = getEmpName(row);
                const dept       = getDept(row);
                const mcIn       = getMcIn(row);
                const mcOut      = getMcOut(row);
                const manIn      = getManIn(row);
                const manOut     = getManOut(row);
                const approved   = getIsApproved(row) === "yes";
                const isBusy     = approving === empCode;
                return (
                  <tr key={i} style={{ opacity: approved ? 0.65 : 1 }}>
                    <td>{i + 1}</td>
                    <td>{empCode ?? "—"}</td>
                    <td>{empName ?? "—"}</td>
                    <td>{dept ?? "—"}</td>
                    <td>{mcIn ?? "—"}</td>
                    <td>{mcOut ?? "—"}</td>
                    <td style={{ color: manIn != null ? "var(--text)" : "var(--text3)" }}>{manIn ?? "—"}</td>
                    <td style={{ color: manOut != null ? "var(--text)" : "var(--text3)" }}>{manOut ?? "—"}</td>
                    <td>
                      {approved ? (
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
