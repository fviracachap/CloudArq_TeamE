import type { Metadata, Viewport } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import { Toaster } from 'sonner'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
})

export const metadata: Metadata = {
  title: 'Comunidad360 - Community Management Platform',
  description:
    'Modern platform for managing community service requests, maintenance, security, and more.',
}

export const viewport: Viewport = {
  themeColor: '#1a1d23',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="font-sans antialiased">
        {children}
        <Toaster
          theme="dark"
          position="top-right"
          richColors
          closeButton
        />
        {/* Analytics only runs on Vercel — omitted in self-hosted / Docker */}
      </body>
    </html>
  )
}
