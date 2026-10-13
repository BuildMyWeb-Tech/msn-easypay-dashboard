import React from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import AppLayout              from "./components/AppLayout";
import Login                  from "./pages/Login";
import AttendanceDashboard    from "./pages/attendance/AttendanceDashboard";
import PayrollDashboard       from "./pages/payroll/PayrollDashboard";

function ComingSoon({ title }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 300, gap: 12 }}>
      <div style={{ fontSize: 48 }}>🚧</div>
      <h2 style={{ fontWeight: 700, fontSize: 20 }}>{title}</h2>
      <p style={{ color: "var(--text3)", fontSize: 14 }}>Coming soon</p>
    </div>
  );
}

function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
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
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />;
  return children;
}

function PublicRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return null;
  if (isAuthenticated) return <Navigate to="/attendance" replace />;
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/" element={
        <ProtectedRoute>
          <AppLayout />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="/attendance" replace />} />
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
        <Route path="*"                       element={<Navigate to="/attendance" replace />} />
      </Route>
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
