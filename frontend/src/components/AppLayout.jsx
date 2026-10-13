import React, { useState } from "react";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useResponsive } from "../hooks/useResponsive";
import {
  LayoutDashboard, Clock, ClipboardList, UserX, AlarmClock,
  MapPin, DollarSign, FileText, CheckCircle, UserPlus,
  TrendingUp, BarChart2, Users, Settings, LogOut, Menu, X,
} from "lucide-react";

const NAV = [
  {
    section: "Attendance",
    items: [
      { path: "/attendance", label: "Attendance Dashboard", Icon: LayoutDashboard },
      { path: "/attendance/punch-report",  label: "Punch Report",      Icon: ClipboardList },
      { path: "/attendance/absent",        label: "Absent Employees",  Icon: UserX },
      { path: "/attendance/late-in",       label: "Late In Report",    Icon: AlarmClock },
      { path: "/attendance/geo-punch",     label: "Geo Punch",         Icon: MapPin },
      { path: "/attendance/ot",            label: "OT Report",         Icon: Clock },
    ],
  },
  {
    section: "Payroll",
    items: [
      { path: "/payroll", label: "Payroll Dashboard", Icon: DollarSign },
      { path: "/payroll/reports", label: "Salary Reports", Icon: FileText },
    ],
  },
  {
    section: "Approvals",
    items: [
      { path: "/approvals/md",         label: "MD Approvals",    Icon: CheckCircle },
      { path: "/approvals/onboarding", label: "New Onboarding",  Icon: UserPlus },
      { path: "/approvals/revisions",  label: "Salary Revisions",Icon: TrendingUp },
    ],
  },
  {
    section: "Other",
    items: [
      { path: "/reports",   label: "Reports",         Icon: BarChart2 },
      { path: "/employees", label: "Employee Master", Icon: Users },
    ],
  },
];

const PAGE_LABELS = {
  "/attendance":              "Attendance Dashboard",
  "/attendance/punch-report": "Punch Report",
  "/attendance/absent":       "Absent Employees",
  "/attendance/late-in":      "Late In Report",
  "/attendance/geo-punch":    "Geo Punch",
  "/attendance/ot":           "OT Report",
  "/payroll":                 "Payroll Dashboard",
  "/payroll/reports":         "Salary Reports",
  "/approvals/md":            "MD Approvals",
  "/approvals/onboarding":    "New Onboarding",
  "/approvals/revisions":     "Salary Revisions",
  "/reports":                 "Reports",
  "/employees":               "Employee Master",
};

export default function AppLayout() {
  const { user, logout }   = useAuth();
  const { isMobile }       = useResponsive();
  const navigate           = useNavigate();
  const location           = useLocation();
  const [open, setOpen]    = useState(false);

  const handleLogout = () => { logout(); navigate("/login", { replace: true }); };
  const close = () => setOpen(false);

  const currentLabel = PAGE_LABELS[location.pathname] || "";
  const initials     = (user?.userName || "U").slice(0, 2).toUpperCase();

  return (
    <div className="app-layout">
      <div className={`sidebar-overlay ${open ? "open" : ""}`} onClick={close} />

      <aside className={`sidebar ${open ? "open" : ""}`}>
        {/* Logo */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "12px 14px", borderBottom: "1px solid var(--border)", flexShrink: 0,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <img src="/msn-logo.png" alt="MSN"
              style={{ height: 34, width: "auto", objectFit: "contain" }}
              onError={e => e.target.style.display = "none"} />
            <div>
              <div style={{ fontSize: 13, fontWeight: 800, color: "var(--text)", lineHeight: 1.2 }}>EasyPay</div>
              <div style={{ fontSize: 10, color: "var(--text3)", marginTop: 1 }}>{user?.companyName || "OM Textiles"}</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="sidebar-nav">
          <NavLink to="/attendance" end
            className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
            onClick={close}>
            <LayoutDashboard size={15} className="nav-icon" /> Dashboard
          </NavLink>

          {NAV.map(group => (
            <React.Fragment key={group.section}>
              <div className="sidebar-section">{group.section}</div>
              {group.items.filter(i => i.path !== "/attendance").map(({ path, label, Icon }) => (
                <NavLink key={path} to={path}
                  className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
                  onClick={close}>
                  <Icon size={15} className="nav-icon" /> {label}
                </NavLink>
              ))}
            </React.Fragment>
          ))}
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          <div className="sidebar-user-card">
            <div className="sidebar-avatar">{initials}</div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div className="sidebar-user-name">{user?.userName || "User"}</div>
              <div className="sidebar-user-role">{user?.companyCode || ""}</div>
            </div>
          </div>
        </div>
      </aside>

      <div className="main-wrap">
        {/* Topbar */}
        <header className="topbar">
          <button className="topbar-hamburger" onClick={() => setOpen(s => !s)}>
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div className="topbar-breadcrumb" style={{ minWidth: 0, flex: 1 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", whiteSpace: "nowrap" }}>MSN EasyPay</span>
            {currentLabel && (
              <>
                <span className="topbar-sep" style={{ margin: "0 6px", color: "var(--text3)" }}>/</span>
                <span style={{ fontSize: 12, color: "var(--text2)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {currentLabel}
                </span>
              </>
            )}
          </div>
          <button onClick={handleLogout} title="Sign Out" style={{
            display: "flex", alignItems: "center", gap: 5,
            padding: "5px 10px", background: "none",
            border: "1px solid var(--border)", borderRadius: "var(--radius-xs)",
            cursor: "pointer", color: "var(--text3)", fontSize: 12, flexShrink: 0,
            transition: "all .15s",
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--red)"; e.currentTarget.style.color = "var(--red)"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text3)"; }}>
            <LogOut size={14} />
            {!isMobile && <span>Sign Out</span>}
          </button>
        </header>

        <main className="page-content"><Outlet /></main>
      </div>
    </div>
  );
}
