import { createClient } from '@supabase/supabase-js'
import { renderToBuffer } from '@react-pdf/renderer'
import { FacturePDF } from '@/lib/pdf'
import { calculateOrderTaxSummary, getTaxSettingsFromRows, hasInvoiceableItems, isInvoiceableLine } from '@/lib/tax'
import type { TaxLine } from '@/lib/types/tax'
import { verifyFactureToken } from '@/lib/facture-token'

export const dynamic = 'force-dynamic'

export async function GET(
  req: Request,
  { params }: { params: Promise<{ order_id: string }> }
) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { order_id } = await params
  const token = new URL(req.url).searchParams.get('token')

  if (!token || !verifyFactureToken(order_id, token)) {
    return new Response('Lien expiré', { status: 403 })
  }

  const { data: order } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('id', order_id)
    .single()

  if (!order) return new Response('Commande introuvable', { status: 404 })

  // Pas de facture si aucune ligne facturable.
  const orderItems = (order.order_items ?? []) as TaxLine[]
  if (!hasInvoiceableItems(orderItems)) {
    return new Response('Aucune ligne facturable', { status: 400 })
  }
  const invoiceItems = orderItems.filter(isInvoiceableLine)
  const invoicePdfItems = invoiceItems.map((item: any) => ({
    ...item,
    product_name: item.product_name ?? item.name ?? item.product?.name ?? item.product?.title ?? 'Produit',
    quantity: Number(item.quantity ?? 1),
    unit_price: Number(item.unit_price ?? item.price ?? item.product?.price ?? 0),
  }))

  let slot = null
  if (order.slot_id) {
    const { data } = await supabase
      .from('delivery_slots')
      .select('*')
      .eq('id', order.slot_id)
      .single()
    slot = data
  }

  const { data: settings } = await supabase.from('settings').select('*')
  const siteName = settings?.find((s: { key: string; value?: string }) => s.key === 'site_name')?.value || 'NOM_CLIENT'
  const rawSiteBaseline = settings?.find((s: { key: string; value?: string }) => s.key === 'site_baseline')?.value
  const siteBaseline = rawSiteBaseline && !rawSiteBaseline.includes('VILLE') && !rawSiteBaseline.includes('PAYS') ? rawSiteBaseline : 'AGADIR · LIVRAISON'
  const currency = settings?.find((s: { key: string; value?: string }) => s.key === 'currency')?.value || 'DH'

  const taxSettings = getTaxSettingsFromRows(settings)
  const summary = calculateOrderTaxSummary(orderItems, taxSettings, {
    deliveryFee: order.delivery_fee || 0,
    deliveryInvoiceable: hasInvoiceableItems(orderItems),
    deliveryTaxable: hasInvoiceableItems(orderItems),
  })
  const tax = { enabled: summary.taxEnabled, rate: summary.taxRate, ht: summary.ht, tax: summary.tax, ttc: summary.ttc }

  let factureNum = order.invoice_number
  if (!factureNum) {
    const today = new Date().toISOString().split('T')[0]
    const { count: orderCount } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', today + 'T00:00:00.000Z')
      .lte('created_at', today + 'T23:59:59.999Z')
    const seqNum = String((orderCount ?? 0) + 1).padStart(4, '0')
    const rawInvoicePrefix = settings?.find((s: { key: string; value?: string }) => s.key === 'invoice_prefix')?.value
  const invoicePrefix = rawInvoicePrefix && rawInvoicePrefix !== 'PREFIXE' ? rawInvoicePrefix : 'AJ'
    factureNum = `${invoicePrefix}-${today.replace(/-/g, '')}-${seqNum}`
  }

  const buffer = await renderToBuffer(
    FacturePDF({ order, items: invoicePdfItems, slot, siteName, siteBaseline, factureNum, currency, tax }) as unknown as Parameters<typeof renderToBuffer>[0]
  )

  return new Response(new Uint8Array(buffer), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'inline',
    },
  })
}
