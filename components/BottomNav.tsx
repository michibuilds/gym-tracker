'use client'
import { useRouter, usePathname } from 'next/navigation'

export default function BottomNav() {
  const router = useRouter()
  const path = usePathname()

  const isHome = path === '/'
  const isHistory = path === '/history'
  const isSettings = path === '/settings' || path === '/builder'

  return (
    <nav className="bottomnav">
      <button className={`navitem ${isHome ? 'active' : ''}`} onClick={() => router.push('/')} aria-label="Home">
        <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 12l9-9 9 9M5 10v10h5v-6h4v6h5V10" />
        </svg>
      </button>
      <button className={`navitem ${isHistory ? 'active' : ''}`} onClick={() => router.push('/history')} aria-label="Verlauf">
        <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 4v16h16M7 14l3-4 3 3 4-6" />
        </svg>
      </button>
      <button className={`navitem ${isSettings ? 'active' : ''}`} onClick={() => router.push('/settings')} aria-label="Einstellungen">
        <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3" />
          <path d="M12 2v3M12 19v3M5 5l2 2M17 17l2 2M2 12h3M19 12h3M5 19l2-2M17 7l2-2" />
        </svg>
      </button>
    </nav>
  )
}
