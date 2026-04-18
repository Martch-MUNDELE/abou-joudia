'use client'
import ProductCard from '@/components/ProductCard'
import { useCatalogue } from '@/store/catalogue'
import type { Product } from '@/lib/types'

const GROUPES = [
  { id: 'boissons', sous: [{ id: 'chaudes' }, { id: 'froides' }] },
  { id: 'sandwichs', sous: [{ id: 'sandwichs_chauds' }, { id: 'sandwichs_froids' }] },
  { id: 'salades', sous: [] },
]

export default function CatalogueClient({ products, isOpen }: { products: Product[], isOpen: boolean }) {
  const { activeGroupe, activeSous, hasSelected } = useCatalogue()
  const groupe = GROUPES.find(g => g.id === activeGroupe)!

  const filtered = groupe.sous.length === 0
    ? products.filter(p => p.subcategory === activeGroupe)
    : products.filter(p => p.subcategory === activeSous)

  if (!hasSelected) return null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '16px 16px 240px' }}>
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#C8B99A', padding: '40px 0', fontSize: 14 }}>Aucun produit disponible</div>
      ) : filtered.map((p, i) => (
        <ProductCard key={p.id} product={p} featured={i === 0 && activeGroupe === 'sandwichs' && activeSous === 'sandwichs_chauds'} isOpen={isOpen} />
      ))}
    </div>
  )
}
