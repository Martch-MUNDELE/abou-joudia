'use client'
import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

export default function NotFound() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const router = useRouter()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = 320
    canvas.height = 320

    const particles: { x: number; y: number; vx: number; vy: number; life: number; maxLife: number; size: number }[] = []

    const addParticle = () => {
      const x = 160 + (Math.random() - 0.5) * 30
      particles.push({
        x, y: 120,
        vx: (Math.random() - 0.5) * 0.6,
        vy: -(Math.random() * 1.2 + 0.4),
        life: 0,
        maxLife: 80 + Math.random() * 40,
        size: Math.random() * 8 + 4,
      })
    }

    let frame = 0
    const animate = () => {
      ctx.clearRect(0, 0, 320, 320)

      if (frame % 4 === 0) addParticle()
      frame++

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]
        p.x += p.vx + Math.sin(p.life * 0.08) * 0.4
        p.y += p.vy
        p.life++
        if (p.life > p.maxLife) { particles.splice(i, 1); continue }
        const t = p.life / p.maxLife
        const alpha = t < 0.2 ? t / 0.2 : 1 - (t - 0.2) / 0.8
        ctx.save()
        ctx.globalAlpha = alpha * 0.35
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size)
        grad.addColorStop(0, '#F5C842')
        grad.addColorStop(1, 'transparent')
        ctx.fillStyle = grad
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      }

      requestAnimationFrame(animate)
    }
    animate()
  }, [])

  return (
    <div style={{
      minHeight: '100vh',
      background: '#080603',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'DM Sans, sans-serif',
      padding: 24,
      position: 'relative',
      overflow: 'hidden',
    }}>

      {/* Fond ambiant */}
      <div style={{
        position: 'absolute',
        width: 400,
        height: 400,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(245,200,66,0.06) 0%, transparent 70%)',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -60%)',
        pointerEvents: 'none',
      }} />

      {/* Canvas fumée */}
      <div style={{ position: 'relative', width: 220, height: 220, marginBottom: 8 }}>
        <canvas ref={canvasRef} style={{ position: 'absolute', top: -80, left: -50, pointerEvents: 'none', opacity: 0.9 }} />

        {/* Sandwich SVG */}
        <svg viewBox="0 0 200 180" width="220" height="198" style={{ position: 'relative', zIndex: 2, filter: 'drop-shadow(0 8px 32px rgba(245,200,66,0.15))' }}>
          {/* Rayons soleil */}
          {Array.from({ length: 12 }, (_, i) => {
            const angle = (i * 30 - 90) * Math.PI / 180
            const r1 = 72, r2 = 88
            return (
              <line key={i}
                x1={100 + Math.cos(angle) * r1}
                y1={85 + Math.sin(angle) * r1}
                x2={100 + Math.cos(angle) * r2}
                y2={85 + Math.sin(angle) * r2}
                stroke="#F5C842" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"
              />
            )
          })}
          {/* Pain du haut */}
          <ellipse cx="100" cy="62" rx="52" ry="28" fill="#E8A020" opacity="0.95"/>
          <ellipse cx="100" cy="58" rx="48" ry="22" fill="#F5B830"/>
          <ellipse cx="100" cy="55" rx="44" ry="16" fill="#F5C842" opacity="0.6"/>
          {/* Graines */}
          <ellipse cx="88" cy="53" rx="4" ry="2" fill="#E8A020" transform="rotate(-20 88 53)"/>
          <ellipse cx="106" cy="50" rx="4" ry="2" fill="#E8A020" transform="rotate(10 106 50)"/>
          <ellipse cx="118" cy="56" rx="3.5" ry="1.8" fill="#E8A020" transform="rotate(-10 118 56)"/>
          {/* Laitue */}
          <path d="M48 88 Q70 78 100 82 Q130 78 152 88 Q130 96 100 92 Q70 96 48 88Z" fill="#5BC57A" opacity="0.9"/>
          <path d="M52 86 Q75 80 100 83 Q125 80 148 86" fill="none" stroke="#3DA85A" strokeWidth="1"/>
          {/* Galette */}
          <rect x="50" y="92" width="100" height="10" rx="5" fill="#C8781A" opacity="0.9"/>
          {/* Tomate */}
          <path d="M50 106 Q100 100 150 106 Q150 118 100 120 Q50 118 50 106Z" fill="#E8402A" opacity="0.85"/>
          <line x1="100" y1="101" x2="100" y2="119" stroke="#C83020" strokeWidth="0.8" opacity="0.5"/>
          <line x1="75" y1="102" x2="75" y2="119" stroke="#C83020" strokeWidth="0.8" opacity="0.5"/>
          <line x1="125" y1="102" x2="125" y2="119" stroke="#C83020" strokeWidth="0.8" opacity="0.5"/>
          {/* Pain du bas */}
          <ellipse cx="100" cy="130" rx="55" ry="14" fill="#E8A020"/>
          <ellipse cx="100" cy="128" rx="52" ry="12" fill="#F5B830"/>
          {/* Assiette / base */}
          <ellipse cx="100" cy="154" rx="60" ry="8" fill="#1A1408" opacity="0.4"/>
          <ellipse cx="100" cy="152" rx="58" ry="6" fill="#2A1E0A" opacity="0.6"/>
        </svg>
      </div>

      {/* 404 */}
      <div style={{
        fontFamily: 'Playfair Display, serif',
        fontSize: 96,
        fontWeight: 900,
        color: '#F5C842',
        lineHeight: 1,
        marginBottom: 8,
        letterSpacing: '-4px',
        opacity: 0.95,
      }}>
        404
      </div>

      <div style={{ fontSize: 18, fontWeight: 600, color: '#F5EDD6', marginBottom: 8 }}>
        Cette page n'existe pas
      </div>

      <div style={{ fontSize: 14, color: '#8A7A60', marginBottom: 40, textAlign: 'center', maxWidth: 300, lineHeight: 1.6 }}>
        Elle s'est peut-être perdue en route, comme une commande sans adresse.
      </div>

      <button
        onClick={() => router.push('/')}
        style={{
          padding: '14px 36px',
          borderRadius: 50,
          border: 'none',
          background: 'linear-gradient(135deg, #F5C842, #FF6B20)',
          color: '#0A0804',
          fontFamily: 'DM Sans, sans-serif',
          fontWeight: 800,
          fontSize: 14,
          cursor: 'pointer',
          letterSpacing: '0.3px',
        }}
      >
        Retour à l'accueil
      </button>
    </div>
  )
}
