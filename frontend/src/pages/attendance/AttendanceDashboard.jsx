import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
} from "recharts";
import { useAuth } from "../../context/AuthContext";
import { useResponsive } from "../../hooks/useResponsive";
import api from "../../services/api";
import {
  Building2, Layers, Users, UserPlus, UserMinus, UsersRound,
  CalendarCheck, CheckCircle2, XCircle, AlertTriangle, ChevronDown,
  RefreshCw, Eye,
} from "lucide-react";

// ── Dummy fallback (demo mode / API down) ─────────────────────
const DUMMY_MAIN = {
  donut:   [{ Status: "Present", emp: 199 }, { Status: "Absent", emp: 17 }],
  pie:     [
    { empcount: 8, department: "SPINNING" },
    { empcount: 3, department: "MAINTENANCE" },
    { empcount: 2, department: "PACKING" },
    { empcount: 1, department: "PRODUCTION" },
    { empcount: 1, department: "SWEEPER" },
    { empcount: 2, department: "DOFFER" },
  ],
  empData:  { Branches: 3, Dept: 33, TotalEmployees: 211, NewEmp: 19, LeftEmp: 6, MaleEmp: 191, FemaleEmp: 20 },
  attend:   { Dt: "12 Oct 2026 09:11AM", Pre: 199, Ab: 17, Ir: 3 },
  turnover: { FNew: 2, MNew: 70, FLeft: 0, MLeft: 70 },
};

// Task 22 — weekly + dept summary will use live SPs; dummy until tomorrow's push
const DUMMY_WEEKLY = {
  strength: [
    { DayName: "Mon", CurrentWeek: 205, PastWeek: 200 },
    { DayName: "Tue", CurrentWeek: 198, PastWeek: 195 },
    { DayName: "Wed", CurrentWeek: 202, PastWeek: 204 },
    { DayName: "Thu", CurrentWeek: 199, PastWeek: 201 },
    { DayName: "Fri", CurrentWeek: 203, PastWeek: 198 },
    { DayName: "Sat", CurrentWeek: 197, PastWeek: 193 },
  ],
  absent: [
    { DayName: "Mon", CurrentWeek: 11, PastWeek: 16 },
    { DayName: "Tue", CurrentWeek: 18, PastWeek: 21 },
    { DayName: "Wed", CurrentWeek: 14, PastWeek: 12 },
    { DayName: "Thu", CurrentWeek: 17, PastWeek: 15 },
    { DayName: "Fri", CurrentWeek: 13, PastWeek: 18 },
    { DayName: "Sat", CurrentWeek: 19, PastWeek: 23 },
  ],
};

const DUMMY_DEPT_SUMMARY = [
  { Sl: 1, Department: "ACCOUNTS",         OnRoll: 1,  Present: 1,  Absent: 0, PresentPct: 100.00 },
  { Sl: 2, Department: "AUTO CONER U1,U2", OnRoll: 36, Present: 31, Absent: 5, PresentPct: 86.11  },
  { Sl: 3, Department: "CANTEEN",          OnRoll: 2,  Present: 2,  Absent: 0, PresentPct: 100.00 },
  { Sl: 4, Department: "DOFFER",           OnRoll: 14, Present: 11, Absent: 3, PresentPct: 78.57  },
  { Sl: 5, Department: "SPINNING",         OnRoll: 71, Present: 63, Absent: 8, PresentPct: 88.73  },
];

const PIE_COLORS = ["#e53935","#2e7d32","#f59e0b","#3b82f6","#455a64","#94a3b8","#a855f7","#14b8a6"];

const fmtDate = (d) => {
  if (!d) return "";
  const dt = new Date(d);
  if (isNaN(dt)) return String(d);
  return dt.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

// ── Accordion ─────────────────────────────────────────────────
function Accordion({ title, children, onOpen }) {
  const [open, setOpen] = useState(false);
  const toggle = () => {
    const next = !open;
    setOpen(next);
    if (next && onOpen) onOpen();
  };
  return (
    <div className="accordion">
      <button className="accordion-trigger" onClick={toggle}>
        <span>{title}</span>
        <ChevronDown size={16} className={`accordion-chevron ${open ? "open" : ""}`} />
      </button>
      <div className={`accordion-body ${open ? "open" : ""}`}>
        {children}
      </div>
    </div>
  );
}

// ── Generic lazy-load accordion report ────────────────────────
function ReportAccordion({ title, endpoint, columns }) {
  const [rows, setRows]       = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const loaded = useRef(false);

  const load = useCallback(async () => {
    if (loaded.current) return;
    loaded.current = true;
    setLoading(true);
    setError("");
    try {
      const res = await api.get(endpoint);
      setRows(res.data?.data || []);
    } catch {
      setError("Failed to load data.");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  return (
    <Accordion title={title} onOpen={load}>
      <div style={{ padding: "0 0 4px" }}>
        {loading && (
          <div style={{ padding: "16px", display: "flex", alignItems: "center", gap: 8, color: "var(--text3)", fontSize: 13 }}>
            <span className="spinner" style={{ width: 14, height: 14 }} /> Loading…
          </div>
        )}
        {error && (
          <div style={{ padding: "12px 16px", fontSize: 13, color: "var(--red)" }}>{error}</div>
        )}
        {rows !== null && !loading && !error && (
          rows.length === 0
            ? <div style={{ padding: "12px 16px", fontSize: 13, color: "var(--text3)" }}>No records found.</div>
            : (
              <div style={{ overflowX: "auto" }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Sl No</th>
                      {columns.map(c => <th key={c.key}>{c.label}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, i) => (
                      <tr key={i}>
                        <td>{i + 1}</td>
                        {columns.map(c => (
                          <td key={c.key} style={c.style ? c.style(row[c.key]) : undefined}>
                            {row[c.key] ?? "—"}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
        )}
      </div>
    </Accordion>
  );
}

// ── KPI Tile ──────────────────────────────────────────────────
function KpiTile({ label, value, Icon, color }) {
  return (
    <div className="kpi-tile" style={{ background: color }}>
      <Icon size={20} style={{ color: "rgba(255,255,255,0.7)" }} />
      <div>
        <div className="kpi-num">{value ?? "—"}</div>
        <div className="kpi-label">{label}</div>
      </div>
    </div>
  );
}

// ── Attend Card ───────────────────────────────────────────────
function AttendCard({ icon, iconBg, iconColor, label, value, sub, valueFontSize }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 12, padding: "12px 14px",
      borderBottom: "1px solid var(--border)",
    }}>
      <div style={{
        width: 44, height: 44, borderRadius: "var(--radius-sm)", flexShrink: 0,
        background: iconBg, color: iconColor,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: valueFontSize ?? 22, fontWeight: 700, color: "var(--text)" }}>{value ?? "—"}</div>
        <div style={{ fontSize: 12, color: "var(--text2)" }}>{label}</div>
        {sub && <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 2 }}>{sub}</div>}
      </div>
    </div>
  );
}

// ── Turnover row ──────────────────────────────────────────────
function TurnoverRow({ label, value }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
      <span style={{ color: "var(--text2)" }}>{label}</span>
      <span style={{ fontWeight: 700, color: "var(--text)" }}>{value ?? 0}</span>
    </div>
  );
}

export default function AttendanceDashboard() {
  const { user }     = useAuth();
  const { isMobile } = useResponsive();
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);

  // ── State ────────────────────────────────────────────────────
  const [main, setMain]       = useState(DUMMY_MAIN);
  const [weekly, setWeekly]   = useState(DUMMY_WEEKLY);
  const [deptSum, setDeptSum] = useState(DUMMY_DEPT_SUMMARY);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  // ── Load main data (sections 1-5) ───────────────────────────
  const loadMain = useCallback(async (d) => {
    if (user?.isDemo) { setMain(DUMMY_MAIN); return; }
    setLoading(true);
    setError("");
    try {
      const res = await api.get(`/dashboard/main-data?date=${d}`);
      setMain(res.data.data);
    } catch (err) {
      setError("Failed to load dashboard data. Showing demo data.");
      setMain(DUMMY_MAIN);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // ── Sections 6-8: weekly charts + dept summary ──────────────
  // PRW_GET_WEEKLYDEPTSTRENGTH + PRW_GetDeptSummary
  const loadSecondary = useCallback(async (d) => {
    if (user?.isDemo) return;
    try {
      const [wRes, dRes] = await Promise.all([
        api.get("/dashboard/weekly-data"),
        api.get(`/dashboard/dept-summary?date=${d}`),
      ]);
      if (wRes.data?.data) setWeekly(wRes.data.data);
      if (dRes.data?.data?.length) setDeptSum(dRes.data.data);
    } catch {
      // silently keep dummy on API failure
    }
  }, [user]);

  useEffect(() => {
    loadMain(date);
    loadSecondary(date);
  }, [date]);

  // ── Derived display values ───────────────────────────────────
  const { donut, pie, empData, attend, turnover } = main;

  // Donut chart: [{name, value}]
  const donutData = donut.map(r => ({ name: r.Status, value: r.emp || r.Emp || r.EmpCount || 0 }));
  const totalDonut = donutData.reduce((s, r) => s + r.value, 0);

  // Pie chart uses dept-wise data
  const pieData = pie.map(r => ({ name: r.department || r.Department, value: r.empcount || r.EmpCount || 0 }));

  // Employee Data KPIs
  const emp = empData;

  // Attendance Data
  const att = attend;

  // Turnover — compute rate
  const totalLeft   = (turnover.MLeft || 0) + (turnover.FLeft || 0);
  const totalStrength = (emp.TotalEmployees || 1);
  const turnoverRate = totalStrength > 0 ? ((totalLeft / totalStrength) * 100).toFixed(1) + "%" : "0%";

  const sectionLabel = fmtDate(date);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* Date picker */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        <input type="date" value={date} onChange={e => setDate(e.target.value)}
          style={{
            background: "var(--surface)", border: "1px solid var(--border)",
            borderRadius: "var(--radius-xs)", padding: "8px 12px",
            color: "var(--text)", fontSize: 13, minHeight: 40,
            touchAction: "manipulation",
          }} />
        <button className="btn btn-primary btn-sm"
          onClick={() => { loadMain(date); loadSecondary(date); }}
          style={{ display: "flex", alignItems: "center", gap: 5, minHeight: 40 }}>
          <RefreshCw size={13} /> Submit
        </button>
        {loading && <span className="spinner" />}
        {error && <span style={{ fontSize: 12, color: "var(--red)" }}>{error}</span>}
        {user?.isDemo && (
          <span style={{
            fontSize: 11, color: "var(--yellow)",
            background: "var(--yellow-dim)", padding: "4px 10px",
            borderRadius: "var(--radius-xs)", whiteSpace: "nowrap",
          }}>
            Demo Mode
          </span>
        )}
        {/* Last processed — right-justified, highlighted */}
        {att.Dt && !loading && (
          <span style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 5,
            fontSize: 13, fontWeight: 700, color: "var(--primary)", whiteSpace: "nowrap" }}>
            <CalendarCheck size={14} style={{ color: "var(--primary)", flexShrink: 0 }} />
            Last processed: <strong style={{ color: "var(--primary)" }}>{att.Dt}</strong>
          </span>
        )}
      </div>

      {/* ─ 1 & 2: Donut + Dept Pie ───────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 16 }}>
        <div className="card">
          <div className="card-header card-header-red">Present Vs Absent on : {sectionLabel}</div>
          <div className="card-body" style={{ display: "flex", justifyContent: "center" }}>
            <ResponsiveContainer width="100%" height={isMobile ? 180 : 220}>
              <PieChart>
                <Pie data={donutData} cx="50%" cy="50%"
                  innerRadius={isMobile ? 48 : 60} outerRadius={isMobile ? 72 : 90}
                  dataKey="value" paddingAngle={3}>
                  <Cell fill="#22c55e" />
                  <Cell fill="#e53935" />
                </Pie>
                <Tooltip formatter={(v, n) => [`${v} (${totalDonut > 0 ? Math.round(v / totalDonut * 100) : 0}%)`, n]} />
                <Legend iconSize={10} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="card-header card-header-red">Departmentwise on : {sectionLabel}</div>
          <div className="card-body" style={{ display: "flex", justifyContent: "center" }}>
            <ResponsiveContainer width="100%" height={isMobile ? 180 : 220}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%"
                  outerRadius={isMobile ? 68 : 90}
                  dataKey="value" nameKey="name" paddingAngle={2}>
                  {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v, n) => [v, n]} />
                <Legend iconSize={10} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ─ 3: Employee Data KPIs ─────────────────────────────── */}
      <div className="card">
        <div className="card-header card-header-red">Employee Data</div>
        <div style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(6, 1fr)",
          gap: 12, padding: 16,
        }}>
          <KpiTile label="Branches"         value={emp.Branches}        Icon={Building2}  color="#1565c0" />
          <KpiTile label="Departments"       value={emp.Dept}            Icon={Layers}     color="#2e7d32" />
          <KpiTile label="Employees"         value={emp.TotalEmployees}  Icon={UsersRound} color="#f57f17" />
          <KpiTile label="# Joined Last 30"  value={emp.NewEmp}          Icon={UserPlus}   color="#455a64" />
          <KpiTile label="# Left in Last 30" value={emp.LeftEmp}         Icon={UserMinus}  color="#c62828" />
          <KpiTile label="Male / Female"     value={`${emp.MaleEmp ?? 0}/${emp.FemaleEmp ?? 0}`} Icon={Users} color="#00838f" />
        </div>
      </div>

      {/* ─ 4: Attendance Data cards ──────────────────────────── */}
      <div className="card">
        <div className="card-header card-header-red">Attendance Data</div>
        <div style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(3,1fr)",
        }}>
          <AttendCard
            icon={<CheckCircle2 size={20} />}
            iconBg="var(--green-dim)" iconColor="var(--green)"
            label="Present" value={att.Pre} />
          <AttendCard
            icon={<XCircle size={20} />}
            iconBg="var(--red-dim)" iconColor="var(--red)"
            label="Absent" value={att.Ab} />
          <AttendCard
            icon={<AlertTriangle size={20} />}
            iconBg="var(--yellow-dim)" iconColor="var(--yellow)"
            label="Irregular Punch" value={att.Ir} />
        </div>
      </div>

      {/* ─ 6 & 7: Weekly Charts ──────────────────────────────── */}
      {/* Task 22: weekly.strength and weekly.absent will be live data after tomorrow */}
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 16 }}>
        <div className="card">
          <div className="card-header card-header-red">Weekly Strength Analysis</div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={isMobile ? 170 : 200}>
              <LineChart data={weekly.strength}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="DayName" tick={{ fill: "var(--text3)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "var(--text3)", fontSize: 11 }} axisLine={false} tickLine={false} domain={["auto","auto"]} />
                <Tooltip contentStyle={{ background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 8 }} />
                <Legend iconSize={10} />
                <Line type="monotone" dataKey="CurrentWeek" name="Current Week" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4, fill: "#3b82f6" }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="PastWeek"    name="Past Week"    stroke="#94a3b8" strokeWidth={2} dot={{ r: 4, fill: "#94a3b8" }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="card-header card-header-red">Weekly Absent Analysis</div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={isMobile ? 170 : 200}>
              <BarChart data={weekly.absent} barCategoryGap="30%">
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="DayName" tick={{ fill: "var(--text3)", fontSize: 11 }} axisLine={false} tickLine={false} />
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

      {/* ─ 8 & 5: Dept Summary Table + Employee Turnover ─────── */}
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "2fr 1fr", gap: 16 }}>

        {/* 8: Department Wise Strength (Task 22 — live SP wired tomorrow) */}
        <div className="card">
          <div className="card-header card-header-red">
            Department wise Summary Report as on : {sectionLabel}
          </div>
          <div style={{ overflowX: "auto" }}>
            <table className="data-table">
              <thead><tr>
                <th>Sl No</th><th>Department</th><th>ON Roll</th>
                <th>Present</th><th>Absent</th><th>Present %</th><th>Details</th>
              </tr></thead>
              <tbody>
                {deptSum.map((r, i) => (
                  <tr key={i}>
                    <td>{r.Sl ?? i + 1}</td>
                    <td>{r.Department}</td>
                    <td>{r.OnRoll}</td>
                    <td style={{ color: "var(--green)", fontWeight: 600 }}>{r.Present}</td>
                    <td style={{ color: r.Absent > 0 ? "var(--red)" : "var(--text2)" }}>{r.Absent}</td>
                    <td>{typeof r.PresentPct === "number" ? r.PresentPct.toFixed(2) + "%" : r.PresentPct}</td>
                    <td>
                      <button className="btn btn-ghost btn-sm"
                        style={{ padding: "3px 10px", color: "var(--blue)", fontSize: 12, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 4, border: "1px solid var(--blue)", borderRadius: "var(--radius-xs)" }}
                        title={`View ${r.Department} details`}>
                        <Eye size={12} /> View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 5: Employee Turnover */}
        <div className="card">
          <div className="card-header card-header-red">Employee Turnover</div>
          <div className="card-body">
            <TurnoverRow label="Female Employees Left"   value={turnover.FLeft} />
            <TurnoverRow label="Male Employees Left"     value={turnover.MLeft} />
            <TurnoverRow label="Female Employees Joined" value={turnover.FNew} />
            <TurnoverRow label="Male Employees Joined"   value={turnover.MNew} />
            <div style={{ marginTop: 16, textAlign: "center" }}>
              <div style={{ fontSize: 42, fontWeight: 800, color: "var(--primary)", lineHeight: 1 }}>
                {turnoverRate}
              </div>
              <div style={{ fontSize: 12, color: "var(--text3)", marginTop: 4 }}>Employee Turnover Rate</div>
            </div>
          </div>
        </div>
      </div>

      {/* ─ Accordion Reports ──────────────────────────────────── */}
      <div>
        <ReportAccordion
          key={`absent-${date}`}
          title={`Absent Employees List as on : ${sectionLabel}`}
          endpoint={`/dashboard/absent-list?date=${date}`}
          columns={[
            { key: "EmpCode",      label: "Emp Code" },
            { key: "EmpName",      label: "Employee Name" },
            { key: "Department",   label: "Department" },
          ]}
        />

        <ReportAccordion
          key={`latein-${date}`}
          title={`Late In Employees List as on : ${sectionLabel}`}
          endpoint={`/dashboard/late-in?date=${date}`}
          columns={[
            { key: "EmpCode",    label: "Emp Code" },
            { key: "EmpName",    label: "Employee Name" },
            { key: "Department", label: "Department" },
            { key: "TimeIn",     label: "Time In" },
            { key: "LateBy",     label: "Late By" },
          ]}
        />

        <ReportAccordion
          key={`punch-${date}`}
          title={`Employees Punch List as on : ${sectionLabel}`}
          endpoint={`/dashboard/punch-list?date=${date}`}
          columns={[
            { key: "EmpCode",    label: "Emp Code" },
            { key: "EmpName",    label: "Employee Name" },
            { key: "Department", label: "Department" },
            { key: "TimeIn",     label: "Time In" },
            { key: "LunchOut",   label: "Lunch Out" },
            { key: "LunchIn",    label: "Lunch In" },
            { key: "TimeOut",    label: "Time Out" },
          ]}
        />

        <ReportAccordion
          key={`longabsent-${date}`}
          title="Employees Long Absent"
          endpoint={`/dashboard/long-absent?date=${date}`}
          columns={[
            { key: "EmpCode",    label: "Emp Code" },
            { key: "EmpName",    label: "Employee Name" },
            { key: "Department", label: "Department" },
            { key: "LastPunch",  label: "Last Punch" },
            { key: "AbsentDays", label: "Absent Days", style: (v) => v > 0 ? { color: "var(--red)", fontWeight: 600 } : undefined },
          ]}
        />

        <ReportAccordion
          key={`ot-${date}`}
          title={`Employee OT List as on : ${sectionLabel}`}
          endpoint={`/dashboard/ot-list?date=${date}`}
          columns={[
            { key: "EmpCode",    label: "Emp Code" },
            { key: "EmpName",    label: "Employee Name" },
            { key: "Department", label: "Department" },
            { key: "OT",         label: "OT" },
            { key: "ApprovedOT", label: "Approved OT" },
          ]}
        />
      </div>

    </div>
  );
}
