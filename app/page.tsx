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
    return <div className="loading-screen"><div style={{ color: 'var(--dim)', fontSize: 14 }}>Loading…</div></div>
  }

  if (!state) {
    return (
      <div className="loading-screen">
        <div style={{ color: 'var(--dim)', fontSize: 14, textAlign: 'center', padding: '0 32px' }}>
          Supabase not connected.<br />Please set up .env.local
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
    return 'this week'
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
      <div className="scroll">
        <p className="greet-sub">Welcome back</p>
        <p className="greet-h">Time to train.</p>
        <p className="greet-meta">
          {WEEKDAYS[now.getDay()]}, {MONTHS[now.getMonth()]} {now.getDate()} · {pad(now.getHours())}:{pad(now.getMinutes())} · {done}/{state.plan.length} days this week
        </p>

        <p className="section-label">Training Day</p>

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
                    ? `Done · ${lastDoneLabel(day.id)}`
                    : isToday
                    ? `Today · ${day.ex.length} exercises`
                    : `${day.ex.length} exercises`}
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
            <span className="dayttl" style={{ color: 'var(--acc)' }}>Create custom day</span>
          </span>
        </button>

        <div style={{ height: 20 }} />
      </div>
      <BottomNav />
    </div>
  )
}
