/* eslint-disable @typescript-eslint/no-explicit-any -- Legacy Abou Joudia lint baseline, à refactorer progressivement. */
import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { renderToBuffer } from '@react-pdf/renderer'
import { FacturePDF } from '@/lib/pdf'
import { calculateOrderTaxSummary, getTaxSettingsFromRows, hasInvoiceableItems, isInvoiceableLine } from '@/lib/tax'
import type { TaxLine } from '@/lib/types/tax'
import { Resend } from 'resend'


function getResend() {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    throw new Error('RESEND_API_KEY is required')
  }
  return new Resend(apiKey)
}

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  const { order_id } = await req.json()

  const { data: order } = await supabase.from('orders').select('*, order_items(*)').eq('id', order_id).single()
  if (!order || !order.customer_email) return NextResponse.json({ error: "Pas d'email" }, { status: 400 })

  // Pas de facture si aucune ligne facturable.
  const orderItems = (order.order_items ?? []) as TaxLine[]
  if (!hasInvoiceableItems(orderItems)) {
    return NextResponse.json({ error: 'Aucune ligne facturable' }, { status: 400 })
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
    const { data } = await supabase.from('delivery_slots').select('*').eq('id', order.slot_id).single()
    slot = data
  }

  // Numéro de facture PREFIXE-YYYYMMDD-NNNN
  const today = new Date().toISOString().split('T')[0]
  const { count: orderCount } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', today + 'T00:00:00.000Z')
    .lte('created_at', today + 'T23:59:59.999Z')
  const seqNum = String((orderCount ?? 0) + 1).padStart(4, '0')
  const dateStr = today.replace(/-/g, '')

  type Setting = { key: string; value: string }
  const { data: settings } = await supabase.from('settings').select('*')
  const rawInvoicePrefix = settings?.find((s: Setting) => s.key === 'invoice_prefix')?.value
  const invoicePrefix = rawInvoicePrefix && rawInvoicePrefix !== 'PREFIXE' ? rawInvoicePrefix : 'AJ'
  const factureNum = `${invoicePrefix}-${dateStr}-${seqNum}`
  const logoUrl = settings?.find((s: Setting) => s.key === 'site_logo')?.value || ''
  const siteName = settings?.find((s: Setting) => s.key === 'site_name')?.value || 'NOM_CLIENT'
  const rawSiteBaseline = settings?.find((s: Setting) => s.key === 'site_baseline')?.value
  const siteBaseline = rawSiteBaseline && !rawSiteBaseline.includes('VILLE') && !rawSiteBaseline.includes('PAYS') ? rawSiteBaseline : 'AGADIR · LIVRAISON'
  const currency = settings?.find((s: Setting) => s.key === 'currency')?.value || 'DH'

  // Récapitulatif TVA (TVA extraite du TTC, lignes taxables uniquement)
  const taxSettings = getTaxSettingsFromRows(settings)
  const summary = calculateOrderTaxSummary(orderItems, taxSettings, {
    deliveryFee: order.delivery_fee || 0,
    deliveryInvoiceable: hasInvoiceableItems(orderItems),
    deliveryTaxable: hasInvoiceableItems(orderItems),
  })
  const tax = { enabled: summary.taxEnabled, rate: summary.taxRate, ht: summary.ht, tax: summary.tax, ttc: summary.ttc }
  const showTax = summary.taxEnabled && summary.tax > 0
  // Email = facture : total facturable TTC (lignes facturables + livraison), pas order.total.
  const invoiceTtc = summary.ttc
  const invoiceSubtotalTtc = invoiceTtc - (order.delivery_fee || 0)

  // Stocker le numéro de facture en base
  await supabase.from('orders').update({ invoice_number: factureNum }).eq('id', order_id)

  const pdfBuffer = await renderToBuffer(
    FacturePDF({ order, items: invoicePdfItems, slot, siteName, siteBaseline, factureNum, currency, tax }) as Parameters<typeof renderToBuffer>[0]
  )

  await getResend().emails.send({
    from: `${siteName} <onboarding@resend.dev>`,
    to: order.customer_email,
    subject: `🧾 Facture ${factureNum} — ${siteName}`,
    html: `<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#0A0804;font-family:'Helvetica Neue',Arial,sans-serif">
  <div style="max-width:520px;margin:0 auto;padding:32px 16px">
    <table width="100%" cellpadding="0" cellspacing="0" style="border-bottom:1px solid rgba(232,160,32,0.15);padding-bottom:20px;margin-bottom:0">
      <tr>
        <td width="56" valign="middle">
          <img src="${logoUrl}" alt="${siteName}" width="52" height="52" style="display:block" onerror="this.style.display='none'" />
        </td>
        <td width="12"></td>
        <td valign="middle">
          <div style="font-family:Georgia,serif;font-size:22px;font-weight:900;color:#F5C842;letter-spacing:-0.5px;line-height:1">${siteName}</div>
          <div style="font-size:9px;color:#C8B99A;letter-spacing:3px;text-transform:uppercase;margin-top:4px">${siteBaseline}</div>
        </td>
      </tr>
    </table>
    <div style="padding:28px 0">
      <p style="color:#C8B99A;font-size:14px;margin:0 0 8px">Bonjour <strong style="color:#F5EDD6">${order.customer_name}</strong>,</p>
      <p style="color:#C8B99A;font-size:14px;margin:0 0 24px;line-height:1.6">Merci pour votre commande ! Veuillez trouver ci-joint votre facture.</p>
      <div style="background:rgba(232,160,32,0.06);border:1px solid rgba(232,160,32,0.15);border-radius:12px;padding:20px;text-align:center;margin-bottom:24px">
        <div style="font-size:11px;color:#E8A020;letter-spacing:2px;text-transform:uppercase;margin-bottom:8px">Total de votre commande</div>
        <div style="font-family:Georgia,serif;font-size:36px;font-weight:900;color:#F5C842">${invoiceTtc.toFixed(2)} <span style="font-size:16px">${currency}</span></div>
        ${order.delivery_mode === 'pickup' ? `<div style="font-size:12px;color:#5BC57A;margin-top:6px">Retrait sur place — Frais : Gratuit</div>` : order.delivery_fee > 0 ? `<div style="font-size:12px;color:#C8B99A;margin-top:6px">Sous-total : ${invoiceSubtotalTtc.toFixed(2)} ${currency} &nbsp;|&nbsp; Frais de livraison : <span style="color:#F5C842;font-weight:700">${order.delivery_fee.toFixed(2)} ${currency}</span></div>` : `<div style="font-size:12px;color:#5BC57A;margin-top:6px">Livraison gratuite</div>`}
        ${showTax ? `<div style="font-size:12px;color:#C8B99A;margin-top:6px">HT : ${tax.ht.toFixed(2)} ${currency} &nbsp;|&nbsp; TVA (${tax.rate}%) : ${tax.tax.toFixed(2)} ${currency}</div>` : ''}
        <div style="font-size:12px;color:#888;margin-top:4px">Paiement à la livraison en cash</div>
      </div>
      <p style="color:#7A6E58;font-size:12px;line-height:1.6;margin:0">
        Votre facture PDF est jointe à cet email. Notre équipe prépare votre commande avec soin et vous livrera dans les meilleurs délais.
      </p>
    </div>
    <div style="border-top:1px solid rgba(232,160,32,0.1);padding-top:20px;text-align:center">
      <div style="font-size:11px;color:#555;line-height:1.8">
        ${siteName} — ${siteBaseline}<br>
        <span style="color:#E8A020">Livraison à domicile.</span>
      </div>
    </div>
  </div>
</body>
</html>`,
    attachments: [{ filename: `${factureNum}.pdf`, content: pdfBuffer }]
  })

  return NextResponse.json({ success: true })
}
