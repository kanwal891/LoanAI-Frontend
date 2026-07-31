import type { Metadata, Viewport } from 'next'
import { Inter, Geist } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap'
})

export const metadata: Metadata = {
  title: 'LoanAI - AI-Powered Personal Loan Platform',
  description: 'Get instant loan eligibility assessment and personalized recommendations powered by artificial intelligence. Smart banking for the modern era.',
  keywords: ['loan', 'AI', 'fintech', 'personal loan', 'eligibility', 'banking'],
  authors: [{ name: 'LoanAI' }],
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#080B14',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={cn("dark bg-[#080B14]", "font-sans", geist.variable)}>
      <body className={`${inter.variable} font-sans antialiased bg-[#080B14] text-white min-h-screen`}>
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
