import { useState, useMemo, useEffect, useRef } from 'react'
import { LockClosedIcon, CheckIcon, XMarkIcon, UserIcon, KeyIcon } from '@heroicons/react/24/solid'
import './App.css'

function shuffleDigits(): string[] {
  const digits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']
  for (let i = digits.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [digits[i], digits[j]] = [digits[j], digits[i]]
  }
  return digits
}

function App() {
  const [usuario, setUsuario] = useState('')
  const [contrasena, setContrasena] = useState('')
  const [digits, setDigits] = useState(() => shuffleDigits())
  const [activeKey, setActiveKey] = useState<string | null>(null)
  const usuarioRef = useRef<HTMLInputElement>(null)

  const rows = useMemo(() => [
    digits.slice(0, 3),
    digits.slice(3, 6),
    digits.slice(6, 9),
    [digits[9]],
  ], [digits])

  const handleDigit = (d: string) => setContrasena(prev => prev + d)
  const handleLimpiar = () => {
    setContrasena('')
    setDigits(shuffleDigits())
  }
  const handleIniciar = () => {
    alert(`Iniciando sesión como: ${usuario}`)
  }
  const handleCancelar = () => {
    setUsuario('')
    setContrasena('')
    setDigits(shuffleDigits())
  }

  const flashKey = (key: string) => {
    setActiveKey(key)
    setTimeout(() => setActiveKey(null), 150)
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // No interceptar si el foco está en el campo Usuario
      if (document.activeElement === usuarioRef.current) return

      const digit = e.key >= '0' && e.key <= '9' ? e.key : null

      if (digit) {
        handleDigit(digit)
        flashKey(digit)
      } else if (e.key === 'Backspace') {
        setContrasena(prev => prev.slice(0, -1))
      } else if (e.key === 'Delete') {
        handleLimpiar()
        flashKey('Limpiar')
      } else if (e.key === 'Enter') {
        handleIniciar()
      } else if (e.key === 'Escape') {
        handleCancelar()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [usuario, digits])  // digits en deps para que handleLimpiar use el estado actual

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
                    className={`num-btn${activeKey === d ? ' num-btn--active' : ''}`}
                    onClick={() => handleDigit(d)}
                  >
                    {d}
                  </button>
                ))}
                {ri === 3 && (
                  <button
                    className={`num-btn limpiar-btn${activeKey === 'Limpiar' ? ' num-btn--active' : ''}`}
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
                onChange={e => setUsuario(e.target.value)}
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
  )
}

export default App
