import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from './supabaseClient'

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
      .from('profiles')
      .select('*')
      .eq('id', authUser.id)
      .single()

    setUser({ id: authUser.id, email: authUser.email, ...profile })
  }

  async function signInWithPassword(email, password) {
    return supabase.auth.signInWithPassword({ email, password })
  }

  async function signUp({ email, password, cedula, nombre }) {
    return supabase.auth.signUp({
      email,
      password,
      options: { data: { cedula, nombre } }
    })
  }

  async function signOut() {
    await supabase.auth.signOut()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, signInWithPassword, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  return ctx
}
