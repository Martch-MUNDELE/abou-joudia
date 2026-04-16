'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const labelStyle = { fontSize: 11, fontWeight: 700, color: '#7A6E58', display: 'block', marginBottom: 6, textTransform: 'uppercase' as const, letterSpacing: '0.8px' }
const inputStyle = { width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid rgba(232,160,32,0.2)', background: 'rgba(255,255,255,0.03)', color: '#F5EDD6', fontSize: 13, outline: 'none', fontFamily: 'DM Sans, sans-serif', boxSizing: 'border-box' as const }

export default function SettingsAdmin() {
  const [status, setStatus] = useState('open')
  const [statusMessage, setStatusMessage] = useState('')
  const [heroImage, setHeroImage] = useState('')
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    supabase.from('settings').select('*').then(({ data }) => {
      data?.forEach((s: any) => {
        if (s.key === 'status') setStatus(s.value)
        if (s.key === 'status_message') setStatusMessage(s.value)
        if (s.key === 'hero_image') setHeroImage(s.value)
      })
    })
  }, [])

  const uploadHeroImage = async (file: File) => {
    setUploading(true)
    const ext = file.name.split('.').pop()
    const fileName = `hero.${ext}`
    const { error } = await supabase.storage.from('products').upload(fileName, file, { upsert: true })
    if (!error) {
      const { data } = supabase.storage.from('products').getPublicUrl(fileName)
      setHeroImage(data.publicUrl)
    }
    setUploading(false)
  }

  const save = async () => {
    setSaving(true)
    await Promise.all([
      supabase.from('settings').upsert({ key: 'status', value: status }),
      supabase.from('settings').upsert({ key: 'status_message', value: statusMessage }),
      supabase.from('settings').upsert({ key: 'hero_image', value: heroImage }),
    ])
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div style={{ maxWidth: 560, margin: '0 auto' }}>
      <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 26, fontWeight: 900, color: '#F5EDD6', marginBottom: 28 }}>Paramètres</h1>

      {/* STATUT */}
      <div style={{ background: '#131009', border: '1px solid rgba(232,160,32,0.12)', borderRadius: 16, padding: '22px 24px', marginBottom: 14 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#7A6E58', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 16 }}>Statut du service</div>
        <div style={{ display: 'flex', gap: 10, marginBottom: 18 }}>
          <button
            onClick={() => setStatus('open')}
            style={{ flex: 1, padding: '12px', borderRadius: 10, border: '1px solid', borderColor: status === 'open' ? 'rgba(91,197,122,0.4)' : 'rgba(255,255,255,0.06)', background: status === 'open' ? 'rgba(91,197,122,0.12)' : 'transparent', color: status === 'open' ? '#5BC57A' : '#7A6E58', fontFamily: 'DM Sans, sans-serif', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}
          >
            Ouvert
          </button>
          <button
            onClick={() => setStatus('closed')}
            style={{ flex: 1, padding: '12px', borderRadius: 10, border: '1px solid', borderColor: status === 'closed' ? 'rgba(255,107,107,0.4)' : 'rgba(255,255,255,0.06)', background: status === 'closed' ? 'rgba(255,107,107,0.12)' : 'transparent', color: status === 'closed' ? '#FF6B6B' : '#7A6E58', fontFamily: 'DM Sans, sans-serif', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}
          >
            Fermé
          </button>
        </div>
        <label style={labelStyle}>Message affiché aux clients</label>
        <input
          type="text"
          value={statusMessage}
          onChange={e => setStatusMessage(e.target.value)}
          placeholder="Ex: Fermé · Reprise bientôt..."
          style={inputStyle}
        />
      </div>

      {/* HERO IMAGE */}
      <div style={{ background: '#131009', border: '1px solid rgba(232,160,32,0.12)', borderRadius: 16, padding: '22px 24px', marginBottom: 20 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#7A6E58', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 16 }}>Image Hero (page d'accueil)</div>
        {heroImage && (
          <div style={{ marginBottom: 14, borderRadius: 12, overflow: 'hidden', height: 180, position: 'relative' }}>
            <img src={heroImage} alt="Hero" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <button
              onClick={() => setHeroImage('')}
              style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.6)', color: '#F5EDD6', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '4px 12px', fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}
            >
              Supprimer
            </button>
          </div>
        )}
        <label style={{ display: 'block', width: '100%', padding: '18px', borderRadius: 10, border: '1.5px dashed rgba(232,160,32,0.25)', background: 'rgba(232,160,32,0.03)', color: uploading ? '#7A6E58' : '#E8A020', cursor: uploading ? 'wait' : 'pointer', textAlign: 'center', fontSize: 12, fontWeight: 600, fontFamily: 'DM Sans, sans-serif', boxSizing: 'border-box' as const }}>
          {uploading ? 'Upload en cours...' : 'Choisir une photo depuis votre tel ou ordinateur'}
          <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => { if (e.target.files?.[0]) uploadHeroImage(e.target.files[0]) }} />
        </label>
      </div>

      {/* SAVE */}
      <button
        onClick={save}
        disabled={saving}
        style={{ width: '100%', padding: '14px', background: saved ? 'rgba(91,197,122,0.15)' : 'linear-gradient(135deg,#F5C842,#FF6B20)', color: saved ? '#5BC57A' : '#0A0804', border: saved ? '1px solid rgba(91,197,122,0.3)' : 'none', borderRadius: 50, fontFamily: 'DM Sans, sans-serif', fontWeight: 800, fontSize: 14, cursor: saving ? 'wait' : 'pointer' }}
      >
        {saved ? 'Enregistré' : saving ? 'Enregistrement...' : 'Enregistrer'}
      </button>
    </div>
  )
}
