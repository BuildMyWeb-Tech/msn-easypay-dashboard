import React, { useState, useEffect, useCallback } from "react";
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from "recharts";
import { useAuth } from "../../context/AuthContext";
import { useResponsive } from "../../hooks/useResponsive";
import api from "../../services/api";
import {
  Building2, Layers, Users, UserPlus, UserMinus, UsersRound,
  CalendarCheck, CheckCircle2, XCircle, AlertTriangle, ChevronDown,
  RefreshCw,
} from "lucide-react";

// ── Dummy data (Phase 1 — swapped for live API in Phase 2) ────
const DUMMY = {
  summary: {
    PresentCount: 199, AbsentCount: 17, IrregularPunch: 3,
    TotalEmployees: 211, TotalDepts: 33, TotalBranches: 3,
    MaleCount: 191, FemaleCount: 20,
    JoinedLast30: 19, LeftLast30: 6,
    LastProcessingDate: "2026-10-12T09:11:00",
  },
  deptAbsent: [
    { DeptName: "SPINNING",     AbsentCount: 8 },
    { DeptName: "MAINTENANCE",  AbsentCount: 3 },
    { DeptName: "PACKING",      AbsentCount: 2 },
    { DeptName: "PRODUCTION",   AbsentCount: 1 },
    { DeptName: "SWEEPER",      AbsentCount: 1 },
    { DeptName: "DOFFER",       AbsentCount: 2 },
  ],
  deptStrength: [
    { DeptName: "SPINNING",          OnRoll: 71, Present: 63, Absent: 8 },
    { DeptName: "AUTO CONER U1,U2",  OnRoll: 36, Present: 32, Absent: 4 },
    { DeptName: "PREPRATERY",        OnRoll: 21, Present: 23, Absent: -2 },
    { DeptName: "DOFFER",            OnRoll: 14, Present: 15, Absent: -1 },
    { DeptName: "MAINTENANCE",       OnRoll: 11, Present: 8,  Absent: 3 },
    { DeptName: "JUNIOR MAINTENANCE",OnRoll: 7,  Present: 7,  Absent: 0 },
    { DeptName: "PRODUCTION",        OnRoll: 7,  Present: 6,  Absent: 1 },
  ],
  weeklyStrength: [
    { DayLabel: "Mon", CurrentWeek: 205, PastWeek: 200 },
    { DayLabel: "Tue", CurrentWeek: 198, PastWeek: 195 },
    { DayLabel: "Wed", CurrentWeek: 202, PastWeek: 204 },
    { DayLabel: "Thu", CurrentWeek: 199, PastWeek: 201 },
    { DayLabel: "Fri", CurrentWeek: 203, PastWeek: 198 },
    { DayLabel: "Sat", CurrentWeek: 197, PastWeek: 193 },
  ],
  weeklyAbsent: [
    { DayLabel: "Mon", CurrentWeek: 11, PastWeek: 16 },
    { DayLabel: "Tue", CurrentWeek: 18, PastWeek: 21 },
    { DayLabel: "Wed", CurrentWeek: 14, PastWeek: 12 },
    { DayLabel: "Thu", CurrentWeek: 17, PastWeek: 15 },
    { DayLabel: "Fri", CurrentWeek: 13, PastWeek: 18 },
    { DayLabel: "Sat", CurrentWeek: 19, PastWeek: 23 },
  ],
  turnover: { MaleLeft: 70, FemaleLeft: 0, MaleJoined: 70, FemaleJoined: 2, TurnoverRate: "0%" },
  absentList: [
    { EmpId: "EMP001", EmpName: "Ramesh Kumar",  DeptName: "SPINNING" },
    { EmpId: "EMP045", EmpName: "Suresh Patel",  DeptName: "MAINTENANCE" },
    { EmpId: "EMP078", EmpName: "Anita Singh",   DeptName: "SPINNING" },
    { EmpId: "EMP112", EmpName: "Mohan Das",     DeptName: "AUTO CONER" },
  ],
  lateIn: [
    { EmpId: "EMP023", EmpName: "Vijay Sharma", DeptName: "PRODUCTION", PunchTime: "09:32 AM", LateBy: "32 min" },
    { EmpId: "EMP067", EmpName: "Priya Nair",   DeptName: "PACKING",    PunchTime: "09:45 AM", LateBy: "45 min" },
  ],
  punchList: [
    { EmpId: "EMP010", EmpName: "Arjun Reddy",  DeptName: "SPINNING",    InTime: "08:58 AM", OutTime: "05:02 PM", TotalHours: "8h 04m", Status: "Regular" },
    { EmpId: "EMP023", EmpName: "Vijay Sharma", DeptName: "PRODUCTION",  InTime: "09:32 AM", OutTime: "05:32 PM", TotalHours: "8h 00m", Status: "Late" },
    { EmpId: "EMP031", EmpName: "Kavya Menon",  DeptName: "PREPRATERY",  InTime: "08:55 AM", OutTime: "—",        TotalHours: "—",      Status: "Irregular" },
  ],
  otList: [
    { EmpId: "EMP015", EmpName: "Ravi Teja",       DeptName: "SPINNING", OTHours: "2h 30m" },
    { EmpId: "EMP088", EmpName: "Deepa Krishnan",  DeptName: "DOFFER",   OTHours: "1h 45m" },
  ],
  employeeList: [
    { EmpId: "EMP001", EmpName: "Ramesh Kumar", DeptName: "SPINNING",    Designation: "Operator",   Status: "Active" },
    { EmpId: "EMP002", EmpName: "Suresh Patel", DeptName: "MAINTENANCE", Designation: "Technician", Status: "Active" },
  ],
  longAbsent: [
    { EmpId: "EMP055", EmpName: "Sundar Rajan", DeptName: "MAINTENANCE", LastPunchDate: "25 Aug 2026", DaysAbsent: 11 },
  ],
  geoPunch: [],
  assetsList: [
    { EmpId: "EMP010", EmpName: "Arjun Reddy", AssetName: "Safety Gloves", IssueDate: "01 Sep 2026" },
    { EmpId: "EMP031", EmpName: "Kavya Menon", AssetName: "ID Card",       IssueDate: "15 Aug 2026" },
  ],
};

const PIE_COLORS  = ["#e53935","#2e7d32","#f59e0b","#3b82f6","#455a64","#94a3b8","#a855f7","#14b8a6"];
const TOP4_COLORS = ["#e53935","#2e7d32","#1565c0","#455a64"];

const fmt = (d) => {
  if (!d) return "";
  const dt = new Date(d);
  return dt.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};
const fmtTime = (d) => {
  if (!d) return "";
  const dt = new Date(d);
  return dt.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
};

// ── Accordion ─────────────────────────────────────────────────
function Accordion({ title, children }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="accordion">
      <button className="accordion-trigger" onClick={() => setOpen(o => !o)}>
        <span>{title}</span>
        <ChevronDown size={16} className={`accordion-chevron ${open ? "open" : ""}`} />
      </button>
      <div className={`accordion-body ${open ? "open" : ""}`}>
        {children}
      </div>
    </div>
  );
}

// ── KPI Tile ──────────────────────────────────────────────────
function KpiTile({ label, value, Icon, color }) {
  return (
    <div className="kpi-tile" style={{ background: color }}>
      <Icon size={20} style={{ color: "rgba(255,255,255,0.7)" }} />
      <div>
        <div className="kpi-num">{value}</div>
        <div className="kpi-label">{label}</div>
      </div>
    </div>
  );
}

// ── Attend Card ───────────────────────────────────────────────
function AttendCard({ icon, iconBg, iconColor, label, value, sub }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 14, padding: "14px 18px",
      borderRight: "1px solid var(--border)",
    }}>
      <div style={{
        width: 44, height: 44, borderRadius: "var(--radius-sm)", flexShrink: 0,
        background: iconBg, color: iconColor,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: 22, fontWeight: 700, color: "var(--text)" }}>{value}</div>
        <div style={{ fontSize: 12, color: "var(--text2)" }}>{label}</div>
        {sub && <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 2 }}>{sub}</div>}
      </div>
    </div>
  );
}

// ── Status badge ──────────────────────────────────────────────
function StatusBadge({ v }) {
  if (v === undefined || v === null) return "—";
  const n = typeof v === "number" ? v : parseInt(v);
  if (isNaN(n)) {
    const cls = v === "Regular" ? "badge-green" : v === "Late" ? "badge-yellow" : "badge-red";
    return <span className={`badge ${cls}`}>{v}</span>;
  }
  const cls = n > 0 ? "badge-red" : n === 0 ? "badge-green" : "badge-green";
  return <span className={`badge ${cls}`}>{n}</span>;
}

export default function AttendanceDashboard() {
  const { user }        = useAuth();
  const { isMobile }    = useResponsive();
  const today           = new Date().toISOString().split("T")[0];
  const [date, setDate] = useState("2026-09-05");
  const [data, setData] = useState(DUMMY);
  const [loading, setLoading] = useState(false);

  // When SP details arrive, swap DUMMY fetch with real API calls:
  const loadData = useCallback(async (d) => {
    setLoading(true);
    try {
      // Phase 2: uncomment and replace with real SP endpoints
      // const [sum, deptAbs, deptStr, wkStr, wkAbs, tur] = await Promise.all([
      //   api.get(`/dashboard/summary?date=${d}`),
      //   api.get(`/dashboard/dept-absent?date=${d}`),
      //   api.get(`/dashboard/dept-strength?date=${d}`),
      //   api.get(`/dashboard/weekly-strength?date=${d}`),
      //   api.get(`/dashboard/weekly-absent?date=${d}`),
      //   api.get(`/dashboard/turnover?date=${d}`),
      // ]);
      // setData({
      //   summary: sum.data.data,
      //   deptAbsent: deptAbs.data.data,
      //   deptStrength: deptStr.data.data,
      //   weeklyStrength: wkStr.data.data,
      //   weeklyAbsent: wkAbs.data.data,
      //   turnover: tur.data.data,
      //   ...data,
      // });

      // Phase 1: use dummy
      setData(DUMMY);
    } catch (err) {
      console.error("Dashboard load error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(date); }, [date]);

  const { summary, deptAbsent, deptStrength, weeklyStrength, weeklyAbsent, turnover } = data;

  const presentPie = [
    { name: "Present", value: summary.PresentCount },
    { name: "Absent",  value: summary.AbsentCount },
  ];

  const top4 = [...deptStrength]
    .sort((a, b) => b.Present - a.Present)
    .slice(0, 4);

  const sectionLabel = `${fmt(date)} (${date})`;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* Date picker */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <input type="date" value={date} onChange={e => setDate(e.target.value)}
          style={{
            background: "var(--surface2)", border: "1px solid var(--border)",
            borderRadius: "var(--radius-xs)", padding: "7px 12px",
            color: "var(--text)", fontSize: 13,
          }} />
        <button className="btn btn-primary btn-sm" onClick={() => loadData(date)}
          style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <RefreshCw size={13} /> Submit
        </button>
        {loading && <span className="spinner" />}
      </div>

      {/* ─ Charts ─────────────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 16 }}>
        <div className="card">
          <div className="card-header card-header-red">Present Vs Absent on : {sectionLabel}</div>
          <div className="card-body" style={{ display: "flex", justifyContent: "center" }}>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={presentPie} cx="50%" cy="50%" innerRadius={60} outerRadius={90}
                  dataKey="value" paddingAngle={3}>
                  <Cell fill="#22c55e" />
                  <Cell fill="#e53935" />
                </Pie>
                <Tooltip formatter={(v, n) => [`${v} (${Math.round(v / (summary.PresentCount + summary.AbsentCount) * 100)}%)`, n]} />
                <Legend iconSize={10} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="card-header card-header-red">Departmentwise Absent on : {sectionLabel}</div>
          <div className="card-body" style={{ display: "flex", justifyContent: "center" }}>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={deptAbsent} cx="50%" cy="50%" outerRadius={90}
                  dataKey="AbsentCount" nameKey="DeptName" paddingAngle={2}>
                  {deptAbsent.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v, n) => [v, n]} />
                <Legend iconSize={10} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ─ Employee Data KPIs ─────────────────────────────────── */}
      <div className="card">
        <div className="card-header card-header-red">Employee Data</div>
        <div style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(6, 1fr)",
          gap: 12, padding: 16,
        }}>
          <KpiTile label="Branches"          value={summary.TotalBranches} Icon={Building2}   color="#1565c0" />
          <KpiTile label="Departments"        value={summary.TotalDepts}    Icon={Layers}       color="#2e7d32" />
          <KpiTile label="Employees"          value={summary.TotalEmployees}Icon={UsersRound}   color="#f57f17" />
          <KpiTile label="# Joined Last 30"   value={summary.JoinedLast30}  Icon={UserPlus}     color="#455a64" />
          <KpiTile label="# Left in Last 30"  value={summary.LeftLast30}    Icon={UserMinus}    color="#c62828" />
          <KpiTile label="Male / Female"      value={`${summary.MaleCount}/${summary.FemaleCount}`} Icon={Users} color="#00838f" />
        </div>
      </div>

      {/* ─ Attendance Data ────────────────────────────────────── */}
      <div className="card">
        <div className="card-header card-header-red">Attendance Data</div>
        <div style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "repeat(2,1fr)" : "repeat(4,1fr)",
        }}>
          <AttendCard
            icon={<CalendarCheck size={20} />}
            iconBg="var(--blue-dim)" iconColor="var(--blue)"
            label="Last Processing on"
            value={fmt(summary.LastProcessingDate)}
            sub={fmtTime(summary.LastProcessingDate)} />
          <AttendCard
            icon={<CheckCircle2 size={20} />}
            iconBg="var(--green-dim)" iconColor="var(--green)"
            label="Present" value={summary.PresentCount} />
          <AttendCard
            icon={<XCircle size={20} />}
            iconBg="var(--red-dim)" iconColor="var(--red)"
            label="Absent" value={summary.AbsentCount} />
          <AttendCard
            icon={<AlertTriangle size={20} />}
            iconBg="var(--yellow-dim)" iconColor="var(--yellow)"
            label="Irregular Punch" value={summary.IrregularPunch} />
        </div>
      </div>

      {/* ─ Accordion Reports ──────────────────────────────────── */}
      <div>
        <Accordion title={`Department wise Summary Report as on : ${sectionLabel}`}>
          <table className="data-table">
            <thead><tr>
              <th>Department</th><th>On Roll</th><th>Present</th><th>Absent</th><th>% Attendance</th>
            </tr></thead>
            <tbody>
              {deptStrength.map((r, i) => (
                <tr key={i}>
                  <td>{r.DeptName}</td>
                  <td>{r.OnRoll}</td>
                  <td>{r.Present}</td>
                  <td><StatusBadge v={r.Absent} /></td>
                  <td>{r.OnRoll ? `${((r.Present / r.OnRoll) * 100).toFixed(1)}%` : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Accordion>

        <Accordion title={`Absent Employees List as on : ${sectionLabel}`}>
          <table className="data-table">
            <thead><tr><th>Emp ID</th><th>Name</th><th>Department</th></tr></thead>
            <tbody>
              {data.absentList.map((r, i) => (
                <tr key={i}>
                  <td>{r.EmpId}</td><td>{r.EmpName}</td><td>{r.DeptName}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Accordion>

        <Accordion title={`Late In Employees List as on : ${sectionLabel}`}>
          <table className="data-table">
            <thead><tr><th>Emp ID</th><th>Name</th><th>Dept</th><th>Punch Time</th><th>Late By</th></tr></thead>
            <tbody>
              {data.lateIn.map((r, i) => (
                <tr key={i}>
                  <td>{r.EmpId}</td><td>{r.EmpName}</td><td>{r.DeptName}</td>
                  <td>{r.PunchTime}</td><td>{r.LateBy}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Accordion>

        <Accordion title={`Employees Punch List as on : ${sectionLabel}`}>
          <table className="data-table">
            <thead><tr><th>Emp ID</th><th>Name</th><th>Dept</th><th>In</th><th>Out</th><th>Hours</th><th>Status</th></tr></thead>
            <tbody>
              {data.punchList.map((r, i) => (
                <tr key={i}>
                  <td>{r.EmpId}</td><td>{r.EmpName}</td><td>{r.DeptName}</td>
                  <td>{r.InTime}</td><td>{r.OutTime}</td><td>{r.TotalHours}</td>
                  <td><StatusBadge v={r.Status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Accordion>

        <Accordion title={`Employee OT List as on : ${sectionLabel}`}>
          <table className="data-table">
            <thead><tr><th>Emp ID</th><th>Name</th><th>Department</th><th>OT Hours</th></tr></thead>
            <tbody>
              {data.otList.map((r, i) => (
                <tr key={i}>
                  <td>{r.EmpId}</td><td>{r.EmpName}</td><td>{r.DeptName}</td><td>{r.OTHours}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Accordion>

        <Accordion title="Employees Last 30 Punch Dates">
          <div style={{ padding: "14px 18px", color: "var(--text3)", fontSize: 13 }}>
            Select an employee to view their punch history.
          </div>
        </Accordion>

        <Accordion title="Employees Long Absent">
          <table className="data-table">
            <thead><tr><th>Emp ID</th><th>Name</th><th>Dept</th><th>Last Punch</th><th>Days Absent</th></tr></thead>
            <tbody>
              {data.longAbsent.map((r, i) => (
                <tr key={i}>
                  <td>{r.EmpId}</td><td>{r.EmpName}</td><td>{r.DeptName}</td>
                  <td>{r.LastPunchDate}</td><td><span className="badge badge-red">{r.DaysAbsent}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Accordion>

        <Accordion title="Geo Punch List">
          <div style={{ padding: "14px 18px", color: "var(--text3)", fontSize: 13 }}>
            {data.geoPunch.length ? null : "No geo-punch records for this date."}
          </div>
        </Accordion>

        <Accordion title="Employee List">
          <table className="data-table">
            <thead><tr><th>Emp ID</th><th>Name</th><th>Department</th><th>Designation</th><th>Status</th></tr></thead>
            <tbody>
              {data.employeeList.map((r, i) => (
                <tr key={i}>
                  <td>{r.EmpId}</td><td>{r.EmpName}</td><td>{r.DeptName}</td>
                  <td>{r.Designation}</td>
                  <td><span className="badge badge-green">{r.Status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Accordion>

        <Accordion title="Assets Issued List">
          <table className="data-table">
            <thead><tr><th>Emp ID</th><th>Name</th><th>Asset</th><th>Issue Date</th></tr></thead>
            <tbody>
              {data.assetsList.map((r, i) => (
                <tr key={i}>
                  <td>{r.EmpId}</td><td>{r.EmpName}</td><td>{r.AssetName}</td><td>{r.IssueDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Accordion>
      </div>

      {/* ─ Top 4 Dept Strength ────────────────────────────────── */}
      <div className="card">
        <div className="card-header card-header-red">Top 4 Department Strength</div>
        <div style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4,1fr)",
          gap: 14, padding: 16,
        }}>
          {top4.map((dept, i) => (
            <div key={i} style={{
              background: TOP4_COLORS[i], borderRadius: "var(--radius-sm)",
              padding: 16, display: "flex", alignItems: "center", gap: 12,
            }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,.8)", textTransform: "uppercase" }}>
                  {dept.DeptName}
                </div>
                <div style={{ fontSize: 22, fontWeight: 800, color: "#fff", marginTop: 2 }}>
                  {dept.Present}{" "}
                  <span style={{ fontSize: 14, opacity: .7 }}>({dept.OnRoll})</span>
                </div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,.7)", marginTop: 3 }}>
                  {dept.OnRoll ? `${((dept.Present / dept.OnRoll) * 100).toFixed(1)}% of OnRoll` : "—"}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─ Weekly Charts ──────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 16 }}>
        <div className="card">
          <div className="card-header card-header-red">Weekly Strength Analysis</div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={weeklyStrength} barCategoryGap="30%">
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="DayLabel" tick={{ fill: "var(--text3)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "var(--text3)", fontSize: 11 }} axisLine={false} tickLine={false} domain={["auto","auto"]} />
                <Tooltip contentStyle={{ background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 8 }} />
                <Legend iconSize={10} />
                <Bar dataKey="CurrentWeek" name="Current Week" fill="#3b82f6"   radius={[4,4,0,0]} />
                <Bar dataKey="PastWeek"    name="Past Week"    fill="#3b82f640" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="card-header card-header-red">Weekly Absent Analysis</div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={weeklyAbsent} barCategoryGap="30%">
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="DayLabel" tick={{ fill: "var(--text3)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "var(--text3)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 8 }} />
                <Legend iconSize={10} />
                <Bar dataKey="CurrentWeek" name="Current Week" fill="#e53935"   radius={[4,4,0,0]} />
                <Bar dataKey="PastWeek"    name="Past Week"    fill="#e5393540" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ─ Dept Table + Turnover ──────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "2fr 1fr", gap: 16 }}>
        <div className="card">
          <div className="card-header card-header-red">Department Wise Strength</div>
          <table className="data-table">
            <thead><tr><th>Department</th><th>On Roll</th><th>Present</th><th>Absent</th></tr></thead>
            <tbody>
              {deptStrength.map((r, i) => (
                <tr key={i}>
                  <td>{r.DeptName}</td>
                  <td>{r.OnRoll}</td>
                  <td>{r.Present}</td>
                  <td><StatusBadge v={r.Absent} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card">
          <div className="card-header card-header-red">Employee Turnover</div>
          <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              ["Female Employees Left",   turnover.FemaleLeft],
              ["Male Employees Left",     turnover.MaleLeft],
              ["Female Employees Joined", turnover.FemaleJoined],
              ["Male Employees Joined",   turnover.MaleJoined],
            ].map(([label, val]) => (
              <div key={label} style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                <span style={{ color: "var(--text2)" }}>{label}</span>
                <span style={{ fontWeight: 700, color: "var(--text)" }}>{val ?? 0}</span>
              </div>
            ))}
            <div style={{ marginTop: 12, textAlign: "center" }}>
              <div style={{ fontSize: 42, fontWeight: 800, color: "var(--primary)", lineHeight: 1 }}>
                {turnover.TurnoverRate ?? "0%"}
              </div>
              <div style={{ fontSize: 12, color: "var(--text3)", marginTop: 4 }}>Employee Turnover Rate</div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
