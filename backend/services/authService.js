const { sql, poolPromise } = require("../database/sqlConnection");

// SP: PR_Validate_UserLogin @UserName, @Password, @companyid
// Returns: ResponseCode (100=success), ResponseMessage, UID, UserName
async function login(userName, password, companyCode) {
  const pool = await poolPromise;

  // companyCode from login form — use DEFAULT_COMPANY_ID env for SP
  const companyId = parseInt(process.env.DEFAULT_COMPANY_ID || "50");

  const result = await pool.request()
    .input("UserName",   sql.NVarChar(50), userName)
    .input("Password",   sql.NVarChar(50), password)
    .input("companyid",  sql.Int,          companyId)
    .execute("PR_Validate_UserLogin");

  const row = result.recordset?.[0];
  if (!row || row.ResponseCode !== 100) {
    throw Object.assign(new Error(row?.ResponseMessage || "Invalid credentials"), { status: 401 });
  }

  return {
    UserId:      row.UID,
    UserName:    row.UserName,
    CompanyId:   companyId,
    CompanyCode: companyCode,
    CompanyName: "",
    RoleId:      0,
  };
}

module.exports = { login };
