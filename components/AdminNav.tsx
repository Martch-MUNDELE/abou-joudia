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
  const [siteName, setSiteName] = useState('Abou Joudia')
  const [siteBaseline, setSiteBaseline] = useState('AGADIR · LIVRAISON')
  const [siteLogo, setSiteLogo] = useState<string | null>(null)

  useEffect(() => {
    supabase.from('settings').select('*').then(({ data }) => {
      data?.forEach((s: any) => {
        if (s.key === 'site_name') setSiteName(s.value)
        if (s.key === 'site_baseline') setSiteBaseline(s.value)
        if (s.key === 'site_logo') setSiteLogo(s.value || '')
      })
    })
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

      {/* LIGNE 1 : Logo + Déconnexion */}
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '8px 24px 6px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/admin" style={{ textDecoration: 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {siteLogo === null ? <div style={{ width: 36, height: 36, flexShrink: 0 }} /> : siteLogo ? (
              <img src={siteLogo} alt={siteName} style={{ width: 36, height: 36, objectFit: 'contain', flexShrink: 0 }} />
            ) : (
              <Logo size={36} />
            )}
            <div>
              <div style={{ fontSize: 8, color: '#E8A020', letterSpacing: '2px', textTransform: 'uppercase', lineHeight: 1, marginBottom: 2, fontWeight: 700 }}>Admin</div>
              <div style={{ fontFamily: 'Playfair Display, serif', fontWeight: 700, fontSize: 15, background: 'linear-gradient(90deg,#FFD060,#E8901A)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-0.3px', lineHeight: 1.1 }}>{siteName}</div>
              <div style={{ fontSize: 8, color: '#A89880', letterSpacing: '2px', textTransform: 'uppercase', lineHeight: 1, marginTop: 2 }}>{siteBaseline}</div>
            </div>
          </div>
        </Link>

        <button onClick={logout} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8, fontSize: 12, fontWeight: 700, fontFamily: 'DM Sans, sans-serif', color: '#FF6B6B', background: 'rgba(255,107,107,0.08)', border: '1px solid rgba(255,107,107,0.25)', cursor: 'pointer', whiteSpace: 'nowrap' }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          Déconnexion
        </button>
      </div>

      {/* LIGNE 2 : Menu */}
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 24px 10px', display: 'flex', alignItems: 'center', gap: 4, overflowX: 'auto', scrollbarWidth: 'none' }}>
        {LINKS.map(l => (
          <Link key={l.href} href={l.href} style={{ textDecoration: 'none', flexShrink: 0 }}>
            <div style={{ padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600, fontFamily: 'DM Sans, sans-serif', color: isActive(l.href, l.exact) ? '#0A0804' : '#E8DCC8', background: isActive(l.href, l.exact) ? 'linear-gradient(135deg,#F5C842,#FF6B20)' : 'transparent', whiteSpace: 'nowrap' as const }}>
              {l.label}
            </div>
          </Link>
        ))}

        {isSuperAdmin && (
          <Link href="/admin/superadmin" style={{ textDecoration: 'none', flexShrink: 0 }}>
            <div style={{ padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 700, fontFamily: 'DM Sans, sans-serif', color: pathname.startsWith('/admin/superadmin') ? '#0A0804' : '#F5C842', background: pathname.startsWith('/admin/superadmin') ? 'linear-gradient(135deg,#F5C842,#FF6B20)' : 'rgba(245,200,66,0.08)', border: pathname.startsWith('/admin/superadmin') ? 'none' : '1px solid rgba(245,200,66,0.2)', whiteSpace: 'nowrap' as const }}>
              Super Admin
            </div>
          </Link>
        )}
      </div>

    </nav>
  )
}
