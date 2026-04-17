import { createClient } from '@/lib/supabase/server'

export default async function AdminDashboard() {
  const supabase = await createClient()
  const { data: orders } = await supabase.from('orders').select('*').order('created_at', { ascending: false })
  const total = orders?.length || 0
  const nouvelles = orders?.filter(o => o.status === 'nouvelle').length || 0
  const today = new Date().toISOString().split('T')[0]
  const todayOrders = orders?.filter(o => o.created_at?.startsWith(today)).length || 0
  const revenue = orders?.reduce((sum, o) => sum + (o.total || 0), 0) || 0

  const STATS = [
    { label: 'Total commandes', value: total, sub: 'Depuis le début', color: '#E8A020' },
    { label: 'Nouvelles', value: nouvelles, sub: 'En attente', color: '#FF6B20' },
    { label: "Aujourd'hui", value: todayOrders, sub: new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }), color: '#7DD87A' },
    { label: 'Chiffre d\'affaires', value: `${revenue.toFixed(0)} DH`, sub: 'Total cumulé', color: '#F5C842' },
  ]

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 28, fontWeight: 800, color: '#F5EDD6', margin: '0 0 4px', letterSpacing: '-0.5px' }}>Dashboard</h1>
        <p style={{ color: '#C8B99A', fontSize: 13, margin: 0 }}>{new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 32 }}>
        {STATS.map(stat => (
          <div key={stat.label} style={{ background: '#131009', border: '1px solid rgba(232,160,32,0.1)', borderRadius: 16, padding: '20px 20px 16px' }}>
            <div style={{ fontSize: 32, fontFamily: 'Playfair Display, serif', fontWeight: 800, color: stat.color, lineHeight: 1, marginBottom: 8 }}>{stat.value}</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#F5EDD6', marginBottom: 3 }}>{stat.label}</div>
            <div style={{ fontSize: 11, color: '#C8B99A' }}>{stat.sub}</div>
          </div>
        ))}
      </div>

      {/* Commandes récentes */}
      <div style={{ background: '#131009', border: '1px solid rgba(232,160,32,0.08)', borderRadius: 16, overflow: 'hidden' }}>
        <div style={{ padding: '18px 20px 14px', borderBottom: '1px solid rgba(232,160,32,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontFamily: 'Playfair Display, serif', fontWeight: 700, fontSize: 16, color: '#F5EDD6' }}>Commandes récentes</span>
          <a href="/admin/commandes" style={{ fontSize: 12, color: '#E8A020', fontWeight: 600, textDecoration: 'none' }}>Voir tout →</a>
        </div>
        {orders?.slice(0, 6).map((o, i) => (
          <div key={o.id} style={{ padding: '14px 20px', borderBottom: i < Math.min((orders?.length || 0), 6) - 1 ? '1px solid rgba(232,160,32,0.06)' : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14, color: '#F5EDD6', marginBottom: 2 }}>{o.customer_name}</div>
              <div style={{ fontSize: 11, color: '#C8B99A' }}>{o.customer_phone} · {new Date(o.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontFamily: 'Playfair Display, serif', fontWeight: 700, fontSize: 15, color: '#F5C842' }}>{o.total?.toFixed(2)} DH</span>
              <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 50, background: o.status === 'nouvelle' ? 'rgba(255,107,32,0.15)' : 'rgba(125,216,122,0.15)', color: o.status === 'nouvelle' ? '#FF8C50' : '#7DD87A', textTransform: 'uppercase' as const, letterSpacing: '0.5px' }}>{o.status}</span>
            </div>
          </div>
        ))}
        {(!orders || orders.length === 0) && (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: '#C8B99A', fontSize: 13 }}>Aucune commande pour l'instant</div>
        )}
      </div>
    </div>
  )
}
