import { createClient } from '@/lib/supabase/server'
import type { Product } from '@/lib/types'
import FeaturedCardButton from '@/components/FeaturedCardButton'

export default async function FeaturedCard() {
  const supabase = await createClient()
  const { data } = await supabase.from('products').select('*').eq('featured', true).single()
  const product = data as Product | null
  if (!product) return null

  return (
    <div style={{ margin: '0 16px 24px', position: 'relative', borderRadius: 20, overflow: 'hidden', border: '1px solid rgba(232,160,32,0.25)', minHeight: 200 }}>

      {/* Image produit en background */}
      {product.image_url && (
        <img src={product.image_url} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', opacity: 1 }} />
      )}



      {/* Overlay gauche pour lisibilité texte */}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(8,4,0,0.82) 0%, rgba(8,4,0,0.6) 50%, transparent 100%)' }} />

      {/* Contenu */}
      <div style={{ position: 'relative', zIndex: 2, padding: '20px 18px' }}>
        <div style={{ fontSize: 9, color: '#E8A020', letterSpacing: '3px', textTransform: 'uppercase', fontWeight: 700, marginBottom: 10, fontFamily: 'DM Sans, sans-serif', display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ color: '#F5C842' }}>✦</span> Signature du moment
        </div>

        <div style={{ marginBottom: 8 }}>
            <div style={{ fontFamily: 'Playfair Display, serif', fontWeight: 900, fontSize: 24, color: '#F5EDD6', lineHeight: 1.05, letterSpacing: '-0.5px', marginBottom: 3 }}>{product.name}</div>
            {product.description && (
              <div style={{ fontSize: 12, color: '#C8B99A', lineHeight: 1.5, maxWidth: 220, marginBottom: 6 }}>{product.description}</div>
            )}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
              <div style={{ fontFamily: 'Playfair Display, serif', fontWeight: 900, fontSize: 28, color: '#F5C842', lineHeight: 1 }}>{product.price}</div>
              <div style={{ fontSize: 11, color: '#E8A020', fontWeight: 600, fontFamily: 'DM Sans, sans-serif' }}>DH</div>
            </div>
        </div>

        <div style={{ height: 1, background: 'rgba(232,160,32,0.15)', margin: '12px 0' }} />

        <FeaturedCardButton product={product} />
      </div>
    </div>
  )
}
