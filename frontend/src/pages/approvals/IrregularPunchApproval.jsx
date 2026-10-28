import React, { useState, useCallback } from "react";
import { RefreshCw, CheckCircle2 } from "lucide-react";
import api from "../../services/api";

const fmtDate = (d) => {
  if (!d) return "";
  const dt = new Date(d);
  if (isNaN(dt)) return String(d);
  return dt.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

export default function IrregularPunchApproval() {
  const [date, setDate]       = useState(() => new Date().toISOString().split("T")[0]);
  const [rows, setRows]       = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

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

  const handleApprove = async (row) => {
    if (!window.confirm(`Approve irregular punch for ${row.EmpName ?? row.empname ?? "this employee"}?`)) return;
    try {
      // SP for approve TBD — confirm with manager
      alert("Approval action — SP not yet configured. Contact administrator.");
    } catch {
      setError("Failed to approve.");
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
                const empCode = row.EmpCode  ?? row.empcode  ?? row.EMPCODE;
                const empName = row.EmpName  ?? row.empname  ?? row.EMPNAME;
                const dept    = row.Department ?? row.department ?? row.DEPARTMENT;
                const mcIn    = row.MCIn    ?? row.mcin    ?? row.MachinePunchIn  ?? "—";
                const mcOut   = row.MCOut   ?? row.mcout   ?? row.MachinePunchOut ?? "—";
                const manIn   = row.ManualIn  ?? row.manualin  ?? "—";
                const manOut  = row.ManualOut ?? row.manualout ?? "—";
                return (
                  <tr key={i}>
                    <td>{i + 1}</td>
                    <td>{empCode}</td>
                    <td>{empName}</td>
                    <td>{dept}</td>
                    <td>{mcIn}</td>
                    <td>{mcOut}</td>
                    <td style={{ color: manIn !== "—" ? "var(--text)" : "var(--text3)" }}>{manIn}</td>
                    <td style={{ color: manOut !== "—" ? "var(--text)" : "var(--text3)" }}>{manOut}</td>
                    <td>
                      <button
                        onClick={() => handleApprove(row)}
                        style={{
                          background: "var(--primary)", color: "#fff",
                          border: "none", borderRadius: "var(--radius-xs)",
                          padding: "4px 12px", fontSize: 12, fontWeight: 600,
                          display: "inline-flex", alignItems: "center", gap: 4, cursor: "pointer",
                        }}>
                        <CheckCircle2 size={12} /> Approve
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
  );
}
