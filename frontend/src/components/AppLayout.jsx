import React, { useState, useEffect } from "react";
import { Outlet, NavLink, useNavigate, useLocation, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useResponsive } from "../hooks/useResponsive";
import {
  LayoutDashboard, Clock, ClipboardList, UserX, AlarmClock,
  MapPin, DollarSign, FileText, CheckCircle, UserPlus,
  TrendingUp, BarChart2, Users, LogOut, Menu, X, Sun, Moon,
  CalendarCheck2, AlertCircle,
} from "lucide-react";

const NAV = [
  {
    section: "Attendance",
    items: [
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
      { path: "/payroll",         label: "Payroll Dashboard", Icon: DollarSign },
      { path: "/payroll/reports", label: "Salary Reports",    Icon: FileText },
    ],
  },
  {
    section: "Approvals",
    items: [
      { path: "/approvals/md",              label: "MD Approvals",       Icon: CheckCircle },
      { path: "/approvals/casual-leave",    label: "Casual Leave",       Icon: CalendarCheck2 },
      { path: "/approvals/irregular-punch", label: "Irregular Punch",    Icon: AlertCircle },
      { path: "/approvals/overtime",        label: "Over Time",          Icon: Clock },
      { path: "/approvals/onboarding",      label: "New Onboarding",     Icon: UserPlus },
      { path: "/approvals/revisions",       label: "Salary Revisions",   Icon: TrendingUp },
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
  "/approvals/md":              "MD Approvals",
  "/approvals/casual-leave":   "Casual Leave",
  "/approvals/irregular-punch":"Irregular Punch",
  "/approvals/overtime":       "Over Time",
  "/approvals/onboarding":     "New Onboarding",
  "/approvals/revisions":      "Salary Revisions",
  "/reports":                 "Reports",
  "/employees":               "Employee Master",
};

export default function AppLayout() {
  const { user, logout }     = useAuth();
  const { isMobile }         = useResponsive();
  const navigate             = useNavigate();
  const location             = useLocation();
  const { tenant }           = useParams();
  const base                 = `/${tenant || "omtex"}`;
  const [drawerOpen, setDrawerOpen] = useState(false);

  // ── Theme toggle ────────────────────────────────────────────
  const [isDark, setIsDark] = useState(() => {
    try { return localStorage.getItem("ep-theme") === "dark"; } catch { return false; }
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", isDark ? "dark" : "light");
    try { localStorage.setItem("ep-theme", isDark ? "dark" : "light"); } catch {}
  }, [isDark]);

  const handleLogout = () => { logout(); navigate(`${base}/login`, { replace: true }); };
  const closeDrawer  = () => setDrawerOpen(false);

  // Strip tenant prefix to get the page key for labels
  const pagePath     = location.pathname.replace(base, "") || "/attendance";
  const currentLabel = PAGE_LABELS[pagePath] || PAGE_LABELS[location.pathname] || "";
  const initials     = (user?.userName || "U").slice(0, 2).toUpperCase();
  const companyName  = user?.isDemo
    ? "Demo Mode"
    : (user?.companyName || "OM Textiles");

  return (
    <div className="app-layout">

      {/* Mobile overlay backdrop */}
      {isMobile && drawerOpen && (
        <div className="sidebar-overlay open" onClick={closeDrawer} />
      )}

      {/* ── Sidebar ──────────────────────────────────────────── */}
      <aside className={`sidebar${isMobile ? (drawerOpen ? " mobile-open" : "") : ""}`}>

        {/* Logo row — close button on mobile */}
        <div className="sidebar-logo-row">
          <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
            <img src="/msn-logo.png" alt="MSN"
              style={{ height: 28, maxWidth: 34, flexShrink: 0, objectFit: "contain" }}
              onError={e => (e.target.style.display = "none")} />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: "var(--text)", lineHeight: 1.2, whiteSpace: "nowrap" }}>
                EasyPay
              </div>
              <div style={{ fontSize: 10, color: "var(--text3)", marginTop: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 120 }}>
                {companyName}
              </div>
            </div>
          </div>
          {isMobile && (
            <button className="sidebar-close-btn" onClick={closeDrawer}>
              <X size={18} />
            </button>
          )}
        </div>

        {/* Nav */}
        <nav className="sidebar-nav">
          <NavLink to={`${base}/attendance`} end
            className={({ isActive }) => `nav-item${isActive ? " active" : ""}`}
            onClick={closeDrawer}>
            <LayoutDashboard size={15} className="nav-icon" /> Dashboard
          </NavLink>

          {NAV.map(group => (
            <React.Fragment key={group.section}>
              <div className="sidebar-section">{group.section}</div>
              {group.items.map(({ path, label, Icon }) => (
                <NavLink key={path} to={`${base}${path}`}
                  className={({ isActive }) => `nav-item${isActive ? " active" : ""}`}
                  onClick={closeDrawer}>
                  <Icon size={15} className="nav-icon" /> {label}
                </NavLink>
              ))}
            </React.Fragment>
          ))}
        </nav>

        {/* User footer */}
        <div className="sidebar-footer">
          <div className="sidebar-user-card">
            <div className="sidebar-avatar">{initials}</div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div className="sidebar-user-name" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {user?.userName || "User"}
              </div>
              <div className="sidebar-user-role" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {user?.companyCode || ""}
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Main ─────────────────────────────────────────────── */}
      <div className="main-wrap">

        {/* Topbar */}
        <header className="topbar">
          {/* Hamburger — mobile only */}
          {isMobile && (
            <button className="topbar-hamburger" onClick={() => setDrawerOpen(s => !s)}>
              <Menu size={20} />
            </button>
          )}

          {/* Breadcrumb */}
          <div className="topbar-breadcrumb">
            <span className="topbar-brand">MSN EasyPay</span>
            {currentLabel && (
              <>
                <span className="topbar-sep">/</span>
                <span className="topbar-page">{currentLabel}</span>
              </>
            )}
          </div>

          {/* Company name — centered */}
          {!isMobile && companyName && (
            <div style={{
              position: "absolute", left: "50%", transform: "translateX(-50%)",
              fontSize: 14, fontWeight: 700, color: "var(--primary)",
              background: "var(--red-dim)", padding: "5px 16px",
              borderRadius: 20, letterSpacing: "0.02em", whiteSpace: "nowrap",
              pointerEvents: "none",
            }}>
              {companyName}
            </div>
          )}

          {/* Right actions */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
            {/* Theme toggle */}
            <button
              className="icon-btn"
              onClick={() => setIsDark(d => !d)}
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            {/* Sign out */}
            <button className="icon-btn signout-btn" onClick={handleLogout} title="Sign Out">
              <LogOut size={16} />
              {!isMobile && <span style={{ fontSize: 12, fontWeight: 600 }}>Sign Out</span>}
            </button>
          </div>
        </header>

        <main className="page-content"><Outlet /></main>
      </div>
    </div>
  );
}
