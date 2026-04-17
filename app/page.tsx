import { createClient } from '@/lib/supabase/server'
import ProductCard from '@/components/ProductCard'
import SmokeEffect from '@/components/SmokeEffect'
import CatalogueClient from '@/components/CatalogueClient'
import type { Product } from '@/lib/types'

export const revalidate = 0
export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const supabase = await createClient()
  const [{ data: products }, { data: settings }] = await Promise.all([
    supabase.from('products').select('*').eq('active', true).order('category'),
    supabase.from('settings').select('*'),
  ])

  const getSetting = (key: string) => (settings as any[])?.find?.((s: any) => s.key === key)?.value || ''
  const isOpen = getSetting('status') === 'open'
  const statusMessage = getSetting('status_message') || 'Ouvert · Livraison Agadir'
  const heroImage = getSetting('hero_image')

  return (
    <div style={{ maxWidth: 600, margin: '0 auto' }}>

      {/* HERO */}
      <div style={{ position: 'relative', overflow: 'hidden', padding: '36px 20px 32px', minHeight: 400 }}>
        {heroImage && (
          <img src={heroImage} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'right bottom', opacity: 1, mixBlendMode: 'lighten', pointerEvents: 'none', zIndex: 0 }} />
        )}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(8,6,3,0.92) 0%, rgba(8,6,3,0.7) 35%, rgba(8,6,3,0.2) 60%, transparent 80%)', pointerEvents: 'none', zIndex: 1 }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '40%', background: 'linear-gradient(to top, #080603 0%, transparent 100%)', pointerEvents: 'none', zIndex: 1 }} />
        <div style={{ position: 'absolute', top: -40, right: -60, width: '80%', height: '130%', background: 'radial-gradient(ellipse 70% 80% at 75% 45%, rgba(232,120,20,0.18) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 1 }} />

        <div style={{ position: 'relative', zIndex: 2, maxWidth: 300 }}>
          {/* Badge statut */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: isOpen ? 'rgba(101,168,96,0.12)' : 'rgba(220,50,50,0.12)', border: `1px solid ${isOpen ? 'rgba(101,168,96,0.3)' : 'rgba(220,50,50,0.3)'}`, padding: '6px 14px', borderRadius: 50, fontSize: 10, color: isOpen ? '#7DD87A' : '#FF6B6B', fontWeight: 600, letterSpacing: '0.8px', marginBottom: 22, textTransform: 'uppercase' as const }}>
            <span style={{ width: 6, height: 6, background: isOpen ? '#7DD87A' : '#FF6B6B', borderRadius: '50%', display: 'inline-block' }} />
            {statusMessage}
          </div>

          <h1 style={{ fontFamily: 'Playfair Display, serif', fontWeight: 900, fontSize: 'clamp(36px,8vw,52px)', lineHeight: 0.97, letterSpacing: '-2px', margin: '0 0 10px' }}>
            <span style={{ display: 'block', background: 'linear-gradient(135deg,#FFD060 0%,#F5A020 35%,#FF6020 70%,#FF3500 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Saveurs du</span>
            <span style={{ display: 'block', background: 'linear-gradient(135deg,#FFD060 0%,#F5A020 35%,#FF6020 70%,#FF3500 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Souss.</span>
          </h1>
          <p style={{ fontFamily: 'Playfair Display, serif', fontWeight: 700, fontSize: 20, color: '#FFFFFF', margin: '0 0 12px', letterSpacing: '-0.3px', fontStyle: 'italic' }}>Livrées chez toi.</p>
          <p style={{ color: 'rgba(255,255,255,0.72)', fontSize: 13, lineHeight: 1.7, maxWidth: 260, margin: 0 }}>Sandwichs maison, salades fraîches et boissons du terroir. Préparés à Agadir.</p>
        </div>

        {heroImage && <SmokeEffect />}
      </div>

      {/* SÉPARATEUR */}
      <div style={{ height: 1, background: 'linear-gradient(90deg,rgba(232,160,32,0.25),transparent)', margin: '0 20px 24px' }} />

      {/* CATALOGUE avec sous-menus */}
      {isOpen ? (
        <CatalogueClient products={products || []} isOpen={isOpen} />
      ) : (
        <div style={{ margin: '0 16px 40px', background: '#131009', border: '1px solid rgba(255,107,107,0.2)', borderRadius: 16, padding: '32px 24px', textAlign: 'center' }}>
          <div style={{ fontSize: 32, marginBottom: 14 }}>🔒</div>
          <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 18, fontWeight: 700, color: '#F5EDD6', marginBottom: 8 }}>Nous sommes fermés</div>
          <div style={{ fontSize: 13, color: '#7A6E58', lineHeight: 1.6 }}>{statusMessage}</div>
        </div>
      )}

      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
    </div>
  )
}
