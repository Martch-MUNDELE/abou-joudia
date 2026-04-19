'use client'
import React from 'react'
import { useEffect, useState } from 'react'
import { useCatalogue } from '@/store/catalogue'
import { createClient } from '@/lib/supabase/client'
import type { Product } from '@/lib/types'
import FeaturedCardButton from '@/components/FeaturedCardButton'
import ProductOverlay from '@/components/ProductOverlay'

export default function PopularCard({ fallback }: { fallback?: React.ReactNode }) {
  const { activeSous, hasSelected } = useCatalogue()
  const [product, setProduct] = useState<Product | null>(null)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [allProducts, setAllProducts] = useState<Product[]>([])

  useEffect(() => {
    if (!hasSelected) { setProduct(null); return }
    const supabase = createClient()
    supabase.from('products').select('*').eq('subcategory', activeSous).eq('active', true).then(({ data }) => {
      const all = (data as Product[]) || []
      setAllProducts(all)
      setProduct(all.find(p => p.popular) || null)
    })
  }, [activeSous, hasSelected])

  if (!hasSelected) return fallback ?? null
  if (!product) return null

  return (
    <>
    {selectedProduct && <ProductOverlay product={selectedProduct} allProducts={allProducts} onClose={() => setSelectedProduct(null)} />}
    <div style={{ margin: '0 16px 24px', position: 'relative', borderRadius: 20, overflow: 'hidden', border: '1px solid rgba(255,107,32,0.25)', minHeight: 'clamp(180px, 50vw, 280px)', cursor: 'pointer' }} onClick={() => setSelectedProduct(product)}>
      {product.image_url && (
        <img src={product.image_url} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', opacity: 0.65 }} />
      )}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(8,4,0,0.88) 0%, rgba(40,15,0,0.65) 45%, rgba(80,30,0,0.2) 100%)' }} />
      <div style={{ position: 'relative', zIndex: 2, padding: '20px 18px' }}>
        <div style={{ fontSize: 9, color: '#FF6B20', letterSpacing: '3px', textTransform: 'uppercase', fontWeight: 700, marginBottom: 10, fontFamily: 'DM Sans, sans-serif' }}>
          🔥 Populaire du moment
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 8 }}>
          <div>
            <span style={{ fontFamily: 'Playfair Display, serif', fontWeight: 900, fontSize: 'clamp(26px, 8vw, 36px)', color: '#FF6B20' }}>{product.price}</span>
            <span style={{ fontSize: 13, color: '#FF8C42', fontWeight: 600, fontFamily: 'DM Sans, sans-serif', marginLeft: 3 }}>DH</span>
          </div>
          <div style={{ fontFamily: 'Playfair Display, serif', fontWeight: 900, fontSize: 'clamp(18px, 5.5vw, 24px)', color: '#F5EDD6', lineHeight: 1.1 }}>{product.name}</div>
        </div>
        {product.description && (
          <div style={{ fontSize: 12, color: '#C8B99A', lineHeight: 1.5, maxWidth: 'min(220px, 55%)', marginBottom: 14 }}>{product.description}</div>
        )}
        <div style={{ height: 1, background: 'rgba(255,107,32,0.15)', margin: '12px 0' }} />
        <div onClick={e => e.stopPropagation()}><FeaturedCardButton product={product} /></div>
      </div>
    </div>
    </>
  )
}
