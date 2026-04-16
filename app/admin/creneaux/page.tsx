'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import type { DeliverySlot } from '@/lib/types'

export default function CreneauxAdmin() {
  const [slots, setSlots] = useState<DeliverySlot[]>([])
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const supabase = createClient()

  const load = async () => {
    const { data } = await supabase.from('delivery_slots').select('*').gte('date', new Date().toISOString().split('T')[0]).order('date').order('time_start')
    setSlots(data || [])
  }
  useEffect(() => { load() }, [])

  const toggle = async (slot: DeliverySlot) => {
    await supabase.from('delivery_slots').update({ blocked: !slot.blocked }).eq('id', slot.id); load()
  }

  const updateCapacity = async (id: string, capacity: number) => {
    await supabase.from('delivery_slots').update({ capacity }).eq('id', id); load()
  }

  const generateSlots = async (date: string) => {
    const { data: existing } = await supabase.from('delivery_slots').select('id').eq('date', date)
    if (existing && existing.length > 0) { alert('Les créneaux existent déjà pour ce jour.'); return }
    const times = [['09:00','10:00'],['10:00','11:00'],['11:00','12:00'],['12:00','13:00'],['14:00','15:00'],['15:00','16:00'],['16:00','17:00'],['17:00','18:00'],['18:00','19:00']]
    await supabase.from('delivery_slots').insert(times.map(([s,e]) => ({ date, time_start: s, time_end: e, capacity: 10, booked: 0, blocked: false })))
    load()
  }

  const dates = [...new Set(slots.map(s => s.date))].sort()
  const daySlots = slots.filter(s => s.date === selectedDate)
  const pct = (slot: DeliverySlot) => Math.min(100, (slot.booked / slot.capacity) * 100)
  const barColor = (slot: DeliverySlot) => slot.booked >= slot.capacity ? '#FF6B6B' : slot.booked > slot.capacity * 0.7 ? '#FF6B20' : '#5BC57A'

  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 26, fontWeight: 900, color: '#F5EDD6' }}>Créneaux</h1>
        <button onClick={() => generateSlots(selectedDate)} style={{ padding: '9px 18px', borderRadius: 50, border: 'none', background: 'linear-gradient(135deg,#F5C842,#FF6B20)', color: '#0A0804', fontFamily: 'DM Sans, sans-serif', fontWeight: 800, fontSize: 12, cursor: 'pointer' }}>
          + Générer pour ce jour
        </button>
      </div>

      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', marginBottom: 20, paddingBottom: 4 }}>
        {dates.map(date => {
          const active = selectedDate === date
          return (
            <button key={date} onClick={() => setSelectedDate(date)} style={{ flexShrink: 0, padding: '7px 14px', borderRadius: 50, border: '1px solid', borderColor: active ? 'rgba(232,160,32,0.4)' : 'rgba(232,160,32,0.12)', background: active ? 'rgba(232,160,32,0.12)' : 'transparent', color: active ? '#E8A020' : '#7A6E58', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', fontWeight: 600, fontSize: 12 }}>
              {format(new Date(date + 'T12:00:00'), 'EEE d/MM', { locale: fr })}
            </button>
          )
        })}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {daySlots.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px', color: '#7A6E58', fontSize: 14 }}>
            Aucun créneau. Cliquez "Générer" pour créer les créneaux.
          </div>
        )}
        {daySlots.map(slot => (
          <div key={slot.id} style={{ background: '#131009', border: `1px solid ${slot.blocked ? 'rgba(255,107,107,0.15)' : 'rgba(232,160,32,0.1)'}`, borderRadius: 14, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 16, opacity: slot.blocked ? 0.6 : 1 }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: slot.blocked ? '#7A6E58' : '#F5EDD6', minWidth: 110, textDecoration: slot.blocked ? 'line-through' : 'none', fontFamily: 'DM Sans, sans-serif' }}>
              {slot.time_start.slice(0,5)} – {slot.time_end.slice(0,5)}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, color: '#7A6E58' }}>{slot.booked}/{slot.capacity} réservations</div>
              <div style={{ width: '100%', height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 2, marginTop: 5 }}>
                <div style={{ width: `${pct(slot)}%`, height: '100%', background: barColor(slot), borderRadius: 2 }} />
              </div>
            </div>

            {/* BOUTONS +/- */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 11, color: '#7A6E58' }}>Cap.</span>
              <button
                onClick={() => slot.capacity > slot.booked && updateCapacity(slot.id, slot.capacity - 1)}
                style={{ width: 28, height: 28, borderRadius: 50, border: '1px solid rgba(232,160,32,0.2)', background: 'rgba(232,160,32,0.06)', color: '#E8A020', cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >−</button>
              <span style={{ minWidth: 24, textAlign: 'center', fontSize: 13, fontWeight: 700, color: '#F5EDD6', fontFamily: 'DM Sans, sans-serif' }}>{slot.capacity}</span>
              <button
                onClick={() => updateCapacity(slot.id, slot.capacity + 1)}
                style={{ width: 28, height: 28, borderRadius: 50, border: '1px solid rgba(232,160,32,0.2)', background: 'rgba(232,160,32,0.06)', color: '#E8A020', cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >+</button>
            </div>

            <button
              onClick={() => toggle(slot)}
              style={{ padding: '7px 14px', borderRadius: 50, border: '1px solid', borderColor: slot.blocked ? 'rgba(91,197,122,0.3)' : 'rgba(255,107,107,0.3)', background: slot.blocked ? 'rgba(91,197,122,0.08)' : 'rgba(255,107,107,0.08)', color: slot.blocked ? '#5BC57A' : '#FF6B6B', cursor: 'pointer', fontSize: 11, fontWeight: 700, fontFamily: 'DM Sans, sans-serif' }}
            >
              {slot.blocked ? 'Débloquer' : 'Bloquer'}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
