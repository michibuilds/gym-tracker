'use client'

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react'
import * as db from '@/lib/db'
import { getMonday } from '@/lib/data'
import type { AppState, PlanDay, WorkoutHistory } from '@/lib/types'

interface AppContextValue {
  state: AppState | null
  loading: boolean
  toast: (msg: string) => void
  toastMsg: string
  finishWorkout: (entry: WorkoutHistory, lastValues: Record<string, number>, dayId: string) => Promise<void>
  addCustomDay: (day: PlanDay) => Promise<void>
  saveSound: (soundId: string) => Promise<void>
  resetWeek: () => Promise<void>
  exportData: () => Promise<string>
  importData: (json: string) => Promise<void>
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState | null>(null)
  const [loading, setLoading] = useState(true)
  const [toastMsg, setToastMsg] = useState('')
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    db.loadState().then((s) => {
      setState(s)
      setLoading(false)
    }).catch(() => {
      setLoading(false)
    })
  }, [])

  const toast = useCallback((msg: string) => {
    setToastMsg(msg)
    if (toastTimer.current) clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToastMsg(''), 2200)
  }, [])

  const finishWorkout = useCallback(async (
    entry: WorkoutHistory,
    lastValues: Record<string, number>,
    dayId: string
  ) => {
    setState((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        history: [...prev.history, entry],
        lastValues: { ...prev.lastValues, ...lastValues },
        doneThisWeek: { ...prev.doneThisWeek, [dayId]: true },
      }
    })
    await db.saveWorkoutResult(entry, lastValues, dayId)
  }, [])

  const addCustomDay = useCallback(async (day: PlanDay) => {
    setState((prev) => {
      if (!prev) return prev
      return { ...prev, plan: [...prev.plan, day] }
    })
    setState((prev) => {
      if (!prev) return prev
      db.savePlan(prev.plan)
      return prev
    })
  }, [])

  const saveSound = useCallback(async (soundId: string) => {
    setState((prev) => prev ? { ...prev, sound: soundId } : prev)
    await db.saveSoundSetting(soundId)
  }, [])

  const resetWeek = useCallback(async () => {
    setState((prev) => prev ? { ...prev, doneThisWeek: {}, weekStart: getMonday() } : prev)
    await db.resetWeek()
  }, [])

  const exportData = useCallback(async () => {
    const data = await db.exportState()
    return JSON.stringify(data, null, 2)
  }, [])

  const importData = useCallback(async (json: string) => {
    const data = JSON.parse(json) as AppState
    await db.importState(data)
    const fresh = await db.loadState()
    setState(fresh)
  }, [])

  return (
    <AppContext.Provider value={{
      state, loading, toast, toastMsg,
      finishWorkout, addCustomDay, saveSound, resetWeek, exportData, importData,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used inside AppProvider')
  return ctx
}
