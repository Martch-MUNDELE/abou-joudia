'use client'
import AdminNav from '@/components/AdminNav'
import { usePathname } from 'next/navigation'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isLogin = pathname === '/admin/login'

  return (
    <div style={{ minHeight: '100vh', background: '#080603' }}>
      {!isLogin && <AdminNav />}
      <main style={{ maxWidth: 900, margin: '0 auto', padding: isLogin ? '0' : '32px 24px 80px' }}>
        {children}
      </main>
    </div>
  )
}
