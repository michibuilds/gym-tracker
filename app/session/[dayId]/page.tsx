'use client'
import { useEffect, useRef, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useApp } from '@/context/AppContext'
import { fmtNum, fmtTime, SOUNDS } from '@/lib/data'
import type { Exercise, SetData } from '@/lib/types'

/* ── Value field (vertical drag to change number) ── */
function VField({
  exName, which, unit, initialVal, onUpdate,
}: {
  exName: string
  which: 'kg' | 'rep' | 'sec'
  unit: string
  initialVal: number
  onUpdate: (val: number) => void
}) {
  const step = which === 'kg' ? 2.5 : 1
  const min = which === 'kg' ? 0 : which === 'sec' ? 1 : 0
  const PXSTEP = 20
  const [val, setVal] = useState(initialVal)
  const startY = useRef(0)
  const startVal = useRef(initialVal)
  const [active, setActive] = useState(false)
  const elRef = useRef<HTMLDivElement>(null)

  function clamp(v: number) { return Math.max(min, v) }

  function updateVal(newVal: number) {
    const clamped = clamp(newVal)
    setVal(clamped)
    onUpdate(clamped)
    try {
      elRef.current?.animate([{ transform: 'scale(1.18)' }, { transform: 'scale(1)' }], {
        duration: 140, easing: 'cubic-bezier(.2,.9,.3,1)',
      })
    } catch { /* ignore */ }
  }

  function onTouchStart(e: React.TouchEvent) {
    startY.current = e.touches[0].clientY
    startVal.current = val
    setActive(true)
  }

  function onTouchMove(e: React.TouchEvent) {
    e.preventDefault()
    const dy = startY.current - e.touches[0].clientY
    const newVal = startVal.current + Math.round(dy / PXSTEP) * step
    updateVal(newVal)
  }

  function onMouseDown(e: React.MouseEvent) {
    startY.current = e.clientY
    startVal.current = val
    setActive(true)
    function mm(ev: MouseEvent) {
      const dy = startY.current - ev.clientY
      updateVal(startVal.current + Math.round(dy / PXSTEP) * step)
    }
    function mu() {
      setActive(false)
      document.removeEventListener('mousemove', mm)
      document.removeEventListener('mouseup', mu)
    }
    document.addEventListener('mousemove', mm)
    document.addEventListener('mouseup', mu)
  }

  const icon = which === 'kg' ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12h2M20 12h2M5 8v8M19 8v8M8 10v4M16 10v4M8 12h8" />
    </svg>
  ) : which === 'sec' ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="13" r="8" /><path d="M12 9v4l2.5 1.5M9 2h6" />
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12a9 9 0 0115-6.7L21 8M21 12a9 9 0 01-15 6.7L3 16" />
      <path d="M21 4v4h-4M3 20v-4h4" />
    </svg>
  )

  return (
    <div
      ref={elRef}
      className={`vfield${active ? ' active' : ''}`}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={() => setActive(false)}
      onMouseDown={onMouseDown}
    >
      <div className="vstack">
        <span className="ghost ghost-up">{fmtNum(val + step)}</span>
        <span className="sval">{fmtNum(val)}</span>
        <span className="ghost ghost-down">{fmtNum(clamp(val - step))}</span>
      </div>
      <span className="vicon">{icon}</span>
    </div>
  )
}

/* ── Swipeable set row ── */
function SetRow({
  label, ex, isBody, initialKg, initialRep, onUpdate, onDoneChange, maxX,
}: {
  label: number
  ex: Exercise
  isBody: boolean
  initialKg: number
  initialRep: number
  onUpdate: (kg: number | null, rep: number) => void
  onDoneChange: (done: boolean) => void
  maxX: number
}) {
  const rowRef = useRef<HTMLDivElement>(null)
  const startX = useRef(0)
  const startY = useRef(0)
  const curX = useRef(0)
  const decided = useRef(false)
  const horiz = useRef(false)
  const isDoneRef = useRef(false)
  const kg = useRef(initialKg)
  const rep = useRef(initialRep)

  function onTouchStart(e: React.TouchEvent) {
    if ((e.target as HTMLElement).closest('.vfield')) return
    startX.current = e.touches[0].clientX
    startY.current = e.touches[0].clientY
    decided.current = false
    horiz.current = false
    rowRef.current?.classList.remove('settled')
  }

  function onTouchMove(e: React.TouchEvent) {
    const dx = e.touches[0].clientX - startX.current
    const dy = e.touches[0].clientY - startY.current
    if (!decided.current) {
      if (Math.abs(dx) > 8 || Math.abs(dy) > 8) {
        decided.current = true
        horiz.current = Math.abs(dx) > Math.abs(dy)
      }
    }
    if (decided.current && horiz.current) {
      e.preventDefault()
      const base = isDoneRef.current ? maxX : 0
      let x = base + dx
      if (x < 0) x = x * 0.3
      if (x > maxX) x = maxX + (x - maxX) * 0.3
      curX.current = x
      if (rowRef.current) rowRef.current.style.transform = `translateX(${x}px)`
    }
  }

  function onTouchEnd() {
    rowRef.current?.classList.add('settled')
    if (horiz.current) {
      if (curX.current > maxX * 0.3) {
        isDoneRef.current = true
        if (rowRef.current) rowRef.current.style.transform = ''
        rowRef.current?.classList.add('done')
        onDoneChange(true)
        if (navigator.vibrate) navigator.vibrate(15)
      } else {
        isDoneRef.current = false
        if (rowRef.current) rowRef.current.style.transform = ''
        rowRef.current?.classList.remove('done')
        onDoneChange(false)
      }
    }
  }

  return (
    <div className="setwrap">
      <div className="setbg">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12l5 5L20 6" />
        </svg>
        Erledigt
      </div>
      <div
        ref={rowRef}
        className="setrow settled"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <span className="setlbl">{label}</span>
        {!isBody && (
          <VField
            exName={ex.n} which="kg" unit="kg" initialVal={initialKg}
            onUpdate={(v) => { kg.current = v; onUpdate(v, rep.current) }}
          />
        )}
        <VField
          exName={ex.n} which="rep" unit="Wdh" initialVal={initialRep}
          onUpdate={(v) => { rep.current = v; onUpdate(isBody ? null : kg.current, v) }}
        />
        <div className="swipebar" />
      </div>
    </div>
  )
}

/* ── Timer component ── */
function TimerBlock({ exName, initialSec, sound, onUpdate }: {
  exName: string
  initialSec: number
  sound: string
  onUpdate: (sec: number) => void
}) {
  const [remain, setRemain] = useState(initialSec)
  const [running, setRunning] = useState(false)
  const [finished, setFinished] = useState(false)
  const ivRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const remainRef = useRef(initialSec)
  const [targetSec, setTargetSec] = useState(initialSec)

  function playSound(soundId: string) {
    try {
      const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
      const snd = SOUNDS.find((s) => s.id === soundId) || SOUNDS[0]
      const t = ctx.currentTime
      for (let i = 0; i < 3; i++) {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = snd.type; osc.frequency.value = snd.freq
        osc.connect(gain); gain.connect(ctx.destination)
        const st = t + i * 0.25
        gain.gain.setValueAtTime(0, st)
        gain.gain.linearRampToValueAtTime(0.3, st + 0.02)
        gain.gain.exponentialRampToValueAtTime(0.001, st + 0.2)
        osc.start(st); osc.stop(st + 0.2)
      }
    } catch { /* ignore */ }
  }

  function start() {
    remainRef.current = remain > 0 ? remain : 30
    setRemain(remainRef.current)
    setFinished(false)
    setRunning(true)
    ivRef.current = setInterval(() => {
      remainRef.current--
      setRemain(remainRef.current)
      if (remainRef.current <= 0) {
        clearInterval(ivRef.current!)
        setRunning(false)
        setFinished(true)
        setRemain(0)
        playSound(sound)
        if (navigator.vibrate) navigator.vibrate([100, 50, 100])
      }
    }, 1000)
  }

  function stop() {
    clearInterval(ivRef.current!)
    setRunning(false)
  }

  useEffect(() => () => { clearInterval(ivRef.current!) }, [])

  return (
    <>
      <div className="wavebox">
        <WaveSvg />
        <p className={`timerval${finished ? ' fin' : ''}`}>{fmtTime(remain)}</p>
      </div>
      <button
        className="pill big"
        style={{ margin: '16px auto 0', display: 'flex' }}
        onClick={running ? stop : start}
      >
        {running ? (
          <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="6" width="12" height="12" rx="1" /></svg> Stopp</>
        ) : (
          <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 5v14l11-7z" /></svg> Halte-Timer starten</>
        )}
      </button>
      <div className="timeset" style={{ marginTop: 14 }}>
        <span className="setlbl" style={{ alignSelf: 'center' }}>Ziel</span>
        <VField
          exName={exName} which="sec" unit="Sek." initialVal={targetSec}
          onUpdate={(v) => { setTargetSec(v); setRemain(v); remainRef.current = v; onUpdate(v) }}
        />
      </div>
    </>
  )
}

function WaveSvg() {
  const lines = []
  for (let x = 10; x < 300; x += 14) {
    const h = 6 + Math.round(Math.random() * 22)
    lines.push(<line key={x} x1={x} y1={30 - h} x2={x} y2={30 + h} />)
  }
  return (
    <svg viewBox="0 0 300 60" style={{ width: '100%', height: 46 }}>
      <g fill="none" stroke="url(#wg)" strokeWidth="3" strokeLinecap="round">{lines}</g>
      <defs>
        <linearGradient id="wg" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#6ea8ff" />
          <stop offset="1" stopColor="#9b7cff" />
        </linearGradient>
      </defs>
    </svg>
  )
}

/* ── Main session page ── */
export default function SessionPage() {
  const { dayId } = useParams<{ dayId: string }>()
  const router = useRouter()
  const { state, finishWorkout, toast } = useApp()
  const [pageIdx, setPageIdx] = useState(1)
  const vwrapRef = useRef<HTMLDivElement>(null)
  const setsRef = useRef<SetData[]>([])
  const [maxX, setMaxX] = useState(250)

  useEffect(() => {
    setMaxX(window.innerWidth - 92)
  }, [])

  const day = state?.plan.find((d) => d.id === dayId)

  // Build initial sets array
  useEffect(() => {
    if (!day || !state) return
    const sets: SetData[] = []
    day.ex.forEach((ex) => {
      const lastW = state.lastValues[ex.n + '|kg']
      const lastR = state.lastValues[ex.n + '|rep']
      const lastT = state.lastValues[ex.n + '|sec']
      const startW = lastW !== undefined ? lastW : 20
      const startR = lastR !== undefined ? lastR : 10
      const startT = lastT !== undefined ? lastT : 30
      if (ex.time) {
        for (let s = 0; s < ex.sets; s++) {
          sets.push({ ex: ex.n, kg: null, rep: null, sec: startT, done: false, time: true, bodyweight: true })
        }
      } else {
        for (let s = 0; s < ex.sets; s++) {
          sets.push({ ex: ex.n, kg: ex.bodyweight ? null : startW, rep: startR, sec: null, done: false, time: false, bodyweight: ex.bodyweight })
        }
      }
    })
    setsRef.current = sets
  }, [day, state])

  const total = (day?.ex.length || 0) + 1

  function onScroll() {
    if (!vwrapRef.current) return
    const i = Math.round(vwrapRef.current.scrollTop / vwrapRef.current.clientHeight) + 1
    setPageIdx(i)
  }

  function confirmLeave() {
    const anyDone = setsRef.current.some((s) => s.done)
    if (anyDone) {
      if (confirm('Training verlassen? Nicht gespeicherte Sätze gehen verloren.')) router.push('/')
    } else {
      router.push('/')
    }
  }

  const handleFinish = useCallback(async () => {
    if (!day || !state) return
    let moved = 0
    const byEx: Record<string, SetData[]> = {}
    setsRef.current.forEach((s) => {
      if (!byEx[s.ex]) byEx[s.ex] = []
      byEx[s.ex].push(s)
      if (s.done && s.kg !== null && s.rep !== null) moved += s.kg * s.rep
    })

    const newLastValues: Record<string, number> = {}
    Object.keys(byEx).forEach((exName) => {
      const arr = byEx[exName]
      const last = arr[arr.length - 1]
      if (last.time && last.sec !== null) newLastValues[exName + '|sec'] = last.sec
      else {
        if (last.kg !== null) newLastValues[exName + '|kg'] = last.kg
        if (last.rep !== null) newLastValues[exName + '|rep'] = last.rep
      }
    })

    await finishWorkout(
      { dayId: day.id, title: day.title, date: Date.now(), exCount: day.ex.length, moved: Math.round(moved) },
      newLastValues,
      day.id
    )
    toast('Training gespeichert 💪')
    router.push('/')
  }, [day, state, finishWorkout, toast, router])

  if (!state) return null
  if (!day) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--dim)' }}>Tag nicht gefunden</p>
        <button className="pill" style={{ marginTop: 16 }} onClick={() => router.push('/')}>Zurück</button>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
      <div className="shead">
        <button className="backbtn" onClick={confirmLeave}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M11 18l-6-6 6-6" />
          </svg>
        </button>
        <span className="shead-title">{day.title}</span>
        <span className="pageind">{pageIdx}/{total}</span>
      </div>

      <div
        ref={vwrapRef}
        onScroll={onScroll}
        style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch', scrollSnapType: 'y mandatory' }}
      >
          {(() => {
          let offset = 0
          return day.ex.map((ex, ei) => {
            const setOffset = offset
            offset += ex.sets
            return (
              <ExercisePage
                key={ex.n + ei}
                ex={ex}
                ei={ei}
                total={day.ex.length}
                state={state}
                setsRef={setsRef}
                sound={state.sound}
                maxX={maxX}
                setOffset={setOffset}
              />
            )
          })
        })()}

        {/* Completion page */}
        <section
          className="expage"
          style={{ justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}
        >
          <div className="trophy">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12l5 5L20 6" />
            </svg>
          </div>
          <p style={{ fontSize: 24, fontWeight: 600, marginBottom: 6 }}>Geschafft</p>
          <p style={{ fontSize: 13, color: 'var(--dim)', marginBottom: 26 }}>{day.title} abgeschlossen</p>
          <button className="pill big" onClick={handleFinish}>Training beenden</button>
        </section>
      </div>
    </div>
  )
}

/* ── Per-exercise page ── */
function ExercisePage({ ex, ei, total, state, setsRef, sound, maxX, setOffset }: {
  ex: Exercise
  ei: number
  total: number
  state: NonNullable<ReturnType<typeof useApp>['state']>
  setsRef: React.MutableRefObject<SetData[]>
  sound: string
  maxX: number
  setOffset: number
}) {
  const lastW = state.lastValues[ex.n + '|kg']
  const lastR = state.lastValues[ex.n + '|rep']
  const lastT = state.lastValues[ex.n + '|sec']
  const startW = lastW !== undefined ? lastW : 20
  const startR = lastR !== undefined ? lastR : 10
  const startT = lastT !== undefined ? lastT : 30

  function buildLastLabel() {
    if (ex.time) return lastT !== undefined ? `zuletzt ${lastT} s` : 'noch keine Daten'
    if (ex.bodyweight) return lastR !== undefined ? `zuletzt KG × ${lastR}` : 'noch keine Daten'
    if (lastW !== undefined && lastR !== undefined) return `zuletzt ${fmtNum(lastW)} kg × ${lastR}`
    return 'noch keine Daten'
  }

  function buildIncreaseHint() {
    const m = ex.goal.match(/(\d+)\s*[–-]\s*(\d+)/)
    if (!m) return null
    const topRep = parseInt(m[2], 10)
    if (lastR !== undefined && lastR >= topRep) {
      const txt = ex.bodyweight
        ? `Ziel erreicht — jetzt auf ${topRep + 1} Wdh erhöhen`
        : `Ziel erreicht — jetzt ${fmtNum((lastW || 0) + 2.5)} kg versuchen`
      return <div className="increase-hint">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V5M6 11l6-6 6 6" /></svg>
        {txt}
      </div>
    }
    return null
  }

  const allSets = setsRef.current

  const goalDisp = ex.goal.replace(/×/g, ' × ').replace(/\s+/g, ' ').trim()

  return (
    <section className="expage">
      <div className="ex-head">
        <div className="ex-badge">{ei + 1}</div>
        <div>
          <h2 className="ex-name">{ex.n}</h2>
          {ex.time && <div className="ex-tag">Zeitübung</div>}
        </div>
      </div>
      <p className="ex-goal">Ziel {goalDisp} · {buildLastLabel()}</p>
      {buildIncreaseHint()}

      {ex.time ? (
        <>
          <TimerBlock
            exName={ex.n}
            initialSec={startT}
            sound={sound}
            onUpdate={(sec) => {
              for (let si = 0; si < ex.sets; si++) allSets[setOffset + si].sec = sec
            }}
          />
          <p className="swipehint">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6" /></svg>
            {ei < total - 1 ? 'Wischen für nächste Übung' : 'Letzte Übung — dann beenden'}
          </p>
        </>
      ) : (
        <>
          <div className="sets">
            {Array.from({ length: ex.sets }, (_, si) => {
              const idx = setOffset + si
              return (
                <SetRow
                  key={si}
                  label={si + 1}
                  ex={ex}
                  isBody={ex.bodyweight}
                  initialKg={startW}
                  initialRep={startR}
                  maxX={maxX}
                  onUpdate={(kg, rep) => {
                    allSets[idx].kg = kg
                    allSets[idx].rep = rep
                  }}
                  onDoneChange={(done) => {
                    allSets[idx].done = done
                  }}
                />
              )
            })}
          </div>
          <p className="swipehint">Walze drehen · Satz nach rechts wischen = erledigt</p>
        </>
      )}
    </section>
  )
}
