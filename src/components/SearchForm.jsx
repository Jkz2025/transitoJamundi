import { useState } from 'react'

const MODOS = [
  { value: 'cedula', label: 'Número de cédula' },
  { value: 'placa', label: 'Placa del vehículo' }
]

// 👇 En desarrollo usa Worker local, en producción usa Worker desplegado
const API_URL = import.meta.env.DEV
  ? 'http://127.0.0.1:8787/consulta'
  : 'https://worker-prueba.moiplay300.workers.dev/consulta'

export default function SearchForm({ onSearch, loading }) {
  const [modo, setModo] = useState('cedula')
  const [valor, setValor] = useState('')
  const [error, setError] = useState('')
  const [enviando, setEnviando] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    const limpio = valor.trim().toUpperCase()

    if (modo === 'cedula' && !/^\d{5,12}$/.test(limpio)) {
      setError('Ingresa un número de cédula válido (solo dígitos).')
      return
    }
    if (modo === 'placa' && !/^[A-Z0-9]{5,7}$/.test(limpio)) {
      setError('Ingresa una placa válida, ej: ABC12D.')
      return
    }

    setError('')
    setEnviando(true)

    try {
      const respuesta = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filtro: limpio })
      })

      const texto = await respuesta.text()

      if (!respuesta.ok) {
        throw new Error(`HTTP ${respuesta.status}: ${texto || respuesta.statusText}`)
      }

      const data = texto ? JSON.parse(texto) : {}
      onSearch({ modo, valor: limpio, resultado: data })
    } catch (error) {
      console.error('Error en la consulta:', error)
      setError(`Error: ${error.message}`)
    } finally {
      setEnviando(false)
    }
  }

  const cargando = loading || enviando

  return (
    <form onSubmit={handleSubmit} className="card p-5 sm:p-6">
      <div className="flex gap-2 mb-4" role="tablist" aria-label="Tipo de búsqueda">
        {MODOS.map((m) => (
          <button
            key={m.value}
            type="button"
            role="tab"
            aria-selected={modo === m.value}
            onClick={() => { setModo(m.value); setValor(''); setError('') }}
            className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-display font-semibold transition-colors
              ${modo === m.value ? 'bg-navy-700 text-white' : 'bg-navy-50 text-navy-600 hover:bg-navy-100'}`}
          >
            {m.label}
          </button>
        ))}
      </div>

      <label htmlFor="valor" className="block text-sm font-medium text-navy-700 mb-1.5">
        {modo === 'cedula' ? 'Escribe tu número de cédula' : 'Escribe la placa del vehículo'}
      </label>
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          id="valor"
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          placeholder={modo === 'cedula' ? 'Ej: 1107012345' : 'Ej: ABC12D'}
          className="input-field flex-1"
          inputMode={modo === 'cedula' ? 'numeric' : 'text'}
          maxLength={modo === 'cedula' ? 12 : 7}
          aria-invalid={!!error}
          aria-describedby={error ? 'valor-error' : undefined}
        />
        <button type="submit" disabled={cargando || !valor} className="btn-primary sm:w-48">
          {cargando ? 'Consultando…' : 'Buscar'}
        </button>
      </div>
      {error && <p id="valor-error" className="text-sm text-red-600 mt-2">{error}</p>}
      <p className="text-xs text-navy-400 mt-3">
        Esta consulta solo incluye comparendos registrados por la Secretaría de Tránsito de Jamundí.
        Si tienes obligaciones en otros organismos de tránsito, consúltalas en el SIMIT nacional.
      </p>
    </form>
  )
}