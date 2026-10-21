const svc = require("../services/dashboardService");

const today = () => new Date().toISOString().split("T")[0];

// GET /api/dashboard/main-data?date=YYYY-MM-DD
// Calls PR_GETDBOARD_DATA_01 — returns 5 recordsets covering sections 1-5:
//   donut, pie, empData, attend, turnover
exports.getMainData = async (req, res, next) => {
  try {
    const { companyId } = req.epUser;
    const date = req.query.date || today();
    const data = await svc.getDashboardMain(companyId, date);
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

// GET /api/dashboard/weekly-data
// Calls PRW_GET_WEEKLYDEPTSTRENGTH — returns { strength[], absent[] }
exports.getWeeklyData = async (req, res, next) => {
  try {
    const { companyId } = req.epUser;
    const data = await svc.getWeeklyDeptStrength(companyId);
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

// GET /api/dashboard/dept-summary?date=YYYY-MM-DD
// Calls PRW_GetDeptSummary — department-wise ON Roll/Dayshift/Nightshift/Present/Absent/Present%
exports.getDeptSummary = async (req, res, next) => {
  try {
    const { companyId } = req.epUser;
    const date = req.query.date || today();
    const data = await svc.getDeptSummary(companyId, date);
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

// ─── Remaining report endpoints (SPs TBD) ────────────────────────────────────

exports.getAbsentList = async (req, res, next) => {
  try {
    const { companyId } = req.epUser;
    const date = req.query.date || today();
    const data = await svc.getAbsentList(companyId, date);
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

exports.getLateIn = async (req, res, next) => {
  try {
    const { companyId } = req.epUser;
    const date = req.query.date || today();
    const data = await svc.getLateInList(companyId, date);
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

exports.getPunchList = async (req, res, next) => {
  try {
    const { companyId } = req.epUser;
    const date = req.query.date || today();
    const data = await svc.getPunchList(companyId, date);
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

exports.getOTList = async (req, res, next) => {
  try {
    const { companyId } = req.epUser;
    const date = req.query.date || today();
    const data = await svc.getOTList(companyId, date);
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

exports.getEmployeeList = async (req, res, next) => {
  try {
    const { companyId } = req.epUser;
    const data = await svc.getEmployeeList(companyId);
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

exports.getLongAbsent = async (req, res, next) => {
  try {
    const { companyId } = req.epUser;
    const data = await svc.getLongAbsent(companyId);
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

exports.getGeoPunch = async (req, res, next) => {
  try {
    const { companyId } = req.epUser;
    const date = req.query.date || today();
    const data = await svc.getGeoPunchList(companyId, date);
    res.json({ success: true, data });
  } catch (err) { next(err); }
};
