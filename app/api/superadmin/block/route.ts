import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
export async function POST(req: NextRequest) {
  const { adminId, performedBy } = await req.json()
  const { data } = await supabase.from('admins').select('email').eq('id', adminId).single()
  await supabase.from('admins').update({ status: 'blocked' }).eq('id', adminId)
  await supabase.auth.admin.updateUserById(adminId, { ban_duration: '876600h' })
  await supabase.from('admin_logs').insert({ action: 'BLOCK_ADMIN', performed_by: performedBy, target_email: data?.email })
  return NextResponse.json({ success: true })
}