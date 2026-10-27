const { sql, getPool } = require("../database/sqlConnection");

// SP: PR_Validate_UserLogin @UserName, @Password, @companyid
// Returns: ResponseCode (100=success), ResponseMessage, UID, UserName
async function login(userName, password, companyCode, companyId, dbName) {
  const cid  = parseInt(companyId) || parseInt(process.env.DEFAULT_COMPANY_ID || "50");
  const pool = await getPool(dbName || process.env.DB_NAME);

  const result = await pool.request()
    .input("UserName",  sql.NVarChar(50), userName)
    .input("Password",  sql.NVarChar(50), password)
    .input("companyid", sql.Int,          cid)
    .execute("PR_Validate_UserLogin");

  const row = result.recordset?.[0];
  if (!row || row.ResponseCode !== 100) {
    throw Object.assign(new Error(row?.ResponseMessage || "Invalid Username or Password"), { status: 401 });
  }

  return {
    UserId:      row.UID,
    UserName:    row.UserName,
    CompanyId:   cid,
    CompanyCode: companyCode,
    DbName:      dbName,
    CompanyName: "",
    RoleId:      0,
  };
}

module.exports = { login };
