import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import axios from 'axios'

interface User {
  id: number
  username: string | null
  email: string | null
  display_name: string | null
  preferred_language: string
  created_at: string | null
}

interface AuthContextType {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
  updateProfile: (data: { display_name?: string; preferred_language?: string }) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Axios interceptor for JWT
const api = axios.create({ baseURL: '/api', timeout: 10000 })

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('mindshield-token'))
  const [isLoading, setIsLoading] = useState(true)

  // Set auth header whenever token changes
  useEffect(() => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
    } else {
      delete api.defaults.headers.common['Authorization']
    }
  }, [token])

  // Load user on mount if token exists
  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          const res = await api.get('/auth/me')
          setUser(res.data)
        } catch {
          // Token invalid, clear it
          localStorage.removeItem('mindshield-token')
          setToken(null)
          setUser(null)
        }
      }
      setIsLoading(false)
    }
    loadUser()
  }, [token])

  const login = async (email: string, password: string) => {
    const res = await api.post('/auth/login', { email, password })
    const { token: newToken, user: newUser } = res.data
    localStorage.setItem('mindshield-token', newToken)
    setToken(newToken)
    setUser(newUser)
  }

  const signup = async (name: string, email: string, password: string) => {
    const res = await api.post('/auth/signup', { name, email, password })
    const { token: newToken, user: newUser } = res.data
    localStorage.setItem('mindshield-token', newToken)
    setToken(newToken)
    setUser(newUser)
  }

  const logout = () => {
    localStorage.removeItem('mindshield-token')
    setToken(null)
    setUser(null)
  }

  const updateProfile = async (data: { display_name?: string; preferred_language?: string }) => {
    const res = await api.put('/auth/profile', data)
    setUser(prev => prev ? { ...prev, ...res.data } : null)
  }

  return (
    <AuthContext.Provider value={{
      user, token, isAuthenticated: !!user, isLoading,
      login, signup, logout, updateProfile
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}

export { api as authApi }
export default AuthContext
