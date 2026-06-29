'use client'
import { useApp } from '@/context/AppContext'
import { useRouter } from 'next/navigation'
import BottomNav from '@/components/BottomNav'
import { WEEKDAYS, MONTHS, fmtKg, MILESTONES } from '@/lib/data'

export default function HistoryPage() {
  const { state } = useApp()
  const router = useRouter()

  if (!state) return null

  const total = state.history.reduce((sum, h) => sum + (h.moved || 0), 0)

  function compareToAnimal(total: number) {
    let m = null
    for (let i = MILESTONES.length - 1; i >= 0; i--) {
      if (total >= MILESTONES[i].kg) { m = MILESTONES[i]; break }
    }
    if (!m) return { icon: '🪶', label: 'Auf dem Weg', sub: 'Erstes Training zählt!' }
    const times = Math.floor(total / m.kg)
    const label = (times > 1 ? `${times} × ` : '') + m.n
    return { icon: m.icon, label, sub: `das entspricht ${fmtKg(m.kg * times)} kg` }
  }

  const cmp = compareToAnimal(total)
  const nextIdx = MILESTONES.findIndex((m) => total < m.kg)
  const startIdx = Math.max(0, (nextIdx < 0 ? MILESTONES.length : nextIdx) - 6)
  const endIdx = Math.min(MILESTONES.length, (nextIdx < 0 ? MILESTONES.length : nextIdx) + 3)
  const visibleMilestones = MILESTONES.slice(startIdx, endIdx)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
      <div className="scroll">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
          <button className="backbtn" onClick={() => router.push('/')}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M11 18l-6-6 6-6" />
            </svg>
          </button>
          <p className="bigtitle">Verlauf</p>
        </div>

        {/* Hero stats */}
        <div style={{ textAlign: 'center', padding: '4px 0 20px' }}>
          <p className="hero-label">Insgesamt bewegt</p>
          <p className="hero-num">{fmtKg(total)} kg</p>
          <p className="hero-sub">{state.history.length} Training{state.history.length !== 1 ? 's' : ''}</p>
          {total > 0 && (
            <div className="compare">
              <span style={{ fontSize: 28 }}>{cmp.icon}</span>
              <div style={{ textAlign: 'left' }}>
                <p style={{ fontSize: 14, fontWeight: 500 }}>{cmp.label}</p>
                <p style={{ fontSize: 11, color: 'var(--dim)', marginTop: 2 }}>{cmp.sub}</p>
              </div>
            </div>
          )}
        </div>

        {/* Milestones */}
        {total > 0 && (
          <>
            <p className="section-label" style={{ marginTop: 0 }}>Meilensteine</p>
            {visibleMilestones.map((m, idx) => {
              const done = total >= m.kg
              const isNext = startIdx + idx === nextIdx
              return (
                <div key={m.n} className={`milestone${done ? ' reached' : ''}${isNext ? ' next' : ''}`}>
                  <span style={{ fontSize: 18 }}>{m.icon}</span>
                  <span>{m.n} — {fmtKg(m.kg)} kg</span>
                  {done ? (
                    <svg className="ms-chk" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12l5 5L20 6" />
                    </svg>
                  ) : (
                    <span className="ms-pct">{Math.round(total / m.kg * 100)}%</span>
                  )}
                </div>
              )
            })}
          </>
        )}

        {/* Recent workouts */}
        <p className="section-label">Letzte Trainings</p>
        {state.history.length === 0 ? (
          <div className="empty">
            Noch keine Trainings abgeschlossen.<br />Starte dein erstes Workout!
          </div>
        ) : (
          [...state.history].reverse().slice(0, 10).map((h, i) => {
            const d = new Date(h.date)
            const movedTxt = h.moved > 0 ? `${fmtKg(h.moved)} kg bewegt` : 'Calisthenics'
            return (
              <div key={i} className="histcard">
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span className="histday">{h.title}</span>
                  <span className="histdate">
                    {WEEKDAYS[d.getDay()].slice(0, 2)}, {d.getDate()}. {MONTHS[d.getMonth()].slice(0, 3)}
                  </span>
                </div>
                <span className="histmeta">{h.exCount} Übungen · {movedTxt}</span>
              </div>
            )
          })
        )}
        <div style={{ height: 20 }} />
      </div>
      <BottomNav />
    </div>
  )
}
