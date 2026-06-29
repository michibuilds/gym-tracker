'use client'
import { useApp } from '@/context/AppContext'
import { useRouter } from 'next/navigation'
import BottomNav from '@/components/BottomNav'
import { SOUNDS } from '@/lib/data'
import { useRef } from 'react'

export default function SettingsPage() {
  const { state, saveSound, resetWeek, exportData, importData, toast } = useApp()
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)

  if (!state) return null

  function playSound(soundId: string) {
    try {
      const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
      const snd = SOUNDS.find((s) => s.id === soundId) || SOUNDS[0]
      const t = ctx.currentTime
      for (let i = 0; i < 3; i++) {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = snd.type
        osc.frequency.value = snd.freq
        osc.connect(gain)
        gain.connect(ctx.destination)
        const st = t + i * 0.25
        gain.gain.setValueAtTime(0, st)
        gain.gain.linearRampToValueAtTime(0.3, st + 0.02)
        gain.gain.exponentialRampToValueAtTime(0.001, st + 0.2)
        osc.start(st)
        osc.stop(st + 0.2)
      }
    } catch { /* ignore */ }
  }

  async function handleExport() {
    const json = await exportData()
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    const d = new Date()
    a.href = url
    a.download = `gymtracker-backup-${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast('Backup exportiert')
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const text = await file.text()
    try {
      await importData(text)
      toast('Backup importiert')
      router.push('/')
    } catch {
      toast('Import fehlgeschlagen')
    }
    e.target.value = ''
  }

  async function handleReset() {
    if (confirm('Erledigt-Markierungen für diese Woche zurücksetzen?')) {
      await resetWeek()
      toast('Woche zurückgesetzt')
      router.push('/')
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
      <div className="scroll">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
          <button className="backbtn" onClick={() => router.push('/')}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M11 18l-6-6 6-6" />
            </svg>
          </button>
          <p className="bigtitle">Einstellungen</p>
        </div>

        <p className="section-label">Timer-Ton</p>
        {SOUNDS.map((s) => {
          const active = state.sound === s.id
          return (
            <div key={s.id} className="setting-row">
              <div>
                <div style={{ fontSize: 14 }}>{s.name}</div>
              </div>
              <button
                className={`pill${active ? '' : ' ghost'}`}
                onClick={async () => {
                  await saveSound(s.id)
                  playSound(s.id)
                }}
              >
                {active ? 'Aktiv' : 'Wählen'}
              </button>
            </div>
          )
        })}

        <p className="section-label">Backup</p>
        <div className="setting-row">
          <div>
            <div style={{ fontSize: 14 }}>Daten exportieren</div>
            <div style={{ fontSize: 12, color: 'var(--faint)', marginTop: 2 }}>Als Backup-Datei sichern</div>
          </div>
          <button className="pill" onClick={handleExport}>Export</button>
        </div>
        <div className="setting-row">
          <div>
            <div style={{ fontSize: 14 }}>Daten importieren</div>
            <div style={{ fontSize: 12, color: 'var(--faint)', marginTop: 2 }}>Backup wiederherstellen</div>
          </div>
          <button className="pill ghost" onClick={() => fileRef.current?.click()}>Import</button>
        </div>
        <input ref={fileRef} type="file" accept="application/json" style={{ display: 'none' }} onChange={handleImport} />

        <p className="section-label">Zurücksetzen</p>
        <div className="setting-row">
          <div>
            <div style={{ fontSize: 14 }}>Neue Woche starten</div>
            <div style={{ fontSize: 12, color: 'var(--faint)', marginTop: 2 }}>Erledigt-Markierungen zurücksetzen</div>
          </div>
          <button className="pill ghost" onClick={handleReset}>Reset</button>
        </div>

        <div style={{ height: 20 }} />
      </div>
      <BottomNav />
    </div>
  )
}
