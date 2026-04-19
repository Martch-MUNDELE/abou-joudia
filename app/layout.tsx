import type { Metadata } from 'next'
import './globals.css'

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export const metadata: Metadata = {
  title: 'Abou Joudia — Sandwichs & Boissons Agadir',
  description: 'Sandwichs frais, salades et boissons. Livraison à Agadir. Paiement à la livraison.',
  openGraph: {
    title: 'Abou Joudia — Sandwichs & Boissons Agadir',
    description: 'Sandwichs frais, salades et boissons. Livraison à Agadir. Paiement à la livraison.',
    url: 'https://abou-joudia.vercel.app',
    siteName: 'Abou Joudia',
    images: [
      {
        url: 'https://nrpsqvmdmsfekemtrbcz.supabase.co/storage/v1/object/public/products/hero.png',
        width: 1200,
        height: 630,
        alt: 'Abou Joudia — Livraison Agadir',
      }
    ],
    locale: 'fr_FR',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='fr' style={{ background: '#080603' }}>
      <body style={{ background: '#080603', minHeight: '100vh' }}>
        {children}
      </body>
    </html>
  )
}
