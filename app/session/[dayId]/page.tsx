'use client'
import { useEffect, useRef, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useApp } from '@/context/AppContext'
import { fmtNum, fmtTime, SOUNDS } from '@/lib/data'
import type { Exercise, SetData } from '@/lib/types'

/* ── Value field (vertical drag) ── */
function VField({
  exName, which, initialVal, onUpdate,
}: {
  exName: string
  which: 'kg' | 'rep' | 'sec'
  initialVal: number
  onUpdate: (val: number) => void
}) {
  const step = which === 'kg' ? 2.5 : 1
  const min = which === 'kg' ? 0 : which === 'sec' ? 1 : 0
  const PXSTEP = 14
  const [val, setVal] = useState(initialVal)
  const startY = useRef(0)
  const startVal = useRef(initialVal)
  const prevVal = useRef(initialVal)
  const [active, setActive] = useState(false)
  const elRef = useRef<HTMLDivElement>(null)

  function clamp(v: number) { return Math.max(min, v) }

  function updateVal(newVal: number) {
    const clamped = clamp(newVal)
    if (clamped === prevVal.current) return
    prevVal.current = clamped
    setVal(clamped)
    onUpdate(clamped)
    try {
      elRef.current?.animate(
        [{ transform: 'scale(1.12)' }, { transform: 'scale(1)' }],
        { duration: 100, easing: 'cubic-bezier(.2,.9,.3,1)' }
      )
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
    updateVal(startVal.current + Math.round(dy / PXSTEP) * step)
  }

  function onMouseDown(e: React.MouseEvent) {
    startY.current = e.clientY
    startVal.current = val
    setActive(true)
    const mm = (ev: MouseEvent) => {
      updateVal(startVal.current + Math.round((startY.current - ev.clientY) / PXSTEP) * step)
    }
    const mu = () => {
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
      if (Math.abs(dx) > 6 || Math.abs(dy) > 6) {
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
      if (curX.current > maxX * 0.25) {
        isDoneRef.current = true
        if (rowRef.current) { rowRef.current.style.transform = ''; rowRef.current.classList.add('done') }
        onDoneChange(true)
        if (navigator.vibrate) navigator.vibrate(15)
      } else {
        isDoneRef.current = false
        if (rowRef.current) { rowRef.current.style.transform = ''; rowRef.current.classList.remove('done') }
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
        Done
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
          <VField exName={ex.n} which="kg" initialVal={initialKg}
            onUpdate={(v) => { kg.current = v; onUpdate(v, rep.current) }}
          />
        )}
        <VField exName={ex.n} which="rep" initialVal={initialRep}
          onUpdate={(v) => { rep.current = v; onUpdate(isBody ? null : kg.current, v) }}
        />
        <div className="swipebar" />
      </div>
    </div>
  )
}

/* ── Timer drag picker ── */
function TimeDragger({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const startY = useRef(0)
  const startVal = useRef(value)
  const [active, setActive] = useState(false)
  const STEP = 5
  const PX_PER_STEP = 10

  function compute(clientY: number) {
    const steps = Math.round((startY.current - clientY) / PX_PER_STEP)
    onChange(Math.max(STEP, startVal.current + steps * STEP))
  }

  return (
    <p
      className={`timer-countdown${active ? ' adj' : ''}`}
      onTouchStart={(e) => { startY.current = e.touches[0].clientY; startVal.current = value; setActive(true) }}
      onTouchMove={(e) => { e.preventDefault(); compute(e.touches[0].clientY) }}
      onTouchEnd={() => setActive(false)}
      onMouseDown={(e) => {
        startY.current = e.clientY; startVal.current = value; setActive(true)
        const mm = (ev: MouseEvent) => compute(ev.clientY)
        const mu = () => { setActive(false); document.removeEventListener('mousemove', mm); document.removeEventListener('mouseup', mu) }
        document.addEventListener('mousemove', mm); document.addEventListener('mouseup', mu)
      }}
    >
      {fmtTime(value)}
    </p>
  )
}

/* ── Timer block ── */
function TimerBlock({ initialSec, sound, onUpdate }: {
  initialSec: number
  sound: string
  onUpdate: (sec: number) => void
}) {
  const [phase, setPhase] = useState<'idle' | 'running' | 'done'>('idle')
  const [display, setDisplay] = useState(initialSec)
  const [target, setTarget] = useState(initialSec)
  const ivRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const remainRef = useRef(initialSec)
  const doneRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => () => { clearInterval(ivRef.current!); clearTimeout(doneRef.current!) }, [])

  function playTimerSound() {
    try {
      const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
      const snd = SOUNDS.find((s) => s.id === sound) || SOUNDS[0]
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
    remainRef.current = target
    setDisplay(target)
    setPhase('running')
    ivRef.current = setInterval(() => {
      remainRef.current--
      setDisplay(remainRef.current)
      if (remainRef.current <= 0) {
        clearInterval(ivRef.current!)
        setPhase('done')
        playTimerSound()
        if (navigator.vibrate) navigator.vibrate([100, 50, 100])
        doneRef.current = setTimeout(() => {
          setPhase('idle')
          setDisplay(target)
          remainRef.current = target
        }, 2500)
      }
    }, 1000)
  }

  function stop() {
    clearInterval(ivRef.current!)
    setPhase('idle')
    setDisplay(target)
    remainRef.current = target
  }

  if (phase === 'done') {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p className="timer-done">DONE</p>
      </div>
    )
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 40 }}>
      {phase === 'idle' ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
          <TimeDragger
            value={target}
            onChange={(v) => { setTarget(v); setDisplay(v); remainRef.current = v; onUpdate(v) }}
          />
          <p style={{ fontSize: 12, color: 'var(--faint)' }}>drag to adjust</p>
        </div>
      ) : (
        <p className="timer-countdown">{fmtTime(display)}</p>
      )}
      <button className="pill big" onClick={phase === 'running' ? stop : start}>
        {phase === 'running' ? 'Stop' : 'Start'}
      </button>
    </div>
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

  useEffect(() => { setMaxX(window.innerWidth - 92) }, [])

  const day = state?.plan.find((d) => d.id === dayId)

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
      if (confirm('Leave workout? Unsaved sets will be lost.')) router.push('/')
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
    toast('Workout saved 💪')
    router.push('/')
  }, [day, state, finishWorkout, toast, router])

  if (!state) return null
  if (!day) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--dim)' }}>Day not found</p>
        <button className="pill" style={{ marginTop: 16 }} onClick={() => router.push('/')}>Back</button>
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

        <section className="expage" style={{ justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
          <div className="trophy">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12l5 5L20 6" />
            </svg>
          </div>
          <p style={{ fontSize: 24, fontWeight: 600, marginBottom: 6 }}>Done</p>
          <p style={{ fontSize: 13, color: 'var(--dim)', marginBottom: 26 }}>{day.title} completed</p>
          <button className="pill big" onClick={handleFinish}>Finish Workout</button>
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
    if (ex.time) return lastT !== undefined ? `last: ${lastT}s` : 'no data yet'
    if (ex.bodyweight) return lastR !== undefined ? `last: BW × ${lastR}` : 'no data yet'
    if (lastW !== undefined && lastR !== undefined) return `last: ${fmtNum(lastW)} kg × ${lastR}`
    return 'no data yet'
  }

  function buildIncreaseHint() {
    const m = ex.goal.match(/(\d+)\s*[–-]\s*(\d+)/)
    if (!m) return null
    const topRep = parseInt(m[2], 10)
    if (lastR !== undefined && lastR >= topRep) {
      const txt = ex.bodyweight
        ? `Goal reached — try ${topRep + 1} reps`
        : `Goal reached — try ${fmtNum((lastW || 0) + 2.5)} kg`
      return (
        <div className="increase-hint">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 19V5M6 11l6-6 6 6" />
          </svg>
          {txt}
        </div>
      )
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
          {ex.time && <div className="ex-tag">Timed</div>}
        </div>
      </div>
      <p className="ex-goal">Goal {goalDisp} · {buildLastLabel()}</p>
      {buildIncreaseHint()}

      {ex.time ? (
        <TimerBlock
          initialSec={startT}
          sound={sound}
          onUpdate={(sec) => {
            for (let si = 0; si < ex.sets; si++) allSets[setOffset + si].sec = sec
          }}
        />
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
                  onUpdate={(kg, rep) => { allSets[idx].kg = kg; allSets[idx].rep = rep }}
                  onDoneChange={(done) => { allSets[idx].done = done }}
                />
              )
            })}
          </div>
          <p className="swipehint">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
            {ei < total - 1 ? 'Swipe up for next · swipe set right = done' : 'Last exercise · swipe set right = done'}
          </p>
        </>
      )}
    </section>
  )
}
