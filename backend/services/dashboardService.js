const { sql, poolPromise } = require("../database/sqlConnection");

// ─── All SP names are placeholders until manager provides actual names ───────
// Each function documents the expected SP signature and return columns.

// SP: SP_EP_GetDashboardSummary  @CompanyCode, @Date
// Returns: PresentCount, AbsentCount, IrregularPunch, TotalEmployees,
//          TotalDepts, TotalBranches, MaleCount, FemaleCount,
//          JoinedLast30, LeftLast30, LastProcessingDate
async function getSummary(companyCode, date) {
  const pool = await poolPromise;
  const res = await pool.request()
    .input("CompanyCode", sql.VarChar(50), companyCode)
    .input("Date",        sql.Date,        date)
    .execute("SP_EP_GetDashboardSummary");
  return res.recordset?.[0] || {};
}

// SP: SP_EP_GetDeptAbsent  @CompanyCode, @Date
// Returns: DeptName, AbsentCount
async function getDeptAbsent(companyCode, date) {
  const pool = await poolPromise;
  const res = await pool.request()
    .input("CompanyCode", sql.VarChar(50), companyCode)
    .input("Date",        sql.Date,        date)
    .execute("SP_EP_GetDeptAbsent");
  return res.recordset || [];
}

// SP: SP_EP_GetDeptStrength  @CompanyCode, @Date
// Returns: DeptName, OnRoll, Present, Absent
async function getDeptStrength(companyCode, date) {
  const pool = await poolPromise;
  const res = await pool.request()
    .input("CompanyCode", sql.VarChar(50), companyCode)
    .input("Date",        sql.Date,        date)
    .execute("SP_EP_GetDeptStrength");
  return res.recordset || [];
}

// SP: SP_EP_GetWeeklyStrength  @CompanyCode, @Date
// Returns: DayLabel, CurrentWeek, PastWeek
async function getWeeklyStrength(companyCode, date) {
  const pool = await poolPromise;
  const res = await pool.request()
    .input("CompanyCode", sql.VarChar(50), companyCode)
    .input("Date",        sql.Date,        date)
    .execute("SP_EP_GetWeeklyStrength");
  return res.recordset || [];
}

// SP: SP_EP_GetWeeklyAbsent  @CompanyCode, @Date
// Returns: DayLabel, CurrentWeek, PastWeek
async function getWeeklyAbsent(companyCode, date) {
  const pool = await poolPromise;
  const res = await pool.request()
    .input("CompanyCode", sql.VarChar(50), companyCode)
    .input("Date",        sql.Date,        date)
    .execute("SP_EP_GetWeeklyAbsent");
  return res.recordset || [];
}

// SP: SP_EP_GetTurnover  @CompanyCode, @Date
// Returns: MaleLeft, FemaleLeft, MaleJoined, FemaleJoined, TurnoverRate
async function getTurnover(companyCode, date) {
  const pool = await poolPromise;
  const res = await pool.request()
    .input("CompanyCode", sql.VarChar(50), companyCode)
    .input("Date",        sql.Date,        date)
    .execute("SP_EP_GetTurnover");
  return res.recordset?.[0] || {};
}

// SP: SP_EP_GetAbsentList  @CompanyCode, @Date
// Returns: EmpId, EmpName, DeptName
async function getAbsentList(companyCode, date) {
  const pool = await poolPromise;
  const res = await pool.request()
    .input("CompanyCode", sql.VarChar(50), companyCode)
    .input("Date",        sql.Date,        date)
    .execute("SP_EP_GetAbsentList");
  return res.recordset || [];
}

// SP: SP_EP_GetLateInList  @CompanyCode, @Date
// Returns: EmpId, EmpName, DeptName, PunchTime, LateBy
async function getLateInList(companyCode, date) {
  const pool = await poolPromise;
  const res = await pool.request()
    .input("CompanyCode", sql.VarChar(50), companyCode)
    .input("Date",        sql.Date,        date)
    .execute("SP_EP_GetLateInList");
  return res.recordset || [];
}

// SP: SP_EP_GetPunchList  @CompanyCode, @Date
// Returns: EmpId, EmpName, DeptName, InTime, OutTime, TotalHours, Status
async function getPunchList(companyCode, date) {
  const pool = await poolPromise;
  const res = await pool.request()
    .input("CompanyCode", sql.VarChar(50), companyCode)
    .input("Date",        sql.Date,        date)
    .execute("SP_EP_GetPunchList");
  return res.recordset || [];
}

// SP: SP_EP_GetOTList  @CompanyCode, @Date
// Returns: EmpId, EmpName, DeptName, OTHours
async function getOTList(companyCode, date) {
  const pool = await poolPromise;
  const res = await pool.request()
    .input("CompanyCode", sql.VarChar(50), companyCode)
    .input("Date",        sql.Date,        date)
    .execute("SP_EP_GetOTList");
  return res.recordset || [];
}

// SP: SP_EP_GetEmployeeList  @CompanyCode
// Returns: EmpId, EmpName, DeptName, Designation, Status
async function getEmployeeList(companyCode) {
  const pool = await poolPromise;
  const res = await pool.request()
    .input("CompanyCode", sql.VarChar(50), companyCode)
    .execute("SP_EP_GetEmployeeList");
  return res.recordset || [];
}

// SP: SP_EP_GetLongAbsent  @CompanyCode
// Returns: EmpId, EmpName, DeptName, LastPunchDate, DaysAbsent
async function getLongAbsent(companyCode) {
  const pool = await poolPromise;
  const res = await pool.request()
    .input("CompanyCode", sql.VarChar(50), companyCode)
    .execute("SP_EP_GetLongAbsent");
  return res.recordset || [];
}

// SP: SP_EP_GetGeoPunchList  @CompanyCode, @Date
// Returns: EmpId, EmpName, DeptName, PunchTime, Latitude, Longitude, Address
async function getGeoPunchList(companyCode, date) {
  const pool = await poolPromise;
  const res = await pool.request()
    .input("CompanyCode", sql.VarChar(50), companyCode)
    .input("Date",        sql.Date,        date)
    .execute("SP_EP_GetGeoPunchList");
  return res.recordset || [];
}

// SP: SP_EP_GetAssetsList  @CompanyCode
// Returns: EmpId, EmpName, AssetName, IssueDate
async function getAssetsList(companyCode) {
  const pool = await poolPromise;
  const res = await pool.request()
    .input("CompanyCode", sql.VarChar(50), companyCode)
    .execute("SP_EP_GetAssetsList");
  return res.recordset || [];
}

module.exports = {
  getSummary, getDeptAbsent, getDeptStrength,
  getWeeklyStrength, getWeeklyAbsent, getTurnover,
  getAbsentList, getLateInList, getPunchList, getOTList,
  getEmployeeList, getLongAbsent, getGeoPunchList, getAssetsList,
};
