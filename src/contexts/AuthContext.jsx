import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check active session
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        setUser(session?.user ?? null)
      } catch (error) {
        console.error('Error checking session:', error)
      } finally {
        setLoading(false)
      }
    }

    checkSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    
    if (error) throw error
    return data
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  // Handle auto-login from URL tokens
  const handleAuthCallback = async (authData) => {
    try {
      const { access_token, refresh_token } = authData
      
      const { data, error } = await supabase.auth.setSession({
        access_token,
        refresh_token,
      })
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('Error setting session:', error)
      throw error
    }
  }

  const value = {
    user,
    loading,
    signIn,
    signOut,
    handleAuthCallback,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
