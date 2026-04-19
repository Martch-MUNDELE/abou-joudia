'use client'
import { useState } from 'react'
import type { Product } from '@/lib/types'
import FeaturedCardButton from '@/components/FeaturedCardButton'
import ProductOverlay from '@/components/ProductOverlay'

export default function FeaturedCardClient({ product, allProducts }: { product: Product, allProducts: Product[] }) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

  return (
    <>
      {selectedProduct && <ProductOverlay product={selectedProduct} allProducts={allProducts} onClose={() => setSelectedProduct(null)} />}
      <div
        onClick={() => setSelectedProduct(product)}
        style={{ margin: '0 16px 24px', position: 'relative', borderRadius: 20, overflow: 'hidden', border: '1px solid rgba(232,160,32,0.25)', minHeight: 'clamp(180px, 50vw, 280px)', cursor: 'pointer' }}
      >
        {product.image_url && (
          <img src={product.image_url} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', opacity: 1 }} />
        )}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(8,4,0,0.82) 0%, rgba(8,4,0,0.6) 50%, transparent 100%)' }} />
        <div style={{ position: 'relative', zIndex: 2, padding: '20px 18px' }}>
          <div style={{ fontSize: 9, color: '#E8A020', letterSpacing: '3px', textTransform: 'uppercase', fontWeight: 700, marginBottom: 10, fontFamily: 'DM Sans, sans-serif', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ color: '#F5C842' }}>✦</span> Signature du moment
          </div>
          <div style={{ marginBottom: 8 }}>
            <div style={{ fontFamily: 'Playfair Display, serif', fontWeight: 900, fontSize: 24, color: '#F5EDD6', lineHeight: 1.05, letterSpacing: '-0.5px', marginBottom: 3 }}>{product.name}</div>
            {product.description && (
              <div style={{ fontSize: 12, color: '#C8B99A', lineHeight: 1.5, maxWidth: 'min(220px, 55%)', marginBottom: 6 }}>{product.description}</div>
            )}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
              <div style={{ fontFamily: 'Playfair Display, serif', fontWeight: 900, fontSize: 28, color: '#F5C842', lineHeight: 1 }}>{product.price}</div>
              <div style={{ fontSize: 11, color: '#E8A020', fontWeight: 600, fontFamily: 'DM Sans, sans-serif' }}>DH</div>
            </div>
          </div>
          <div style={{ height: 1, background: 'rgba(232,160,32,0.15)', margin: '12px 0' }} />
          <div onClick={e => e.stopPropagation()}>
            <FeaturedCardButton product={product} />
          </div>
        </div>
      </div>
    </>
  )
}
