'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Category = {
  id: string
  slug: string
  name: string
  parent_id: string | null
  display_order: number
  active: boolean
  icon_type: string
  icon_value: string
  level: number
}

type FormState = {
  name: string
  slug: string
  parent_id: string
  display_order: string
  active: boolean
  icon_type: string
  icon_value: string
}

const BUILTIN_ICONS = [
  { value: 'boissons', label: 'Boissons (tasse)' },
  { value: 'chaudes', label: 'Chaud (flamme)' },
  { value: 'froides', label: 'Froid (flocon)' },
  { value: 'sandwichs', label: 'Sandwichs (burger)' },
  { value: 'chauds', label: 'Chaud (flamme)' },
  { value: 'froids', label: 'Froid (flocon)' },
  { value: 'salades', label: 'Salades' },
]

const renderIcon = (id: string, size = 18): React.ReactNode => {
  const s = size < 20 ? 20 : size
  const flamme = <svg width={s} height={s} viewBox='0 0 38 38' fill='none'><path d='M19 9 C17 14 12 17 12 22 C12 27.5 15 32 19 33 C23 32 26 27.5 26 22 C26 17 21 14 19 9Z' stroke='currentColor' strokeWidth='2' fill='rgba(232,160,32,0.2)' strokeLinecap='round' strokeLinejoin='round'/></svg>
  const flocon = <svg width={s} height={s} viewBox='0 0 40 40' fill='none'><line x1='20' y1='4' x2='20' y2='36' stroke='currentColor' strokeWidth='2.2' strokeLinecap='round'/><line x1='4' y1='20' x2='36' y2='20' stroke='currentColor' strokeWidth='2.2' strokeLinecap='round'/><line x1='8' y1='8' x2='32' y2='32' stroke='currentColor' strokeWidth='2.2' strokeLinecap='round'/><line x1='32' y1='8' x2='8' y2='32' stroke='currentColor' strokeWidth='2.2' strokeLinecap='round'/><circle cx='20' cy='20' r='2.5' fill='currentColor'/></svg>
  const burger = <svg width={s} height={s} viewBox='0 0 40 40' fill='none'><path d='M8 19 Q8 7 20 7 Q32 7 32 19Z' stroke='currentColor' strokeWidth='2' fill='rgba(232,160,32,0.15)' strokeLinecap='round' strokeLinejoin='round'/><path d='M7 21 Q10 18.5 13 21 Q16 18.5 20 21 Q24 18.5 27 21 Q30 18.5 33 21' stroke='currentColor' strokeWidth='2' fill='none' strokeLinecap='round'/><rect x='8' y='23' width='24' height='3.5' rx='1.8' stroke='currentColor' strokeWidth='2' fill='rgba(232,160,32,0.15)'/><path d='M8 28.5 Q8 35 20 35 Q32 35 32 28.5Z' stroke='currentColor' strokeWidth='2' fill='rgba(232,160,32,0.15)' strokeLinecap='round' strokeLinejoin='round'/></svg>
  const tasse = <svg width={s} height={s} viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><path d='M17 8h1a4 4 0 0 1 0 8h-1'/><path d='M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V8z'/><line x1='6' y1='2' x2='6' y2='4'/><line x1='10' y1='2' x2='10' y2='4'/><line x1='14' y1='2' x2='14' y2='4'/></svg>
  const salade = <svg width={s} height={s} viewBox='0 0 38 38' fill='none'><path d='M19 4 C21 4 23 5 23 7 C25 5 28 6 28 9 C31 8 33 11 31 14 C34 14 35 18 33 20 C35 22 33 26 30 26 C31 29 29 32 26 31 C25 34 22 35 19 34 C16 35 13 34 12 31 C9 32 7 29 8 26 C5 26 3 22 5 20 C3 18 4 14 7 14 C5 11 7 8 10 9 C10 6 13 5 15 7 C15 5 17 4 19 4Z' stroke='currentColor' strokeWidth='2' fill='rgba(232,160,32,0.1)' strokeLinejoin='round'/><circle cx='19' cy='19' r='2.5' fill='currentColor' opacity='0.85'/></svg>
  const map: Record<string, React.ReactNode> = { boissons: tasse, chaudes: flamme, froides: flocon, sandwichs: burger, chauds: flamme, froids: flocon, salades: salade }
  return map[id] ?? null
}

const slugify = (s: string) =>
  s.toLowerCase()
    .replace(/[éèêë]/g, 'e').replace(/[àâä]/g, 'a').replace(/[ùûü]/g, 'u')
    .replace(/[ôö]/g, 'o').replace(/[îï]/g, 'i').replace(/ç/g, 'c')
    .replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')

const EMPTY_FORM: FormState = { name: '', slug: '', parent_id: '', display_order: '0', active: true, icon_type: 'builtin', icon_value: 'boissons' }

const INP: React.CSSProperties = { width: '100%', padding: '10px 14px', borderRadius: 10, background: '#1A1510', border: '1px solid rgba(232,160,32,0.2)', color: '#F5EDD6', fontFamily: 'DM Sans, sans-serif', fontSize: 13, outline: 'none', boxSizing: 'border-box' }
const LBL: React.CSSProperties = { fontSize: 11, fontWeight: 700, color: '#C8B99A', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 6, display: 'block' }

const IconEdit = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
const IconTrash = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3,6 5,6 21,6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>

function CatRow({ cat, indent = false, onEdit, onDelete }: { cat: Category; indent?: boolean; onEdit: (c: Category) => void; onDelete: (id: string) => void }) {
  return (
    <div style={{ background: '#131009', border: '1px solid rgba(232,160,32,0.1)', borderRadius: 14, padding: '12px 16px', display: 'flex', gap: 14, alignItems: 'center', marginLeft: indent ? 28 : 0, ...(indent ? { borderLeft: '2px solid rgba(232,160,32,0.25)' } : {}) }}>
      <div style={{ display: 'inline-flex', width: 32, height: 32, borderRadius: 9, background: 'rgba(232,160,32,0.08)', border: '1px solid rgba(232,160,32,0.15)', alignItems: 'center', justifyContent: 'center', color: '#E8A020', flexShrink: 0 }}>
        {cat.icon_type === 'builtin'
          ? renderIcon(cat.icon_value, 14)
          : cat.icon_value
            ? <img src={cat.icon_value} style={{ width: 20, height: 20, objectFit: 'contain' }} alt="" />
            : null}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 700, fontSize: 14, color: '#F5EDD6', fontFamily: 'DM Sans, sans-serif' }}>{cat.name}</div>
        <div style={{ fontSize: 11, color: '#7A6E58', marginTop: 2, fontFamily: 'DM Sans, sans-serif' }}>{cat.slug}</div>
      </div>
      <span style={{ padding: '3px 10px', borderRadius: 50, fontSize: 11, fontWeight: 700, fontFamily: 'DM Sans, sans-serif', background: cat.active ? 'rgba(80,200,120,0.12)' : 'rgba(255,107,107,0.12)', color: cat.active ? '#50C878' : '#FF6B6B', flexShrink: 0 }}>
        {cat.active ? 'Actif' : 'Inactif'}
      </span>
      <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
        <button onClick={() => onEdit(cat)} style={{ width: 34, height: 34, borderRadius: 8, border: '1px solid rgba(232,160,32,0.2)', background: 'rgba(232,160,32,0.06)', color: '#E8A020', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <IconEdit />
        </button>
        <button onClick={() => onDelete(cat.id)} style={{ width: 34, height: 34, borderRadius: 8, border: '1px solid rgba(255,107,107,0.2)', background: 'rgba(255,107,107,0.06)', color: '#FF6B6B', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <IconTrash />
        </button>
      </div>
    </div>
  )
}

export default function MenuAdmin() {
  const [cats, setCats] = useState<Category[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [iconFile, setIconFile] = useState<File | null>(null)
  const supabase = createClient()

  const load = async () => {
    const { data } = await supabase.from('menu_categories').select('*').order('display_order')
    setCats((data as Category[]) || [])
  }

  useEffect(() => { load() }, [])

  const parents = cats.filter(c => c.level === 0).sort((a, b) => a.display_order - b.display_order)
  const childrenOf = (pid: string) => cats.filter(c => c.parent_id === pid).sort((a, b) => a.display_order - b.display_order)

  const openNew = () => { setEditingId(null); setForm(EMPTY_FORM); setIconFile(null); setShowForm(true) }
  const openEdit = (cat: Category) => {
    setEditingId(cat.id)
    setForm({ name: cat.name, slug: cat.slug, parent_id: cat.parent_id ?? '', display_order: String(cat.display_order), active: cat.active, icon_type: cat.icon_type, icon_value: cat.icon_value })
    setIconFile(null)
    setShowForm(true)
  }
  const closeForm = () => { setShowForm(false); setEditingId(null); setForm(EMPTY_FORM); setIconFile(null) }

  const setField = (k: keyof FormState, v: string | boolean) =>
    setForm(f => ({ ...f, [k]: v, ...(k === 'name' ? { slug: slugify(v as string) } : {}) }))

  const del = async (id: string) => {
    if (!window.confirm('Supprimer cette catégorie ?')) return
    const { error } = await supabase.from('menu_categories').delete().eq('id', id)
    if (error) { alert('Erreur : ' + error.message); return }
    await load()
  }

  const save = async () => {
    if (!form.name.trim() || !form.slug.trim()) return
    setSaving(true)
    try {
      let icon_value = form.icon_value
      if (form.icon_type === 'custom' && iconFile) {
        const ext = iconFile.name.split('.').pop()
        const path = `${form.slug}-${Date.now()}.${ext}`
        const { error: upErr } = await supabase.storage.from('menu-icons').upload(path, iconFile, { upsert: true })
        if (upErr) { alert('Erreur upload : ' + upErr.message); return }
        const { data: urlData } = supabase.storage.from('menu-icons').getPublicUrl(path)
        icon_value = urlData.publicUrl
      }
      const level = form.parent_id ? 1 : 0
      const payload = {
        slug: form.slug,
        name: form.name,
        parent_id: form.parent_id || null,
        display_order: parseInt(form.display_order) || 0,
        active: form.active,
        icon_type: form.icon_type,
        icon_value,
        level,
      }
      let saveError = null
      if (editingId) {
        const { error } = await supabase.from('menu_categories').update(payload).eq('id', editingId)
        saveError = error
      } else {
        const { error } = await supabase.from('menu_categories').insert(payload)
        saveError = error
      }
      if (saveError) { alert('Erreur : ' + saveError.message); return }
      await load()
      closeForm()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 26, fontWeight: 900, color: '#F5EDD6' }}>Menu</h1>
        <button onClick={openNew} style={{ padding: '9px 18px', borderRadius: 50, border: 'none', background: 'linear-gradient(135deg,#F5C842,#FF6B20)', color: '#0A0804', fontFamily: 'DM Sans, sans-serif', fontWeight: 800, fontSize: 12, cursor: 'pointer' }}>
          + Ajouter
        </button>
      </div>

      {/* FORMULAIRE */}
      {showForm && (
        <div style={{ background: '#131009', border: '1px solid rgba(232,160,32,0.25)', borderRadius: 16, padding: 28, marginBottom: 28 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
            <span style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 800, fontSize: 16, color: '#F5EDD6' }}>
              {editingId ? 'Modifier la catégorie' : 'Nouvelle catégorie'}
            </span>
            <button onClick={closeForm} style={{ background: 'none', border: 'none', color: '#C8B99A', cursor: 'pointer', fontSize: 22, lineHeight: 1, padding: 0 }}>×</button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={LBL}>Nom</label>
              <input value={form.name} onChange={e => setField('name', e.target.value)} style={INP} placeholder="ex: Boissons Chaudes" />
            </div>
            <div>
              <label style={LBL}>Slug</label>
              <input value={form.slug} onChange={e => setField('slug', e.target.value)} style={INP} placeholder="ex: boissons_chaudes" />
            </div>
            <div>
              <label style={LBL}>Catégorie parente</label>
              <select value={form.parent_id} onChange={e => setField('parent_id', e.target.value)} style={{ ...INP, cursor: 'pointer' }}>
                <option value="">— Catégorie principale —</option>
                {parents.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label style={LBL}>Ordre d&apos;affichage</label>
              <input type="number" min={0} value={form.display_order} onChange={e => setField('display_order', e.target.value)} style={INP} />
            </div>
            <div>
              <label style={LBL}>Type d&apos;icône</label>
              <select value={form.icon_type} onChange={e => setField('icon_type', e.target.value)} style={{ ...INP, cursor: 'pointer' }}>
                <option value="builtin">Icône intégrée</option>
                <option value="custom">Image personnalisée</option>
              </select>
            </div>
            <div>
              <label style={LBL}>Icône</label>
              {form.icon_type === 'builtin' ? (
                <select value={form.icon_value} onChange={e => setField('icon_value', e.target.value)} style={{ ...INP, cursor: 'pointer' }}>
                  {BUILTIN_ICONS.map(i => <option key={i.value} value={i.value}>{i.label}</option>)}
                </select>
              ) : (
                <input type="file" accept="image/*" onChange={e => setIconFile(e.target.files?.[0] ?? null)} style={{ ...INP, padding: '8px 14px' }} />
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <input type="checkbox" id="cat-active" checked={form.active} onChange={e => setField('active', e.target.checked)} style={{ width: 16, height: 16, accentColor: '#F5C842', cursor: 'pointer' }} />
              <label htmlFor="cat-active" style={{ ...LBL, marginBottom: 0, cursor: 'pointer' }}>Catégorie active</label>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {form.icon_type === 'builtin' && form.icon_value && (
                <>
                  <div style={{ display: 'inline-flex', width: 36, height: 36, borderRadius: 10, background: 'rgba(232,160,32,0.1)', border: '1px solid rgba(232,160,32,0.2)', alignItems: 'center', justifyContent: 'center', color: '#E8A020' }}>
                    {renderIcon(form.icon_value, 18)}
                  </div>
                  <span style={{ fontSize: 12, color: '#C8B99A', fontFamily: 'DM Sans, sans-serif' }}>Aperçu icône</span>
                </>
              )}
              {form.icon_type === 'custom' && form.icon_value && !iconFile && (
                <>
                  <img src={form.icon_value} style={{ width: 36, height: 36, objectFit: 'contain', borderRadius: 8, border: '1px solid rgba(232,160,32,0.2)' }} alt="" />
                  <span style={{ fontSize: 12, color: '#C8B99A', fontFamily: 'DM Sans, sans-serif' }}>Icône actuelle</span>
                </>
              )}
            </div>
          </div>

          <div style={{ marginTop: 24, display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <button onClick={closeForm} style={{ padding: '10px 22px', borderRadius: 10, border: '1px solid rgba(232,160,32,0.2)', background: 'transparent', color: '#C8B99A', fontFamily: 'DM Sans, sans-serif', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
              Annuler
            </button>
            <button onClick={save} disabled={saving} style={{ padding: '10px 24px', borderRadius: 10, border: 'none', background: saving ? 'rgba(245,200,66,0.3)' : 'linear-gradient(135deg,#F5C842,#FF6B20)', color: '#0A0804', fontFamily: 'DM Sans, sans-serif', fontWeight: 800, fontSize: 13, cursor: saving ? 'not-allowed' : 'pointer' }}>
              {saving ? 'Enregistrement…' : editingId ? 'Mettre à jour' : 'Créer'}
            </button>
          </div>
        </div>
      )}

      {/* LISTE */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {parents.length === 0 && (
          <div style={{ textAlign: 'center', color: '#7A6E58', padding: '40px 0', fontSize: 14, fontFamily: 'DM Sans, sans-serif' }}>
            Aucune catégorie — cliquez sur + Ajouter
          </div>
        )}
        {parents.map(parent => (
          <div key={parent.id} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <CatRow cat={parent} onEdit={openEdit} onDelete={del} />
            {childrenOf(parent.id).map(child => (
              <CatRow key={child.id} cat={child} indent onEdit={openEdit} onDelete={del} />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
