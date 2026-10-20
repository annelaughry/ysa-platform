import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../AuthContext'
import api from '../api'

const PROGRAMS = [
  {
    value: 'stem_explorer',
    label: 'I am a STEM Explorer',
    note: 'For students on a YSA Explorer team.',
    color: 'var(--teal)', dark: 'var(--teal-dark)', light: 'var(--teal-light)',
  },
  {
    value: 'global_ambassador',
    label: 'I am a Global Ambassador',
    note: 'For students on a Global STEM Ambassadors (GSA) team.',
    color: 'var(--yellow)', dark: 'var(--yellow-dark)', light: 'var(--yellow-light)',
  },
]

export default function RegisterStudent() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [form, setForm] = useState({ first_name: '', last_name: '', username: '', password: '', classroom_code: '', program: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data } = await api.post('auth/register/student/', form)
      localStorage.setItem('access', data.access)
      localStorage.setItem('refresh', data.refresh)
      navigate('/student')
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page">
      <div className="container container--narrow">
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ color: 'var(--teal)' }}>Student Sign Up</h1>
          <p className="text-muted">Create your account and join your classroom.</p>
        </div>
        <div className="card">
          {error && <div className="form-error">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">First name</label>
                <input className="form-input" value={form.first_name} onChange={set('first_name')} autoFocus />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">Last name</label>
                <input className="form-input" value={form.last_name} onChange={set('last_name')} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Username</label>
              <input className="form-input" value={form.username} onChange={set('username')} autoComplete="username" />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input type="password" className="form-input" value={form.password} onChange={set('password')} autoComplete="new-password" />
            </div>
            <div className="form-group">
              <label className="form-label">Classroom code <span className="optional">(optional — can join later)</span></label>
              <input className="form-input" value={form.classroom_code} onChange={set('classroom_code')}
                     placeholder="e.g. A1B2C3" style={{ fontFamily: 'monospace', letterSpacing: '0.1em', textTransform: 'uppercase' }} />
            </div>
            <div className="form-group">
              <label className="form-label">YSA program <span className="optional">(optional — pick one if it applies)</span></label>
              {PROGRAMS.map(p => (
                <div key={p.value} style={{ marginBottom: '0.75rem', padding: '1rem', background: p.light, border: `2px solid ${p.color}`, borderRadius: 10 }}>
                  <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={form.program === p.value}
                      onChange={e => setForm(f => ({ ...f, program: e.target.checked ? p.value : '' }))}
                      style={{ accentColor: p.color, width: 18, height: 18, marginTop: 2, flexShrink: 0 }}
                    />
                    <div>
                      <div style={{ fontWeight: 800, color: p.dark, fontSize: '0.95rem' }}>{p.label}</div>
                      <div style={{ fontSize: '0.82rem', color: p.dark, marginTop: '0.2rem', opacity: 0.85 }}>{p.note}</div>
                    </div>
                  </label>
                </div>
              ))}
            </div>
            <button type="submit" className="btn btn--teal w-full" disabled={loading}>
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </form>
        </div>
        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
          <Link to="/login" style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Already have an account? Sign in</Link>
        </div>
      </div>
    </div>
  )
}
