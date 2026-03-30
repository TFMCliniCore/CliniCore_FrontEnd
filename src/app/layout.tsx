import type { Metadata } from 'next';
import './globals.css';
import DashboardLayout from '@/components/layout/DashboardLayout';

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
      <body>
        <DashboardLayout>
          {children}
        </DashboardLayout>
      </body>
    </html>
  );
}
