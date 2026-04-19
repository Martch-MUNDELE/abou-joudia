'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const labelStyle = { fontSize: 11, fontWeight: 700, color: '#C8B99A', display: 'block', marginBottom: 6, textTransform: 'uppercase' as const, letterSpacing: '0.8px' }
const inputStyle = { width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid rgba(232,160,32,0.2)', background: 'rgba(255,255,255,0.03)', color: '#F5EDD6', fontSize: 13, outline: 'none', fontFamily: 'DM Sans, sans-serif', boxSizing: 'border-box' as const }

type Feature = { icon: string; title: string; desc: string }

const ICON_OPTIONS = [
  { value: 'chef', label: 'Toque — Chef' },
  { value: 'delivery', label: 'Scooter — Livraison' },
  { value: 'fresh', label: 'Panier — Frais' },
  { value: 'star', label: 'Étoile' },
  { value: 'clock', label: 'Horloge' },
  { value: 'heart', label: 'Cœur' },
  { value: 'shield', label: 'Bouclier qualité' },
  { value: 'fire', label: 'Flamme' },
]

export default function SettingsAdmin() {
  const [status, setStatus] = useState('open')
  const [statusMessage, setStatusMessage] = useState('')
  const [heroImage, setHeroImage] = useState('')
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [siteName, setSiteName] = useState('Abou Joudia')
  const [siteBaseline, setSiteBaseline] = useState('AGADIR · LIVRAISON')
  const [siteLogo, setSiteLogo] = useState('')
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [logoDimensions, setLogoDimensions] = useState<{w:number,h:number}|null>(null)
  const [feature1, setFeature1] = useState<Feature>({ icon: 'chef', title: 'Préparé à Agadir', desc: 'Par chez vous à Agadir, repas cuisinés avec soin par nos équipes.' })
  const [feature2, setFeature2] = useState<Feature>({ icon: 'delivery', title: 'Livraison rapide', desc: 'On vous livre rapidement et directement à votre porte.' })
  const [feature3, setFeature3] = useState<Feature>({ icon: 'fresh', title: 'Frais du jour', desc: 'Profitez de produits toujours frais, choisis chaque jour.' })
  const supabase = createClient()

  useEffect(() => {
    supabase.from('settings').select('*').then(({ data }) => {
      data?.forEach((s: any) => {
        if (s.key === 'status') setStatus(s.value)
        if (s.key === 'status_message') setStatusMessage(s.value)
        if (s.key === 'hero_image') setHeroImage(s.value)
        if (s.key === 'site_name') setSiteName(s.value)
        if (s.key === 'site_baseline') setSiteBaseline(s.value)
        if (s.key === 'site_logo') setSiteLogo(s.value)
        if (s.key === 'feature_1') { try { setFeature1(JSON.parse(s.value)) } catch {} }
        if (s.key === 'feature_2') { try { setFeature2(JSON.parse(s.value)) } catch {} }
        if (s.key === 'feature_3') { try { setFeature3(JSON.parse(s.value)) } catch {} }
      })
    })
  }, [])

  const uploadLogo = async (file: File) => {
    const previewUrl = URL.createObjectURL(file)
    setSiteLogo(previewUrl)
    const img = new Image()
    img.onload = () => setLogoDimensions({w: img.naturalWidth, h: img.naturalHeight})
    img.src = previewUrl
    setUploadingLogo(true)
    const ext = file.name.split('.').pop()
    const fileName = `logo-abou-joudia-${Date.now()}.${ext}`
    const { error } = await supabase.storage.from('products').upload(fileName, file, { upsert: true })
    if (!error) {
      const { data } = supabase.storage.from('products').getPublicUrl(fileName)
      setSiteLogo(data.publicUrl)
      await supabase.from('settings').upsert({ key: 'site_logo', value: data.publicUrl })
    }
    setUploadingLogo(false)
  }

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
      supabase.from('settings').upsert({ key: 'site_name', value: siteName }),
      supabase.from('settings').upsert({ key: 'site_baseline', value: siteBaseline }),
      supabase.from('settings').upsert({ key: 'site_logo', value: siteLogo }),
      supabase.from('settings').upsert({ key: 'feature_1', value: JSON.stringify(feature1) }),
      supabase.from('settings').upsert({ key: 'feature_2', value: JSON.stringify(feature2) }),
      supabase.from('settings').upsert({ key: 'feature_3', value: JSON.stringify(feature3) }),
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
        <div style={{ fontSize: 11, fontWeight: 700, color: '#C8B99A', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 16 }}>Statut du service</div>
        <div style={{ display: 'flex', gap: 10, marginBottom: 18 }}>
          <button
            onClick={() => setStatus('open')}
            style={{ flex: 1, padding: '12px', borderRadius: 10, border: '1px solid', borderColor: status === 'open' ? 'rgba(91,197,122,0.4)' : 'rgba(255,255,255,0.06)', background: status === 'open' ? 'rgba(91,197,122,0.12)' : 'transparent', color: status === 'open' ? '#5BC57A' : '#C8B99A', fontFamily: 'DM Sans, sans-serif', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}
          >
            Ouvert
          </button>
          <button
            onClick={() => setStatus('closed')}
            style={{ flex: 1, padding: '12px', borderRadius: 10, border: '1px solid', borderColor: status === 'closed' ? 'rgba(255,107,107,0.4)' : 'rgba(255,255,255,0.06)', background: status === 'closed' ? 'rgba(255,107,107,0.12)' : 'transparent', color: status === 'closed' ? '#FF6B6B' : '#C8B99A', fontFamily: 'DM Sans, sans-serif', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}
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

      {/* IDENTITE DU SITE */}
      <div style={{ background: '#131009', border: '1px solid rgba(232,160,32,0.12)', borderRadius: 16, padding: '22px 24px', marginBottom: 14 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#C8B99A', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 16 }}>Identité du site</div>

        {/* Logo */}
        <label style={labelStyle}>Logo</label>
        {siteLogo && (
          <div style={{ marginBottom: 12, borderRadius: 12, overflow: 'hidden', height: 350, background: '#0A0804', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
            <img src={siteLogo} alt="Logo" style={{ width: '320px', height: '320px', objectFit: 'contain' }} />
            <button onClick={() => setSiteLogo('')} style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.6)', color: '#F5EDD6', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '4px 12px', fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>Supprimer</button>
          </div>
        )}
        <label style={{ display: 'block', width: '100%', padding: '14px', borderRadius: 10, border: '1.5px dashed rgba(232,160,32,0.25)', background: 'rgba(232,160,32,0.03)', color: uploadingLogo ? '#C8B99A' : '#E8A020', cursor: uploadingLogo ? 'wait' : 'pointer', textAlign: 'center', fontSize: 12, fontWeight: 600, fontFamily: 'DM Sans, sans-serif', boxSizing: 'border-box' as const, marginBottom: 14 }}>
          {uploadingLogo ? 'Upload en cours...' : 'Choisir le logo (PNG recommandé)'}
          <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => { if (e.target.files?.[0]) uploadLogo(e.target.files[0]) }} />
        {logoDimensions && <div style={{ fontSize: 11, color: '#5BC57A', marginTop: 6, fontFamily: 'DM Sans, sans-serif' }}>✓ {logoDimensions.w} × {logoDimensions.h} px</div>}
        </label>

        {/* Nom du site */}
        <label style={labelStyle}>Nom du site</label>
        <input type="text" value={siteName} onChange={e => setSiteName(e.target.value)} style={{ ...inputStyle, marginBottom: 14 }} />

        {/* Baseline */}
        <label style={labelStyle}>Baseline</label>
        <input type="text" value={siteBaseline} onChange={e => setSiteBaseline(e.target.value)} style={inputStyle} />
      </div>

      {/* HERO IMAGE */}
      <div style={{ background: '#131009', border: '1px solid rgba(232,160,32,0.12)', borderRadius: 16, padding: '22px 24px', marginBottom: 20 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#C8B99A', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 16 }}>Image Hero (page d'accueil)</div>
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
        <label style={{ display: 'block', width: '100%', padding: '18px', borderRadius: 10, border: '1.5px dashed rgba(232,160,32,0.25)', background: 'rgba(232,160,32,0.03)', color: uploading ? '#C8B99A' : '#E8A020', cursor: uploading ? 'wait' : 'pointer', textAlign: 'center', fontSize: 12, fontWeight: 600, fontFamily: 'DM Sans, sans-serif', boxSizing: 'border-box' as const }}>
          {uploading ? 'Upload en cours...' : 'Choisir une photo depuis votre tel ou ordinateur'}
          <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => { if (e.target.files?.[0]) uploadHeroImage(e.target.files[0]) }} />
        </label>
      </div>

      {/* ARGUMENTS PRODUIT */}
      <div style={{ background: '#131009', border: '1px solid rgba(232,160,32,0.12)', borderRadius: 16, padding: '22px 24px', marginBottom: 14 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#C8B99A', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 16 }}>Arguments produit</div>

        {/* Argument 1 */}
        <div style={{ marginBottom: 20, paddingBottom: 20, borderBottom: '1px solid rgba(232,160,32,0.08)' }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#E8A020', marginBottom: 10 }}>Argument 1</div>
          <label style={labelStyle}>Icône</label>
          <select value={feature1.icon} onChange={e => setFeature1({ ...feature1, icon: e.target.value })} style={{ ...inputStyle, marginBottom: 10, cursor: 'pointer' }}>
            {ICON_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <label style={labelStyle}>Titre</label>
          <input type="text" value={feature1.title} onChange={e => setFeature1({ ...feature1, title: e.target.value })} style={{ ...inputStyle, marginBottom: 10 }} />
          <label style={labelStyle}>Description</label>
          <textarea value={feature1.desc} onChange={e => setFeature1({ ...feature1, desc: e.target.value })} rows={2} style={{ ...inputStyle, resize: 'vertical' as const }} />
        </div>

        {/* Argument 2 */}
        <div style={{ marginBottom: 20, paddingBottom: 20, borderBottom: '1px solid rgba(232,160,32,0.08)' }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#E8A020', marginBottom: 10 }}>Argument 2</div>
          <label style={labelStyle}>Icône</label>
          <select value={feature2.icon} onChange={e => setFeature2({ ...feature2, icon: e.target.value })} style={{ ...inputStyle, marginBottom: 10, cursor: 'pointer' }}>
            {ICON_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <label style={labelStyle}>Titre</label>
          <input type="text" value={feature2.title} onChange={e => setFeature2({ ...feature2, title: e.target.value })} style={{ ...inputStyle, marginBottom: 10 }} />
          <label style={labelStyle}>Description</label>
          <textarea value={feature2.desc} onChange={e => setFeature2({ ...feature2, desc: e.target.value })} rows={2} style={{ ...inputStyle, resize: 'vertical' as const }} />
        </div>

        {/* Argument 3 */}
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#E8A020', marginBottom: 10 }}>Argument 3</div>
          <label style={labelStyle}>Icône</label>
          <select value={feature3.icon} onChange={e => setFeature3({ ...feature3, icon: e.target.value })} style={{ ...inputStyle, marginBottom: 10, cursor: 'pointer' }}>
            {ICON_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <label style={labelStyle}>Titre</label>
          <input type="text" value={feature3.title} onChange={e => setFeature3({ ...feature3, title: e.target.value })} style={{ ...inputStyle, marginBottom: 10 }} />
          <label style={labelStyle}>Description</label>
          <textarea value={feature3.desc} onChange={e => setFeature3({ ...feature3, desc: e.target.value })} rows={2} style={{ ...inputStyle, resize: 'vertical' as const }} />
        </div>
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
