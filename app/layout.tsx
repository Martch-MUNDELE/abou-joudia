import type { Metadata } from 'next'
import './globals.css'
import Navbar from '@/components/Navbar'

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export const metadata: Metadata = {
  title: 'Abou Joudia — Sandwichs & Boissons Agadir',
  description: 'Sandwichs frais, salades et boissons. Livraison à Agadir. Paiement à la livraison.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" style={{ background: '#080603' }}>
      <body style={{ background: '#080603', minHeight: '100vh' }}>
        <Navbar />
        <main style={{ maxWidth: 768, margin: '0 auto', padding: '0 0 80px' }}>
          {children}
        </main>
      </body>
    </html>
  )
}
