const authService  = require("../services/authService");
const tenantService = require("../services/tenantService");

exports.login = async (req, res, next) => {
  try {
    const { userName, password, companyCode, companyId, slug } = req.body;
    if (!userName || !password) {
      return res.status(400).json({ success: false, message: "User Name and Password are required" });
    }
    if (!companyCode || !companyId) {
      return res.status(400).json({ success: false, message: "Company not identified. Please use your company login URL." });
    }

    // Resolve tenant to get the correct database name
    let dbName = null;
    if (slug) {
      const tenant = await tenantService.getBySlug(slug);
      dbName = tenant?.DbName || null;
    }
    // Fallback: find by companyId if slug not provided
    if (!dbName) {
      const all = await tenantService.getAll();
      const match = all.find(t => String(t.CompanyId) === String(companyId));
      dbName = match?.DbName || null;
    }

    const user = await authService.login(userName, password, companyCode, companyId, dbName);
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};
