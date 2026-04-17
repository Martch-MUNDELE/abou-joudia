'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const STATUSES = ['nouvelle', 'confirmée', 'en_preparation', 'en_livraison', 'livrée', 'annulée']
const STATUS_LABELS: Record<string, string> = {
  nouvelle: 'Nouvelle', confirmée: 'Confirmée', en_preparation: 'Préparation',
  en_livraison: 'Livraison', livrée: 'Livrée', annulée: 'Annulée'
}
const STATUS_COLORS: Record<string, { bg: string; color: string; border: string }> = {
  nouvelle:       { bg: 'rgba(232,160,32,0.1)',   color: '#E8A020', border: 'rgba(232,160,32,0.25)' },
  confirmée:      { bg: 'rgba(91,197,122,0.1)',   color: '#5BC57A', border: 'rgba(91,197,122,0.25)' },
  en_preparation: { bg: 'rgba(255,107,32,0.1)',   color: '#FF6B20', border: 'rgba(255,107,32,0.25)' },
  en_livraison:   { bg: 'rgba(56,182,255,0.1)',   color: '#38B6FF', border: 'rgba(56,182,255,0.25)' },
  livrée:         { bg: 'rgba(122,110,88,0.1)',   color: '#C8B99A', border: 'rgba(122,110,88,0.2)'  },
  annulée:        { bg: 'rgba(255,107,107,0.1)',  color: '#FF6B6B', border: 'rgba(255,107,107,0.2)' },
}

function whatsappLink(phone: string, name: string, total: number) {
  const num = phone.replace(/\s/g, '').replace(/^0/, '212')
  const msg = encodeURIComponent(`Bonjour ${name}, votre commande Abou Joudia de ${total.toFixed(2)} DH est en cours de préparation. Merci !`)
  return `https://wa.me/${num}?text=${msg}`
}

const IconPhone = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.36 11.67a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.11 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21 16z"/>
  </svg>
)
const IconChat = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
)
const IconPin = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2C8.69 2 6 4.69 6 8c0 4.5 6 12 6 12s6-7.5 6-12c0-3.31-2.69-6-6-6z"/>
    <circle cx="12" cy="8" r="2"/>
  </svg>
)
const IconCal = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="3"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
)

export default function CommandesAdmin() {
  const [orders, setOrders] = useState<any[]>([])
  const [filter, setFilter] = useState('all')
  const [counts, setCounts] = useState<Record<string, number>>({})
  const supabase = createClient()

  const load = async () => {
    const { data: all } = await supabase.from('orders').select('*, delivery_slots(*), order_items(*)').order('created_at', { ascending: false })
    if (!all) return
    const c: Record<string, number> = {}
    all.forEach(o => { c[o.status] = (c[o.status] || 0) + 1 })
    setCounts(c)
    setOrders(filter === 'all' ? all : all.filter(o => o.status === filter))
  }

  useEffect(() => { load() }, [filter])

  const updateStatus = async (id: string, status: string) => {
    await supabase.from('orders').update({ status }).eq('id', id)
    load()
  }

  const formatDate = (d: string) => new Date(d + 'T12:00:00').toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })

  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 26, fontWeight: 900, color: '#F5EDD6', marginBottom: 24 }}>
        Commandes
      </h1>

      {/* FILTRES */}
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', marginBottom: 24, paddingBottom: 4 }}>
        <button
          onClick={() => setFilter('all')}
          style={{ flexShrink: 0, padding: '6px 14px', borderRadius: 50, border: '1px solid', borderColor: filter === 'all' ? 'rgba(232,160,32,0.4)' : 'rgba(232,160,32,0.12)', background: filter === 'all' ? 'rgba(232,160,32,0.12)' : 'transparent', color: filter === 'all' ? '#E8A020' : '#C8B99A', cursor: 'pointer', fontSize: 12, fontWeight: 600, fontFamily: 'DM Sans, sans-serif' }}
        >
          Toutes
        </button>
        {STATUSES.map(s => {
          const sc = STATUS_COLORS[s]
          const active = filter === s
          return (
            <button key={s} onClick={() => setFilter(s)} style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 50, border: '1px solid', borderColor: active ? sc.border : 'rgba(255,255,255,0.06)', background: active ? sc.bg : 'transparent', color: active ? sc.color : '#C8B99A', cursor: 'pointer', fontSize: 12, fontWeight: 600, fontFamily: 'DM Sans, sans-serif' }}>
              {STATUS_LABELS[s]}
              {counts[s] ? <span style={{ background: active ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.06)', padding: '0 6px', borderRadius: 50, fontSize: 10 }}>{counts[s]}</span> : null}
            </button>
          )
        })}
      </div>

      {/* LISTE */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {orders.length === 0 && (
          <div style={{ textAlign: 'center', color: '#C8B99A', padding: '40px 0', fontSize: 14 }}>Aucune commande</div>
        )}
        {orders.map(order => {
          const sc = STATUS_COLORS[order.status] || STATUS_COLORS['nouvelle']
          return (
            <div key={order.id} style={{ background: '#131009', border: '1px solid rgba(232,160,32,0.1)', borderRadius: 16, padding: '18px 20px' }}>

              {/* HEADER */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15, color: '#F5EDD6' }}>{order.customer_name}</div>
                  <div style={{ fontSize: 11, color: '#C8B99A', marginTop: 3 }}>{order.customer_phone} · {order.customer_address?.slice(0, 40)}{order.customer_address?.length > 40 ? '…' : ''}</div>
                  <div style={{ fontSize: 10, color: '#A89880', marginTop: 2 }}>#{order.id.slice(0,8).toUpperCase()} · {new Date(order.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 20, fontWeight: 800, color: '#F5C842', fontFamily: 'DM Sans, sans-serif' }}>{order.total.toFixed(2)} <span style={{ fontSize: 13 }}>DH</span></div>
                  <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 50, background: sc.bg, color: sc.color, border: `1px solid ${sc.border}`, display: 'inline-block', marginTop: 4 }}>{STATUS_LABELS[order.status]}</span>
                </div>
              </div>

              {/* CRÉNEAU */}
              {order.delivery_slots && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(232,160,32,0.04)', border: '1px solid rgba(232,160,32,0.1)', borderRadius: 8, padding: '7px 12px', marginBottom: 12, color: '#C8B890', fontSize: 12 }}>
                  <IconCal />
                  <span style={{ fontWeight: 600 }}>{formatDate(order.delivery_slots.date)}</span>
                  <span style={{ color: '#E8A020', fontWeight: 700 }}>{order.delivery_slots.time_start?.slice(0,5)} – {order.delivery_slots.time_end?.slice(0,5)}</span>
                </div>
              )}

              {/* ITEMS */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
                {order.order_items?.map((item: any) => (
                  <span key={item.id} style={{ background: 'rgba(232,160,32,0.07)', border: '1px solid rgba(232,160,32,0.12)', color: '#C8B890', padding: '3px 10px', borderRadius: 50, fontSize: 11, fontWeight: 500 }}>
                    {item.quantity}× {item.product_name}
                  </span>
                ))}
              </div>

              {/* ACTIONS */}
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                <a href={`tel:${order.customer_phone}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 50, border: '1px solid rgba(232,160,32,0.2)', background: 'rgba(232,160,32,0.06)', color: '#E8A020', textDecoration: 'none', fontSize: 11, fontWeight: 600, fontFamily: 'DM Sans, sans-serif' }}>
                  <IconPhone /> Appeler
                </a>
                <a href={whatsappLink(order.customer_phone, order.customer_name, order.total)} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 50, border: '1px solid rgba(91,197,122,0.2)', background: 'rgba(91,197,122,0.06)', color: '#5BC57A', textDecoration: 'none', fontSize: 11, fontWeight: 600, fontFamily: 'DM Sans, sans-serif' }}>
                  <IconChat /> WhatsApp
                </a>
                {order.lat && order.lng && (
                  <a href={`https://www.google.com/maps?q=${order.lat},${order.lng}`} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 50, border: '1px solid rgba(255,107,32,0.2)', background: 'rgba(255,107,32,0.06)', color: '#FF6B20', textDecoration: 'none', fontSize: 11, fontWeight: 600, fontFamily: 'DM Sans, sans-serif' }}>
                    <IconPin /> Maps
                  </a>
                )}
              </div>
<div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 11, color: '#7A6E58', fontFamily: 'DM Sans, sans-serif' }}>Statut</span>
                <div style={{ position: 'relative' }}>
                  <select
                    value={order.status}
                    onChange={e => updateStatus(order.id, e.target.value)}
                    style={{ background: '#1A1510', border: '1px solid rgba(232,160,32,0.25)', color: STATUS_COLORS[order.status]?.color || '#E8A020', borderRadius: 8, padding: '7px 32px 7px 12px', fontSize: 12, fontWeight: 700, outline: 'none', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', appearance: 'none', WebkitAppearance: 'none' }}
                  >
                    {STATUSES.map(s => <option key={s} value={s} style={{ background: '#131009', color: '#F5EDD6' }}>{STATUS_LABELS[s]}</option>)}
                  </select>
                  <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: STATUS_COLORS[order.status]?.color || '#E8A020', fontSize: 10 }}>▾</span>
                </div>
              </div>

            </div>
          )
        })}
      </div>
    </div>
  )
}
