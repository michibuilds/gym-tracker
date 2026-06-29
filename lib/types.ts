export interface Exercise {
  n: string
  goal: string
  sets: number
  bodyweight: boolean
  time: boolean
}

export interface PlanDay {
  id: string
  title: string
  ex: Exercise[]
}

export interface WorkoutHistory {
  id?: number
  dayId: string
  title: string
  date: number
  exCount: number
  moved: number
}

export interface SetData {
  ex: string
  kg: number | null
  rep: number | null
  sec: number | null
  done: boolean
  time: boolean
  bodyweight: boolean
}

export interface Milestone {
  n: string
  kg: number
  icon: string
}

export interface Sound {
  id: string
  name: string
  freq: number
  type: OscillatorType
}

export interface AppState {
  plan: PlanDay[]
  history: WorkoutHistory[]
  lastValues: Record<string, number>
  doneThisWeek: Record<string, boolean>
  sound: string
  weekStart: number
}
