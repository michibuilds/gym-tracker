'use client'
import { useApp } from '@/context/AppContext'
import { useRouter } from 'next/navigation'
import BottomNav from '@/components/BottomNav'
import { WEEKDAYS, MONTHS, pad } from '@/lib/data'
import { useEffect, useState } from 'react'

export default function HomePage() {
  const { state, loading } = useApp()
  const router = useRouter()
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const iv = setInterval(() => setNow(new Date()), 30000)
    return () => clearInterval(iv)
  }, [])

  if (loading) {
    return (
      <div className="loading-screen">
        <div style={{ color: 'var(--dim)', fontSize: 14 }}>Laden…</div>
      </div>
    )
  }

  if (!state) {
    return (
      <div className="loading-screen">
        <div style={{ color: 'var(--dim)', fontSize: 14, textAlign: 'center', padding: '0 32px' }}>
          Supabase nicht verbunden.<br />Bitte .env.local einrichten.
        </div>
      </div>
    )
  }

  const done = Object.values(state.doneThisWeek).filter(Boolean).length
  const todayIdx = state.plan.findIndex((d) => !state.doneThisWeek[d.id])

  function lastDoneLabel(dayId: string): string {
    for (let i = state!.history.length - 1; i >= 0; i--) {
      if (state!.history[i].dayId === dayId) {
        const d = new Date(state!.history[i].date)
        return WEEKDAYS[d.getDay()]
      }
    }
    return 'diese Woche'
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
      <div className="scroll">
        <p className="greet-sub">Willkommen zurück</p>
        <p className="greet-h">Zeit zu trainieren.</p>
        <p className="greet-meta">
          {WEEKDAYS[now.getDay()]}, {now.getDate()}. {MONTHS[now.getMonth()]} · {pad(now.getHours())}:{pad(now.getMinutes())} · {done}/{state.plan.length} Tage diese Woche
        </p>

        <p className="section-label">Trainingstag</p>

        {state.plan.map((day, i) => {
          const isDone = !!state.doneThisWeek[day.id]
          const isToday = i === todayIdx && !isDone
          return (
            <button
              key={day.id}
              className={`daybtn${isDone ? ' done' : ''}${isToday ? ' today' : ''}`}
              onClick={() => router.push(`/session/${day.id}`)}
            >
              <span className={`dot${isDone ? ' done' : ''}${isToday ? ' today' : ''}`}>
                {isDone && (
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12l5 5L20 6" />
                  </svg>
                )}
              </span>
              <span style={{ flex: 1 }}>
                <span className="dayttl">{day.title}</span>
                <span className="daysub">
                  {isDone
                    ? `Erledigt · ${lastDoneLabel(day.id)}`
                    : isToday
                    ? `Heute fällig · ${day.ex.length} Übungen`
                    : `${day.ex.length} Übungen`}
                </span>
              </span>
              {isToday && <span className="runpill">Start</span>}
            </button>
          )
        })}

        <button className="daybtn add" onClick={() => router.push('/builder')}>
          <span className="dot" style={{ borderStyle: 'dashed' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--acc)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </span>
          <span style={{ flex: 1 }}>
            <span className="dayttl" style={{ color: 'var(--acc)' }}>Eigenen Tag erstellen</span>
          </span>
        </button>

        <div style={{ height: 20 }} />
      </div>
      <BottomNav />
    </div>
  )
}
