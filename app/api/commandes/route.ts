/* eslint-disable @typescript-eslint/no-unused-vars -- Legacy Abou Joudia warnings baseline, à refactorer progressivement. */
/* eslint-disable @typescript-eslint/no-explicit-any -- Legacy Abou Joudia lint baseline, à refactorer progressivement. */
import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { sendOrderNotification } from '@/lib/notifications'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  const body = await req.json()

  const { data: shopStatus } = await supabase.from('settings').select('value').eq('key', 'status').single()
  if (shopStatus?.value === 'closed') {
    return NextResponse.json({ error: 'Le shop est actuellement fermé' }, { status: 403 })
  }
  const { data: currencyRow } = await supabase.from('settings').select('value').eq('key', 'currency').single()
  const currency = currencyRow?.value || 'DH'
  const { data: siteNameRow } = await supabase.from('settings').select('value').eq('key', 'site_name').single()
  const siteName = siteNameRow?.value || 'Abou Joudia'
  const { data: adminEmailRow } = await supabase.from('settings').select('value').eq('key', 'notification_email').single()
  const adminEmail = adminEmailRow?.value || undefined
  const { name, phone, address, note, slot_id, items, total, lat, lng, geo_address, email, wantFacture, delivery_mode, delivery_fee, distance_km } = body

  const { data: slot } = await supabase.from('delivery_slots').select('*').eq('id', slot_id).single()
  if (!slot || slot.blocked || slot.booked >= slot.capacity) {
    return NextResponse.json({ error: 'Créneau non disponible' }, { status: 400 })
  }

  // Stock check
  const { data: stockEnabledRow } = await supabase.from('settings').select('value').eq('key', 'stock_enabled').single()
  const stockEnabled = stockEnabledRow?.value === 'true'
  
  if (stockEnabled) {
    const productIds = items.map((item: any) => item.product_id)
    const { data: products } = await supabase.from('products').select('id, name, stock').in('id', productIds)
    
    for (const item of items) {
      const product = products?.find((p: any) => p.id === item.product_id)
      if (product && product.stock !== null && product.stock < item.quantity) {
        return NextResponse.json({ 
          error: `Stock insuffisant pour ${product.name} (${product.stock} disponible)` 
        }, { status: 400 })
      }
    }
  }

  const subtotal = items.reduce((sum: number, item: any) => sum + item.unit_price * item.quantity, 0)
  const calculatedTotal = subtotal + (delivery_fee ?? 0)

  const today = new Date().toISOString().split('T')[0]
  const { count: orderCount } = await supabase.from('orders')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', today + 'T00:00:00.000Z')
    .lte('created_at', today + 'T23:59:59.999Z')
  const seqNum = String((orderCount ?? 0) + 1).padStart(4, '0')
  const invoice_number = `AJ-${today.replace(/-/g, '')}-${seqNum}`

  const { data: order, error } = await supabase.from('orders').insert({
    customer_name: name, customer_phone: phone, customer_address: address,
    customer_note: note, slot_id, total: calculatedTotal, payment_method: 'livraison', status: 'nouvelle',
    lat: lat || null, lng: lng || null, geo_address: geo_address || null,
    customer_email: (wantFacture && email) ? email : null,
    delivery_mode: delivery_mode || null, delivery_fee: delivery_fee ?? null, distance_km: distance_km ?? null,
    invoice_number,
  }).select().single()

  if (error || !order) return NextResponse.json({ error: 'Erreur création commande' }, { status: 500 })

  // BF-P2-001 AJ ORDER API PROMO FIELDS PATCH
  await supabase.from('order_items').insert(items.map((item: any) => ({
    order_id: order.id,
    product_id: item.product_id,
    product_name: item.product_name,
    quantity: item.quantity,
    unit_price: item.unit_price,
    selected_variants: item.selected_variants ?? null,
    line_type: item.line_type ?? 'classic',
    original_unit_price: item.original_unit_price ?? null,
    discount_percent: item.discount_percent ?? null,
    discount_amount: item.discount_amount ?? null,
    is_promotion_gift: item.is_promotion_gift ?? false,
    promotion_rule_id: item.promotion_rule_id ?? null,
    promotion_label: item.promotion_label ?? null,
    can_trigger_promotion: item.can_trigger_promotion ?? true,
    is_vip: item.is_vip ?? false,
  })))

  // Decrement stock if enabled
  if (stockEnabled) {
    for (const item of items) {
      await supabase.rpc('decrement_stock', { product_id: item.product_id, qty: item.quantity })
    }
  }
  await supabase.from('delivery_slots').update({ booked: slot.booked + 1 }).eq('id', slot_id)
  await sendOrderNotification({ ...order, items, slot }, currency, siteName, adminEmail)

  if (wantFacture && email) {
    try {
      const requestOrigin = req.headers.get('origin')
      const requestHost = req.headers.get('host')
      const requestProto = req.headers.get('x-forwarded-proto') ?? 'http'
      const factureBaseUrl = requestOrigin ?? (requestHost ? `${requestProto}://${requestHost}` : process.env.NEXT_PUBLIC_SITE_URL)
      if (!factureBaseUrl) throw new Error('Facture base URL introuvable')
      await fetch(`${factureBaseUrl}/api/facture`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_id: order.id })
      })
    } catch (e) { console.error('Facture error:', e) }
  }

  return NextResponse.json(order)
}
