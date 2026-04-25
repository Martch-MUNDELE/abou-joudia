'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { BILLING_MODE_LABELS, BILLING_STATUS_LABELS, type BillingMode, type ClientContract, type BillingPeriod } from '@/lib/types/billing'

const supabase = createClient()

function getMonthRange() {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10)
  const end   = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10)
  return { start, end }
}

export default function ContratsPage() {
  const [admins, setAdmins]       = useState<any[]>([])
  const [contracts, setContracts] = useState<ClientContract[]>([])
  const [periods, setPeriods]     = useState<BillingPeriod[]>([])
  const [selected, setSelected]   = useState<any>(null)
  const [mode, setMode]           = useState<BillingMode>('flat_only')
  const [flatFee, setFlatFee]     = useState('')
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10))
  const [saving, setSaving]       = useState(false)
  const [msg, setMsg]             = useState('')
  const [currentUser, setCurrentUser] = useState<any>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setCurrentUser(data.user))
    loadAll()
  }, [])

  const loadAll = async () => {
    const [{ data: a }, { data: c }, { data: p }] = await Promise.all([
      supabase.from('admins').select('*').eq('role', 'admin').order('created_at', { ascending: false }),
      supabase.from('client_contracts').select('*').eq('is_active', true),
      supabase.from('billing_periods').select('*').eq('status', 'en_cours'),
    ])
    setAdmins(a || [])
    setContracts(c || [])
    setPeriods(p || [])
  }

  const getContract = (adminId: string) =>
    contracts.find(c => c.client_id === adminId)

  const getPeriod = (adminId: string) =>
    periods.find(p => p.client_id === adminId)

  const selectAdmin = (admin: any) => {
    setSelected(admin)
    const existing = getContract(admin.id)
    if (existing) {
      setMode(existing.billing_mode)
      setFlatFee(String(existing.flat_fee_amount))
      setStartDate(existing.started_at)
    } else {
      setMode('flat_only')
      setFlatFee('')
      setStartDate(new Date().toISOString().slice(0, 10))
    }
    setMsg('')
  }

  const saveContract = async () => {
    if (!selected) return
    if (!flatFee || isNaN(Number(flatFee))) {
      setMsg('❌ Montant de l\'abonnement invalide')
      return
    }
    setSaving(true)
    try {
      const existing = getContract(selected.id)

      if (existing) {
        // Snapshot pour historique
        await supabase.from('contract_history').insert({
          contract_id: existing.id,
          changed_by: currentUser?.id,
          old_snapshot: existing,
          new_snapshot: { billing_mode: mode, flat_fee_amount: Number(flatFee) },
          reason: 'Modification via Super Admin',
        })
        await supabase.from('client_contracts')
          .update({ billing_mode: mode, flat_fee_amount: Number(flatFee), updated_at: new Date().toISOString() })
          .eq('id', existing.id)
        setMsg('✅ Contrat mis à jour')
      } else {
        // Nouveau contrat
        const { data: newContract, error } = await supabase
          .from('client_contracts')
          .insert({
            client_id: selected.id,
            started_at: startDate,
            billing_mode: mode,
            flat_fee_amount: Number(flatFee),
          })
          .select()
          .single()

        if (error || !newContract) throw error

        // Créer la période en cours
        const existingPeriod = getPeriod(selected.id)
        if (!existingPeriod) {
          const { start, end } = getMonthRange()
          await supabase.from('billing_periods').insert({
            client_id: selected.id,
            period_start: start,
            period_end: end,
            status: 'en_cours',
            flat_fee_amount: Number(flatFee),
          })
        }
        setMsg('✅ Contrat créé et période ouverte')
      }

      await loadAll()
    } catch (e) {
      setMsg('❌ Erreur lors de la sauvegarde')
    }
    setSaving(false)
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 14px', borderRadius: 10,
    border: '1px solid rgba(232,160,32,0.2)',
    background: 'rgba(255,255,255,0.03)',
    color: '#F5EDD6', fontSize: 13, outline: 'none',
    fontFamily: 'DM Sans, sans-serif', boxSizing: 'border-box',
  }

  const labelStyle: React.CSSProperties = {
    fontSize: 11, fontWeight: 700, color: '#C8B99A',
    display: 'block', marginBottom: 6,
    textTransform: 'uppercase', letterSpacing: '0.8px',
  }

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '24px 16px', fontFamily: 'DM Sans, sans-serif' }}>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <a href="/admin/superadmin" style={{ fontSize: 12, color: '#C8B99A', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
          ← Super Admin
        </a>
        <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 22, fontWeight: 900, color: '#F5C842', margin: 0 }}>
          Clients & Contrats
        </h1>
        <p style={{ fontSize: 12, color: '#C8B99A', marginTop: 4 }}>
          Associer un contrat de facturation à chaque client admin.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

        {/* Liste clients */}
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#C8B99A', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 10 }}>
            Clients ({admins.length})
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {admins.length === 0 && (
              <div style={{ color: '#7A6E58', fontSize: 13, padding: '20px 0' }}>Aucun client admin trouvé.</div>
            )}
            {admins.map(admin => {
              const contract = getContract(admin.id)
              const period   = getPeriod(admin.id)
              const isActive = selected?.id === admin.id
              return (
                <div
                  key={admin.id}
                  onClick={() => selectAdmin(admin)}
                  style={{
                    background: isActive ? 'rgba(232,160,32,0.08)' : '#131009',
                    border: `1px solid ${isActive ? 'rgba(232,160,32,0.4)' : 'rgba(232,160,32,0.1)'}`,
                    borderRadius: 12, padding: '14px 16px', cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                >
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#F5EDD6', marginBottom: 6 }}>
                    {admin.email}
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {contract ? (
                      <>
                        <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 50, background: 'rgba(91,197,122,0.1)', color: '#5BC57A' }}>
                          Contrat actif
                        </span>
                        <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 50, background: 'rgba(232,160,32,0.08)', color: '#E8A020' }}>
                          {contract.flat_fee_amount} MAD/mois
                        </span>
                      </>
                    ) : (
                      <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 50, background: 'rgba(255,107,107,0.08)', color: '#FF6B6B' }}>
                        Sans contrat
                      </span>
                    )}
                    {period && (
                      <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 50, background: 'rgba(56,182,255,0.08)', color: '#38B6FF' }}>
                        Période ouverte
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Formulaire contrat */}
        <div>
          {!selected ? (
            <div style={{ background: '#131009', border: '1px solid rgba(232,160,32,0.08)', borderRadius: 14, padding: '32px 20px', textAlign: 'center', color: '#7A6E58', fontSize: 13 }}>
              Sélectionne un client pour configurer son contrat.
            </div>
          ) : (
            <div style={{ background: '#131009', border: '1px solid rgba(232,160,32,0.12)', borderRadius: 14, padding: '20px' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#F5EDD6', marginBottom: 4 }}>{selected.email}</div>
              <div style={{ fontSize: 11, color: '#7A6E58', marginBottom: 20 }}>
                {getContract(selected.id) ? 'Modifier le contrat' : 'Créer un contrat'}
              </div>

              {msg && (
                <div style={{ background: msg.startsWith('✅') ? 'rgba(91,197,122,0.08)' : 'rgba(255,107,107,0.08)', border: `1px solid ${msg.startsWith('✅') ? 'rgba(91,197,122,0.2)' : 'rgba(255,107,107,0.2)'}`, borderRadius: 10, padding: '10px 14px', marginBottom: 16, fontSize: 12, color: msg.startsWith('✅') ? '#5BC57A' : '#FF6B6B' }}>
                  {msg}
                </div>
              )}

              {/* Mode de facturation */}
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Mode de facturation</label>
                <select
                  value={mode}
                  onChange={e => setMode(e.target.value as BillingMode)}
                  style={{ ...inputStyle, appearance: 'none' }}
                >
                  {(Object.entries(BILLING_MODE_LABELS) as [BillingMode, string][]).map(([key, label]) => (
                    <option key={key} value={key} style={{ background: '#131009' }}>{label}</option>
                  ))}
                </select>
              </div>

              {/* Abonnement fixe */}
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Abonnement fixe mensuel (MAD)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={flatFee}
                  onChange={e => setFlatFee(e.target.value)}
                  placeholder="Ex: 500"
                  style={inputStyle}
                />
              </div>

              {/* Date de début (nouveau contrat seulement) */}
              {!getContract(selected.id) && (
                <div style={{ marginBottom: 16 }}>
                  <label style={labelStyle}>Date de début</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    style={inputStyle}
                  />
                </div>
              )}

              {/* Info mode variable */}
              {mode !== 'flat_only' && (
                <div style={{ background: 'rgba(232,160,32,0.04)', border: '1px solid rgba(232,160,32,0.12)', borderRadius: 10, padding: '10px 14px', marginBottom: 16, fontSize: 11, color: '#C8B99A', lineHeight: 1.5 }}>
                  Les règles variables ({BILLING_MODE_LABELS[mode]}) seront configurables à l'étape 3.
                </div>
              )}

              <button
                onClick={saveContract}
                disabled={saving}
                style={{ width: '100%', padding: '12px', borderRadius: 50, border: 'none', background: saving ? 'rgba(232,160,32,0.3)' : 'linear-gradient(135deg,#F5C842,#FF6B20)', color: '#0A0804', fontFamily: 'DM Sans, sans-serif', fontWeight: 800, fontSize: 13, cursor: saving ? 'not-allowed' : 'pointer' }}
              >
                {saving ? 'Enregistrement...' : getContract(selected.id) ? 'Mettre à jour' : 'Créer le contrat'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
