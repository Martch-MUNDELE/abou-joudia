'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const SUBCAT_LABELS = { chaudes: 'Boissons Chaudes', froides: 'Boissons Froides', sandwichs_chauds: 'Sandwichs Chauds', sandwichs_froids: 'Sandwichs Froids', salades: 'Salades' }
const SUBCAT_ORDER = ['sandwichs_chauds', 'sandwichs_froids', 'salades', 'chaudes', 'froides']

const IconEdit = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
)
const IconTrash = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3,6 5,6 21,6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
    <path d="M10 11v6"/><path d="M14 11v6"/>
    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
  </svg>
)

export default function ProduitsAdmin() {
  const [products, setProducts] = useState([])
  const [tab, setTab] = useState('actifs')
  const supabase = createClient()
  const router = useRouter()

  const load = async () => {
    const { data } = await supabase.from('products').select('*').order('subcategory')
    setProducts(data || [])
  }
  useEffect(() => { load() }, [])

  const del = async (id) => {
    if (!window.confirm('Supprimer ce produit ?')) return
    await supabase.from('products').delete().eq('id', id)
    load()
  }

  const filtered = products.filter(p => tab === 'actifs' ? p.active : !p.active)

  const grouped = SUBCAT_ORDER.reduce((acc, sub) => {
    const items = filtered.filter(p => p.subcategory === sub)
    if (items.length > 0) acc[sub] = items
    return acc
  }, {})

  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 26, fontWeight: 900, color: '#F5EDD6' }}>Produits</h1>
        <button onClick={() => router.push('/admin/produits/nouveau')} style={{ padding: '9px 18px', borderRadius: 50, border: 'none', background: 'linear-gradient(135deg,#F5C842,#FF6B20)', color: '#0A0804', fontFamily: 'DM Sans, sans-serif', fontWeight: 800, fontSize: 12, cursor: 'pointer' }}>
          + Ajouter
        </button>
      </div>

      {/* ONGLETS */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        <button onClick={() => setTab('actifs')} style={{ padding: '8px 20px', borderRadius: 50, border: 'none', background: tab === 'actifs' ? 'linear-gradient(135deg,#F5C842,#FF6B20)' : 'rgba(255,255,255,0.05)', color: tab === 'actifs' ? '#0A0804' : '#C8B99A', fontFamily: 'DM Sans, sans-serif', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
          Actifs ({products.filter(p => p.active).length})
        </button>
        <button onClick={() => setTab('inactifs')} style={{ padding: '8px 20px', borderRadius: 50, border: 'none', background: tab === 'inactifs' ? 'rgba(255,107,107,0.15)' : 'rgba(255,255,255,0.05)', color: tab === 'inactifs' ? '#FF6B6B' : '#C8B99A', fontFamily: 'DM Sans, sans-serif', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
          Inactifs ({products.filter(p => !p.active).length})
        </button>
      </div>

      {/* LISTE PAR SOUS-CATEGORIE */}
      {Object.keys(grouped).length === 0 && (
        <div style={{ textAlign: 'center', color: '#7A6E58', padding: '40px 0', fontSize: 14 }}>
          Aucun produit {tab === 'actifs' ? 'actif' : 'inactif'}
        </div>
      )}

      {Object.entries(grouped).map(([sub, items]) => (
        <div key={sub} style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#E8A020', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: 10, paddingBottom: 6, borderBottom: '1px solid rgba(232,160,32,0.15)' }}>
            {SUBCAT_LABELS[sub]} ({items.length})
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {items.map(p => (
              <div key={p.id} style={{ background: '#131009', border: '1px solid rgba(232,160,32,0.1)', borderRadius: 14, padding: '14px 16px', display: 'flex', gap: 14, alignItems: 'center' }}>
                <img src={p.image_url} alt={p.name} style={{ width: 52, height: 52, borderRadius: 10, objectFit: 'cover', flexShrink: 0, border: '1px solid rgba(232,160,32,0.1)' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: '#F5EDD6' }}>{p.name}</div>
                  <div style={{ fontSize: 11, color: '#C8B99A', marginTop: 2 }}>{p.price} DH</div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => router.push('/admin/produits/' + p.id + '/modifier')} style={{ width: 34, height: 34, borderRadius: 8, border: '1px solid rgba(232,160,32,0.2)', background: 'rgba(232,160,32,0.06)', color: '#E8A020', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <IconEdit />
                  </button>
                  <button onClick={() => del(p.id)} style={{ width: 34, height: 34, borderRadius: 8, border: '1px solid rgba(255,107,107,0.2)', background: 'rgba(255,107,107,0.06)', color: '#FF6B6B', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <IconTrash />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}