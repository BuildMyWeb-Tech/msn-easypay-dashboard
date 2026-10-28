import React from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation, useParams } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import AppLayout              from "./components/AppLayout";
import Login                  from "./pages/Login";
import AttendanceDashboard      from "./pages/attendance/AttendanceDashboard";
import PayrollDashboard         from "./pages/payroll/PayrollDashboard";
import OTApproval               from "./pages/approvals/OTApproval";
import IrregularPunchApproval   from "./pages/approvals/IrregularPunchApproval";
import InstallPrompt          from "./components/InstallPrompt";
import AdminCompanies         from "./pages/admin/AdminCompanies";
import CompanySearch          from "./pages/CompanySearch";
import { useTenant }          from "./hooks/useTenant";

function ComingSoon({ title }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 300, gap: 12 }}>
      <div style={{ fontSize: 48 }}>🚧</div>
      <h2 style={{ fontWeight: 700, fontSize: 20 }}>{title}</h2>
      <p style={{ color: "var(--text3)", fontSize: 14 }}>Coming soon</p>
    </div>
  );
}

// Resolves :tenant from API — shows spinner while loading, error if not found
function TenantGuard({ children }) {
  const { tenant }           = useParams();
  const { loading, notFound } = useTenant();

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)" }}>
      <div style={{ textAlign: "center" }}>
        <div className="spinner" style={{ margin: "0 auto 16px" }} />
        <div style={{ fontSize: 13, color: "var(--text3)" }}>Loading…</div>
      </div>
    </div>
  );

  if (notFound) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)" }}>
      <div style={{ textAlign: "center", maxWidth: 360 }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🏢</div>
        <h2 style={{ fontWeight: 700, fontSize: 20, marginBottom: 8 }}>Company Not Found</h2>
        <p style={{ color: "var(--text3)", fontSize: 14 }}>
          <strong style={{ color: "var(--text)" }}>/{tenant}</strong> is not configured.<br />
          Contact your administrator.
        </p>
      </div>
    </div>
  );

  return children;
}

function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  const { tenant } = useParams();
  const location   = useLocation();
  if (isLoading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)" }}>
        <div style={{ textAlign: "center" }}>
          <div className="spinner" style={{ margin: "0 auto 16px" }} />
          <div style={{ fontSize: 13, color: "var(--text3)" }}>Loading...</div>
        </div>
      </div>
    );
  }
  if (!isAuthenticated) return <Navigate to={`/${tenant}/login`} state={{ from: location }} replace />;
  return children;
}

function PublicRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  const { tenant } = useParams();
  if (isLoading) return null;
  if (isAuthenticated) return <Navigate to={`/${tenant}/attendance`} replace />;
  return children;
}

// Handles bare /:tenant — sends to login if not authed, attendance if authed
function TenantRoot() {
  const { isAuthenticated, isLoading } = useAuth();
  const { tenant } = useParams();
  if (isLoading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)" }}>
      <div className="spinner" />
    </div>
  );
  return <Navigate to={isAuthenticated ? `/${tenant}/attendance` : `/${tenant}/login`} replace />;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Root → company search (no dropdown, user types slug) */}
      <Route path="/" element={<CompanySearch />} />

      {/* Per-tenant routes */}
      <Route path="/:tenant/*" element={
        <TenantGuard>
          <TenantInnerRoutes />
        </TenantGuard>
      } />

      {/* Unknown path → company search */}
      <Route path="*" element={<CompanySearch />} />
    </Routes>
  );
}

function TenantInnerRoutes() {
  const { tenant } = useParams();
  return (
    <Routes>
      {/* /:tenant → redirect to login if not authenticated, else to attendance */}
      <Route index element={<TenantRoot />} />
      <Route path="login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route index element={<Navigate to={`/${tenant}/attendance`} replace />} />
        <Route path="attendance"              element={<AttendanceDashboard />} />
        <Route path="attendance/punch-report" element={<ComingSoon title="Punch Report" />} />
        <Route path="attendance/absent"       element={<ComingSoon title="Absent Employees" />} />
        <Route path="attendance/late-in"      element={<ComingSoon title="Late In Report" />} />
        <Route path="attendance/geo-punch"    element={<ComingSoon title="Geo Punch" />} />
        <Route path="attendance/ot"           element={<ComingSoon title="OT Report" />} />
        <Route path="payroll"                 element={<PayrollDashboard />} />
        <Route path="payroll/reports"         element={<ComingSoon title="Salary Reports" />} />
        <Route path="approvals/md"              element={<ComingSoon title="MD Approvals" />} />
        <Route path="approvals/casual-leave"  element={<ComingSoon title="Casual Leave" />} />
        <Route path="approvals/irregular-punch" element={<IrregularPunchApproval />} />
        <Route path="approvals/overtime"      element={<OTApproval />} />
        <Route path="approvals/onboarding"    element={<ComingSoon title="New Onboarding" />} />
        <Route path="approvals/revisions"     element={<ComingSoon title="Salary Revisions" />} />
        <Route path="reports"                 element={<ComingSoon title="Reports" />} />
        <Route path="employees"               element={<ComingSoon title="Employee Master" />} />
        <Route path="*"                       element={<Navigate to={`/${tenant}/attendance`} replace />} />
      </Route>
      {/* Admin — no auth guard, protected by ADMIN_KEY */}
      <Route path="admin" element={<AdminCompanies />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <InstallPrompt />
      </AuthProvider>
    </BrowserRouter>
  );
}
