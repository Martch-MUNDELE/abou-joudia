'use client'
import { useState, useRef, useEffect } from 'react'
import React from 'react'
import ProductCard from '@/components/ProductCard'
import type { Product } from '@/lib/types'

const GROUPES = [
  {
    id: 'boissons', label: 'Boissons', emoji: 'boissons',
    sous: [
      { id: 'chaudes', label: 'Boissons Chaudes', emoji: 'chaudes' },
      { id: 'froides', label: 'Boissons Froides', emoji: 'froides' },
    ]
  },
  {
    id: 'sandwichs', label: 'Sandwichs', emoji: 'sandwichs',
    sous: [
      { id: 'sandwichs_chauds', label: 'Sandwichs Chauds', emoji: 'chauds' },
      { id: 'sandwichs_froids', label: 'Sandwichs Froids', emoji: 'froids' },
    ]
  },
  { id: 'salades', label: 'Salades', emoji: 'salades', sous: [] },
]

const renderIcon = (id: string, size = 16): React.ReactNode => {
  const s = size < 20 ? 20 : size
  const flamme = (
    <svg width={s} height={s} viewBox='0 0 38 38' fill='none' xmlns='http://www.w3.org/2000/svg'>
      <path d='M15 9 Q13 6 15 4 Q17 2 15 1' stroke='currentColor' strokeWidth='1.3' strokeLinecap='round' opacity='0.45'/>
      <path d='M19 7 Q18 5 19.5 3.5 Q20.5 2 19 1' stroke='currentColor' strokeWidth='1.3' strokeLinecap='round' opacity='0.55'/>
      <path d='M23 9 Q25 6 23 4 Q21 2 23 1' stroke='currentColor' strokeWidth='1.3' strokeLinecap='round' opacity='0.45'/>
      <path d='M19 9 C17 14 12 17 12 22 C12 27.5 15 32 19 33 C23 32 26 27.5 26 22 C26 17 21 14 19 9Z' stroke='currentColor' strokeWidth='2' fill='rgba(232,160,32,0.2)' strokeLinecap='round' strokeLinejoin='round'/>
      <path d='M16 24 C16 21 17.5 19 19 17 C20.5 19 22 22 21 26' stroke='currentColor' strokeWidth='1.5' fill='none' strokeLinecap='round'/>
    </svg>
  )
  const flocon = (
    <svg width={s} height={s} viewBox='0 0 40 40' fill='none' xmlns='http://www.w3.org/2000/svg'>
      <line x1='20' y1='4' x2='20' y2='36' stroke='currentColor' strokeWidth='2.2' strokeLinecap='round'/>
      <line x1='4' y1='20' x2='36' y2='20' stroke='currentColor' strokeWidth='2.2' strokeLinecap='round'/>
      <line x1='8' y1='8' x2='32' y2='32' stroke='currentColor' strokeWidth='2.2' strokeLinecap='round'/>
      <line x1='32' y1='8' x2='8' y2='32' stroke='currentColor' strokeWidth='2.2' strokeLinecap='round'/>
      <line x1='15' y1='7' x2='20' y2='13' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round'/>
      <line x1='25' y1='7' x2='20' y2='13' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round'/>
      <line x1='15' y1='33' x2='20' y2='27' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round'/>
      <line x1='25' y1='33' x2='20' y2='27' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round'/>
      <line x1='7' y1='15' x2='13' y2='20' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round'/>
      <line x1='7' y1='25' x2='13' y2='20' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round'/>
      <line x1='33' y1='15' x2='27' y2='20' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round'/>
      <line x1='33' y1='25' x2='27' y2='20' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round'/>
      <circle cx='20' cy='20' r='2.5' fill='currentColor'/>
    </svg>
  )
  const burger = (
    <svg width={s} height={s} viewBox='0 0 40 40' fill='none' xmlns='http://www.w3.org/2000/svg'>
      <path d='M8 19 Q8 7 20 7 Q32 7 32 19Z' stroke='currentColor' strokeWidth='2' fill='rgba(232,160,32,0.15)' strokeLinecap='round' strokeLinejoin='round'/>
      <path d='M7 21 Q10 18.5 13 21 Q16 18.5 20 21 Q24 18.5 27 21 Q30 18.5 33 21' stroke='currentColor' strokeWidth='2' fill='none' strokeLinecap='round'/>
      <rect x='8' y='23' width='24' height='3.5' rx='1.8' stroke='currentColor' strokeWidth='2' fill='rgba(232,160,32,0.15)'/>
      <path d='M8 28.5 Q8 35 20 35 Q32 35 32 28.5Z' stroke='currentColor' strokeWidth='2' fill='rgba(232,160,32,0.15)' strokeLinecap='round' strokeLinejoin='round'/>
    </svg>
  )
  const tasse = (
    <svg width={s} height={s} viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
      <path d='M17 8h1a4 4 0 0 1 0 8h-1'/>
      <path d='M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V8z'/>
      <line x1='6' y1='2' x2='6' y2='4'/>
      <line x1='10' y1='2' x2='10' y2='4'/>
      <line x1='14' y1='2' x2='14' y2='4'/>
    </svg>
  )
  const salade = (
    <svg width={s} height={s} viewBox='0 0 38 38' fill='none' xmlns='http://www.w3.org/2000/svg'>
      <path d='M19 4 C21 4 23 5 23 7 C25 5 28 6 28 9 C31 8 33 11 31 14 C34 14 35 18 33 20 C35 22 33 26 30 26 C31 29 29 32 26 31 C25 34 22 35 19 34 C16 35 13 34 12 31 C9 32 7 29 8 26 C5 26 3 22 5 20 C3 18 4 14 7 14 C5 11 7 8 10 9 C10 6 13 5 15 7 C15 5 17 4 19 4Z' stroke='currentColor' strokeWidth='2' fill='rgba(232,160,32,0.1)' strokeLinejoin='round'/>
      <path d='M19 10 C21 10 23 12 21 14 C24 13 26 16 24 18 C26 19 26 22 24 23 C25 25 23 27 21 25 C20 27 19 28 19 28 C19 28 18 27 17 25 C15 27 13 25 14 23 C12 22 12 19 14 18 C12 16 14 13 17 14 C15 12 17 10 19 10Z' stroke='currentColor' strokeWidth='1.5' fill='rgba(232,160,32,0.2)' strokeLinejoin='round'/>
      <circle cx='19' cy='19' r='2.5' fill='currentColor' opacity='0.85'/>
    </svg>
  )
  const map: Record<string, React.ReactNode> = {
    boissons: tasse, chaudes: flamme, froides: flocon,
    sandwichs: burger, chauds: flamme, froids: flocon,
    salades: salade,
  }
  return map[id] ?? null
}

export default function CatalogueClient({ products, isOpen }: { products: Product[], isOpen: boolean }) {
  const [activeGroupe, setActiveGroupe] = useState('boissons')
  const [activeSous, setActiveSous] = useState('chaudes')
  const [openDropdown, setOpenDropdown] = useState(false)
  const [hasSelected, setHasSelected] = useState(false)
  const dropRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) setOpenDropdown(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const groupe = GROUPES.find(g => g.id === activeGroupe)!

  const handleSelect = (groupeId: string, sousId?: string) => {
    setActiveGroupe(groupeId)
    const g = GROUPES.find(g => g.id === groupeId)!
    setActiveSous(sousId || (g.sous[0]?.id ?? groupeId))
    setOpenDropdown(false)
    setHasSelected(true)
  }

  const getProducts = () => {
    if (groupe.sous.length === 0) return products.filter(p => p.subcategory === activeGroupe)
    return products.filter(p => p.subcategory === activeSous)
  }

  const filtered = getProducts()
  const currentSous = groupe.sous.find(s => s.id === activeSous)
  const currentLabel = currentSous ? currentSous.label : groupe.label
  const currentEmoji = currentSous ? currentSous.emoji : groupe.emoji

  const countGroupe = (g: typeof GROUPES[0]) =>
    g.sous.length === 0
      ? products.filter(p => p.subcategory === g.id).length
      : g.sous.reduce((acc, s) => acc + products.filter(p => p.subcategory === s.id).length, 0)

  return (
    <div style={{ padding: '0 0 80px' }}>
      {/* DROPDOWN MENU */}
      <div ref={dropRef} style={{ position: 'relative', margin: '0 16px 24px' }}>
        <button
          onClick={() => setOpenDropdown(o => !o)}
          style={{ width: '100%', padding: '16px 20px', background: '#131009', border: '1px solid rgba(232,160,32,0.2)', borderRadius: 14, color: '#F5EDD6', fontFamily: 'DM Sans, sans-serif', fontWeight: 600, fontSize: 15, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', textAlign: 'left' as const }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ display: 'inline-flex', width: 32, height: 32, borderRadius: 9, background: 'rgba(232,160,32,0.1)', border: '1px solid rgba(232,160,32,0.2)', alignItems: 'center', justifyContent: 'center', color: '#E8A020' }}>
              {renderIcon(currentEmoji, 16)}
            </span>
            <span style={{ fontStyle: hasSelected ? 'normal' : 'italic', color: hasSelected ? '#F5EDD6' : '#7A6E58' }}>
              {hasSelected ? currentLabel : "Qu'est-ce qui te fait envie ?"}
            </span>
          </span>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ transform: openDropdown ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }}>
            <path d="M3 6L8 11L13 6" stroke="#7A6E58" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        {openDropdown && (
          <div style={{ position: 'absolute', top: 'calc(100% + 8px)', left: 0, right: 0, background: '#1A1510', border: '1px solid rgba(232,160,32,0.2)', borderRadius: 14, overflow: 'hidden', zIndex: 50, boxShadow: '0 16px 48px rgba(0,0,0,0.6)' }}>
            {GROUPES.map((g, gi) => (
              <div key={g.id}>
                <div style={{ padding: '10px 16px 6px', fontSize: 10, fontWeight: 700, color: '#7A6E58', letterSpacing: '1.5px', textTransform: 'uppercase' as const, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ color: '#E8A020' }}>{renderIcon(g.emoji, 11)}</span>
                  {g.label} · {countGroupe(g)} produits
                </div>
                {g.sous.length > 0 ? g.sous.map(s => {
                  const count = products.filter(p => p.subcategory === s.id).length
                  const isActive = activeGroupe === g.id && activeSous === s.id && hasSelected
                  return (
                    <button key={s.id} onClick={() => handleSelect(g.id, s.id)} style={{ width: '100%', padding: '12px 16px 12px 28px', background: isActive ? 'rgba(232,160,32,0.1)' : 'transparent', border: 'none', borderLeft: isActive ? '3px solid #F5C842' : '3px solid transparent', color: isActive ? '#F5C842' : '#C8B890', fontFamily: 'DM Sans, sans-serif', fontWeight: isActive ? 700 : 500, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', textAlign: 'left' as const }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ display: 'inline-flex', width: 28, height: 28, borderRadius: 8, background: 'rgba(232,160,32,0.08)', border: '1px solid rgba(232,160,32,0.15)', alignItems: 'center', justifyContent: 'center', color: '#E8A020', flexShrink: 0 }}>
                          {renderIcon(s.emoji, 14)}
                        </span>
                        {s.label}
                      </span>
                      <span style={{ fontSize: 11, color: '#7A6E58', background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: 50 }}>{count}</span>
                    </button>
                  )
                }) : (
                  <button onClick={() => handleSelect(g.id)} style={{ width: '100%', padding: '12px 16px 12px 28px', background: activeGroupe === g.id && hasSelected ? 'rgba(232,160,32,0.1)' : 'transparent', border: 'none', borderLeft: activeGroupe === g.id && hasSelected ? '3px solid #F5C842' : '3px solid transparent', color: activeGroupe === g.id && hasSelected ? '#F5C842' : '#C8B890', fontFamily: 'DM Sans, sans-serif', fontWeight: activeGroupe === g.id && hasSelected ? 700 : 500, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', textAlign: 'left' as const }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ display: 'inline-flex', width: 28, height: 28, borderRadius: 8, background: 'rgba(232,160,32,0.08)', border: '1px solid rgba(232,160,32,0.15)', alignItems: 'center', justifyContent: 'center', color: '#E8A020', flexShrink: 0 }}>
                        {renderIcon(g.emoji, 14)}
                      </span>
                      {g.label}
                    </span>
                    <span style={{ fontSize: 11, color: '#7A6E58', background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: 50 }}>{countGroupe(g)}</span>
                  </button>
                )}
                {gi < GROUPES.length - 1 && <div style={{ height: 1, background: 'rgba(232,160,32,0.08)', margin: '4px 0' }} />}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* LISTE PRODUITS */}
      {hasSelected && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '0 16px' }}>
          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#7A6E58', padding: '40px 0', fontSize: 14 }}>Aucun produit disponible</div>
          ) : filtered.map((p, i) => (
            <ProductCard key={p.id} product={p} featured={i === 0 && activeGroupe === 'sandwichs' && activeSous === 'sandwichs_chauds'} isOpen={isOpen} />
          ))}
        </div>
      )}
    </div>
  )
}
