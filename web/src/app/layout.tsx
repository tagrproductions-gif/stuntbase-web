import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { AuthProvider } from '@/lib/auth-context'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://stuntpitch.com'),
  title: 'StuntPitch - Stunt Performer Directory',
  description: 'Connect stunt performers with casting directors and coordinators. Find the perfect talent for your project with AI-powered search.',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '32x32', type: 'image/x-icon' },
      { url: '/icon.png', sizes: '1024x1024', type: 'image/png' },
      { url: '/logo.png', sizes: '1024x1024', type: 'image/png' }
    ],
    shortcut: '/favicon.ico',
    apple: {
      url: '/logo.png',
      sizes: '1024x1024',
      type: 'image/png',
    },
  },
  openGraph: {
    title: 'StuntPitch - Stunt Performer Directory',
    description: 'Connect stunt performers with casting directors and coordinators. Find the perfect talent for your project with AI-powered search.',
    url: 'https://stuntpitch.com',
    siteName: 'StuntPitch',
    images: [
      {
        url: 'https://stuntpitch.com/logo.png',
        width: 1024,
        height: 1024,
        alt: 'StuntPitch Logo',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'StuntPitch - Stunt Performer Directory',
    description: 'Connect stunt performers with casting directors and coordinators. Find the perfect talent for your project with AI-powered search.',
    images: ['https://stuntpitch.com/logo.png'],
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <div className="min-h-screen bg-background">
            {children}
          </div>
        </AuthProvider>
      </body>
    </html>
  )
}
