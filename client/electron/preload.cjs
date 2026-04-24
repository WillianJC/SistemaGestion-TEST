const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("dbAPI", {
  runQuery: (query) => ipcRenderer.invoke("db-query", query),
  login: (username, pin) => ipcRenderer.invoke("db-login", username, pin),
});
