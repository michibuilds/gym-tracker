'use client'
import { useState } from 'react'
import { useApp } from '@/context/AppContext'
import { useRouter } from 'next/navigation'
import BottomNav from '@/components/BottomNav'
import { EXERCISES, TIME_EXERCISES, BODYWEIGHT_EXERCISES } from '@/lib/data'
import type { PlanDay } from '@/lib/types'

export default function BuilderPage() {
  const { addCustomDay, toast } = useApp()
  const router = useRouter()
  const [name, setName] = useState('')
  const [selected, setSelected] = useState<Record<string, boolean>>({})

  function toggle(n: string) {
    setSelected((prev) => ({ ...prev, [n]: !prev[n] }))
  }

  async function save() {
    const trimmed = name.trim()
    if (!trimmed) { toast('Bitte einen Namen eingeben'); return }
    const sel = Object.keys(selected).filter((k) => selected[k])
    if (sel.length === 0) { toast('Mindestens eine Übung wählen'); return }

    const ex = sel.map((n) => {
      const isTime = TIME_EXERCISES.includes(n)
      const isBody = BODYWEIGHT_EXERCISES.includes(n) || isTime
      return { n, goal: isTime ? '3× Halten' : '3×8–12', sets: 3, bodyweight: isBody, time: isTime }
    })

    const day: PlanDay = { id: 'custom' + Date.now(), title: trimmed, ex }
    await addCustomDay(day)
    toast('Trainingstag gespeichert')
    router.push('/')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
      <div className="scroll">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <button className="backbtn" onClick={() => router.push('/')}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M11 18l-6-6 6-6" />
            </svg>
          </button>
          <p className="bigtitle">Neuer Trainingstag</p>
        </div>

        <input
          type="text"
          className="darkinput"
          placeholder="Name, z. B. Tag 5 — Oberkörper"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <div className="grp-label">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 12h2M20 12h2M5 8v8M19 8v8M8 10v4M16 10v4M8 12h8" />
          </svg>
          Krafttraining
        </div>
        <div className="exgrid">
          {EXERCISES.kraft.map((n) => (
            <button key={n} className={`extag${selected[n] ? ' sel' : ''}`} onClick={() => toggle(n)}>
              {n}
            </button>
          ))}
        </div>

        <div className="grp-label">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="4" r="2" />
            <path d="M12 6v6l-3 6M12 12l3 6M7 9l5 1 5-1" />
          </svg>
          Calisthenics
        </div>
        <div className="exgrid">
          {EXERCISES.cal.map((n) => (
            <button key={n} className={`extag${selected[n] ? ' sel' : ''}`} onClick={() => toggle(n)}>
              {n}
            </button>
          ))}
        </div>

        <button className="pill big" style={{ marginTop: 20, width: '100%' }} onClick={save}>
          Tag für diese Woche speichern
        </button>
        <div style={{ height: 20 }} />
      </div>
      <BottomNav />
    </div>
  )
}
