const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const db = require("./db.cjs"); // Importar el módulo de base de datos

const isDev = process.env.NODE_ENV === "development";

function createWindow() {
  const win = new BrowserWindow({
    width: 600,
    height: 310,
    resizable: false,
    frame: true,
    autoHideMenuBar: true,
    title: "Acceso al Sistema",
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.cjs"), // Conectar el script de precarga
    },
  });

  if (isDev) {
    win.loadURL("http://localhost:5173");
  } else {
    win.loadFile(path.join(__dirname, "../dist/index.html"));
  }
}

app.whenReady().then(() => {
  // Configurar el handler IPC para consultas a la DB
  ipcMain.handle("db-query", async (event, query) => {
    try {
      const result = await db.runQuery(query);
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  // Handler específico para el login y auditoría
  ipcMain.handle("db-login", async (event, username, pin) => {
    try {
      const result = await db.validateLogin(username, pin);
      return result;
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  createWindow();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
