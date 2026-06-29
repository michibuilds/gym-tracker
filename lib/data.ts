import type { PlanDay, Milestone, Sound } from './types'

export const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
export const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

export const EXERCISES = {
  kraft: ['Bench Press', 'Incline Bench Press', 'Chest Flys', 'Tricep Pushdown', 'Pull-Ups', 'Lat Pulldown', 'Bent-Over Row', 'Face Pulls', 'Bicep Curls', 'Squats', 'Lunges', 'Calf Raises', 'Shoulder Press', 'Leg Press'],
  cal: ['Dips', 'Pike Push-Ups', 'Negative Pull-Ups', 'Tuck L-Sit', 'Plank', 'Hollow Body Rocks', 'TRX Push-Ups'],
}

export const TIME_EXERCISES = ['Negative Pull-Ups', 'Tuck L-Sit', 'Plank', 'Hollow Body Rocks']
export const BODYWEIGHT_EXERCISES = ['Dips', 'Pike Push-Ups', 'TRX Push-Ups', 'Pull-Ups']

export const MILESTONES: Milestone[] = [
  { n: 'House Cat', kg: 4, icon: '🐱' },
  { n: 'Bulldog', kg: 25, icon: '🐶' },
  { n: 'Tire', kg: 60, icon: '⭕' },
  { n: 'A Human', kg: 75, icon: '🧍' },
  { n: 'Washing Machine', kg: 90, icon: '🫧' },
  { n: 'Fridge', kg: 120, icon: '🧊' },
  { n: 'Lion', kg: 190, icon: '🦁' },
  { n: 'Piano', kg: 300, icon: '🎹' },
  { n: 'Cow', kg: 450, icon: '🐄' },
  { n: 'Motorcycle', kg: 550, icon: '🏍️' },
  { n: 'Horse', kg: 700, icon: '🐴' },
  { n: 'Polar Bear', kg: 900, icon: '🐻‍❄️' },
  { n: 'Small Car', kg: 1200, icon: '🚗' },
  { n: 'Hippo', kg: 1800, icon: '🦛' },
  { n: 'Rhino', kg: 2300, icon: '🦏' },
  { n: 'Elephant', kg: 6000, icon: '🐘' },
  { n: 'Motorhome', kg: 8000, icon: '🚐' },
  { n: 'School Bus', kg: 12000, icon: '🚌' },
  { n: 'Whale', kg: 15000, icon: '🐋' },
  { n: 'Airliner', kg: 180000, icon: '✈️' },
]

export const SOUNDS: Sound[] = [
  { id: 'beep', name: 'Beep', freq: 880, type: 'sine' },
  { id: 'chime', name: 'Chime', freq: 660, type: 'triangle' },
  { id: 'ding', name: 'Ding', freq: 1046, type: 'sine' },
  { id: 'buzz', name: 'Buzz', freq: 220, type: 'square' },
]

export const DEFAULT_PLAN: PlanDay[] = [
  {
    id: 'tag1', title: 'Day 1 — Push', ex: [
      { n: 'Bench Press', goal: '4×6–10', sets: 4, bodyweight: false, time: false },
      { n: 'Incline Bench Press', goal: '3×8–12', sets: 3, bodyweight: false, time: false },
      { n: 'Chest Flys', goal: '3×12–15', sets: 3, bodyweight: false, time: false },
      { n: 'Dips', goal: '3×8–12', sets: 3, bodyweight: true, time: false },
      { n: 'Tricep Pushdown', goal: '3×10–12', sets: 3, bodyweight: false, time: false },
    ],
  },
  {
    id: 'tag2', title: 'Day 2 — Pull', ex: [
      { n: 'Lat Pulldown', goal: '4×8–12', sets: 4, bodyweight: false, time: false },
      { n: 'Negative Pull-Ups', goal: '3× slow', sets: 3, bodyweight: true, time: true },
      { n: 'Bent-Over Row', goal: '4×8–12', sets: 4, bodyweight: false, time: false },
      { n: 'Face Pulls', goal: '3×12–15', sets: 3, bodyweight: false, time: false },
      { n: 'Bicep Curls', goal: '3×10–12', sets: 3, bodyweight: false, time: false },
    ],
  },
  {
    id: 'tag3', title: 'Day 3 — Legs & Core', ex: [
      { n: 'Squats', goal: '4×6–8', sets: 4, bodyweight: false, time: false },
      { n: 'Lunges', goal: '3×10/leg', sets: 3, bodyweight: false, time: false },
      { n: 'Calf Raises', goal: '3×15–20', sets: 3, bodyweight: false, time: false },
      { n: 'Tuck L-Sit', goal: '3× hold', sets: 3, bodyweight: true, time: true },
      { n: 'Plank', goal: '3× hold', sets: 3, bodyweight: true, time: true },
    ],
  },
  {
    id: 'tag4', title: 'Day 4 — Full Body', ex: [
      { n: 'Pike Push-Ups', goal: '3×8–12', sets: 3, bodyweight: true, time: false },
      { n: 'Dips', goal: '3×8–12', sets: 3, bodyweight: true, time: false },
      { n: 'Negative Pull-Ups', goal: '3× slow', sets: 3, bodyweight: true, time: true },
      { n: 'Hollow Body Rocks', goal: '3× hold', sets: 3, bodyweight: true, time: true },
      { n: 'Plank', goal: '3× hold', sets: 3, bodyweight: true, time: true },
    ],
  },
]

export function getMonday(): number {
  const d = new Date()
  const day = (d.getDay() + 6) % 7
  d.setDate(d.getDate() - day)
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

export function pad(n: number): string {
  return String(n).padStart(2, '0')
}

export function fmtNum(n: number | null | undefined): string {
  if (n === null || n === undefined) return '–'
  const s = (Math.round(n * 10) / 10).toString()
  return s.replace('.', ',')
}

export function fmtKg(n: number): string {
  return Math.round(n).toLocaleString('en-US')
}

export function fmtTime(sec: number): string {
  if (sec < 0) sec = 0
  return pad(Math.floor(sec / 60)) + ':' + pad(sec % 60)
}

export function parseTime(str: string): number {
  const p = str.split(':')
  return parseInt(p[0], 10) * 60 + parseInt(p[1], 10)
}
