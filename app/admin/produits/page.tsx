'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import type { Product } from '@/lib/types'

const SUBCATS: Record<string, string> = { chaudes: 'Boissons Chaudes', froides: 'Boissons Froides', sandwichs_chauds: 'Sandwichs Chauds', sandwichs_froids: 'Sandwichs Froids', salades: 'Salades' }

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
  const [products, setProducts] = useState<Product[]>([])
  const supabase = createClient()
  const router = useRouter()

  const load = async () => {
    const { data } = await supabase.from('products').select('*').order('subcategory')
    setProducts(data || [])
  }
  useEffect(() => { load() }, [])

  const del = async (id: string) => {
    await supabase.from('products').delete().eq('id', id)
    load()
  }

  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 26, fontWeight: 900, color: '#F5EDD6' }}>Produits</h1>
        <button onClick={() => router.push('/admin/produits/nouveau')} style={{ padding: '9px 18px', borderRadius: 50, border: 'none', background: 'linear-gradient(135deg,#F5C842,#FF6B20)', color: '#0A0804', fontFamily: 'DM Sans, sans-serif', fontWeight: 800, fontSize: 12, cursor: 'pointer' }}>
          + Ajouter
        </button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {products.map(p => (
          <div key={p.id} style={{ background: '#131009', border: p.active ? '1px solid rgba(232,160,32,0.1)' : '1px solid rgba(255,107,107,0.2)', borderRadius: 14, padding: '14px 16px', display: 'flex', gap: 14, alignItems: 'center', opacity: p.active ? 1 : 0.55 }}>
            <img src={p.image_url} alt={p.name} style={{ width: 52, height: 52, borderRadius: 10, objectFit: 'cover', flexShrink: 0, border: '1px solid rgba(232,160,32,0.1)' }} />
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: '#F5EDD6' }}>{p.name}</div>
                {!p.active && <span style={{ fontSize: 10, background: 'rgba(255,107,107,0.15)', color: '#FF6B6B', padding: '2px 8px', borderRadius: 50, fontWeight: 700, whiteSpace: 'nowrap' }}>Inactif</span>}
              </div>
              <div style={{ fontSize: 11, color: '#C8B99A', marginTop: 2 }}>{SUBCATS[p.subcategory]} · {p.price} DH</div>
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
  )
}