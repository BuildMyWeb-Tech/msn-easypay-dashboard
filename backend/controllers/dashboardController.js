const svc = require("../services/dashboardService");

// GET /api/dashboard/summary?date=YYYY-MM-DD
exports.getSummary = async (req, res, next) => {
  try {
    const { companyCode } = req.epUser;
    const date = req.query.date || new Date().toISOString().split("T")[0];
    const data = await svc.getSummary(companyCode, date);
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

// GET /api/dashboard/dept-absent?date=
exports.getDeptAbsent = async (req, res, next) => {
  try {
    const { companyCode } = req.epUser;
    const date = req.query.date || new Date().toISOString().split("T")[0];
    const data = await svc.getDeptAbsent(companyCode, date);
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

// GET /api/dashboard/dept-strength?date=
exports.getDeptStrength = async (req, res, next) => {
  try {
    const { companyCode } = req.epUser;
    const date = req.query.date || new Date().toISOString().split("T")[0];
    const data = await svc.getDeptStrength(companyCode, date);
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

// GET /api/dashboard/weekly-strength?date=
exports.getWeeklyStrength = async (req, res, next) => {
  try {
    const { companyCode } = req.epUser;
    const date = req.query.date || new Date().toISOString().split("T")[0];
    const data = await svc.getWeeklyStrength(companyCode, date);
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

// GET /api/dashboard/weekly-absent?date=
exports.getWeeklyAbsent = async (req, res, next) => {
  try {
    const { companyCode } = req.epUser;
    const date = req.query.date || new Date().toISOString().split("T")[0];
    const data = await svc.getWeeklyAbsent(companyCode, date);
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

// GET /api/dashboard/turnover?date=
exports.getTurnover = async (req, res, next) => {
  try {
    const { companyCode } = req.epUser;
    const date = req.query.date || new Date().toISOString().split("T")[0];
    const data = await svc.getTurnover(companyCode, date);
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

// GET /api/dashboard/absent-list?date=
exports.getAbsentList = async (req, res, next) => {
  try {
    const { companyCode } = req.epUser;
    const date = req.query.date || new Date().toISOString().split("T")[0];
    const data = await svc.getAbsentList(companyCode, date);
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

// GET /api/dashboard/late-in?date=
exports.getLateIn = async (req, res, next) => {
  try {
    const { companyCode } = req.epUser;
    const date = req.query.date || new Date().toISOString().split("T")[0];
    const data = await svc.getLateInList(companyCode, date);
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

// GET /api/dashboard/punch-list?date=
exports.getPunchList = async (req, res, next) => {
  try {
    const { companyCode } = req.epUser;
    const date = req.query.date || new Date().toISOString().split("T")[0];
    const data = await svc.getPunchList(companyCode, date);
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

// GET /api/dashboard/ot-list?date=
exports.getOTList = async (req, res, next) => {
  try {
    const { companyCode } = req.epUser;
    const date = req.query.date || new Date().toISOString().split("T")[0];
    const data = await svc.getOTList(companyCode, date);
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

// GET /api/dashboard/employee-list
exports.getEmployeeList = async (req, res, next) => {
  try {
    const { companyCode } = req.epUser;
    const data = await svc.getEmployeeList(companyCode);
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

// GET /api/dashboard/long-absent
exports.getLongAbsent = async (req, res, next) => {
  try {
    const { companyCode } = req.epUser;
    const data = await svc.getLongAbsent(companyCode);
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

// GET /api/dashboard/geo-punch?date=
exports.getGeoPunch = async (req, res, next) => {
  try {
    const { companyCode } = req.epUser;
    const date = req.query.date || new Date().toISOString().split("T")[0];
    const data = await svc.getGeoPunchList(companyCode, date);
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

// GET /api/dashboard/assets
exports.getAssets = async (req, res, next) => {
  try {
    const { companyCode } = req.epUser;
    const data = await svc.getAssetsList(companyCode);
    res.json({ success: true, data });
  } catch (err) { next(err); }
};
