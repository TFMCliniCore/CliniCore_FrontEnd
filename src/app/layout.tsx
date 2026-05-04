import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Clinicore - Sistema Veterinario',
  description: 'Sistema de gestión para clínicas veterinarias',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
