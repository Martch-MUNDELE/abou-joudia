import { createClient } from '@/lib/supabase/server'
import ProductCard from '@/components/ProductCard'
import CatalogueClient from '@/components/CatalogueClient'
import FeaturedCard from '@/components/FeaturedCard'
import PopularCard from '@/components/PopularCard'
import FeaturesBar from '@/components/FeaturesBar'
import type { Product } from '@/lib/types'

export const revalidate = 0
export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const supabase = await createClient()
  const [{ data: products }, { data: settings }] = await Promise.all([
    supabase.from('products').select('*').eq('active', true).order('category'),
    supabase.from('settings').select('*').eq('key', 'status'),
  ])

  const isOpen = ((settings as any[])?.find?.((s: any) => s.key === 'status')?.value || '') === 'open'

  return (
    <div style={{ maxWidth: 600, margin: '0 auto' }}>

      {/* FEATURED ou POPULAR selon sélection */}
      {isOpen && <PopularCard fallback={<FeaturedCard />} />}

      {/* 3 ARGUMENTS */}
      {isOpen && <FeaturesBar />}

      {/* CATALOGUE avec sous-menus */}
      {isOpen && <CatalogueClient products={products || []} isOpen={isOpen} />}

      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
    </div>
  )
}
