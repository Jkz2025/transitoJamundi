import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './lib/AuthContext.jsx'
import Header from './components/Header.jsx'
import Consulta from './pages/Consulta.jsx'
import Login from './pages/Login.jsx'
import MiCuenta from './pages/MiCuenta.jsx'

export default function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Consulta />} />
            <Route path="/ingresar" element={<Login />} />
            <Route path="/mi-cuenta" element={<MiCuenta />} />
          </Routes>
        </main>
        <footer className="border-t border-navy-100 bg-white">
          <div className="max-w-6xl mx-auto px-4 py-6 text-sm text-navy-400 flex flex-col sm:flex-row justify-between gap-2">
            <span>© {new Date().getFullYear()} Secretaría de Tránsito y Transporte de Jamundí</span>
            <span>Línea de atención: (602) 000 0000 · transito@jamundi.gov.co</span>
          </div>
        </footer>
      </div>
    </AuthProvider>
  )
}
