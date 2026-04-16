'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const LINKS = [
  { href: '/admin', label: 'Dashboard', exact: true },
  { href: '/admin/commandes', label: 'Commandes' },
  { href: '/admin/produits', label: 'Produits' },
  { href: '/admin/creneaux', label: 'Créneaux' },
  { href: '/admin/settings', label: 'Paramètres' },
]

const IconLogout = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16 17 21 12 16 7"/>
    <line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
)

export default function AdminNav() {
  const path = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const isActive = (href: string, exact?: boolean) =>
    exact ? path === href : path.startsWith(href)

  const logout = async () => {
    await supabase.auth.signOut()
    router.push('/admin/login')
  }

  return (
    <nav style={{ background: 'rgba(8,6,3,0.97)', borderBottom: '1px solid rgba(232,160,32,0.1)', position: 'sticky', top: 0, zIndex: 50, backdropFilter: 'blur(20px)' }}>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', gap: 4, height: 56, overflowX: 'auto', scrollbarWidth: 'none' }}>

        <div style={{ fontFamily: 'Playfair Display, serif', fontWeight: 700, fontSize: 14, background: 'linear-gradient(90deg,#FFD060,#E8901A)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginRight: 16, flexShrink: 0, letterSpacing: '-0.3px' }}>
          Admin
        </div>

        {LINKS.map(l => (
          <Link key={l.href} href={l.href} style={{ textDecoration: 'none', flexShrink: 0 }}>
            <div style={{ padding: '7px 14px', borderRadius: 8, fontSize: 13, fontWeight: 600, fontFamily: 'DM Sans, sans-serif', color: isActive(l.href, l.exact) ? '#0A0804' : '#7A6E58', background: isActive(l.href, l.exact) ? 'linear-gradient(135deg,#F5C842,#FF6B20)' : 'transparent', transition: 'all 0.15s', whiteSpace: 'nowrap' as const }}>
              {l.label}
            </div>
          </Link>
        ))}

        <div style={{ marginLeft: 'auto', flexShrink: 0 }}>
          <button
            onClick={logout}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600, fontFamily: 'DM Sans, sans-serif', color: '#FF6B6B', background: 'rgba(255,107,107,0.06)', border: '1px solid rgba(255,107,107,0.2)', cursor: 'pointer' }}
          >
            <IconLogout />
            Déconnexion
          </button>
        </div>

      </div>
    </nav>
  )
}
