const svc = require("../services/payrollService");

function getDbName(req) {
  return req.headers["dbname"] || req.user?.dbName || null;
}
function getCompanyId(req) {
  return req.headers["companyid"] || req.user?.companyId || 0;
}

exports.getPayrollDashboard = async (req, res, next) => {
  try {
    const companyId = getCompanyId(req);
    const { month, year } = req.query;
    if (!month || !year) return res.status(400).json({ message: "month and year are required" });
    const data = await svc.getPayrollDashboard(companyId, month, year, getDbName(req));
    res.json({ data });
  } catch (err) {
    next(err);
  }
};
