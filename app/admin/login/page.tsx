'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const login = async () => {
    setLoading(true); setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError('Email ou mot de passe incorrect')
    else router.push('/admin')
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F5F5F0' }}>
      <div className="card" style={{ padding: 40, width: '100%', maxWidth: 380 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🥙</div>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 22, fontWeight: 800 }}>Admin Abou Joudia</h1>
        </div>
        {error && <div style={{ background: '#FEE2E2', color: '#991B1B', padding: '10px 16px', borderRadius: 10, marginBottom: 16, fontSize: 14 }}>{error}</div>}
        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} style={{ width: '100%', padding: '14px 16px', borderRadius: 12, border: '1.5px solid #E5E7EB', fontSize: 15, marginBottom: 12, fontFamily: 'DM Sans, sans-serif', boxSizing: 'border-box' }} />
        <input type="password" placeholder="Mot de passe" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && login()} style={{ width: '100%', padding: '14px 16px', borderRadius: 12, border: '1.5px solid #E5E7EB', fontSize: 15, marginBottom: 20, fontFamily: 'DM Sans, sans-serif', boxSizing: 'border-box' }} />
        <button className="btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={login} disabled={loading}>
          {loading ? 'Connexion...' : 'Se connecter'}
        </button>
      </div>
    </div>
  )
}
