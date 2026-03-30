// components/productos/InventarioOverview.tsx
import React from 'react';
import { Package, DollarSign, AlertCircle, TrendingUp } from 'lucide-react';

interface StatCardProps {
  icon: React.ElementType;
  title: string;
  value: string;
  description: string;
  colorClass: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon: Icon, title, value, description, colorClass }) => (
  <div className={`bg-white p-6 rounded-[2rem] shadow-md border border-slate-100 relative overflow-hidden group hover:scale-[1.01] transition-transform`}>
    {/* Fondo decorativo de la tarjeta */}
    <div className={`absolute top-0 right-0 w-24 h-24 rounded-full ${colorClass} opacity-10 group-hover:opacity-20 transition-opacity blur-md`} />

    <div className="flex items-center space-x-4 mb-4">
      <div className={`p-3 rounded-full ${colorClass} text-white shadow-lg`}>
        <Icon size={24} />
      </div>
      <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide">{title}</h3>
    </div>
    <p className="text-3xl font-extrabold text-slate-800 mb-2">{value}</p>
    <p className="text-sm text-slate-500">{description}</p>
  </div>
);

export default function InventarioOverview() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 m-5">
      <StatCard
        icon={Package}
        title="Total de Productos"
        value="124"
        description="Artículos únicos en el inventario"
        colorClass="bg-gradient-to-br from-cyan-500 to-blue-600"
      />
      <StatCard
        icon={DollarSign}
        title="Valor del Inventario"
        value="$54,320.50"
        description="Costo total de productos en stock"
        colorClass="bg-gradient-to-br from-emerald-500 to-green-600"
      />
      <StatCard
        icon={AlertCircle}
        title="Stock Bajo"
        value="8 Productos"
        description="Necesitan ser reabastecidos pronto"
        colorClass="bg-gradient-to-br from-orange-400 to-red-500"
      />
      <StatCard
        icon={TrendingUp}
        title="Mayor Venta"
        value="Bravecto"
        description="Producto más vendido este mes"
        colorClass="bg-gradient-to-br from-purple-500 to-pink-600"
      />
    </div>
  );
}