import type { Metadata } from 'next'
import { Poppins } from 'next/font/google'

import { Providers } from '@/components/providers'
import { APP_NAME } from '@/lib/constants'

import './globals.css'

const poppins = Poppins({
  subsets: ['latin'],
  variable: '--font-poppins',
  weight: ['300', '400', '500', '600', '700'],
})

export const metadata: Metadata = {
  title: APP_NAME,
  description: 'Complete scheduling and calendar engine for services and events.',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={poppins.variable} suppressHydrationWarning>
      <body className="min-h-screen font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
