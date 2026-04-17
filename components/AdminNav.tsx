'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import Logo from '@/components/Logo'

const LINKS = [
  { href: '/admin', label: 'Dashboard', exact: true },
  { href: '/admin/commandes', label: 'Commandes' },
  { href: '/admin/produits', label: 'Produits' },
  { href: '/admin/creneaux', label: 'Créneaux' },
  { href: '/admin/settings', label: 'Paramètres' },
]

export default function AdminNav() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [isSuperAdmin, setIsSuperAdmin] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (data.user?.email) {
        const { data: admin } = await supabase.from('admins').select('role').eq('email', data.user.email).single()
        setIsSuperAdmin(admin?.role === 'superadmin')
      }
    })
  }, [])

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href)

  const logout = async () => {
    await supabase.auth.signOut()
    router.push('/admin/login')
  }

  return (
    <nav style={{ background: 'rgba(8,6,3,0.97)', borderBottom: '1px solid rgba(232,160,32,0.1)', position: 'sticky', top: 0, zIndex: 50, backdropFilter: 'blur(20px)' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 20px', display: 'flex', alignItems: 'center', gap: 4, height: 56, overflowX: 'auto', scrollbarWidth: 'none' }}>

        {/* LOGO */}
        <Link href="/admin" style={{ textDecoration: 'none', flexShrink: 0, marginRight: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Logo size={36} />
            <div>
              <div style={{ fontSize: 8, color: '#E8A020', letterSpacing: '2px', textTransform: 'uppercase', lineHeight: 1, marginBottom: 3, fontWeight: 700 }}>Admin</div>
              <div style={{ fontFamily: 'Playfair Display, serif', fontWeight: 700, fontSize: 15, background: 'linear-gradient(90deg,#FFD060,#E8901A)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-0.3px', lineHeight: 1.1 }}>Abou Joudia</div>
              <div style={{ fontSize: 8, color: '#A89880', letterSpacing: '2px', textTransform: 'uppercase', lineHeight: 1, marginTop: 2 }}>Agadir · Livraison</div>
            </div>
          </div>
        </Link>

        {/* LIENS */}
        {LINKS.map(l => (
          <Link key={l.href} href={l.href} style={{ textDecoration: 'none', flexShrink: 0 }}>
            <div style={{ padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600, fontFamily: 'DM Sans, sans-serif', color: isActive(l.href, l.exact) ? '#0A0804' : '#E8DCC8', background: isActive(l.href, l.exact) ? 'linear-gradient(135deg,#F5C842,#FF6B20)' : 'transparent', transition: 'all 0.15s', whiteSpace: 'nowrap' as const }}>
              {l.label}
            </div>
          </Link>
        ))}

        {/* SUPER ADMIN */}
        {isSuperAdmin && (
          <Link href="/admin/superadmin" style={{ textDecoration: 'none', flexShrink: 0 }}>
            <div style={{ padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 700, fontFamily: 'DM Sans, sans-serif', color: pathname.startsWith('/admin/superadmin') ? '#0A0804' : '#F5C842', background: pathname.startsWith('/admin/superadmin') ? 'linear-gradient(135deg,#F5C842,#FF6B20)' : 'rgba(245,200,66,0.08)', border: pathname.startsWith('/admin/superadmin') ? 'none' : '1px solid rgba(245,200,66,0.2)', whiteSpace: 'nowrap' as const }}>
              Super Admin
            </div>
          </Link>
        )}

        {/* DÉCONNEXION */}
        <div style={{ marginLeft: 'auto', flexShrink: 0 }}>
          <button onClick={logout} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 700, fontFamily: 'DM Sans, sans-serif', color: '#FF6B6B', background: 'rgba(255,107,107,0.08)', border: '1px solid rgba(255,107,107,0.25)', cursor: 'pointer', whiteSpace: 'nowrap' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Déconnexion
          </button>
        </div>

      </div>
    </nav>
  )
}
