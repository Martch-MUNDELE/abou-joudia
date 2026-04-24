'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import Logo from '@/components/Logo'

const NAV_GROUPS = [
  {
    label: 'BOUTIQUE',
    links: [
      { href: '/admin', label: 'Dashboard', exact: true },
      { href: '/admin/commandes', label: 'Commandes', sub: [
        { label: 'Nouvelles', anchor: 'nouvelle', url: '/admin/commandes?tab=nouvelle' },
        { label: 'Confirmées', anchor: 'confirmee', url: '/admin/commandes?tab=confirmée' },
        { label: 'Préparation', anchor: 'preparation', url: '/admin/commandes?tab=en_preparation' },
        { label: 'Livraison', anchor: 'livraison', url: '/admin/commandes?tab=en_livraison' },
        { label: 'Livrées', anchor: 'livree', url: '/admin/commandes?tab=livrée' },
        { label: 'Annulées', anchor: 'annulee', url: '/admin/commandes?tab=annulée' },
        { label: 'Retrait', anchor: 'retrait', url: '/admin/commandes?tab=retrait' },
      ]},
      { href: '/admin/produits', label: 'Produits', sub: [
        { label: '+ Ajouter', anchor: 'nouveau', url: '/admin/produits/nouveau' },
        { label: 'Actifs', anchor: 'actifs', url: '/admin/produits?tab=actifs' },
        { label: 'Inactifs', anchor: 'inactifs', url: '/admin/produits?tab=inactifs' },
      ]},
    ],
  },
  {
    label: 'CONFIGURATION',
    links: [
      { href: '/admin/menu', label: 'Menu' },
      { href: '/admin/livraison', label: 'Livraison', sub: [
        { label: 'Mode', anchor: 'mode' },
        { label: 'Position boutique', anchor: 'position' },
        { label: 'Zone & tarifs', anchor: 'zone' },
        { label: 'Simulateur', anchor: 'simulateur' },
      ]},
      { href: '/admin/creneaux', label: 'Créneaux', sub: [
        { label: 'Horaires', anchor: 'horaires' },
        { label: 'Pause déjeuner', anchor: 'pause' },
        { label: 'Jours fermés', anchor: 'fermeture' },
        { label: 'Génération', anchor: 'generation' },
      ]},
      { href: '/admin/settings', label: 'Paramètres', sub: [
        { label: 'Statut service', anchor: 'statut' },
        { label: 'Identité du site', anchor: 'identite' },
        { label: 'Fond de page', anchor: 'fond' },
        { label: 'Image hero', anchor: 'hero' },
        { label: 'Arguments produit', anchor: 'arguments' },
      ]},
    ],
  },
]

export default function AdminNav() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [isSuperAdmin, setIsSuperAdmin] = useState(false)
  const [siteName, setSiteName] = useState('Abou Joudia')
  const [siteLogo, setSiteLogo] = useState<string | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [expandedHref, setExpandedHref] = useState<string | null>(null)

  useEffect(() => {
    supabase.from('settings').select('*').then(({ data }) => {
      data?.forEach((s: any) => {
        if (s.key === 'site_name') setSiteName(s.value)
        if (s.key === 'site_logo') setSiteLogo(s.value || '')
      })
    })
    supabase.auth.getUser().then(async ({ data }) => {
      if (data.user?.email) {
        const { data: admin } = await supabase
          .from('admins')
          .select('role')
          .eq('email', data.user.email)
          .single()
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

  const close = () => { setMenuOpen(false); setExpandedHref(null) }

  const allGroups = [
    ...NAV_GROUPS,
    ...(isSuperAdmin
      ? [{ label: 'ADMIN', links: [{ href: '/admin/superadmin', label: 'Super Admin' }] }]
      : []),
  ]

  const renderLogo = (size: number) =>
    siteLogo === null ? (
      <div style={{ width: size, height: size, flexShrink: 0 }} />
    ) : siteLogo ? (
      <img src={siteLogo} alt={siteName} style={{ width: size, height: size, objectFit: 'contain', flexShrink: 0 }} />
    ) : (
      <Logo size={size} />
    )

  return (
    <>
      {/* Fixed header */}
      <header style={{
        height: 56,
        background: '#0D0B07',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px',
        borderBottom: '1px solid rgba(232,160,32,0.1)',
      }}>
        <Link href="/admin" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
          {renderLogo(28)}
          <div style={{
            fontFamily: 'Playfair Display, serif',
            fontWeight: 700,
            fontSize: 14,
            background: 'linear-gradient(90deg,#FFD060,#E8901A)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            {siteName}
          </div>
        </Link>

        <button
          onClick={() => setMenuOpen(o => !o)}
          style={{
            width: 40,
            height: 40,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            color: '#F5C842',
            fontSize: 22,
            lineHeight: 1,
          }}
          aria-label={menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
        >
          {menuOpen ? '✕' : '≡'}
        </button>
      </header>
      {/* Sous-navigation fixe pour la page active */}
      {(() => {
        const activeLink = allGroups.flatMap(g => g.links).find(l => isActive(l.href, (l as any).exact))
        const sub = activeLink ? (activeLink as any).sub : null
        if (!sub) return null
        return (
          <div style={{ position:'fixed', top:56, left:0, right:0, zIndex:97, background:'#0D0B07', borderBottom:'1px solid rgba(232,160,32,0.1)', display:'flex', overflowX:'auto' as const, padding:'0 8px' }}>
            {sub.map((s: any) => (
              <div key={s.anchor} onClick={() => { if (s.url) window.location.href = s.url; else document.getElementById(s.anchor)?.scrollIntoView({ behavior:'smooth' }) }} style={{ padding:'8px 12px', fontSize:11, fontWeight:600, color:'#C8B99A', cursor:'pointer', whiteSpace:'nowrap' as const, fontFamily:'DM Sans, sans-serif' }}>
                {s.label}
              </div>
            ))}
          </div>
        )
      })()}

      {/* Transparent overlay to close on outside click */}
      {menuOpen && (
        <div
          onClick={close}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 98,
          }}
        />
      )}

      {/* Dropdown below header */}
      {menuOpen && (
        <div style={{
          position: 'fixed',
          top: 56,
          left: 0,
          right: 0,
          background: '#0D0B07',
          zIndex: 99,
          borderBottom: '1px solid rgba(232,160,32,0.15)',
          maxHeight: 'calc(100vh - 56px)',
          overflowY: 'auto',
        }}>
          <div style={{ padding: '8px 0' }}>
            {allGroups.map(group => (
              <div key={group.label}>
                <div style={{
                  fontSize: 9,
                  fontWeight: 800,
                  color: '#7A6E58',
                  letterSpacing: '1.5px',
                  textTransform: 'uppercase' as const,
                  padding: '12px 16px 4px',
                  fontFamily: 'DM Sans, sans-serif',
                }}>
                  {group.label}
                </div>
                {group.links.map(link => {
                  const active = isActive(link.href, (link as any).exact)
                  const sub = (link as any).sub
                  return (
                    <div key={link.href}>
                      <Link
                        href={link.href}
                        onClick={close}
                        style={{ textDecoration: 'none', display: 'block' }}
                      >
                        <div style={{
                          padding: '9px 16px',
                          fontSize: 13,
                          fontWeight: 500,
                          fontFamily: 'DM Sans, sans-serif',
                          color: active ? '#F5C842' : '#C8B99A',
                          background: active ? 'rgba(245,200,66,0.08)' : 'transparent',
                          borderLeft: active ? '2px solid #F5C842' : '2px solid transparent',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}>
                          {link.label}
                          {sub && <span style={{ fontSize: 9, opacity: 0.5 }}>{active ? '▲' : '▼'}</span>}
                        </div>
                      </Link>
                      {sub && (active || expandedHref === link.href) && (
                        <div style={{
                          borderLeft: '1px solid rgba(232,160,32,0.1)',
                          marginLeft: 16,
                        }}>
                          {sub.map((s: any) => (
                            <div
                              key={s.anchor}
                              onClick={() => {
                                close()
                                if (s.url) {
                                  window.location.href = s.url
                                } else {
                                  setTimeout(() => {
                                    document.getElementById(s.anchor)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                                  }, 100)
                                }
                              }}
                              style={{
                                padding: '6px 16px',
                                fontSize: 11,
                                fontWeight: 500,
                                fontFamily: 'DM Sans, sans-serif',
                                color: '#7A6E58',
                                cursor: 'pointer',
                              }}
                              onMouseEnter={e => (e.currentTarget.style.color = '#E8A020')}
                              onMouseLeave={e => (e.currentTarget.style.color = '#7A6E58')}
                            >
                              › {s.label}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>

          <div style={{ borderTop: '1px solid rgba(232,160,32,0.08)', padding: '8px 0' }}>
            <button
              onClick={() => { close(); logout() }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '10px 16px',
                fontSize: 12,
                fontWeight: 700,
                fontFamily: 'DM Sans, sans-serif',
                color: '#FF6B6B',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                width: '100%',
                textAlign: 'left' as const,
              }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              Déconnexion
            </button>
          </div>
        </div>
      )}
    </>
  )
}
