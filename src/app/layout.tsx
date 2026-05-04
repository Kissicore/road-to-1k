import type { Metadata, Viewport } from 'next'
import { Outfit, Inter } from 'next/font/google'
import './globals.css'

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Road to 1K · FÓRMULA 100K',
  description:
    'Reto de 42 días para crecer 1.000 seguidores aplicando la metodología FÓRMULA 100K.',
  keywords: ['instagram', 'reels', 'crecimiento', 'formula 100k', 'reto'],
}

export const viewport: Viewport = {
  themeColor: '#0e0a1a',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="es"
      className={`${outfit.variable} ${inter.variable} h-full`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground antialiased font-body">
        {children}
      </body>
    </html>
  )
}
