import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function AuthPage() {
  const { login, register, guestLogin } = useAuth()
  const navigate = useNavigate()
  const [mode, setMode] = useState('login') // login | register | guest
  const [form, setForm] = useState({ username: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    setError(''); setLoading(true)
    try {
      if (mode === 'guest') {
        await guestLogin(form.username)
      } else if (mode === 'login') {
        await login(form.email, form.password)
      } else {
        await register(form.username, form.email, form.password)
      }
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.root}>
      {/* Background grid */}
      <div style={styles.grid} />
      <div style={styles.glow} />

      <div style={styles.box} className="fade-up">
        {/* Logo */}
        <div style={styles.logo}>
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <rect width="32" height="32" rx="8" fill="#4f8cff" fillOpacity="0.15"/>
            <path d="M8 16 L16 8 L24 16 L16 24 Z" stroke="#4f8cff" strokeWidth="1.5" fill="none"/>
            <circle cx="16" cy="16" r="3" fill="#4f8cff"/>
          </svg>
          <span style={styles.logoText}>NEXUS</span>
        </div>

        <h1 style={styles.heading}>
          {mode === 'login' ? 'Welcome back' : mode === 'register' ? 'Create account' : 'Quick join'}
        </h1>
        <p style={styles.sub}>
          {mode === 'login' ? 'Sign in to your workspace' : mode === 'register' ? 'Start collaborating instantly' : 'Join as a guest — no account needed'}
        </p>

        {/* Mode tabs */}
        <div style={styles.tabs}>
          {['login','register','guest'].map(m => (
            <button key={m} onClick={() => { setMode(m); setError('') }}
              style={{ ...styles.tab, ...(mode === m ? styles.tabActive : {}) }}>
              {m === 'login' ? 'Sign In' : m === 'register' ? 'Register' : 'Guest'}
            </button>
          ))}
        </div>

        <form onSubmit={submit} style={styles.form}>
          {(mode === 'register' || mode === 'guest') && (
            <div style={styles.field}>
              <label style={styles.label}>Username</label>
              <input className="input" placeholder="cooluser42" value={form.username} onChange={set('username')} required />
            </div>
          )}
          {mode !== 'guest' && (
            <div style={styles.field}>
              <label style={styles.label}>Email</label>
              <input className="input" type="email" placeholder="you@example.com" value={form.email} onChange={set('email')} required />
            </div>
          )}
          {mode !== 'guest' && (
            <div style={styles.field}>
              <label style={styles.label}>Password</label>
              <input className="input" type="password" placeholder="••••••••" value={form.password} onChange={set('password')} required minLength={6} />
            </div>
          )}

          {error && <p style={styles.error}>{error}</p>}

          <button className="btn btn-primary" type="submit" disabled={loading} style={{ width:'100%', marginTop: 4, height: 44 }}>
            {loading ? <span className="spinner" style={{width:18,height:18}}/> : (
              mode === 'login' ? 'Sign In →' : mode === 'register' ? 'Create Account →' : 'Join as Guest →'
            )}
          </button>
        </form>

        <p style={styles.hint}>
          {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
          <span style={styles.hintLink} onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>
            {mode === 'login' ? 'Register' : 'Sign In'}
          </span>
        </p>
      </div>
    </div>
  )
}

const styles = {
  root: {
    height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'var(--bg-void)', position: 'relative', overflow: 'hidden',
  },
  grid: {
    position: 'absolute', inset: 0,
    backgroundImage: 'linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)',
    backgroundSize: '48px 48px', opacity: 0.4,
  },
  glow: {
    position: 'absolute', top: '30%', left: '50%', transform: 'translate(-50%,-50%)',
    width: 600, height: 600,
    background: 'radial-gradient(circle, rgba(79,140,255,0.08) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  box: {
    position: 'relative', zIndex: 1,
    width: '100%', maxWidth: 400,
    background: 'var(--bg-surface)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-xl)',
    padding: '36px 32px',
    boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
  },
  logo: {
    display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28,
  },
  logoText: {
    fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18,
    letterSpacing: '0.12em', color: 'var(--text-primary)',
  },
  heading: { fontSize: 24, fontWeight: 700, marginBottom: 6 },
  sub: { color: 'var(--text-secondary)', marginBottom: 24, fontSize: 13 },
  tabs: {
    display: 'flex', gap: 2, background: 'var(--bg-deep)',
    borderRadius: 'var(--radius-md)', padding: 3, marginBottom: 24,
  },
  tab: {
    flex: 1, padding: '7px 0', borderRadius: 8, border: 'none',
    background: 'transparent', color: 'var(--text-secondary)',
    cursor: 'pointer', fontSize: 12, fontWeight: 600,
    fontFamily: 'var(--font-display)', transition: 'all 0.15s',
  },
  tabActive: {
    background: 'var(--bg-elevated)', color: 'var(--text-primary)',
    boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
  },
  form: { display: 'flex', flexDirection: 'column', gap: 14 },
  field: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: { fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '0.04em' },
  error: {
    color: 'var(--red)', fontSize: 12, padding: '8px 12px',
    background: 'var(--red-glow)', borderRadius: 'var(--radius-sm)',
    border: '1px solid rgba(255,79,106,0.2)',
  },
  hint: { marginTop: 20, textAlign: 'center', fontSize: 12, color: 'var(--text-muted)' },
  hintLink: { color: 'var(--accent)', cursor: 'pointer', fontWeight: 600 },
}
