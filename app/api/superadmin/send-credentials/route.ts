import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
const resend = new Resend(process.env.RESEND_API_KEY)
export async function POST(req: NextRequest) {
  const { email, password } = await req.json()
  await resend.emails.send({
    from: 'Abou Joudia Admin <onboarding@resend.dev>',
    to: email,
    subject: 'Vos identifiants Abou Joudia Admin',
    html: '<div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px"><h2>Vos identifiants</h2><p>Email: ' + email + '</p><p>Mot de passe: <code>' + password + '</code></p></div>',
  })
  return NextResponse.json({ success: true })
}