'use client'
import Link from 'next/link'
import { useCart } from '@/store/cart'
import { useEffect, useState } from 'react'
import Logo from '@/components/Logo'
import { createClient } from '@/lib/supabase/client'

export default function Navbar() {
  const count = useCart(s => s.count())
  const [mounted, setMounted] = useState(false)
  const [isOpen, setIsOpen] = useState(true)

  useEffect(() => {
    setMounted(true)
    const supabase = createClient()
    supabase.from('settings').select('value').eq('key', 'status').single().then(({ data }) => {
      setIsOpen(data?.value === 'open')
    })
  }, [])

  return (
    <nav style={{ background: 'rgba(8,6,3,0.94)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(232,160,32,0.08)', position: 'sticky', top: 0, zIndex: 50 }}>
      <div style={{ maxWidth: 600, margin: '0 auto', padding: '0 20px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/" style={{ textDecoration: 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Logo size={36} />
            <div>
              <div style={{ fontFamily: 'Playfair Display, serif', fontWeight: 700, fontSize: 15, background: 'linear-gradient(90deg,#FFD060,#E8901A)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-0.3px', lineHeight: 1.1 }}>Abou Joudia</div>
              <div style={{ fontSize: 8, color: '#C8B99A', letterSpacing: '2px', textTransform: 'uppercase', lineHeight: 1, marginTop: 2 }}>Agadir · Livraison</div>
            </div>
          </div>
        </Link>

        {isOpen && (
          <Link href="/panier" style={{ textDecoration: 'none' }}>
            <div style={{ background: mounted && count > 0 ? 'linear-gradient(135deg,#F5C842,#FF6B20)' : 'rgba(255,255,255,0.05)', color: mounted && count > 0 ? '#0A0804' : '#C8B99A', border: mounted && count > 0 ? 'none' : '1px solid rgba(232,160,32,0.15)', padding: '9px 18px', borderRadius: 50, display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'DM Sans, sans-serif', fontWeight: 700, fontSize: 13, transition: 'all 0.25s', boxShadow: mounted && count > 0 ? '0 4px 16px rgba(232,160,32,0.28)' : 'none' }}>
              <span>Panier</span>
              {mounted && count > 0 && (
                <span style={{ background: '#0A0804', color: '#FFFFFF', borderRadius: 50, padding: '2px 8px', fontSize: 11, fontWeight: 800, lineHeight: 1.4 }}>{count}</span>
              )}
            </div>
          </Link>
        )}
      </div>
    </nav>
  )
}
