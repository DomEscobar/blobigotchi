import type { Metadata } from 'next'
import { Inter, Press_Start_2P } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { Header } from '@/components/header'
import { Toaster } from '@/components/ui/toaster'
import { SfxAudio } from '@/components/sfx-audio'
import { Jukebox } from '@/components/jukebox'
import { Sidebar } from '@/components/sidebar'
import { SettingsProvider } from '@/contexts/SettingsContext'
import { Sonner } from 'sonner'

const inter = Inter({ subsets: ['latin'] })
const pixelFont = Press_Start_2P({
  weight: '400',
  subsets: ['latin'],
  variable: '--pixel-font',
})

export const metadata: Metadata = {
  title: 'Blobigotchi',
  description: 'A virtual pet for the modern web',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} ${pixelFont.variable}`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <SettingsProvider>
            <div className="relative min-h-screen overflow-hidden">
              <Header />
              <main className="mx-auto min-h-[calc(100vh-4rem)]">
                {children}
              </main>
              <Sidebar />
              <Jukebox />
              <SfxAudio />
            </div>
            <Toaster />
            <Sonner position="top-center" richColors className="pixel-text" />
          </SettingsProvider>
        </ThemeProvider>
      </body>
    </html>
  )
} 