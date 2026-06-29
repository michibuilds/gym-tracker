import type { PlanDay, Milestone, Sound } from './types'

export const WEEKDAYS = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag']
export const MONTHS = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember']

export const EXERCISES = {
  kraft: ['Bankdrücken', 'Schrägbankdrücken', 'Butterfly / Flys', 'Trizepsdrücken', 'Klimmzüge', 'Latzug', 'Vorgebeugtes Rudern', 'Face Pulls', 'Bizepscurls', 'Kniebeugen', 'Ausfallschritte', 'Wadenheben', 'Schulterdrücken', 'Beinpresse'],
  cal: ['Dips', 'Pike Push-Ups', 'Negative Klimmzüge', 'Tuck L-Sit', 'Plank', 'Hollow Body Rocks', 'TRX Push-Ups'],
}

export const TIME_EXERCISES = ['Negative Klimmzüge', 'Tuck L-Sit', 'Plank', 'Hollow Body Rocks']
export const BODYWEIGHT_EXERCISES = ['Dips', 'Pike Push-Ups', 'TRX Push-Ups', 'Klimmzüge']

export const MILESTONES: Milestone[] = [
  { n: 'Hauskatze', kg: 4, icon: '🐱' },
  { n: 'Bulldogge', kg: 25, icon: '🐶' },
  { n: 'Reifen', kg: 60, icon: '⭕' },
  { n: 'Ein Mensch', kg: 75, icon: '🧍' },
  { n: 'Waschmaschine', kg: 90, icon: '🫧' },
  { n: 'Kühlschrank', kg: 120, icon: '🧊' },
  { n: 'Löwe', kg: 190, icon: '🦁' },
  { n: 'Klavier', kg: 300, icon: '🎹' },
  { n: 'Kuh', kg: 450, icon: '🐄' },
  { n: 'Motorrad', kg: 550, icon: '🏍️' },
  { n: 'Pferd', kg: 700, icon: '🐴' },
  { n: 'Eisbär', kg: 900, icon: '🐻‍❄️' },
  { n: 'Kleinwagen', kg: 1200, icon: '🚗' },
  { n: 'Nilpferd', kg: 1800, icon: '🦛' },
  { n: 'Nashorn', kg: 2300, icon: '🦏' },
  { n: 'Elefant', kg: 6000, icon: '🐘' },
  { n: 'Wohnmobil', kg: 8000, icon: '🚐' },
  { n: 'Schulbus', kg: 12000, icon: '🚌' },
  { n: 'Wal', kg: 15000, icon: '🐋' },
  { n: 'Verkehrsflugzeug', kg: 180000, icon: '✈️' },
]

export const SOUNDS: Sound[] = [
  { id: 'beep', name: 'Beep', freq: 880, type: 'sine' },
  { id: 'chime', name: 'Glocke', freq: 660, type: 'triangle' },
  { id: 'ding', name: 'Ding', freq: 1046, type: 'sine' },
  { id: 'buzz', name: 'Summer', freq: 220, type: 'square' },
]

export const DEFAULT_PLAN: PlanDay[] = [
  {
    id: 'tag1', title: 'Tag 1 — Push', ex: [
      { n: 'Bankdrücken', goal: '4×6–10', sets: 4, bodyweight: false, time: false },
      { n: 'Schrägbankdrücken', goal: '3×8–12', sets: 3, bodyweight: false, time: false },
      { n: 'Butterfly / Flys', goal: '3×12–15', sets: 3, bodyweight: false, time: false },
      { n: 'Dips', goal: '3×8–12', sets: 3, bodyweight: true, time: false },
      { n: 'Trizepsdrücken', goal: '3×10–12', sets: 3, bodyweight: false, time: false },
    ],
  },
  {
    id: 'tag2', title: 'Tag 2 — Pull', ex: [
      { n: 'Latzug', goal: '4×8–12', sets: 4, bodyweight: false, time: false },
      { n: 'Negative Klimmzüge', goal: '3× langsam', sets: 3, bodyweight: true, time: true },
      { n: 'Vorgebeugtes Rudern', goal: '4×8–12', sets: 4, bodyweight: false, time: false },
      { n: 'Face Pulls', goal: '3×12–15', sets: 3, bodyweight: false, time: false },
      { n: 'Bizepscurls', goal: '3×10–12', sets: 3, bodyweight: false, time: false },
    ],
  },
  {
    id: 'tag3', title: 'Tag 3 — Legs & Core', ex: [
      { n: 'Kniebeugen', goal: '4×6–8', sets: 4, bodyweight: false, time: false },
      { n: 'Ausfallschritte', goal: '3×10/Bein', sets: 3, bodyweight: false, time: false },
      { n: 'Wadenheben', goal: '3×15–20', sets: 3, bodyweight: false, time: false },
      { n: 'Tuck L-Sit', goal: '3× Halten', sets: 3, bodyweight: true, time: true },
      { n: 'Plank', goal: '3× Halten', sets: 3, bodyweight: true, time: true },
    ],
  },
  {
    id: 'tag4', title: 'Tag 4 — Full Body', ex: [
      { n: 'Pike Push-Ups', goal: '3×8–12', sets: 3, bodyweight: true, time: false },
      { n: 'Dips', goal: '3×8–12', sets: 3, bodyweight: true, time: false },
      { n: 'Negative Klimmzüge', goal: '3× langsam', sets: 3, bodyweight: true, time: true },
      { n: 'Hollow Body Rocks', goal: '3× Halten', sets: 3, bodyweight: true, time: true },
      { n: 'Plank', goal: '3× Halten', sets: 3, bodyweight: true, time: true },
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
  return Math.round(n).toLocaleString('de-DE')
}

export function fmtTime(sec: number): string {
  if (sec < 0) sec = 0
  return pad(Math.floor(sec / 60)) + ':' + pad(sec % 60)
}

export function parseTime(str: string): number {
  const p = str.split(':')
  return parseInt(p[0], 10) * 60 + parseInt(p[1], 10)
}
