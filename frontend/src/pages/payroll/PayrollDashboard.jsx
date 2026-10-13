import React from "react";

export default function PayrollDashboard() {
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", minHeight: 300, gap: 12,
    }}>
      <div style={{ fontSize: 48 }}>💰</div>
      <h2 style={{ fontWeight: 700, fontSize: 20 }}>Payroll Dashboard</h2>
      <p style={{ color: "var(--text3)", fontSize: 14 }}>Coming in Phase 2 — awaiting SP details</p>
    </div>
  );
}
