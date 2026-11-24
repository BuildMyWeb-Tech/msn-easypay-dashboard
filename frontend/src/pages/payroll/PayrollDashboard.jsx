import React, { useState, useCallback, useEffect } from "react";
import { RefreshCw, Users, IndianRupee, Clock, Minus, CreditCard, Building2, AlertCircle } from "lucide-react";
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import api from "../../services/api";

// ── helpers ────────────────────────────────────────────────────────────────────
const ci = (obj, keys) => {
  if (!obj) return 0;
  for (const k of keys) {
    const e = Object.entries(obj).find(([rk]) => rk.toLowerCase() === k.toLowerCase());
    if (e && e[1] != null) return e[1];
  }
  return 0;
};
const fmt = (n) => {
  const v = Number(n) || 0;
  if (v >= 10000000) return `₹${(v / 10000000).toFixed(2)} Cr`;
  if (v >= 100000)   return `₹${(v / 100000).toFixed(2)} L`;
  return `₹${v.toLocaleString("en-IN")}`;
};
const fmtN   = (n) => (Number(n) || 0).toLocaleString("en-IN");
const fmtHrs = (n) => { const v = Number(n) || 0; return v >= 1000 ? `${fmtN(v)} hrs` : `${v} hrs`; };

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];
const PIE_COLORS   = ["#e53935","#1565c0","#2e7d32","#f57f17","#6a1b9a","#00838f","#4e342e","#37474f"];
const DONUT_COLORS = ["#e53935","#fb8c00","#43a047","#1e88e5","#8e24aa","#00acc1","#f06292","#aed581"];

// ── sub-components ─────────────────────────────────────────────────────────────
function SectionHead({ icon: Icon, title, color = "var(--primary)" }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 8,
      padding: "10px 16px", borderBottom: "1px solid var(--border)",
      background: "var(--surface)",
    }}>
      <Icon size={15} style={{ color, flexShrink: 0 }} />
      <span style={{ fontWeight: 700, fontSize: 13, color: "var(--text)", letterSpacing: "0.01em" }}>
        {title}
      </span>
    </div>
  );
}

function KpiRow({ items }) {
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: `repeat(${items.length}, 1fr)`,
      gap: 1, background: "var(--border)",
    }}>
      {items.map(({ label, value, accent }) => (
        <div key={label} style={{
          background: "var(--surface)", padding: "14px 16px",
          display: "flex", flexDirection: "column", gap: 3,
        }}>
          <div style={{ fontSize: 11, color: "var(--text3)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>
            {label}
          </div>
          <div style={{ fontSize: 20, fontWeight: 800, color: accent || "var(--text)", lineHeight: 1.1 }}>
            {value}
          </div>
        </div>
      ))}
    </div>
  );
}

function Section({ icon, title, color, children }) {
  return (
    <div style={{
      border: "1px solid var(--border)", borderRadius: "var(--radius)",
      overflow: "hidden", background: "var(--surface)",
    }}>
      <SectionHead icon={icon} title={title} color={color} />
      {children}
    </div>
  );
}

const renderPieLabel = ({ name, percent }) => percent > 0.04 ? `${(percent * 100).toFixed(0)}%` : "";

// ── main component ─────────────────────────────────────────────────────────────
export default function PayrollDashboard() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year,  setYear]  = useState(now.getFullYear());
  const [data,  setData]  = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const res = await api.get(`/payroll/dashboard?month=${month}&year=${year}`);
      setData(res.data?.data || null);
    } catch (e) {
      setError(e.response?.data?.message || "Failed to load payroll data.");
    } finally {
      setLoading(false);
    }
  }, [month, year]);

  useEffect(() => { load(); }, [load]);

  const monthLabel = `${MONTHS[month - 1]} ${year}`;

  const S = data?.summary    || {};
  const A = data?.salaries   || {};
  const E = data?.earned     || {};
  const O = data?.ot         || {};
  const D = data?.deductions || {};
  const P = data?.payments   || {};

  const deptPie = (data?.deptWise || []).map((r) => ({
    name:  ci(r, ["deptname","department","dept","name"]) || "—",
    value: Number(ci(r, ["salary","amount","total","TotalSalary","totalsalary"])) || 0,
  })).filter(r => r.value > 0);

  const desigDonut = (data?.desigWise || []).map((r) => ({
    name:  ci(r, ["designation","designationname","desig","name"]) || "—",
    value: Number(ci(r, ["count","empcount","total","TotalEmp"])) || 0,
  })).filter(r => r.value > 0);

  const years = Array.from({ length: 5 }, (_, i) => now.getFullYear() - 2 + i);

  const selectStyle = {
    background: "var(--bg)", border: "1px solid var(--border)",
    borderRadius: "var(--radius-xs)", padding: "7px 10px",
    color: "var(--text)", fontSize: 13, minHeight: 36,
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      {/* ── header bar ── */}
      <div className="card" style={{ padding: "14px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <div className="card-header card-header-red" style={{ margin: 0, flex: "none" }}>
            Payroll Dashboard — {monthLabel}
          </div>
          <select value={month} onChange={e => setMonth(Number(e.target.value))} style={selectStyle}>
            {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
          </select>
          <select value={year} onChange={e => setYear(Number(e.target.value))} style={selectStyle}>
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <button className="btn btn-primary btn-sm" onClick={load}
            style={{ display: "flex", alignItems: "center", gap: 5, minHeight: 36 }}>
            <RefreshCw size={13} /> Load
          </button>
          {loading && <span className="spinner" />}
          {error && (
            <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "var(--red)" }}>
              <AlertCircle size={13} /> {error}
            </span>
          )}
        </div>
      </div>

      {/* ── 1. Employees ── */}
      <Section icon={Users} title="Employees" color="#1565c0">
        <KpiRow items={[
          { label: "Total Employees", value: fmtN(ci(S, ["TotalEmp","TotalEmployees","totalemployees","total"])), accent: "var(--primary)" },
          { label: "Staff",           value: fmtN(ci(S, ["Staff","StaffCount","staff"])) },
          { label: "Worker",          value: fmtN(ci(S, ["Worker","WorkerCount","worker"])) },
          { label: "PF Employees",    value: fmtN(ci(S, ["PFEmployees","PFEmp","pfemployees","pfemp"])) },
          { label: "ESI Employees",   value: fmtN(ci(S, ["ESIEmployees","ESIEmp","esiemployees","esiemp"])) },
          { label: "Exempted",        value: fmtN(ci(S, ["Exempted","ExemptedEmp","exempted"])) },
        ]} />
      </Section>

      {/* ── 2. Actual Salaries ── */}
      <Section icon={IndianRupee} title="Actual Salaries" color="#2e7d32">
        <KpiRow items={[
          { label: "Total Salary",  value: fmt(ci(A, ["TotalSalary","totalsalary","total"])), accent: "#2e7d32" },
          { label: "Staff Salary",  value: fmt(ci(A, ["StaffSalary","staffsalary","staff"])) },
          { label: "Worker Salary", value: fmt(ci(A, ["WorkerSalary","workersalary","worker"])) },
          { label: "PF Salary",     value: fmt(ci(A, ["PFSalary","pfsalary","pf"])) },
          { label: "ESI Salary",    value: fmt(ci(A, ["ESISalary","esisalary","esi"])) },
          { label: "Exempted",      value: fmt(ci(A, ["ExemptedSalary","exemptedsalary","exempted"])) },
        ]} />
      </Section>

      {/* ── 3. Earned Salaries + Charts ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>

        <Section icon={IndianRupee} title="Earned Salaries" color="#f57f17">
          <KpiRow items={[
            { label: "Total Earned", value: fmt(ci(E, ["TotalEarned","totalearned","total"])), accent: "#f57f17" },
            { label: "Staff",        value: fmt(ci(E, ["StaffEarned","staffearned","staff"])) },
            { label: "Worker",       value: fmt(ci(E, ["WorkerEarned","workerearned","worker"])) },
          ]} />
        </Section>

        {/* Dept-wise Pie */}
        <div style={{
          border: "1px solid var(--border)", borderRadius: "var(--radius)",
          overflow: "hidden", background: "var(--surface)",
        }}>
          <SectionHead icon={Building2} title="Salary — Department Wise" color="#6a1b9a" />
          <div style={{ padding: "8px 0", height: 180 }}>
            {deptPie.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={deptPie} dataKey="value" nameKey="name"
                    cx="40%" cy="50%" outerRadius={68}
                    label={renderPieLabel} labelLine={false}>
                    {deptPie.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v) => fmt(v)} />
                  <Legend iconSize={9} wrapperStyle={{ fontSize: 10 }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <NoData />
            )}
          </div>
        </div>
      </div>

      {/* ── Designation-wise Donut ── */}
      <div style={{
        border: "1px solid var(--border)", borderRadius: "var(--radius)",
        overflow: "hidden", background: "var(--surface)",
      }}>
        <SectionHead icon={Users} title="Employees — Designation Wise" color="#00838f" />
        <div style={{ padding: "8px 0", height: 200 }}>
          {desigDonut.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={desigDonut} dataKey="value" nameKey="name"
                  cx="50%" cy="50%" innerRadius={55} outerRadius={80}
                  label={renderPieLabel} labelLine={false}>
                  {desigDonut.map((_, i) => <Cell key={i} fill={DONUT_COLORS[i % DONUT_COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v) => `${fmtN(v)} emp`} />
                <Legend iconSize={9} wrapperStyle={{ fontSize: 10 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <NoData />
          )}
        </div>
      </div>

      {/* ── 4. Over Time  +  5. Deductions ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <Section icon={Clock} title="Over Time" color="#f57f17">
          <KpiRow items={[
            { label: "OT Hours", value: fmtHrs(ci(O, ["OTHours","othours","hours"])), accent: "#f57f17" },
            { label: "OT Wages", value: fmt(ci(O, ["OTWages","otwages","wages"])) },
          ]} />
        </Section>

        <Section icon={Minus} title="Deductions" color="#c62828">
          <KpiRow items={[
            { label: "PF Deducted",      value: fmt(ci(D, ["PFDeducted","pfdeducted","pf"])), accent: "#c62828" },
            { label: "ESI Deducted",     value: fmt(ci(D, ["ESIDeducted","esideducted","esi"])) },
            { label: "TDS Deducted",     value: fmt(ci(D, ["TDSDeducted","tdsdeducted","tds"])) },
            { label: "Other Deductions", value: fmt(ci(D, ["OtherDeductions","otherdeductions","other"])) },
          ]} />
        </Section>
      </div>

      {/* ── 6. Payments + Cost to Company ── */}
      <Section icon={CreditCard} title="Payments & Cost to Company" color="#1565c0">
        <KpiRow items={[
          { label: "Bank",            value: fmt(ci(P, ["Bank","bank","BankTransfer"])), accent: "#1565c0" },
          { label: "Cash",            value: fmt(ci(P, ["Cash","cash"])) },
          { label: "Net Salary Paid", value: fmt(ci(P, ["NetSalaryPaid","netsalarypaid","NetPaid","netpaid"])) },
          { label: "PF Paid",         value: fmt(ci(P, ["PFPaid","pfpaid"])) },
          { label: "ESI Paid",        value: fmt(ci(P, ["ESIPaid","esipaid"])) },
          { label: "Total CTC",       value: fmt(ci(P, ["TotalCTC","totalctc","CTC","ctc"])), accent: "#2e7d32" },
        ]} />
      </Section>

    </div>
  );
}

function NoData() {
  return (
    <div style={{
      height: "100%", display: "flex", alignItems: "center", justifyContent: "center",
      color: "var(--text3)", fontSize: 13,
    }}>
      No data for selected period
    </div>
  );
}
