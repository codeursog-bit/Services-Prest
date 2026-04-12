import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Melanie Services&Prest. — Votre partenaire idéal !',
  description: 'Génie civil, hydrocarbures & gaz, QHSE, achat et livraison de matériel industriel.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      {/*
        Script inline exécuté AVANT le premier rendu pour éviter le flash blanc.
        Il lit le localStorage et applique la classe 'dark' si nécessaire.
        Le défaut est dark (si aucune préférence sauvegardée).
      */}
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('theme');
                  var isDark = saved ? saved === 'dark' : true;
                  if (isDark) document.documentElement.classList.add('dark');
                } catch(e) {
                  document.documentElement.classList.add('dark');
                }
              })();
            `,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}