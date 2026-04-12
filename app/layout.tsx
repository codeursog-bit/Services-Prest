import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Melanie Services&Prest. — Votre partenaire idéal !',
  description: 'Génie civil, hydrocarbures & gaz, QHSE, achat et livraison de matériel industriel.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  )
}