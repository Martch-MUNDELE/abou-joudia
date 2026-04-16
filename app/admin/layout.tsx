import AdminNav from '@/components/AdminNav'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', background: '#080603' }}>
      <AdminNav />
      <main style={{ maxWidth: 900, margin: '0 auto', padding: '32px 24px 80px' }}>
        {children}
      </main>
    </div>
  )
}
