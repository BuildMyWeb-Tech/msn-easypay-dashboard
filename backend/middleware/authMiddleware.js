// Headers expected:
//   userid      — Int
//   companycode — String  (e.g. "5146688")
//   companyid   — Int
const protect = (req, res, next) => {
  try {
    const userId      = req.headers["userid"];
    const companyCode = req.headers["companycode"] || process.env.DEFAULT_COMPANY_CODE || "";
    const companyId   = req.headers["companyid"]   || process.env.DEFAULT_COMPANY_ID   || 1;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized — userid header missing" });
    }

    req.epUser = {
      userId:      parseInt(userId),
      companyCode: String(companyCode),
      companyId:   parseInt(companyId),
    };

    next();
  } catch (err) {
    console.error("protect error:", err);
    return res.status(500).json({ success: false, message: "Authentication error" });
  }
};

const notFound = (req, res, next) => {
  const err  = new Error(`Route not found: ${req.originalUrl}`);
  err.status = 404;
  next(err);
};

const errorHandler = (err, req, res, next) => {
  const status = err.status || 500;
  console.error(`[ERROR] ${status} — ${err.message}`);
  res.status(status).json({
    success: false,
    message: err.message || "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

module.exports = { protect, notFound, errorHandler };
