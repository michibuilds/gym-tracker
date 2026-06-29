import type { Metadata, Viewport } from 'next'
import './globals.css'
import { AppProvider } from '@/context/AppContext'
import Toast from '@/components/Toast'

export const metadata: Metadata = {
  title: 'Gym Tracker',
  description: 'Persönlicher Trainingsbegleiter',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Gym Tracker',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#0a0a0c',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body style={{
        background: 'radial-gradient(130% 70% at 50% -10%, #171c44 0%, #0b0e26 45%, #0a0a0c 100%)',
        position: 'fixed',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}>
        <AppProvider>
          {children}
          <Toast />
        </AppProvider>
      </body>
    </html>
  )
}
