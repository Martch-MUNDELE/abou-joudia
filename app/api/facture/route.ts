import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { renderToBuffer } from '@react-pdf/renderer'
import { FacturePDF } from '@/lib/pdf'
import { Resend } from 'resend'


const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)
const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: NextRequest) {
  const { order_id } = await req.json()

  const { data: order } = await supabase.from('orders').select('*, delivery_slots(*), order_items(*)').eq('id', order_id).single()
  if (!order || !order.customer_email) return NextResponse.json({ error: 'Pas d\'email' }, { status: 400 })

  const pdfBuffer = await renderToBuffer(
    FacturePDF({ order, items: order.order_items, slot: order.delivery_slots }) as any
  )

  await resend.emails.send({
    from: 'Abou Joudia <onboarding@resend.dev>',
    to: order.customer_email,
    subject: `🧾 Votre facture Abou Joudia — ${order.total.toFixed(2)} DH`,
    html: `<div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
      <h2 style="color:#2D6A4F">🥙 Votre facture Abou Joudia</h2>
      <p>Bonjour ${order.customer_name},</p>
      <p>Veuillez trouver ci-joint votre facture pour votre commande de <strong>${order.total.toFixed(2)} DH</strong>.</p>
      <p style="color:#6B7280;font-size:13px">Paiement à la livraison en cash.</p>
    </div>`,
    attachments: [{ filename: `facture-${order.id.slice(0,8)}.pdf`, content: pdfBuffer }]
  })

  return NextResponse.json({ success: true })
}
