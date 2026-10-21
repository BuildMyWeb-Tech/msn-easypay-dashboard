const { sql, poolPromise } = require("../database/sqlConnection");

// ─── SP: PR_GETDBOARD_DATA_01  @COMPID INTEGER, @Dt date ─────────────────────
// Returns 5 recordsets:
//   [0] Donut   — [{Status, emp}]  (Present / Absent totals)
//   [1] Pie     — [{empcount, department, typeeid, dt}]  (dept-wise absent)
//   [2] EmpData — [{Branches, Dept, TotalEmployees, NewEmp, LeftEmp, MaleEmp, FemaleEmp}]
//   [3] Attend  — [{Dt, Pre, Ab, Ir}]  (last processing + daily counts)
//   [4] Turnover— [{FNew, MNew, FLeft, MLeft}]
async function getDashboardMain(companyId, date) {
  const pool = await poolPromise;
  const res = await pool.request()
    .input("COMPID", sql.Int,  parseInt(companyId))
    .input("Dt",     sql.Date, date)
    .execute("PR_GETDBOARD_DATA_01");

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
async function getWeeklyDeptStrength(companyId) {
  const pool = await poolPromise;
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
async function getDeptSummary(companyId, date) {
  const pool = await poolPromise;
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

// ─── Placeholder SPs — names TBD from manager ────────────────────────────────

async function getAbsentList(companyId, date) {
  const pool = await poolPromise;
  const res = await pool.request()
    .input("COMPID", sql.Int, parseInt(companyId))
    .input("Dt",     sql.Date, date)
    .execute("PRW_GetAbsentList");
  return res.recordset || [];
}

async function getLateInList(companyId, date) {
  const pool = await poolPromise;
  const res = await pool.request()
    .input("COMPID", sql.Int, parseInt(companyId))
    .input("Dt",     sql.Date, date)
    .execute("PRW_GetLateInList");
  return res.recordset || [];
}

async function getPunchList(companyId, date) {
  const pool = await poolPromise;
  const res = await pool.request()
    .input("COMPID", sql.Int, parseInt(companyId))
    .input("Dt",     sql.Date, date)
    .execute("PRW_GetPunchList");
  return res.recordset || [];
}

async function getOTList(companyId, date) {
  const pool = await poolPromise;
  const res = await pool.request()
    .input("COMPID", sql.Int, parseInt(companyId))
    .input("Dt",     sql.Date, date)
    .execute("PRW_GetOTList");
  return res.recordset || [];
}

async function getEmployeeList(companyId) {
  const pool = await poolPromise;
  const res = await pool.request()
    .input("COMPID", sql.Int, parseInt(companyId))
    .execute("PRW_GetEmployeeList");
  return res.recordset || [];
}

async function getLongAbsent(companyId) {
  const pool = await poolPromise;
  const res = await pool.request()
    .input("COMPID", sql.Int, parseInt(companyId))
    .execute("PRW_GetLongAbsent");
  return res.recordset || [];
}

async function getGeoPunchList(companyId, date) {
  const pool = await poolPromise;
  const res = await pool.request()
    .input("COMPID", sql.Int, parseInt(companyId))
    .input("Dt",     sql.Date, date)
    .execute("PRW_GetGeoPunchList");
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
  getEmployeeList,
  getLongAbsent,
  getGeoPunchList,
};
