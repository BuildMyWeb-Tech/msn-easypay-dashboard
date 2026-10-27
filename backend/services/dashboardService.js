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
  return {
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
    .input("companyid", sql.Int,  parseInt(companyId))
    .input("dt",        sql.Date, date)
    .execute("PRW_GetAbsentList");
  return res.recordset || [];
}

async function getLateInList(companyId, date, dbName) {
  const pool = await resolvePool(dbName);
  const res = await pool.request()
    .input("companyid", sql.Int,  parseInt(companyId))
    .input("dt",        sql.Date, date)
    .execute("PRW_GetLateInList");
  return res.recordset || [];
}

// SP name is PRW_GetPuchList (note: "Puch" not "Punch" — matches the actual SP)
async function getPunchList(companyId, date, dbName) {
  const pool = await resolvePool(dbName);
  const res = await pool.request()
    .input("companyid", sql.Int,  parseInt(companyId))
    .input("dt",        sql.Date, date)
    .execute("PRW_GetPuchList");
  return res.recordset || [];
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
  return res.recordset || [];
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
};
