import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Roofing Measurement Tool - Professional Aerial Estimation',
  description: 'Accurate roofing measurements using satellite imagery. Calculate roof area, linear footage, and material costs for professional contractors.',
  keywords: 'roofing, measurement, estimation, satellite, aerial, contractor, shingles, materials',
  authors: [{ name: 'Roofing Measurement Tool' }],
  viewport: 'width=device-width, initial-scale=1',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}