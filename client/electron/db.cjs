const sql = require("mssql");
require("dotenv").config();

const config = {
  user: "admin-willian",
  password: 'baAWDAWDqwnhwvh147815"1431341',
  server: "db-gestion.database.windows.net", // ej. 'mi-servidor.database.windows.net'
  database: "free-sql-db-9991957",
  options: {
    encrypt: true, // Debe ser true para Azure SQL
    trustServerCertificate: false, // En Azure SQL normalmente es false
  },
};

let poolPromise = null;

async function getConnection() {
  if (!poolPromise) {
    try {
      poolPromise = new sql.ConnectionPool(config).connect();
      console.log("Conexión a Azure SQL establecida exitosamente.");
    } catch (err) {
      console.error("Error al conectar con la base de datos:", err);
      throw err;
    }
  }
  return poolPromise;
}

async function runQuery(queryString) {
  try {
    const pool = await getConnection();
    const result = await pool.request().query(queryString);
    return result.recordset;
  } catch (err) {
    console.error("Error ejecutando la consulta:", err);
    throw err;
  }
}

async function validateLogin(username, pin) {
  try {
    const pool = await getConnection();

    // 1. Validar si el usuario existe y si el PIN es correcto
    const userResult = await pool
      .request()
      .input("username", sql.NVarChar, username)
      .input("pin", sql.NVarChar, pin)
      .query(
        "SELECT IdUsuario FROM usuarios WHERE NombreUsuario = @username AND ContrasenaNumerica = @pin",
      );

    const isValid = userResult.recordset.length > 0;
    const resultText = isValid ? "CORRECTO" : "ERROR";
    const auditUser = username ? username : "desconocido";

    // 2. Registrar en la auditoría
    await pool
      .request()
      .input("auditUser", sql.NVarChar, auditUser)
      .input("resultText", sql.NVarChar, resultText)
      .query(
        "INSERT INTO auditoria (NombreUsuario, Resultado) VALUES (@auditUser, @resultText)",
      );

    return {
      success: isValid,
      message: isValid ? "Ingreso correcto" : "Credenciales inválidas",
    };
  } catch (err) {
    console.error("Error en validateLogin:", err);
    throw err;
  }
}

module.exports = {
  getConnection,
  runQuery,
  validateLogin,
};
