import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from './supabaseClient'
import { obtenerEstadoVerificacion } from './verificationEngine.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      await loadProfile(data.session?.user)
      setLoading(false)
    })

    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, session) => {
      await loadProfile(session?.user)
    })

    return () => sub.subscription.unsubscribe()
  }, [])

  async function loadProfile(authUser) {
    if (!authUser) {
      setUser(null)
      return
    }
    const { data: profile } = await supabase
      .from('profiles_transito')
      .select('*')
      .eq('id', authUser.id)
      .maybeSingle()

    const verificacion = await obtenerEstadoVerificacion(authUser.id)

    setUser({ 
      id: authUser.id, 
      email: authUser.email, 
      cedula: authUser.user_metadata?.cedula || profile?.cedula,
      nombre: authUser.user_metadata?.nombre || profile?.nombre,
      apellidos: profile?.apellidos,
      telefono: profile?.telefono,
      ...profile, 
      verificacion 
    })
  }

  // Se llama después de subir un documento o registrar el rostro,
  // para refrescar las banderas sin tener que recargar la sesión completa.
  async function refreshVerificacion() {
    if (!user) return
    const verificacion = await obtenerEstadoVerificacion(user.id)
    setUser((prev) => (prev ? { ...prev, verificacion } : prev))
  }

  async function signInWithPassword(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return { data, error: null }
  }

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + '/',
        skipBrowserRedirect: false,
      },
    })
    if (error) throw error
  }

  async function signUp({ email, password, cedula, nombre }) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { cedula, nombre } },
    })
    if (error) throw error
    return { data, error: null }
  }

  async function signOut() {
    await supabase.auth.signOut()
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signInWithPassword,
        signInWithGoogle,
        signUp,
        signOut,
        refreshVerificacion,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  return ctx
}
