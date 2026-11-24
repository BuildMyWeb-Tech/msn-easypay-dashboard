const { sql, poolPromise, getPool } = require("../database/sqlConnection");

async function resolvePool(dbName) {
  if (dbName) return getPool(dbName);
  return poolPromise;
}

// SP: PRW_GetPayrollDashboard @companyid int, @month int, @year int
// Expected recordsets (adjust once SP is confirmed):
//   [0] Summary   — TotalEmp, Staff, Worker, PFEmployees, ESIEmployees, Exempted
//   [1] Salaries  — TotalSalary, StaffSalary, WorkerSalary, PFSalary, ESISalary, ExemptedSalary
//   [2] Earned    — TotalEarned, StaffEarned, WorkerEarned
//   [3] OT        — OTHours, OTWages
//   [4] Deductions — PFDeducted, ESIDeducted, TDSDeducted, OtherDeductions
//   [5] Payments  — Bank, Cash, NetSalaryPaid, PFPaid, ESIPaid, TotalCTC
//   [6] DeptWise  — [{deptname, salary}]  for pie chart
//   [7] DesigWise — [{designation, count}] for donut chart
async function getPayrollDashboard(companyId, month, year, dbName) {
  const pool = await resolvePool(dbName);
  const res = await pool.request()
    .input("companyid", sql.Int, parseInt(companyId))
    .input("month",     sql.Int, parseInt(month))
    .input("year",      sql.Int, parseInt(year))
    .execute("PRW_GetPayrollDashboard");

  const rs = res.recordsets;
  if (rs[0]?.length > 0) console.log("[PayrollDashboard] rs[0] columns:", Object.keys(rs[0][0]));
  return {
    summary:    rs[0]?.[0] || {},
    salaries:   rs[1]?.[0] || {},
    earned:     rs[2]?.[0] || {},
    ot:         rs[3]?.[0] || {},
    deductions: rs[4]?.[0] || {},
    payments:   rs[5]?.[0] || {},
    deptWise:   rs[6]  || [],
    desigWise:  rs[7]  || [],
  };
}

module.exports = { getPayrollDashboard };
