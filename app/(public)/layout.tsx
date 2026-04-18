import Navbar from '@/components/Navbar'
import BackgroundSmoke from '@/components/BackgroundSmoke'
import FooterHero from '@/components/FooterHero'
export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main style={{ maxWidth: 768, margin: '0 auto', padding: '0 0 80px', position: 'relative', zIndex: 1 }}>
        {children}
      </main>
      <BackgroundSmoke />
      <FooterHero />
    </>
  )
}