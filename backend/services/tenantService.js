const { sql, poolPromise } = require("../database/sqlConnection");

const INIT_SQL = `
IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'DBoard_Companies')
BEGIN
  CREATE TABLE DBoard_Companies (
    Slug        NVARCHAR(50)  NOT NULL PRIMARY KEY,
    CompanyCode NVARCHAR(50)  NOT NULL,
    CompanyId   INT           NOT NULL,
    CompanyName NVARCHAR(200) NOT NULL DEFAULT '',
    LogoUrl     NVARCHAR(500) NOT NULL DEFAULT '/msn-logo.png',
    IsActive    BIT           NOT NULL DEFAULT 1,
    CreatedAt   DATETIME      NOT NULL DEFAULT GETDATE()
  );
END
`;

// Runs every startup — inserts missing companies, never overwrites existing rows
const SEED_SQL = `
MERGE DBoard_Companies AS t
USING (VALUES
  ('omtex',    '5146688', 50, 'OM Textiles'),
  ('amman1',   '5146679', 34, 'Amman Unit 1'),
  ('amman2',   '5146681', 40, 'Amman Unit 2'),
  ('krg',      '5146672', 25, 'KRG'),
  ('krgsolar', '5146703', 65, 'KRG Solar'),
  ('ragatex',  '5146635',  5, 'Ragatex')
) AS s (Slug, CompanyCode, CompanyId, CompanyName)
ON t.Slug = s.Slug
WHEN NOT MATCHED THEN
  INSERT (Slug, CompanyCode, CompanyId, CompanyName)
  VALUES (s.Slug, s.CompanyCode, s.CompanyId, s.CompanyName);
`;

let _initialized = false;

async function ensureTable() {
  if (_initialized) return;
  const pool = await poolPromise;
  await pool.request().query(INIT_SQL);
  await pool.request().query(SEED_SQL);
  _initialized = true;
}

async function getAll() {
  await ensureTable();
  const pool = await poolPromise;
  const res = await pool.request().query(
    "SELECT Slug, CompanyCode, CompanyId, CompanyName, LogoUrl, IsActive FROM DBoard_Companies ORDER BY CreatedAt"
  );
  return res.recordset;
}

async function getBySlug(slug) {
  await ensureTable();
  const pool = await poolPromise;
  const res = await pool.request()
    .input("Slug", sql.NVarChar(50), slug.toLowerCase())
    .query("SELECT Slug, CompanyCode, CompanyId, CompanyName, LogoUrl, IsActive FROM DBoard_Companies WHERE Slug = @Slug AND IsActive = 1");
  return res.recordset[0] || null;
}

async function upsert({ slug, companyCode, companyId, companyName, logoUrl }) {
  await ensureTable();
  const pool = await poolPromise;
  await pool.request()
    .input("Slug",        sql.NVarChar(50),  slug.toLowerCase().replace(/[^a-z0-9]/g, ""))
    .input("CompanyCode", sql.NVarChar(50),  companyCode)
    .input("CompanyId",   sql.Int,           parseInt(companyId))
    .input("CompanyName", sql.NVarChar(200), companyName || "")
    .input("LogoUrl",     sql.NVarChar(500), logoUrl || "/msn-logo.png")
    .query(`
      MERGE DBoard_Companies AS target
      USING (SELECT @Slug AS Slug) AS source ON target.Slug = source.Slug
      WHEN MATCHED THEN
        UPDATE SET CompanyCode=@CompanyCode, CompanyId=@CompanyId,
                   CompanyName=@CompanyName, LogoUrl=@LogoUrl, IsActive=1
      WHEN NOT MATCHED THEN
        INSERT (Slug, CompanyCode, CompanyId, CompanyName, LogoUrl)
        VALUES (@Slug, @CompanyCode, @CompanyId, @CompanyName, @LogoUrl);
    `);
}

async function setActive(slug, active) {
  await ensureTable();
  const pool = await poolPromise;
  await pool.request()
    .input("Slug",     sql.NVarChar(50), slug.toLowerCase())
    .input("IsActive", sql.Bit,          active ? 1 : 0)
    .query("UPDATE DBoard_Companies SET IsActive=@IsActive WHERE Slug=@Slug");
}

module.exports = { getAll, getBySlug, upsert, setActive };
