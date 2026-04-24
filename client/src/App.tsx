import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import {
  LockClosedIcon,
  CheckIcon,
  XMarkIcon,
  UserIcon,
  KeyIcon,
  ArrowRightOnRectangleIcon,
  TableCellsIcon,
} from "@heroicons/react/24/solid";
import "./App.css";

function shuffleDigits(): string[] {
  const digits = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
  for (let i = digits.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [digits[i], digits[j]] = [digits[j], digits[i]];
  }
  return digits;
}

function App() {
  const [loggedUser, setLoggedUser] = useState<string | null>(null);
  const [usuario, setUsuario] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [digits, setDigits] = useState(() => shuffleDigits());
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const usuarioRef = useRef<HTMLInputElement>(null);

  const rows = useMemo(
    () => [
      digits.slice(0, 3),
      digits.slice(3, 6),
      digits.slice(6, 9),
      [digits[9]],
    ],
    [digits],
  );

  const handleDigit = useCallback(
    (d: string) => setContrasena((prev) => prev + d),
    [],
  );
  const handleLimpiar = useCallback(() => {
    setContrasena("");
    setDigits(shuffleDigits());
    setTimeout(() => usuarioRef.current?.focus(), 10);
  }, []);

  const handleIniciar = useCallback(async () => {
    if (!usuario) {
      alert("Por favor, ingresa tu usuario");
      return;
    }
    if (!contrasena) {
      alert("Por favor, ingresa tu contraseña");
      return;
    }

    try {
      const response = await window.dbAPI.login(usuario, contrasena);
      if (response.success) {
        setLoggedUser(usuario);
      } else {
        alert("ACCESO DENEGADO: " + response.message);
        handleLimpiar();
      }
    } catch (error: unknown) {
      console.error(error);
      const msg = error instanceof Error ? error.message : String(error);
      alert("ERROR en la BD: " + msg);
    }
  }, [usuario, contrasena, handleLimpiar]);

  const handleCancelar = useCallback(() => {
    setUsuario("");
    setContrasena("");
    setDigits(shuffleDigits());
    setTimeout(() => usuarioRef.current?.focus(), 10);
  }, []);

  const flashKey = useCallback((key: string) => {
    setActiveKey(key);
    setTimeout(() => setActiveKey(null), 150);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        const isUserFocus = document.activeElement === usuarioRef.current;

        // Enter y Escape aplican independiente de qué esté enfocado
        if (e.key === "Enter") {
          e.preventDefault();
          handleIniciar();
          return;
        }
        if (e.key === "Escape") {
          handleCancelar();
          return;
        }

        const digit = e.key >= "0" && e.key <= "9" ? e.key : null;
        if (digit) {
          // Si no está enfocado en usuario, lo manda a la contraseña
          if (!isUserFocus) {
            handleDigit(digit);
            flashKey(digit);
          }
          return;
        }

        if (e.key === "Backspace") {
          if (!isUserFocus) {
            setContrasena((prev) => prev.slice(0, -1));
          }
          return;
        }
        if (e.key === "Delete") {
          if (!isUserFocus) {
            handleLimpiar();
            flashKey("Limpiar");
          }
          return;
        }

        // Si es una letra pero no está el foco en el campo usuario, redirigir el foco automáticamente
        if (!isUserFocus && e.key.length === 1 && /[a-zA-Z0-9_-]/.test(e.key)) {
          usuarioRef.current?.focus();
        }
      };

      window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleDigit, handleLimpiar, handleIniciar, handleCancelar, flashKey]);

  if (loggedUser) {
    if (loggedUser === "admin") {
      return (
        <AdminDashboard
          onLogout={() => {
            setLoggedUser(null);
            handleLimpiar();
          }}
        />
      );
    } else {
      return (
        <div className="dashboard-screen">
          <div className="dashboard-header">
            <h1 className="panel-title">Bienvenido, {loggedUser}</h1>
            <button
              className="btn-logout"
              onClick={() => {
                setLoggedUser(null);
                handleLimpiar();
              }}
            >
              <ArrowRightOnRectangleIcon
                style={{
                  width: 20,
                  height: 20,
                  marginRight: 8,
                  verticalAlign: "middle",
                }}
              />
              Cerrar Sesión
            </button>
          </div>
          <div
            className="card-body"
            style={{ background: "#fff", padding: 20, borderRadius: 8 }}
          >
            <p>Has ingresado al sistema exitosamente.</p>
          </div>
        </div>
      );
    }
  }

  return (
    <div className="screen">
      <div className="card">
        <h1 className="title">ACCESO AL SISTEMA</h1>
        <div className="card-body">
          {/* Lock Icon */}
          <div className="lock-section">
            <LockClosedIcon className="lock-icon" />
          </div>

          {/* Numpad */}
          <div className="numpad">
            {rows.map((row, ri) => (
              <div className="numpad-row" key={ri}>
                {row.map((d) => (
                  <button
                    key={d}
                    className={`num-btn${activeKey === d ? " num-btn--active" : ""}`}
                    onClick={() => handleDigit(d)}
                  >
                    {d}
                  </button>
                ))}
                {ri === 3 && (
                  <button
                    className={`num-btn limpiar-btn${activeKey === "Limpiar" ? " num-btn--active" : ""}`}
                    onClick={handleLimpiar}
                  >
                    Limpiar
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Fields */}
          <div className="fields-section">
            <div className="field-row">
              <label className="field-label">
                <UserIcon className="field-icon" />
                Usuario:
              </label>
              <input
                ref={usuarioRef}
                className="field-input"
                type="text"
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                autoComplete="off"
              />
            </div>
            <div className="field-row">
              <label className="field-label">
                <KeyIcon className="field-icon" />
                Contraseña:
              </label>
              <input
                className="field-input"
                type="password"
                value={contrasena}
                readOnly
              />
            </div>

            {/* Action buttons */}
            <div className="action-buttons">
              <button className="btn btn-iniciar" onClick={handleIniciar}>
                <CheckIcon className="btn-icon" />
                <span>Iniciar</span>
              </button>
              <button className="btn btn-cancelar" onClick={handleCancelar}>
                <XMarkIcon className="btn-icon" />
                <span>Cancelar</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const [logs, setLogs] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAuditoria = async () => {
      try {
        const res = await window.dbAPI.runQuery(
          "SELECT * FROM auditoria ORDER BY Fecha DESC",
        );
        if (res.success && res.data) {
          // Si el ipcRenderer lo devolvió exitoso o si es directo
          setLogs(Array.isArray(res.data) ? res.data : []);
        } else if (Array.isArray(res)) {
          // Por fallback de como lo resuelve mssql
          setLogs(res);
        } else if (res.data) {
          setLogs(res.data);
        }
      } catch (error) {
        console.error("Error fetching logs", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAuditoria();
  }, []);

  return (
    <div className="dashboard-screen">
      <div className="dashboard-header">
        <h1 className="panel-title">
          <TableCellsIcon
            style={{
              width: 24,
              height: 24,
              marginRight: 10,
              verticalAlign: "middle",
              color: "#112448",
            }}
          />
          Panel de Auditoría (Admin)
        </h1>
        <button className="btn-logout" onClick={onLogout}>
          <ArrowRightOnRectangleIcon
            style={{
              width: 20,
              height: 20,
              marginRight: 8,
              verticalAlign: "middle",
            }}
          />
          Cerrar Sesión
        </button>
      </div>

      <div className="auditoria-table-container">
        {loading ? (
          <p>Cargando registros...</p>
        ) : (
          <table className="auditoria-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Usuario</th>
                <th>Fecha y Hora</th>
                <th>Resultado</th>
              </tr>
            </thead>
            <tbody>
              {logs.length > 0 ? (
                logs.map((log: Record<string, unknown>, index: number) => (
                  <tr key={(log.IdAuditoria as number) || index}>
                    <td>{log.IdAuditoria as string}</td>
                    <td>
                      <strong style={{ textTransform: "uppercase" }}>
                        {log.NombreUsuario as string}
                      </strong>
                    </td>
                    <td>{new Date(log.Fecha as string).toLocaleString()}</td>
                    <td>
                      <span
                        className={`status-badge ${(log.Resultado as string)?.toLowerCase()}`}
                      >
                        {log.Resultado as string}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={4}
                    style={{ textAlign: "center", padding: "20px" }}
                  >
                    No hay registros de auditoría.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default App;
