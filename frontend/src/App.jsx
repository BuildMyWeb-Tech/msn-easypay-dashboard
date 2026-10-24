import React from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation, useParams } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import AppLayout              from "./components/AppLayout";
import Login                  from "./pages/Login";
import AttendanceDashboard    from "./pages/attendance/AttendanceDashboard";
import PayrollDashboard       from "./pages/payroll/PayrollDashboard";
import InstallPrompt          from "./components/InstallPrompt";
import TENANTS                from "./config/tenants";

function ComingSoon({ title }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 300, gap: 12 }}>
      <div style={{ fontSize: 48 }}>🚧</div>
      <h2 style={{ fontWeight: 700, fontSize: 20 }}>{title}</h2>
      <p style={{ color: "var(--text3)", fontSize: 14 }}>Coming soon</p>
    </div>
  );
}

// Validates :tenant slug — unknown slugs redirect to /omtex
function TenantGuard({ children }) {
  const { tenant } = useParams();
  const location   = useLocation();
  const isValid    = tenant && TENANTS[tenant.toLowerCase()];
  if (!isValid) {
    const rest = location.pathname.replace(`/${tenant}`, "") || "/login";
    return <Navigate to={`/omtex${rest}`} replace />;
  }
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

function AppRoutes() {
  return (
    <Routes>
      {/* Root → default tenant login */}
      <Route path="/" element={<Navigate to="/omtex/login" replace />} />

      {/* Per-tenant routes */}
      <Route path="/:tenant/*" element={
        <TenantGuard>
          <TenantInnerRoutes />
        </TenantGuard>
      } />

      <Route path="*" element={<Navigate to="/omtex/login" replace />} />
    </Routes>
  );
}

function TenantInnerRoutes() {
  const { tenant } = useParams();
  return (
    <Routes>
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
        <Route path="approvals/md"            element={<ComingSoon title="MD Approvals" />} />
        <Route path="approvals/onboarding"    element={<ComingSoon title="New Onboarding" />} />
        <Route path="approvals/revisions"     element={<ComingSoon title="Salary Revisions" />} />
        <Route path="reports"                 element={<ComingSoon title="Reports" />} />
        <Route path="employees"               element={<ComingSoon title="Employee Master" />} />
        <Route path="*"                       element={<Navigate to={`/${tenant}/attendance`} replace />} />
      </Route>
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
