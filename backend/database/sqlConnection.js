const sql = require("mssql");

const baseConfig = {
  user:     process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server:   process.env.DB_HOST,
  port:     Number(process.env.DB_PORT) || 1433,
  options: {
    encrypt:                false,
    trustServerCertificate: true,
    enableArithAbort:       true,
    connectTimeout:         60000,
    requestTimeout:         120000,
  },
  pool: {
    max:                       10,
    min:                       1,
    idleTimeoutMillis:         60000,
    acquireTimeoutMillis:      60000,
    createTimeoutMillis:       30000,
    destroyTimeoutMillis:      5000,
    reapIntervalMillis:        1000,
    createRetryIntervalMillis: 200,
  },
};

// Default pool → meb01 (used for DBoard_Companies tenant lookups)
const poolPromise = (() => {
  if (!baseConfig.server || !baseConfig.user) {
    const msg = "DB not configured — set DB_HOST, DB_USER, DB_PASSWORD, DB_NAME env vars";
    console.warn("⚠️  " + msg);
    return Promise.reject(Object.assign(new Error(msg), { status: 503 }));
  }
  return new sql.ConnectionPool({ ...baseConfig, database: process.env.DB_NAME })
    .connect()
    .then(pool => {
      console.log("✅ MS SQL Server connected →", process.env.DB_NAME, "DB");
      setInterval(() => pool.request().query("SELECT 1").catch(() => {}), 4 * 60 * 1000);
      return pool;
    })
    .catch(err => {
      console.error("❌ DB connection failed:", err.message);
      throw Object.assign(err, { status: 503 });
    });
})();

// Per-company pool cache — one pool per dbName
const _pools = {};

async function getPool(dbName) {
  const db = (dbName || process.env.DB_NAME || "").trim();
  if (!db) throw Object.assign(new Error("No database name provided"), { status: 503 });

  // Reuse existing pool
  if (_pools[db]) return _pools[db];

  if (!baseConfig.server || !baseConfig.user) {
    throw Object.assign(new Error("DB not configured"), { status: 503 });
  }

  const pool = await new sql.ConnectionPool({ ...baseConfig, database: db })
    .connect()
    .catch(err => {
      throw Object.assign(err, { status: 503 });
    });

  console.log(`✅ Pool created → ${db}`);
  setInterval(() => pool.request().query("SELECT 1").catch(() => {}), 4 * 60 * 1000);
  _pools[db] = pool;
  return pool;
}

module.exports = { sql, poolPromise, getPool };
