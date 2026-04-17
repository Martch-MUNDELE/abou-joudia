'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Product } from '@/lib/types'

const SUBCATS = ['chaudes', 'froides', 'sandwichs_chauds', 'sandwichs_froids', 'salades']
const SUBCAT_LABELS: Record<string, string> = { chaudes: 'Boissons Chaudes', froides: 'Boissons Froides', sandwichs_chauds: 'Sandwichs Chauds', sandwichs_froids: 'Sandwichs Froids', salades: 'Salades' }
const empty = { name: '', description: '', ingredients: '', price: 0, category: 'nourriture', subcategory: 'sandwichs_chauds', image_url: '', active: true, stock: 0 }

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

const inputStyle = { width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid rgba(232,160,32,0.2)', background: 'rgba(255,255,255,0.03)', color: '#F5EDD6', fontSize: 13, outline: 'none', fontFamily: 'DM Sans, sans-serif', boxSizing: 'border-box' as const }
const labelStyle = { fontSize: 11, fontWeight: 700, color: '#C8B99A', display: 'block', marginBottom: 6, textTransform: 'uppercase' as const, letterSpacing: '0.8px' }

export default function ProduitsAdmin() {
  const [products, setProducts] = useState<Product[]>([])
  const [editing, setEditing] = useState<Partial<Product> | null>(null)
  const [isNew, setIsNew] = useState(false)
  const [uploading, setUploading] = useState(false)
  const supabase = createClient()

  const load = async () => { const { data } = await supabase.from('products').select('*').order('subcategory'); setProducts(data || []) }
  useEffect(() => { load() }, [])

  const uploadImage = async (file: File) => {
    setUploading(true)
    const ext = file.name.split('.').pop()
    const fileName = `${Date.now()}.${ext}`
    const { error } = await supabase.storage.from('products').upload(fileName, file, { upsert: true })
    if (!error) {
      const { data } = supabase.storage.from('products').getPublicUrl(fileName)
      setEditing(p => ({ ...p, image_url: data.publicUrl }))
    }
    setUploading(false)
  }

  const save = async () => {
    if (!editing) return
    const cat = ['chaudes','froides'].includes(editing.subcategory || '') ? 'boissons' : 'nourriture'
    if (isNew) await supabase.from('products').insert({ ...editing, category: cat })
    else await supabase.from('products').update({ ...editing, category: cat }).eq('id', editing.id)
    setEditing(null); load()
  }

  const del = async (id: string) => {
    if (!confirm('Supprimer ce produit ?')) return
    await supabase.from('products').delete().eq('id', id); load()
  }

  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 26, fontWeight: 900, color: '#F5EDD6' }}>Produits</h1>
        <button onClick={() => { setEditing({...empty} as any); setIsNew(true) }} style={{ padding: '9px 18px', borderRadius: 50, border: 'none', background: 'linear-gradient(135deg,#F5C842,#FF6B20)', color: '#0A0804', fontFamily: 'DM Sans, sans-serif', fontWeight: 800, fontSize: 12, cursor: 'pointer' }}>
          + Ajouter
        </button>
      </div>

      {/* MODAL */}
      {editing && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 16 }}>
          <div style={{ background: '#131009', border: '1px solid rgba(232,160,32,0.15)', borderRadius: 20, width: '100%', maxWidth: 480, maxHeight: '90vh', overflow: 'auto', padding: 28 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
              <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 20, fontWeight: 900, color: '#F5EDD6' }}>{isNew ? 'Nouveau produit' : 'Modifier'}</h2>
              <button onClick={() => setEditing(null)} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 50, width: 32, height: 32, color: '#C8B99A', cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
            </div>

            {[{ key: 'name', label: 'Nom', type: 'text' }, { key: 'description', label: 'Description', type: 'text' }, { key: 'ingredients', label: 'Ingrédients', type: 'text' }, { key: 'price', label: 'Prix (DH)', type: 'number' }].map(f => (
              <div key={f.key} style={{ marginBottom: 16 }}>
                <label style={labelStyle}>{f.label}</label>
                <input type={f.type} value={(editing as any)[f.key] || ''} onChange={e => setEditing(p => ({ ...p, [f.key]: f.type === 'number' ? parseFloat(e.target.value) : e.target.value }))} style={inputStyle} />
              </div>
            ))}

            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Image</label>
              {editing.image_url && (
                <img src={editing.image_url} alt="preview" style={{ width: '100%', height: 130, objectFit: 'cover', borderRadius: 10, marginBottom: 10 }} />
              )}
              <label style={{ display: 'block', width: '100%', padding: '12px', borderRadius: 10, border: '1.5px dashed rgba(232,160,32,0.3)', background: 'rgba(232,160,32,0.04)', color: '#E8A020', cursor: 'pointer', textAlign: 'center', fontSize: 12, fontWeight: 600, fontFamily: 'DM Sans, sans-serif', boxSizing: 'border-box' as const }}>
                {uploading ? 'Upload en cours...' : 'Choisir une image'}
                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => { if (e.target.files?.[0]) uploadImage(e.target.files[0]) }} />
              </label>
              {!editing.image_url && (
                <div style={{ marginTop: 8 }}>
                  <label style={{ ...labelStyle, marginTop: 8 }}>Ou URL</label>
                  <input type="text" placeholder="https://..." value={editing.image_url || ''} onChange={e => setEditing(p => ({ ...p, image_url: e.target.value }))} style={inputStyle} />
                </div>
              )}
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Sous-catégorie</label>
              <select value={editing.subcategory} onChange={e => setEditing(p => ({ ...p, subcategory: e.target.value as any }))} style={{ ...inputStyle, cursor: 'pointer' }}>
                {SUBCATS.map(s => <option key={s} value={s}>{SUBCAT_LABELS[s]}</option>)}
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 22, padding: '10px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: 10, border: '1px solid rgba(232,160,32,0.1)' }}>
              <input type="checkbox" checked={editing.active} id="active" onChange={e => setEditing(p => ({ ...p, active: e.target.checked }))} style={{ accentColor: '#E8A020' }} />
              <label htmlFor="active" style={{ fontSize: 13, color: '#C8B890', cursor: 'pointer' }}>Produit actif (visible sur le site)</label>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setEditing(null)} style={{ flex: 1, padding: '11px', borderRadius: 50, border: '1px solid rgba(255,255,255,0.08)', background: 'transparent', color: '#C8B99A', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', fontWeight: 700, fontSize: 13 }}>Annuler</button>
              <button onClick={save} disabled={uploading} style={{ flex: 2, padding: '11px', borderRadius: 50, border: 'none', background: 'linear-gradient(135deg,#F5C842,#FF6B20)', color: '#0A0804', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', fontWeight: 800, fontSize: 13 }}>Enregistrer</button>
            </div>
          </div>
        </div>
      )}

      {/* LISTE */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {products.map(p => (
          <div key={p.id} style={{ background: '#131009', border: '1px solid rgba(232,160,32,0.1)', borderRadius: 14, padding: '14px 16px', display: 'flex', gap: 14, alignItems: 'center' }}>
            <img src={p.image_url} alt={p.name} style={{ width: 52, height: 52, borderRadius: 10, objectFit: 'cover', flexShrink: 0, border: '1px solid rgba(232,160,32,0.1)' }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: '#F5EDD6' }}>{p.name}</div>
              <div style={{ fontSize: 11, color: '#C8B99A', marginTop: 2 }}>{SUBCAT_LABELS[p.subcategory]} · {p.price} DH</div>
              {!p.active && <span style={{ fontSize: 10, background: 'rgba(255,107,107,0.1)', color: '#FF6B6B', padding: '2px 8px', borderRadius: 50, display: 'inline-block', marginTop: 4 }}>Inactif</span>}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => { setEditing(p); setIsNew(false) }} style={{ width: 34, height: 34, borderRadius: 8, border: '1px solid rgba(232,160,32,0.2)', background: 'rgba(232,160,32,0.06)', color: '#E8A020', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
