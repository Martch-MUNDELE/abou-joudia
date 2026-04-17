'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  active:   { bg: 'rgba(91,197,122,0.1)',  color: '#5BC57A' },
  blocked:  { bg: 'rgba(255,107,107,0.1)', color: '#FF6B6B' },
  suspended:{ bg: 'rgba(255,107,32,0.1)',  color: '#FF6B20' },
  deleted:  { bg: 'rgba(122,110,88,0.1)',  color: '#A89880' },
}

const ROLE_COLORS: Record<string, { bg: string; color: string }> = {
  superadmin: { bg: 'rgba(245,200,66,0.15)', color: '#F5C842' },
  admin:      { bg: 'rgba(56,182,255,0.1)',  color: '#38B6FF' },
}

function generatePassword() {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$'
  return Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

export default function SuperAdminPage() {
  const [admins, setAdmins] = useState<any[]>([])
  const [logs, setLogs] = useState<any[]>([])
  const [credentials, setCredentials] = useState<Record<string, string>>({})
  const [tab, setTab] = useState<'admins' | 'logs'>('admins')
  const [showNew, setShowNew] = useState(false)
  const [newEmail, setNewEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [autoGen, setAutoGen] = useState(true)
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')
  const [showPwd, setShowPwd] = useState<Record<string, boolean>>({})
  const [currentUser, setCurrentUser] = useState<any>(null)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setCurrentUser(data.user))
    load()
  }, [])

  const load = async () => {
    const [{ data: a }, { data: l }, { data: c }] = await Promise.all([
      supabase.from('admins').select('*').order('created_at', { ascending: false }),
      supabase.from('admin_logs').select('*').order('created_at', { ascending: false }).limit(50),
      supabase.from('admin_credentials').select('*'),
    ])
    setAdmins(a || [])
    setLogs(l || [])
    const cmap: Record<string, string> = {}
    ;(c || []).forEach((x: any) => { cmap[x.admin_id] = x.temp_password })
    setCredentials(cmap)
  }

  const logAction = async (action: string, targetEmail?: string, details?: string) => {
    await supabase.from('admin_logs').insert({
      action,
      performed_by: currentUser?.email || 'superadmin',
      target_email: targetEmail || null,
      details: details || null,
    })
  }

  const createAdmin = async () => {
    if (!newEmail) return
    const pwd = autoGen ? generatePassword() : newPassword
    if (!pwd || pwd.length < 8) { setMsg('Mot de passe trop court (min 8 caractères)'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/superadmin/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newEmail, password: pwd, performedBy: currentUser?.email }),
      })
      const data = await res.json()
      if (data.error) { setMsg(data.error); return }
      setMsg(`✅ Admin créé — Mot de passe : ${pwd}`)
      setShowNew(false)
      setNewEmail('')
      setNewPassword('')
      load()
    } catch (e) { setMsg('Erreur création') }
    setLoading(false)
  }

  const blockAdmin = async (admin: any) => {
    if (!confirm(`Bloquer ${admin.email} ?`)) return
    await fetch('/api/superadmin/block', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ adminId: admin.id, performedBy: currentUser?.email }) })
    await load()
  }

  const unblockAdmin = async (admin: any) => {
    await fetch('/api/superadmin/unblock', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ adminId: admin.id, performedBy: currentUser?.email }) })
    await load()
  }

  const resetPassword = async (admin: any) => {
    if (!confirm(`Réinitialiser le mot de passe de ${admin.email} ?`)) return
    const newPwd = generatePassword()
    await fetch('/api/superadmin/reset-password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ adminId: admin.id, newPassword: newPwd, performedBy: currentUser?.email }) })
    setMsg(`🔑 Nouveau mot de passe pour ${admin.email} : ${newPwd}`)
    await load()
  }

  const deleteAdmin = async (admin: any) => {
    if (!confirm(`Supprimer définitivement ${admin.email} ? Cette action est irréversible.`)) return
    await fetch('/api/superadmin/delete', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ adminId: admin.id, performedBy: currentUser?.email }) })
    await load()
  }

  const sendCredentials = async (admin: any) => {
    const pwd = credentials[admin.id]
    if (!pwd) { setMsg('Aucun mot de passe temporaire disponible'); return }
    await fetch('/api/superadmin/send-credentials', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: admin.email, password: pwd }) })
    setMsg(`📧 Identifiants envoyés à ${admin.email}`)
  }

  const inputStyle = { width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid rgba(232,160,32,0.2)', background: 'rgba(255,255,255,0.03)', color: '#F5EDD6', fontSize: 13, outline: 'none', fontFamily: 'DM Sans, sans-serif', boxSizing: 'border-box' as const }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '24px 16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 24, fontWeight: 900, color: '#F5C842', margin: 0 }}>Super Admin</h1>
          <div style={{ fontSize: 11, color: '#A89880', marginTop: 4 }}>Accès restreint · {currentUser?.email}</div>
        </div>
        <button onClick={() => { setShowNew(true); if (autoGen) setNewPassword(generatePassword()) }} style={{ padding: '9px 18px', borderRadius: 50, border: 'none', background: 'linear-gradient(135deg,#F5C842,#FF6B20)', color: '#0A0804', fontFamily: 'DM Sans, sans-serif', fontWeight: 800, fontSize: 12, cursor: 'pointer' }}>
          + Nouvel admin
        </button>
      </div>

      {/* MESSAGE */}
      {msg && (
        <div style={{ background: 'rgba(232,160,32,0.08)', border: '1px solid rgba(232,160,32,0.2)', borderRadius: 12, padding: '12px 16px', marginBottom: 16, fontSize: 13, color: '#F5C842', fontFamily: 'DM Sans, sans-serif', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>{msg}</span>
          <button onClick={() => setMsg('')} style={{ background: 'none', border: 'none', color: '#A89880', cursor: 'pointer', fontSize: 16 }}>×</button>
        </div>
      )}

      {/* MODAL NOUVEL ADMIN */}
      {showNew && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 16 }}>
          <div style={{ background: '#131009', border: '1px solid rgba(232,160,32,0.2)', borderRadius: 20, width: '100%', maxWidth: 440, padding: 28 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 18, color: '#F5EDD6', margin: 0 }}>Nouvel administrateur</h2>
              <button onClick={() => setShowNew(false)} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 50, width: 32, height: 32, color: '#A89880', cursor: 'pointer', fontSize: 16 }}>×</button>
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: '#A89880', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.8px' }}>Email</label>
              <input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder="admin@example.com" style={inputStyle} />
            </div>

            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#A89880', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Mot de passe</label>
                <button onClick={() => setAutoGen(v => !v)} style={{ fontSize: 10, padding: '3px 10px', borderRadius: 50, border: '1px solid rgba(232,160,32,0.2)', background: autoGen ? 'rgba(232,160,32,0.1)' : 'transparent', color: autoGen ? '#E8A020' : '#A89880', cursor: 'pointer', fontWeight: 600 }}>
                  {autoGen ? 'Auto' : 'Manuel'}
                </button>
                {autoGen && <button onClick={() => setNewPassword(generatePassword())} style={{ fontSize: 10, padding: '3px 10px', borderRadius: 50, border: '1px solid rgba(232,160,32,0.1)', background: 'transparent', color: '#A89880', cursor: 'pointer' }}>↻ Générer</button>}
              </div>
              {autoGen ? (
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <div style={{ flex: 1, padding: '10px 14px', borderRadius: 10, border: '1px solid rgba(232,160,32,0.2)', background: 'rgba(232,160,32,0.04)', color: '#F5C842', fontSize: 13, fontFamily: 'monospace', letterSpacing: 1 }}>{newPassword || '—'}</div>
                  <button onClick={() => { navigator.clipboard.writeText(newPassword); setMsg('Mot de passe copié !') }} style={{ padding: '10px 14px', borderRadius: 10, border: '1px solid rgba(232,160,32,0.15)', background: 'transparent', color: '#E8A020', cursor: 'pointer', fontSize: 11, fontWeight: 600 }}>Copier</button>
                </div>
              ) : (
                <input type="text" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Min. 8 caractères" style={inputStyle} />
              )}
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setShowNew(false)} style={{ flex: 1, padding: '11px', borderRadius: 50, border: '1px solid rgba(255,255,255,0.08)', background: 'transparent', color: '#A89880', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', fontWeight: 700, fontSize: 13 }}>Annuler</button>
              <button onClick={createAdmin} disabled={loading} style={{ flex: 2, padding: '11px', borderRadius: 50, border: 'none', background: 'linear-gradient(135deg,#F5C842,#FF6B20)', color: '#0A0804', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', fontWeight: 800, fontSize: 13 }}>
                {loading ? 'Création...' : 'Créer l\'admin'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TABS */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {(['admins', 'logs'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ padding: '7px 16px', borderRadius: 50, border: '1px solid', borderColor: tab === t ? 'rgba(232,160,32,0.4)' : 'rgba(232,160,32,0.12)', background: tab === t ? 'rgba(232,160,32,0.12)' : 'transparent', color: tab === t ? '#E8A020' : '#A89880', cursor: 'pointer', fontSize: 12, fontWeight: 600, fontFamily: 'DM Sans, sans-serif' }}>
            {t === 'admins' ? `Administrateurs (${admins.filter(a => a.status !== 'deleted').length})` : 'Journal'}
          </button>
        ))}
      </div>

      {/* LISTE ADMINS */}
      {tab === 'admins' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {admins.filter(a => a.status !== 'deleted').map(admin => {
            const sc = STATUS_COLORS[admin.status] || STATUS_COLORS.active
            const rc = ROLE_COLORS[admin.role] || ROLE_COLORS.admin
            const pwd = credentials[admin.id]
            return (
              <div key={admin.id} style={{ background: '#131009', border: '1px solid rgba(232,160,32,0.1)', borderRadius: 14, padding: '16px 18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: '#F5EDD6', marginBottom: 4 }}>{admin.email}</div>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 10px', borderRadius: 50, background: rc.bg, color: rc.color }}>{admin.role}</span>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 10px', borderRadius: 50, background: sc.bg, color: sc.color }}>{admin.status}</span>
                    </div>
                  </div>
                  <div style={{ fontSize: 10, color: '#4A4030', textAlign: 'right' }}>
                    <div>Créé {new Date(admin.created_at).toLocaleDateString('fr-FR')}</div>
                    {admin.last_login && <div>Connecté {new Date(admin.last_login).toLocaleDateString('fr-FR')}</div>}
                  </div>
                </div>

                {/* Mot de passe temporaire */}
                {pwd && admin.role !== 'superadmin' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, padding: '8px 12px', background: 'rgba(232,160,32,0.04)', border: '1px solid rgba(232,160,32,0.1)', borderRadius: 8 }}>
                    <span style={{ fontSize: 11, color: '#A89880' }}>Mot de passe :</span>
                    <span style={{ fontFamily: 'monospace', fontSize: 12, color: showPwd[admin.id] ? '#F5C842' : '#3A3020', letterSpacing: 1 }}>
                      {showPwd[admin.id] ? pwd : '••••••••••••'}
                    </span>
                    <button onClick={() => setShowPwd(p => ({ ...p, [admin.id]: !p[admin.id] }))} style={{ fontSize: 10, padding: '2px 8px', borderRadius: 50, border: '1px solid rgba(232,160,32,0.15)', background: 'transparent', color: '#A89880', cursor: 'pointer' }}>
                      {showPwd[admin.id] ? 'Masquer' : 'Voir'}
                    </button>
                    <button onClick={() => { navigator.clipboard.writeText(pwd); setMsg('Copié !') }} style={{ fontSize: 10, padding: '2px 8px', borderRadius: 50, border: '1px solid rgba(232,160,32,0.15)', background: 'transparent', color: '#E8A020', cursor: 'pointer' }}>Copier</button>
                  </div>
                )}

                {/* Actions */}
                {admin.role !== 'superadmin' && (
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {admin.status === 'active' ? (
                      <button onClick={() => blockAdmin(admin)} style={{ padding: '5px 12px', borderRadius: 50, border: '1px solid rgba(255,107,107,0.25)', background: 'rgba(255,107,107,0.06)', color: '#FF6B6B', fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>Bloquer</button>
                    ) : admin.status === 'blocked' ? (
                      <button onClick={() => unblockAdmin(admin)} style={{ padding: '5px 12px', borderRadius: 50, border: '1px solid rgba(91,197,122,0.25)', background: 'rgba(91,197,122,0.06)', color: '#5BC57A', fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>Débloquer</button>
                    ) : null}
                    <button onClick={() => resetPassword(admin)} style={{ padding: '5px 12px', borderRadius: 50, border: '1px solid rgba(232,160,32,0.2)', background: 'rgba(232,160,32,0.06)', color: '#E8A020', fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>Reset pwd</button>
                    <button onClick={() => sendCredentials(admin)} style={{ padding: '5px 12px', borderRadius: 50, border: '1px solid rgba(56,182,255,0.2)', background: 'rgba(56,182,255,0.06)', color: '#38B6FF', fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>Envoyer par mail</button>
                    <button onClick={() => deleteAdmin(admin)} style={{ padding: '5px 12px', borderRadius: 50, border: '1px solid rgba(255,107,107,0.15)', background: 'transparent', color: '#A89880', fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>Supprimer</button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* JOURNAL */}
      {tab === 'logs' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {logs.map(log => (
            <div key={log.id} style={{ background: '#131009', border: '1px solid rgba(232,160,32,0.08)', borderRadius: 12, padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 10px', borderRadius: 50, background: 'rgba(232,160,32,0.08)', color: '#E8A020', marginRight: 8 }}>{log.action}</span>
                {log.target_email && <span style={{ fontSize: 12, color: '#C8B890' }}>{log.target_email}</span>}
                {log.details && <div style={{ fontSize: 11, color: '#A89880', marginTop: 4 }}>{log.details}</div>}
              </div>
              <div style={{ fontSize: 10, color: '#4A4030', textAlign: 'right', flexShrink: 0, marginLeft: 12 }}>
                <div>{new Date(log.created_at).toLocaleDateString('fr-FR')}</div>
                <div>{new Date(log.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</div>
              </div>
            </div>
          ))}
          {logs.length === 0 && <div style={{ textAlign: 'center', color: '#A89880', padding: '40px 0', fontSize: 14 }}>Aucune action enregistrée</div>}
        </div>
      )}
    </div>
  )
}
