const authService = require("../services/authService");

exports.login = async (req, res, next) => {
  try {
    const { userName, password, companyCode } = req.body;
    if (!userName || !password) {
      return res.status(400).json({ success: false, message: "User Name and Password are required" });
    }
    if (!companyCode) {
      return res.status(400).json({ success: false, message: "Company not identified. Please use your company login URL." });
    }
    const user = await authService.login(userName, password, companyCode);
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};
