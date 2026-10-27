const svc = require("../services/dashboardService");

const today = () => new Date().toISOString().split("T")[0];

// dbName comes from request header 'dbname' set by frontend from session
const getDbName = (req) => req.headers["dbname"] || req.epUser?.dbName || null;

exports.getMainData = async (req, res, next) => {
  try {
    const { companyId } = req.epUser;
    const date = req.query.date || today();
    const data = await svc.getDashboardMain(companyId, date, getDbName(req));
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

exports.getWeeklyData = async (req, res, next) => {
  try {
    const { companyId } = req.epUser;
    const data = await svc.getWeeklyDeptStrength(companyId, getDbName(req));
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

exports.getDeptSummary = async (req, res, next) => {
  try {
    const { companyId } = req.epUser;
    const date = req.query.date || today();
    const data = await svc.getDeptSummary(companyId, date, getDbName(req));
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

exports.getAbsentList = async (req, res, next) => {
  try {
    const { companyId } = req.epUser;
    const date = req.query.date || today();
    const data = await svc.getAbsentList(companyId, date, getDbName(req));
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

exports.getLateIn = async (req, res, next) => {
  try {
    const { companyId } = req.epUser;
    const date = req.query.date || today();
    const data = await svc.getLateInList(companyId, date, getDbName(req));
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

exports.getPunchList = async (req, res, next) => {
  try {
    const { companyId } = req.epUser;
    const date = req.query.date || today();
    const data = await svc.getPunchList(companyId, date, getDbName(req));
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

exports.getOTList = async (req, res, next) => {
  try {
    const { companyId } = req.epUser;
    const date = req.query.date || today();
    const data = await svc.getOTList(companyId, date, getDbName(req));
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

exports.getLongAbsent = async (req, res, next) => {
  try {
    const { companyId } = req.epUser;
    const date = req.query.date || today();
    const data = await svc.getLongAbsent(companyId, date, getDbName(req));
    res.json({ success: true, data });
  } catch (err) { next(err); }
};
