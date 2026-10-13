const { sql, poolPromise } = require("../database/sqlConnection");

// SP: SP_EasyPay_Login  @UserName, @Password, @CompanyCode
// Returns: UserId, UserName, CompanyId, CompanyCode, CompanyName, RoleId
// ── Replace SP name / param names once manager provides them ──
async function login(userName, password, companyCode) {
  const pool = await poolPromise;
  const result = await pool.request()
    .input("UserName",    sql.VarChar(100), userName)
    .input("Password",    sql.VarChar(200), password)
    .input("CompanyCode", sql.VarChar(50),  companyCode)
    .execute("SP_EasyPay_Login");

  const row = result.recordset?.[0];
  if (!row) throw Object.assign(new Error("Invalid credentials"), { status: 401 });
  return row;
}

module.exports = { login };
