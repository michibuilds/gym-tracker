import { supabase } from './supabase'
import { DEFAULT_PLAN, getMonday } from './data'
import type { AppState, PlanDay, WorkoutHistory } from './types'

export async function loadState(): Promise<AppState> {
  const [planRes, histRes, valRes, doneRes, settRes] = await Promise.all([
    supabase.from('plan_days').select('*').order('sort_order'),
    supabase.from('workout_history').select('*').order('date'),
    supabase.from('last_values').select('*'),
    supabase.from('done_this_week').select('*'),
    supabase.from('app_settings').select('*'),
  ])

  const mon = getMonday()

  // Seed default plan if empty
  if (!planRes.data || planRes.data.length === 0) {
    await seedDefaultPlan()
    return {
      plan: DEFAULT_PLAN,
      history: [],
      lastValues: {},
      doneThisWeek: {},
      sound: 'beep',
      weekStart: mon,
    }
  }

  const plan: PlanDay[] = (planRes.data || []).map((row) => ({
    id: row.id,
    title: row.title,
    ex: row.exercises,
  }))

  const history: WorkoutHistory[] = (histRes.data || []).map((row) => ({
    id: row.id,
    dayId: row.day_id,
    title: row.title,
    date: row.date,
    exCount: row.ex_count,
    moved: row.moved,
  }))

  const lastValues: Record<string, number> = {}
  for (const row of valRes.data || []) {
    lastValues[row.key] = Number(row.value)
  }

  // Auto-reset done_this_week if new week
  const weekStart = Number(settRes.data?.find((r) => r.key === 'week_start')?.value || mon)
  if (weekStart !== mon) {
    await supabase.from('done_this_week').delete().neq('day_id', '')
    await upsertSetting('week_start', String(mon))
  }

  const doneThisWeek: Record<string, boolean> = {}
  if (weekStart === mon) {
    for (const row of doneRes.data || []) {
      doneThisWeek[row.day_id] = true
    }
  }

  const sound = settRes.data?.find((r) => r.key === 'sound')?.value || 'beep'

  return { plan, history, lastValues, doneThisWeek, sound, weekStart: mon }
}

async function seedDefaultPlan() {
  const rows = DEFAULT_PLAN.map((day, i) => ({
    id: day.id,
    title: day.title,
    exercises: day.ex,
    sort_order: i,
  }))
  await supabase.from('plan_days').insert(rows)
  await upsertSetting('week_start', String(getMonday()))
  await upsertSetting('sound', 'beep')
}

export async function savePlan(plan: PlanDay[]) {
  await supabase.from('plan_days').delete().neq('id', '')
  const rows = plan.map((day, i) => ({
    id: day.id,
    title: day.title,
    exercises: day.ex,
    sort_order: i,
  }))
  await supabase.from('plan_days').insert(rows)
}

export async function saveWorkoutResult(
  entry: WorkoutHistory,
  lastValues: Record<string, number>,
  dayId: string
) {
  await supabase.from('workout_history').insert({
    day_id: entry.dayId,
    title: entry.title,
    date: entry.date,
    ex_count: entry.exCount,
    moved: entry.moved,
  })

  const valRows = Object.entries(lastValues).map(([key, value]) => ({ key, value }))
  if (valRows.length > 0) {
    await supabase.from('last_values').upsert(valRows, { onConflict: 'key' })
  }

  await supabase
    .from('done_this_week')
    .upsert({ day_id: dayId, week_start: getMonday() }, { onConflict: 'day_id' })
}

export async function saveSoundSetting(soundId: string) {
  await upsertSetting('sound', soundId)
}

export async function resetWeek() {
  await supabase.from('done_this_week').delete().neq('day_id', '')
  await upsertSetting('week_start', String(getMonday()))
}

async function upsertSetting(key: string, value: string) {
  await supabase.from('app_settings').upsert({ key, value }, { onConflict: 'key' })
}

export async function exportState(): Promise<AppState> {
  return loadState()
}

export async function importState(data: AppState) {
  // Clear all tables
  await Promise.all([
    supabase.from('plan_days').delete().neq('id', ''),
    supabase.from('workout_history').delete().neq('id', 0),
    supabase.from('last_values').delete().neq('key', ''),
    supabase.from('done_this_week').delete().neq('day_id', ''),
  ])

  // Re-insert
  const planRows = data.plan.map((day, i) => ({
    id: day.id,
    title: day.title,
    exercises: day.ex,
    sort_order: i,
  }))
  if (planRows.length) await supabase.from('plan_days').insert(planRows)

  const histRows = data.history.map((h) => ({
    day_id: h.dayId,
    title: h.title,
    date: h.date,
    ex_count: h.exCount,
    moved: h.moved,
  }))
  if (histRows.length) await supabase.from('workout_history').insert(histRows)

  const valRows = Object.entries(data.lastValues).map(([key, value]) => ({ key, value }))
  if (valRows.length) await supabase.from('last_values').insert(valRows)

  const doneRows = Object.keys(data.doneThisWeek)
    .filter((k) => data.doneThisWeek[k])
    .map((day_id) => ({ day_id, week_start: data.weekStart }))
  if (doneRows.length) await supabase.from('done_this_week').insert(doneRows)

  await upsertSetting('sound', data.sound)
  await upsertSetting('week_start', String(data.weekStart))
}
