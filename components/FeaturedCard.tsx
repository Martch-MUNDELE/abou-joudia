import { createClient } from '@/lib/supabase/server'
import type { Product } from '@/lib/types'
import FeaturedCardClient from '@/components/FeaturedCardClient'

export default async function FeaturedCard() {
  const supabase = await createClient()
  const { data: stockEnabledRow } = await supabase.from('settings').select('value').eq('key', 'stock_enabled').single()
  const stockEnabled = stockEnabledRow?.value === 'true'

  const { data } = await supabase.from('products').select('*').eq('featured', true).single()
  let product = data as Product | null
  
  // If stock enabled and featured product is out of stock, skip it
  if (stockEnabled && product && product.stock !== null && product.stock <= 0) {
    product = null
  }
  
  if (!product) return null

  let query = supabase.from('products').select('*').eq('subcategory', product.subcategory).eq('active', true)
  const { data: allData } = await query
  let allProducts = (allData as Product[]) || []
  
  // Filter out of stock products if stock enabled
  if (stockEnabled) {
    allProducts = allProducts.filter(p => p.stock === null || p.stock > 0)
  }

  return <FeaturedCardClient product={product} allProducts={allProducts} />
}
