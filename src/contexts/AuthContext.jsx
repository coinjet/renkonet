import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Get user profile from database
  const fetchProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Error fetching profile:', error)
        return null
      }

      return data
    } catch (err) {
      console.error('Error in fetchProfile:', err)
      return null
    }
  }

  // Create profile if it doesn't exist
  const createProfile = async (user) => {
    try {
      const username = user.email?.split('@')[0] || 'user'
      const { data, error } = await supabase
        .from('profiles')
        .insert([
          {
            id: user.id,
            username: username,
            full_name: user.user_metadata?.full_name || '',
            role: 'normal'
          }
        ])
        .select()
        .single()

      if (error) {
        console.error('Error creating profile:', error)
        return null
      }

      return data
    } catch (err) {
      console.error('Error in createProfile:', err)
      return null
    }
  }

  // Initialize auth state
  useEffect(() => {
    let mounted = true

    const initializeAuth = async () => {
      try {
        setLoading(true)
        setError(null)

        // Get initial session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) {
          console.error('Session error:', sessionError)
          setError(sessionError.message)
          return
        }

        if (session?.user && mounted) {
          setUser(session.user)
          
          // Fetch or create profile
          let userProfile = await fetchProfile(session.user.id)
          
          if (!userProfile) {
            userProfile = await createProfile(session.user)
          }
          
          if (userProfile && mounted) {
            setProfile(userProfile)
          }
        }
      } catch (err) {
        console.error('Auth initialization error:', err)
        if (mounted) {
          setError(err.message)
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    initializeAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return

        console.log('Auth state changed:', event, session?.user?.id)

        if (event === 'SIGNED_IN' && session?.user) {
          setUser(session.user)
          
          // Fetch or create profile
          let userProfile = await fetchProfile(session.user.id)
          
          if (!userProfile) {
            userProfile = await createProfile(session.user)
          }
          
          if (userProfile) {
            setProfile(userProfile)
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null)
          setProfile(null)
        }
        
        setLoading(false)
      }
    )

    return () => {
      mounted = false
      subscription?.unsubscribe()
    }
  }, [])

  // Sign in function
  const signIn = async (email, password) => {
    try {
      setError(null)
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error
      return data
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  // Sign up function
  const signUp = async (email, password, metadata = {}) => {
    try {
      setError(null)
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata
        }
      })

      if (error) throw error
      return data
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  // Sign out function
  const signOut = async () => {
    try {
      setError(null)
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  // Update profile function
  const updateProfile = async (updates) => {
    try {
      setError(null)
      if (!user) throw new Error('No user logged in')

      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single()

      if (error) throw error
      
      setProfile(data)
      return data
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  const value = {
    user,
    profile,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    updateProfile,
    isAuthenticated: !!user,
    isAdmin: profile?.role === 'admin',
    isVerified: profile?.is_verified || profile?.role === 'verified' || profile?.role === 'admin'
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

