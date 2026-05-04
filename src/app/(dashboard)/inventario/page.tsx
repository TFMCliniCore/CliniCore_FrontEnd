// app/inventario/page.tsx
import React from 'react';
import CrearProductoForm from '@/components/organisms/productos/CrearProductoForm';
// import InventarioTable from '@/components/organisms/productos/InventarioTable';
import InventarioOverview from '@/components/organisms/productos/InventarioOverview';
import BackgroundPattern from '@/components/ui/BackgroundPattern'; // Importa el nuevo componente

export default function InventarioPage() {
  return (
    <div className="relative min-h-screen bg-slate-50">
      {/* Fondo Decorativo para la Página */}
      <BackgroundPattern 
        imageSrc="/images/vet-pattern.png" // Ruta a tu imagen de patrón (huellas, etc.)
        opacity="opacity-8" // Ajusta la opacidad para que sea sutil
        className="top-1/4 left-1/2 -translate-x-1/2 w-full h-3/4 max-w-7xl rotate-3" // Clase para posicionar y rotar el patrón
      />

      <div className="relative z-10 p-8 md:p-12">
        {/* Encabezado de la Página */}
        <div className="mb-10">
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Gestión de Inventario</h1>
          <p className="text-lg text-slate-600 mt-2">Administra tus productos, stock y precios.</p>
        </div>

        {/* Sección de Resumen del Inventario */}
        <div className="mb-10">
          <InventarioOverview />
        </div>

        {/* Sección de Creación de Productos */}
        <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-slate-100 mb-10">
          <CrearProductoForm />
        </div>

        {/* Sección de Tabla de Productos */}
        <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-slate-100">
          {/* <InventarioTable /> */}
        </div>
      </div>
    </div>
  );
}