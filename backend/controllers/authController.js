const authService = require("../services/authService");

exports.login = async (req, res, next) => {
  try {
    const { userName, password, companyCode } = req.body;
    if (!userName || !password || !companyCode) {
      return res.status(400).json({ success: false, message: "userName, password and companyCode are required" });
    }
    const user = await authService.login(userName, password, companyCode);
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};
