'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useCart } from '@/store/cart'
import FeaturesBar from '@/components/FeaturesBar'
import SlotPicker from '@/components/SlotPicker'
import PhoneInput from '@/components/PhoneInput'

export default function PanierPage() {
  const { items, update, total, clear } = useCart()
  const router = useRouter()
  const [step, setStep] = useState<'cart' | 'info' | 'slot'>('cart')
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [orderError, setOrderError] = useState('')
  const [form, setForm] = useState(() => {
    if (typeof window === 'undefined') return { name: '', phone: '', address: '', note: '', email: '', wantFacture: false, lat: null as number | null, lng: null as number | null, geo_address: '' }
    try {
      const saved = localStorage.getItem('aj_customer')
      if (saved) {
        const parsed = JSON.parse(saved)
        return { ...parsed, lat: null, lng: null, geo_address: '' }
      }
    } catch {}
    return { name: '', phone: '', address: '', note: '', email: '', wantFacture: false, lat: null as number | null, lng: null as number | null, geo_address: '' }
  })
  const [geoLoading, setGeoLoading] = useState(false)

  // Sauvegarde auto dans localStorage
  const updateForm = (updater: (f: typeof form) => typeof form) => {
    setForm((prev: typeof form) => {
      const next = updater(prev)
      try { localStorage.setItem('aj_customer', JSON.stringify({ name: next.name, phone: next.phone, address: next.address, note: next.note, email: next.email, wantFacture: next.wantFacture })) } catch {}
      return next
    })
  }
  const [geoError, setGeoError] = useState('')

  const localize = () => {
    if (!navigator.geolocation) { setGeoError("Géolocalisation non supportée"); return }
    setGeoLoading(true); setGeoError('')
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=fr`, { headers: { 'User-Agent': 'AbouJoudia/1.0' } })
          const data = await res.json()
          updateForm(f => ({ ...f, lat, lng, address: data.display_name || '', geo_address: data.display_name || '' }))
        } catch { updateForm(f => ({ ...f, lat, lng })) }
        setGeoLoading(false)
      },
      (err) => { setGeoError(err.code === 1 ? "Accès refusé." : "Position introuvable."); setGeoLoading(false) },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  const handleOrder = async () => {
    if (!selectedSlot || !form.name || !form.phone || !form.address) return
    setLoading(true)
    try {
      const res = await fetch('/api/commandes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, slot_id: selectedSlot, items: items.map(i => ({ product_id: i.product.id, product_name: i.product.name, quantity: i.quantity, unit_price: i.product.price })), total: total() })
      })
      const data = await res.json()
      if (data.error) { setOrderError(data.error); setLoading(false); return }
      if (data.id) { clear(); router.push(`/confirmation/${data.id}`) }
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  useEffect(() => { if (items.length === 0) router.replace('/') }, [items.length, router])

  if (items.length === 0) return null

  const stepIndex = ['cart', 'info', 'slot'].indexOf(step)
  const stepLabels = ['Panier', 'Infos', 'Horaire']

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', paddingBottom: 100 }}>

      {/* HEADER */}
      <div style={{ padding: '24px 20px 20px' }}>
        <h1 style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 24, fontWeight: 800, color: '#F5EDD6', margin: '0 0 20px', letterSpacing: '-0.5px' }}>
          {step === 'cart' ? 'Mon panier' : step === 'info' ? 'Vos informations' : 'Quand livrer ?'}
        </h1>

        {/* STEPPER */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {stepLabels.map((label, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', flex: i < 2 ? 1 : 'none' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
                <div style={{ width: 30, height: 30, borderRadius: '50%', background: stepIndex >= i ? 'linear-gradient(135deg,#F5C842,#FF6B20)' : 'rgba(255,255,255,0.05)', border: stepIndex >= i ? 'none' : '1.5px solid rgba(232,160,32,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: stepIndex >= i ? '#0A0804' : '#C8B99A', transition: 'all 0.3s', fontFamily: 'DM Sans, sans-serif' }}>
                  {stepIndex > i ? '✓' : i + 1}
                </div>
                <div style={{ fontSize: 11, fontWeight: 600, color: stepIndex >= i ? '#E8A020' : '#C8B99A', letterSpacing: '0.3px', textTransform: 'none' as const, whiteSpace: 'nowrap' as const }}>{label}</div>
              </div>
              {i < 2 && <div style={{ flex: 1, height: 1.5, background: stepIndex > i ? 'linear-gradient(90deg,#F5C842,#FF6B20)' : 'rgba(232,160,32,0.1)', margin: '0 6px 16px', transition: 'background 0.3s', borderRadius: 2 }} />}
            </div>
          ))}
        </div>
      </div>

      {/* ══ STEP 1 — PANIER ══ */}
      {step === 'cart' && (
        <div style={{ padding: '0 20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {items.map((item, idx) => (
              <div key={item.product.id} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '13px 0', borderBottom: '1px solid rgba(232,160,32,0.06)' }}>
                {/* Image ronde */}
                <div style={{ width: 'clamp(44px, 12vw, 56px)', height: 'clamp(44px, 12vw, 56px)', borderRadius: '50%', overflow: 'hidden', flexShrink: 0, border: '2px solid rgba(232,160,32,0.15)' }}>
                  <img src={item.product.image_url} alt={item.product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>

                {/* Nom + prix */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, color: '#F5EDD6', marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{item.product.name}</div>
                  <div style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 700, fontSize: 14, color: '#F5C842' }}>{(item.product.price * item.quantity).toFixed(2)} DH</div>
                </div>

                {/* Contrôle quantité */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 0, background: 'rgba(255,255,255,0.04)', borderRadius: 50, border: '1px solid rgba(232,160,32,0.15)', flexShrink: 0 }}>
                  <button onClick={() => update(item.product.id, item.quantity - 1)} style={{ width: 32, height: 32, borderRadius: '50%', border: 'none', background: 'transparent', color: item.quantity === 1 ? '#FF6B6B' : '#C8B890', cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 500, lineHeight: 1 }}>
                    {item.quantity === 1 ? '×' : '−'}
                  </button>
                  <span style={{ fontWeight: 800, fontSize: 14, color: '#F5EDD6', minWidth: 20, textAlign: 'center' as const, fontFamily: 'DM Sans, sans-serif' }}>{item.quantity}</span>
                  <button onClick={() => update(item.product.id, item.quantity + 1)} style={{ width: 32, height: 32, borderRadius: '50%', border: 'none', background: 'linear-gradient(135deg,#F5C842,#FF6B20)', color: '#0A0804', cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, lineHeight: 1 }}>+</button>
                </div>
              </div>
            ))}
          </div>

          {/* Livraison gratuite */}
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid rgba(232,160,32,0.06)', fontSize: 12, color: '#C8B99A' }}>
            <span>Livraison</span>
            <span style={{ color: '#7DD87A', fontWeight: 600 }}>Gratuite</span>
          </div>
        </div>
      )}

      {/* ══ STEP 2 — INFOS ══ */}
      {step === 'info' && (
        <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#C8B99A', textTransform: 'uppercase' as const, letterSpacing: '0.8px', marginBottom: 8 }}>Nom complet <span style={{ color: '#FF6B20' }}>*</span></label>
            <input type="text" placeholder="Mohamed Amine..." value={form.name} onChange={e => updateForm(f => ({ ...f, name: e.target.value }))} style={{ width: '100%', padding: '13px 16px', borderRadius: 12, border: `1.5px solid ${form.name ? 'rgba(232,160,32,0.4)' : 'rgba(232,160,32,0.15)'}`, background: 'rgba(255,255,255,0.03)', color: '#F5EDD6', fontFamily: 'DM Sans, sans-serif', fontSize: 14, outline: 'none', boxSizing: 'border-box' as const }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#C8B99A', textTransform: 'uppercase' as const, letterSpacing: '0.8px', marginBottom: 8 }}>Téléphone <span style={{ color: '#FF6B20' }}>*</span></label>
            <div style={{ display: 'flex', gap: 8 }}><PhoneInput value={form.phone} initialValue={form.phone} onChange={v => updateForm(f => ({ ...f, phone: v }))} /></div>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#C8B99A', textTransform: 'uppercase' as const, letterSpacing: '0.8px', marginBottom: 8 }}>Adresse de livraison <span style={{ color: '#FF6B20' }}>*</span></label>
            <button type="button" onClick={localize} disabled={geoLoading} style={{ width: '100%', padding: '13px 16px', borderRadius: 12, border: '1.5px dashed rgba(232,160,32,0.3)', background: form.lat ? 'rgba(125,216,122,0.06)' : 'rgba(232,160,32,0.04)', color: form.lat ? '#7DD87A' : '#E8A020', cursor: geoLoading ? 'wait' : 'pointer', fontSize: 13, fontWeight: 600, textAlign: 'center' as const, marginBottom: 10, fontFamily: 'DM Sans, sans-serif', boxSizing: 'border-box' as const }}>
              {geoLoading ? 'Localisation...' : form.lat ? '✓ Position détectée' : 'Me localiser automatiquement'}
            </button>
            {geoError && <div style={{ fontSize: 12, color: '#FF6B6B', marginBottom: 8 }}>{geoError}</div>}
            {form.lat && form.lng && (
              <div style={{ marginBottom: 10, borderRadius: 12, overflow: 'hidden', height: 'clamp(100px, 22vw, 150px)', border: '1px solid rgba(232,160,32,0.15)' }}>
                <iframe
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${form.lng - 0.005},${form.lat - 0.005},${form.lng + 0.005},${form.lat + 0.005}&layer=mapnik&marker=${form.lat},${form.lng}`}
                  style={{ width: '100%', height: '100%', border: 'none', filter: 'invert(0.85) hue-rotate(180deg)' }}
                />
              </div>
            )}
            <textarea placeholder="Ou saisissez votre adresse..." value={form.address} onChange={e => updateForm(f => ({ ...f, address: e.target.value, lat: null, lng: null }))} rows={3} style={{ width: '100%', padding: '13px 16px', borderRadius: 12, border: '1.5px solid rgba(232,160,32,0.15)', background: 'rgba(255,255,255,0.03)', color: '#F5EDD6', fontFamily: 'DM Sans, sans-serif', fontSize: 13, outline: 'none', resize: 'none' as const, lineHeight: 1.6, boxSizing: 'border-box' as const }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#C8B99A', textTransform: 'uppercase' as const, letterSpacing: '0.8px', marginBottom: 8 }}>Note (optionnel)</label>
            <input type="text" placeholder="Étage, sonnette, instructions..." value={form.note} onChange={e => updateForm(f => ({ ...f, note: e.target.value }))} style={{ width: '100%', padding: '13px 16px', borderRadius: 12, border: '1.5px solid rgba(232,160,32,0.15)', background: 'rgba(255,255,255,0.03)', color: '#F5EDD6', fontFamily: 'DM Sans, sans-serif', fontSize: 14, outline: 'none', boxSizing: 'border-box' as const }} />
          </div>

          {/* Facturette */}
          <div style={{ background: 'rgba(232,160,32,0.04)', border: '1px solid rgba(232,160,32,0.12)', borderRadius: 12, padding: '14px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => updateForm(f => ({ ...f, wantFacture: !f.wantFacture }))}>
              <div style={{ width: 20, height: 20, borderRadius: 6, border: `2px solid ${form.wantFacture ? '#F5C842' : 'rgba(232,160,32,0.3)'}`, background: form.wantFacture ? 'linear-gradient(135deg,#F5C842,#FF6B20)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.2s' }}>
                {form.wantFacture && <span style={{ fontSize: 11, color: '#0A0804', fontWeight: 800 }}>✓</span>}
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#C8B890' }}>Recevoir une facturette PDF</div>
                <div style={{ fontSize: 11, color: '#C8B99A', marginTop: 2 }}>Envoyée par email après commande</div>
              </div>
            </div>
            {form.wantFacture && (
              <input type="email" placeholder="votre@email.com" value={form.email} onChange={e => updateForm(f => ({ ...f, email: e.target.value }))} style={{ width: '100%', marginTop: 12, padding: '11px 14px', borderRadius: 10, border: '1.5px solid rgba(232,160,32,0.2)', background: 'rgba(255,255,255,0.03)', color: '#F5EDD6', fontFamily: 'DM Sans, sans-serif', fontSize: 13, outline: 'none', boxSizing: 'border-box' as const }} />
            )}
          </div>
        </div>
      )}

      {/* ══ STEP 3 — CRÉNEAU ══ */}
      {step === 'slot' && (
        <div style={{ padding: '0 20px' }}>
          <SlotPicker onSelect={setSelectedSlot} />
          <p style={{ textAlign: 'center', color: '#C8B99A', fontSize: 11, marginTop: 16, letterSpacing: '0.3px' }}>Paiement en cash à la livraison uniquement</p>
        </div>
      )}

      {step === 'cart' && <FeaturesBar alwaysShow />}
      {/* ══ BARRE STICKY BAS ══ */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'rgba(8,6,3,0.97)', backdropFilter: 'blur(20px)', padding: '16px 20px', zIndex: 40 }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          {/* Total visible sur step panier */}
          {step === 'cart' && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ fontSize: 13, color: '#C8B99A', fontWeight: 500 }}>{items.reduce((acc, i) => acc + i.quantity, 0)} article{items.reduce((acc, i) => acc + i.quantity, 0) > 1 ? 's' : ''}</span>
              <span style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 800, fontSize: 22, color: '#F5C842', letterSpacing: '-0.5px' }}>{total().toFixed(2)} DH</span>
            </div>
          )}

          <div style={{ display: 'flex', gap: 10 }}>
            {step !== 'cart' && (
              <button onClick={() => setStep(step === 'slot' ? 'info' : 'cart')} style={{ padding: '14px 20px', borderRadius: 50, border: '1.5px solid rgba(232,160,32,0.2)', background: 'transparent', color: '#C8B890', fontFamily: 'DM Sans, sans-serif', fontWeight: 700, fontSize: 14, cursor: 'pointer', flexShrink: 0 }}>
                ← Retour
              </button>
            )}
            <button
              onClick={() => {
                if (step === 'cart') setStep('info')
                else if (step === 'info') setStep('slot')
                else handleOrder()
              }}
              disabled={(step === 'info' && (!form.name || !form.phone || !form.address)) || (step === 'slot' && (!selectedSlot || loading))}
              style={{ flex: 1, padding: '15px 20px', borderRadius: 50, border: 'none', background: 'linear-gradient(135deg,#F5C842,#FF6B20)', color: '#0A0804', fontFamily: 'DM Sans, sans-serif', fontWeight: 800, fontSize: 15, cursor: 'pointer', boxShadow: '0 4px 20px rgba(232,160,32,0.3)', transition: 'all 0.2s', opacity: (step === 'info' && (!form.name || !form.phone || !form.address)) || (step === 'slot' && !selectedSlot) ? 0.4 : 1 }}
            >
              {step === 'cart' ? `Continuer` : step === 'info' ? 'Quand livrer ?' : loading ? 'Envoi...' : 'Commander'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
