require("dotenv").config();

const express   = require("express");
const cors      = require("cors");
const helmet    = require("helmet");
const morgan    = require("morgan");
const rateLimit = require("express-rate-limit");

const app  = express();
const PORT = process.env.PORT || 5001;

app.set("trust proxy", 1);
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));

const getAllowedOrigins = () => {
  const list = [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:3000",
    "http://localhost:4173",
  ];
  if (process.env.FRONTEND_URL) list.push(process.env.FRONTEND_URL.trim());
  return list;
};

app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);
    if (getAllowedOrigins().includes(origin)) return cb(null, true);
    if (/^https:\/\/[a-z0-9-]+\.vercel\.app$/.test(origin)) return cb(null, true);
    if (/^https?:\/\/([a-z0-9-]+\.)?msninfotec\.com$/.test(origin)) return cb(null, true);
    cb(new Error(`CORS: ${origin} not allowed`));
  },
  credentials: true,
  methods: ["GET","POST","PUT","PATCH","DELETE","OPTIONS"],
  allowedHeaders: ["Content-Type","Authorization","userid","companyid","companycode","x-admin-key"],
  optionsSuccessStatus: 200,
}));

app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 500 }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== "test") {
  app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
}

app.get("/health", (_, res) =>
  res.json({ success: true, status: "healthy", service: "MSN EasyPay API", ts: new Date().toISOString() })
);

app.use("/api/auth",      require("./routes/authRoutes"));
app.use("/api/dashboard", require("./routes/dashboardRoutes"));
app.use("/api/tenants",   require("./routes/tenantRoutes"));
// Also mount without /api prefix for Vercel deployments where VITE_API_URL omits /api
app.use("/auth",      require("./routes/authRoutes"));
app.use("/dashboard", require("./routes/dashboardRoutes"));
app.use("/tenants",   require("./routes/tenantRoutes"));

const { notFound, errorHandler } = require("./middleware/authMiddleware");
app.use(notFound);
app.use(errorHandler);

const server = app.listen(PORT, () => {
  console.log(`\n💰 MSN EasyPay API → port ${PORT} [${process.env.NODE_ENV || "dev"}]\n`);
});

process.on("SIGTERM", () => { server.close(() => process.exit(0)); setTimeout(() => process.exit(1), 10000); });
process.on("SIGINT",  () => { server.close(() => process.exit(0)); setTimeout(() => process.exit(1), 10000); });
process.on("unhandledRejection", (e) => {
  // DB connection failures are handled per-request (poolPromise rejects → 503).
  // Don't crash the server — it can still serve auth and health routes.
  if (e && (e.code === "ESOCKET" || e.code === "ELOGIN" || e.status === 503)) {
    console.error("Unhandled rejection (DB):", e.message);
    return;
  }
  console.error("Unhandled rejection:", e);
  server.close(() => process.exit(1));
});

module.exports = app;
