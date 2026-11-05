const { sql, poolPromise, getPool } = require("../database/sqlConnection");

// Helper — use company-specific DB pool if dbName provided, else default pool
async function resolvePool(dbName) {
  if (dbName) return getPool(dbName);
  return poolPromise;
}

// ─── SP: PRW_GETDBOARD_DATA_01  @COMPID INTEGER, @Dt date ────────────────────
// Returns 5 recordsets:
//   [0] Donut   — [{Status, emp}]  (Present / Absent totals)
//   [1] Pie     — [{empcount, department, typeeid, dt}]  (dept-wise absent)
//   [2] EmpData — [{Branches, Dept, TotalEmployees, NewEmp, LeftEmp, MaleEmp, FemaleEmp}]
//   [3] Attend  — [{Dt, Pre, Ab, Ir}]  (last processing + daily counts)
//   [4] Turnover— [{FNew, MNew, FLeft, MLeft}]
// omtex (meb01) has PRW_GETDBOARD_DATA_01; all other DBs have PR_GETDBOARD_DATA_01
const MAIN_SP = (dbName) =>
  (!dbName || dbName === "meb01") ? "PRW_GETDBOARD_DATA_01" : "PR_GETDBOARD_DATA_01";

async function getDashboardMain(companyId, date, dbName) {
  const pool = await resolvePool(dbName);
  const res = await pool.request()
    .input("COMPID", sql.Int,  parseInt(companyId))
    .input("Dt",     sql.Date, date)
    .execute(MAIN_SP(dbName));

  // SP returns 6 recordsets:
  //   [0] date header    {Dt}
  //   [1] donut          [{Status, emp}]
  //   [2] pie            [{empcount, department, typeuid, dt}]
  //   [3] employee data  [{Branches, Dept, TotalEmployees, NewEmp, LeftEmp, MaleEmp, FemaleEmp}]
  //   [4] attendance     [{Dt, Pre, Ab, Ir}]
  //   [5] turnover       [{FNew, MNew, FLeft, MLeft}]
  const rs = res.recordsets;
  // rs[0] = [{Dt}] — the actual date SP used (may differ from @Dt if attendance not processed yet)
  const actualDt = rs[0]?.[0]?.Dt || null;
  return {
    actualDate: actualDt ? new Date(actualDt).toISOString().split("T")[0] : null,
    donut:    rs[1] || [],
    pie:      rs[2] || [],
    empData:  rs[3]?.[0] || {},
    attend:   rs[4]?.[0] || {},
    turnover: rs[5]?.[0] || {},
  };
}

// ─── SP: PRW_GET_WEEKLYDEPTSTRENGTH  @COMPANYID INT ───────────────────────────
// Returns 4 recordsets:
//   [0] Current week strength — [{dt, empstrength}]
//   [1] Past week strength    — [{dt, empstrength}]
//   [2] Current week absent   — [{dt, empabsent}]
//   [3] Past week absent      — [{dt, empabsent}]
// Merged into {strength[], absent[]} with {DayName, CurrentWeek, PastWeek}
async function getWeeklyDeptStrength(companyId, dbName) {
  const pool = await resolvePool(dbName);
  const res = await pool.request()
    .input("COMPANYID", sql.Int, parseInt(companyId))
    .execute("PRW_GET_WEEKLYDEPTSTRENGTH");

  const rs = res.recordsets;
  const strength = (rs[0] || []).map((row, i) => ({
    DayName:     row.dt,
    CurrentWeek: row.empstrength,
    PastWeek:    rs[1]?.[i]?.empstrength || 0,
  }));
  const absent = (rs[2] || []).map((row, i) => ({
    DayName:     row.dt,
    CurrentWeek: row.empabsent,
    PastWeek:    rs[3]?.[i]?.empabsent || 0,
  }));
  return { strength, absent };
}

// ─── SP: PRW_GetDeptSummary  @Companyid int, @dt date ────────────────────────
// Returns: [{present, deptname, onroll}]
// Absent and PresentPct are derived: Absent = OnRoll - Present
async function getDeptSummary(companyId, date, dbName) {
  const pool = await resolvePool(dbName);
  const res = await pool.request()
    .input("Companyid", sql.Int,  parseInt(companyId))
    .input("dt",        sql.Date, date)
    .execute("PRW_GetDeptSummary");
  return (res.recordset || []).map((r, i) => ({
    Sl:         i + 1,
    Department: r.deptname,
    OnRoll:     r.onroll   || 0,
    Present:    r.present  || 0,
    Absent:     (r.onroll  || 0) - (r.present || 0),
    PresentPct: r.onroll > 0 ? +((r.present / r.onroll) * 100).toFixed(2) : 0,
  }));
}

// ─── Accordion report SPs ─────────────────────────────────────────────────────

async function getAbsentList(companyId, date, dbName) {
  const pool = await resolvePool(dbName);
  const res = await pool.request()
    .input("dt",        sql.Date, date)
    .input("companyid", sql.Int,  parseInt(companyId))
    .execute("PRW_GetAbsentList");
  const rows = res.recordset || [];
  if (rows.length > 0) console.log("[AbsentList] columns:", Object.keys(rows[0]));
  return rows;
}

async function getLateInList(companyId, date, dbName) {
  const pool = await resolvePool(dbName);
  const res = await pool.request()
    .input("companyid", sql.Int,  parseInt(companyId))
    .input("dt",        sql.Date, date)
    .execute("PRW_GetLateInList");
  return res.recordset || [];
}

// SP: PRW_GetPunchList @dt date, @companyid int, @deptname nvarchar(50)
async function getPunchList(companyId, date, dbName) {
  const pool = await resolvePool(dbName);
  try {
    const res = await pool.request()
      .input("dt",        sql.Date,         date)
      .input("companyid", sql.Int,          parseInt(companyId))
      .input("deptname",  sql.NVarChar(50), "ALL")
      .execute("PRW_GetPunchList");
    return res.recordset || [];
  } catch {
    // Fallback: SP may not yet have @deptname param on this DB
    const res = await pool.request()
      .input("dt",        sql.Date, date)
      .input("companyid", sql.Int,  parseInt(companyId))
      .execute("PRW_GetPunchList");
    return res.recordset || [];
  }
}

async function getOTList(companyId, date, dbName) {
  const pool = await resolvePool(dbName);
  const res = await pool.request()
    .input("companyid", sql.Int,  parseInt(companyId))
    .input("dt",        sql.Date, date)
    .execute("PRW_GetOTList");
  return res.recordset || [];
}

async function getLongAbsent(companyId, date, dbName) {
  const pool = await resolvePool(dbName);
  const res = await pool.request()
    .input("companyid", sql.Int,  parseInt(companyId))
    .input("Dt",        sql.Date, date)
    .execute("PRW_GetLongAbsentEmployees");
  const rows = res.recordset || [];
  if (rows.length > 0) console.log("[LongAbsent] columns:", Object.keys(rows[0]));
  return rows;
}

// ─── Approval SPs ────────────────────────────────────────────────────────────

// Save OT approval — SP: PRW_ApproveOT (confirm exact name with manager)
async function approveOT(companyId, empCode, date, approvedOT, dbName) {
  const pool = await resolvePool(dbName);
  await pool.request()
    .input("companyid",  sql.Int,     parseInt(companyId))
    .input("empcode",    sql.VarChar, String(empCode))
    .input("dt",         sql.Date,    date)
    .input("approvedot", sql.Int,     parseInt(approvedOT))
    .execute("PRW_ApproveOT");
}

// SP: PRW_Get_IrregularpunchData @dt date, @companyid int
async function getIrregularPunchList(companyId, date, dbName) {
  const pool = await resolvePool(dbName);
  const res = await pool.request()
    .input("dt",        sql.Date, date)
    .input("companyid", sql.Int,  parseInt(companyId))
    .execute("PRW_Get_IrregularpunchData");
  const rows = res.recordset || [];
  if (rows.length > 0) console.log("[IrregularPunch] columns:", Object.keys(rows[0]));
  return rows;
}

// SP: PRW_Approve_IrregularPunch @dt date, @empcode nvarchar(50), @companyid int
async function approveIrregularPunch(companyId, empCode, date, dbName) {
  const pool = await resolvePool(dbName);
  await pool.request()
    .input("dt",        sql.Date,         date)
    .input("empcode",   sql.NVarChar(50), String(empCode))
    .input("companyid", sql.Int,          parseInt(companyId))
    .execute("PRW_Approve_IrregularPunch");
}

module.exports = {
  getDashboardMain,
  getWeeklyDeptStrength,
  getDeptSummary,
  getAbsentList,
  getLateInList,
  getPunchList,
  getOTList,
  getLongAbsent,
  approveOT,
  getIrregularPunchList,
  approveIrregularPunch,
};
