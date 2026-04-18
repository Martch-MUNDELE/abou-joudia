'use client'
import { useState } from 'react'
import { useCart } from '@/store/cart'
import type { Product } from '@/lib/types'

export default function ProductOverlay({ product, onClose }: { product: Product, onClose: () => void }) {
  const { add, items, update } = useCart()
  const quantity = items.find(i => i.product.id === product.id)?.quantity || 0
  const [added, setAdded] = useState(false)

  const handleAdd = () => {
    add(product)
    setAdded(true)
    setTimeout(() => setAdded(false), 800)
  }

  const handleRemove = () => {
    if (quantity > 0) update(product.id, quantity - 1)
  }

  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', animation: 'fadeIn 0.2s ease' }}
    >
      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { transform: translateY(100%) } to { transform: translateY(0) } }
      `}</style>

      <div
        onClick={e => e.stopPropagation()}
        style={{ background: '#0F0C07', borderRadius: '24px 24px 0 0', maxWidth: 600, width: '100%', margin: '0 auto', animation: 'slideUp 0.3s cubic-bezier(0.32,0.72,0,1)', height: '75vh', maxHeight: '75vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}
      >
        {/* Bouton fermeture — EN DEHORS de l'image, tout en haut de la sheet */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '14px 16px 0', flexShrink: 0 }}>
          <button onClick={onClose} style={{ width: 34, height: 34, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', color: '#C8B99A', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
            ×
          </button>
        </div>

        {/* ZONE IMAGE */}
        <div style={{ position: 'relative', flex: '0 0 200px', background: '#080603', margin: '0 16px', borderRadius: 16, overflow: 'hidden' }}>
          {product.image_url && (
            <img src={product.image_url} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }} />
          )}
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '40%', background: 'linear-gradient(to top, #0F0C07 0%, transparent 100%)' }} />
        </div>

        {/* ZONE INFOS — scrollable */}
        <div style={{ padding: '16px 20px 0', overflowY: 'auto', flex: 1 }}>
          {/* Handle bar */}
          <div style={{ width: 36, height: 4, background: 'rgba(255,255,255,0.1)', borderRadius: 2, margin: '0 auto 16px' }} />

          {/* Sous-catégorie */}
          <div style={{ fontSize: 9, color: '#E8A020', letterSpacing: '2.5px', textTransform: 'uppercase', fontWeight: 700, fontFamily: 'DM Sans, sans-serif', marginBottom: 8 }}>
            {product.subcategory?.replace(/_/g, ' ')}
          </div>

          {/* Nom + Prix sur même ligne */}
          <div style={{ display: 'flex', flexDirection: 'column', marginBottom: 10, gap: 6 }}>
            <div style={{ fontFamily: 'Playfair Display, serif', fontWeight: 900, fontSize: 26, color: '#F5EDD6', lineHeight: 1.05, letterSpacing: '-0.8px', flex: 1 }}>
              {product.name}
            </div>
            <div style={{ flexShrink: 0 }}>
              <span style={{ fontFamily: 'Playfair Display, serif', fontWeight: 900, fontSize: 34, color: '#F5C842' }}>{product.price}</span>
              <span style={{ fontSize: 13, color: '#E8A020', fontWeight: 600, fontFamily: 'DM Sans, sans-serif', marginLeft: 4 }}>DH</span>
            </div>
          </div>

          {/* Description */}
          {product.description && (
            <div style={{ fontSize: 14, color: '#C8B99A', lineHeight: 1.7, marginBottom: 14 }}>
              {product.description}
            </div>
          )}

          {/* Ingrédients */}
          {product.ingredients && (
            <div style={{ background: 'rgba(232,160,32,0.05)', border: '1px solid rgba(232,160,32,0.1)', borderRadius: 12, padding: '10px 14px', marginBottom: 16 }}>
              <div style={{ fontSize: 9, color: '#E8A020', letterSpacing: '2px', textTransform: 'uppercase', fontWeight: 700, fontFamily: 'DM Sans, sans-serif', marginBottom: 4 }}>Ingrédients</div>
              <div style={{ fontSize: 12, color: '#C8B99A', lineHeight: 1.6 }}>{product.ingredients}</div>
            </div>
          )}
        </div>

        {/* BOUTON + en bas à droite */}
        <div style={{ padding: '12px 20px env(safe-area-inset-bottom, 20px)', flexShrink: 0, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 12 }}>
          {quantity > 0 && (
            <>
              <button onClick={handleRemove} style={{ width: 40, height: 40, borderRadius: '50%', border: '1.5px solid rgba(232,160,32,0.25)', background: 'transparent', color: '#C8B890', cursor: 'pointer', fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
              <span style={{ fontFamily: 'Playfair Display, serif', fontWeight: 900, fontSize: 20, color: '#F5EDD6', minWidth: 24, textAlign: 'center' }}>{quantity}</span>
            </>
          )}
          <button onClick={handleAdd} style={{ width: 48, height: 48, background: added ? 'rgba(232,160,32,0.15)' : 'linear-gradient(135deg,#F5C842,#FF6B20)', border: 'none', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: added ? 16 : 24, fontWeight: 700, color: added ? '#E8A020' : '#080603', cursor: 'pointer', boxShadow: added ? 'none' : '0 4px 16px rgba(232,160,32,0.35)', transition: 'all 0.2s' }}>
            {added ? '✓' : '+'}
          </button>
        </div>
      </div>
    </div>
  )
}
