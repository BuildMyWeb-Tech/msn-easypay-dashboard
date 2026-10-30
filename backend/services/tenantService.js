const { sql, getPool } = require("../database/sqlConnection");

// All company/customer config lives in MebAdmin — not in meb01 (customer DB)
const ADMIN_DB = "MebAdmin";

// getBySlug — calls PRW_GetDBDetails @cname from MebAdmin
// SP returns: Responsecode, Responsemessage, ServerName, UserName, PassCode,
//             DBName, CustomerName, Companyid
async function getBySlug(slug) {
  const pool = await getPool(ADMIN_DB);
  const res = await pool.request()
    .input("cname", sql.NVarChar(20), slug.toLowerCase())
    .execute("PRW_GetDBDetails");

  const row = res.recordset?.[0];
  if (!row || row.Responcecode !== 100) return null;

  return {
    Slug:        slug.toLowerCase(),
    CompanyCode: String(row.Companyid),   // no separate CompanyCode in SP; use Companyid
    CompanyId:   row.Companyid,
    CompanyName: row.CustomerName,
    DbName:      row.DBName,
    LogoUrl:     "/msn-logo.png",
    IsActive:    1,
  };
}

// ── Admin helpers — DBoard_Companies table in MebAdmin ───────────────────────

const INIT_SQL = `
IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'DBoard_Companies')
BEGIN
  CREATE TABLE DBoard_Companies (
    Slug        NVARCHAR(50)  NOT NULL PRIMARY KEY,
    CompanyCode NVARCHAR(50)  NOT NULL,
    CompanyId   INT           NOT NULL,
    CompanyName NVARCHAR(200) NOT NULL DEFAULT '',
    DbName      NVARCHAR(100) NOT NULL DEFAULT '',
    LogoUrl     NVARCHAR(500) NOT NULL DEFAULT '/msn-logo.png',
    IsActive    BIT           NOT NULL DEFAULT 1,
    CreatedAt   DATETIME      NOT NULL DEFAULT GETDATE()
  );
END
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id=OBJECT_ID('DBoard_Companies') AND name='DbName')
  ALTER TABLE DBoard_Companies ADD DbName NVARCHAR(100) NOT NULL DEFAULT '';
`;

let _adminTableReady = false;

async function ensureAdminTable() {
  if (_adminTableReady) return;
  const pool = await getPool(ADMIN_DB);
  await pool.request().query(INIT_SQL);
  _adminTableReady = true;
}

async function getAll() {
  await ensureAdminTable();
  const pool = await getPool(ADMIN_DB);
  const res = await pool.request().query(
    "SELECT Slug, CompanyCode, CompanyId, CompanyName, DbName, LogoUrl, IsActive FROM DBoard_Companies ORDER BY CreatedAt"
  );
  return res.recordset;
}

async function upsert({ slug, companyCode, companyId, companyName, dbName, logoUrl }) {
  await ensureAdminTable();
  const pool = await getPool(ADMIN_DB);
  await pool.request()
    .input("Slug",        sql.NVarChar(50),  slug.toLowerCase().replace(/[^a-z0-9]/g, ""))
    .input("CompanyCode", sql.NVarChar(50),  companyCode || "")
    .input("CompanyId",   sql.Int,           parseInt(companyId))
    .input("CompanyName", sql.NVarChar(200), companyName || "")
    .input("DbName",      sql.NVarChar(100), dbName || "")
    .input("LogoUrl",     sql.NVarChar(500), logoUrl || "/msn-logo.png")
    .query(`
      MERGE DBoard_Companies AS target
      USING (SELECT @Slug AS Slug) AS source ON target.Slug = source.Slug
      WHEN MATCHED THEN
        UPDATE SET CompanyCode=@CompanyCode, CompanyId=@CompanyId,
                   CompanyName=@CompanyName, DbName=@DbName, LogoUrl=@LogoUrl, IsActive=1
      WHEN NOT MATCHED THEN
        INSERT (Slug, CompanyCode, CompanyId, CompanyName, DbName, LogoUrl)
        VALUES (@Slug, @CompanyCode, @CompanyId, @CompanyName, @DbName, @LogoUrl);
    `);
}

async function setActive(slug, active) {
  await ensureAdminTable();
  const pool = await getPool(ADMIN_DB);
  await pool.request()
    .input("Slug",     sql.NVarChar(50), slug.toLowerCase())
    .input("IsActive", sql.Bit,          active ? 1 : 0)
    .query("UPDATE DBoard_Companies SET IsActive=@IsActive WHERE Slug=@Slug");
}

module.exports = { getAll, getBySlug, upsert, setActive };
