"use client";

import { Package, Plus, Dog, ArrowRight, ClipboardList } from "lucide-react";

import Link from "next/link";

export default function DashboardCards() {
  return (
    <div className="grid grid-cols-3 gap-6 mb-8">
      {/* Inventario Card */}
      <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-xl shadow-blue-500/30 relative overflow-hidden group hover:scale-[1.02] transition-transform">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2"></div>

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold">Inventarios</h3>
            <ClipboardList className="w-8 h-8 opacity-80" />
          </div>
          <div className="mb-4">
            <span className="text-4xl font-bold">372</span>
            <span className="text-blue-100 ml-2">productos registrados</span>
          </div>
          <button className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors w-fit">
            Gestionar
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Productos Card */}
      <div className="bg-gradient-to-br from-amber-400 to-amber-500 rounded-2xl p-6 text-white shadow-xl shadow-amber-500/30 relative overflow-hidden group hover:scale-[1.02] transition-transform">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold">Productos</h3>
            <Package className="w-8 h-8 opacity-80" />
          </div>
          <button className="flex items-center gap-2 mb-4 text-amber-50 hover:text-white transition-colors">
            <Plus className="w-5 h-5" />
            <Link href="/productos">Agregar producto</Link>
          </button>
          <div className="flex gap-2 mt-6">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <div className="w-5 h-5 bg-white/40 rounded"></div>
            </div>
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <Plus className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Mascotas Card */}
      <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-xl shadow-green-500/30 relative overflow-hidden group hover:scale-[1.02] transition-transform">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold">Mascotas</h3>
            <Dog className="w-8 h-8 opacity-80" />
          </div>
          <div className="mb-4">
            <span className="text-4xl font-bold">152</span>
            <span className="text-green-100 ml-2">mascotas registradas</span>
          </div>
          <button className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors w-fit">
            Ver todas
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
