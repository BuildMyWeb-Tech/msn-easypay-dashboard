const sql = require("mssql");

const config = {
  user:     process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server:   process.env.DB_HOST,
  port:     Number(process.env.DB_PORT) || 1433,
  database: process.env.DB_NAME,
  options: {
    encrypt:                false,
    trustServerCertificate: true,
    enableArithAbort:       true,
    connectTimeout:         60000,
    requestTimeout:         120000,
  },
  pool: {
    max:                       15,
    min:                       2,
    idleTimeoutMillis:         60000,
    acquireTimeoutMillis:      60000,
    createTimeoutMillis:       30000,
    destroyTimeoutMillis:      5000,
    reapIntervalMillis:        1000,
    createRetryIntervalMillis: 200,
  },
};

// Lazy-connect so the server stays up even if DB creds aren't set yet.
// Services await poolPromise; if it rejects they get a 503 from the error handler.
let _pool = null;

const poolPromise = new Promise((resolve, reject) => {
  if (!config.server || !config.user) {
    const msg = "DB not configured — set DB_HOST, DB_USER, DB_PASSWORD, DB_NAME env vars";
    console.warn("⚠️  " + msg);
    return reject(Object.assign(new Error(msg), { status: 503 }));
  }

  new sql.ConnectionPool(config)
    .connect()
    .then(pool => {
      _pool = pool;
      console.log("✅ MS SQL Server connected →", config.database, "DB");
      setInterval(() => pool.request().query("SELECT 1").catch(() => {}), 4 * 60 * 1000);
      resolve(pool);
    })
    .catch(err => {
      console.error("❌ DB connection failed:", err.message);
      reject(Object.assign(err, { status: 503 }));
    });
});

module.exports = { sql, poolPromise };
