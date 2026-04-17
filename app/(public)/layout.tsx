import Navbar from '@/components/Navbar'
export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main style={{ maxWidth: 768, margin: '0 auto', padding: '0 0 80px' }}>
        {children}
      </main>
    </>
  )
}