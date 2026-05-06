import { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'
import { initSocket, disconnectSocket } from '../utils/socket'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('nexus_token')
    const saved = localStorage.getItem('nexus_user')
    if (token && saved) {
      try {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
        setUser(JSON.parse(saved))
        initSocket(token)  // async — non-blocking
      } catch { localStorage.clear() }
    }
    setLoading(false)
  }, [])

  const _persist = ({ token, user: u }) => {
    localStorage.setItem('nexus_token', token)
    localStorage.setItem('nexus_user', JSON.stringify(u))
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
    setUser(u)
    initSocket(token)  // async
  }

  const login     = async (email, password)           => { const { data } = await axios.post('/api/auth/login',    { email, password });           _persist(data); return data }
  const register  = async (username, email, password) => { const { data } = await axios.post('/api/auth/register', { username, email, password }); _persist(data); return data }
  const guestLogin= async (username)                  => { const { data } = await axios.post('/api/auth/guest',    { username });                  _persist(data); return data }

  const logout = () => {
    localStorage.clear()
    delete axios.defaults.headers.common['Authorization']
    setUser(null)
    disconnectSocket()
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, guestLogin, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
