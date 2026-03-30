"use client";

import React, { useState } from "react";
import { 
  Search, Filter, Edit, Trash2, 
  MoreVertical, ChevronLeft, ChevronRight,
  AlertCircle, CheckCircle2, Package
} from "lucide-react";

// Datos de ejemplo basados en una veterinaria
const productosData = [
  { id: 1, nombre: "Bravecto 20-40kg", categoria: "Medicamentos", precio: 45.00, stock: 12, sku: "MED-001", estado: "Disponible" },
  { id: 2, nombre: "Pro Plan Adulto 15kg", categoria: "Alimentos", precio: 85.50, stock: 3, sku: "ALM-054", estado: "Stock Bajo" },
  { id: 3, nombre: "Collar Antipulgas Seresto", categoria: "Accesorios", precio: 32.00, stock: 25, sku: "ACC-012", estado: "Disponible" },
  { id: 4, nombre: "Shampoo Hipoalergénico", categoria: "Higiene", precio: 15.00, stock: 0, sku: "HIG-009", estado: "Agotado" },
  { id: 5, nombre: "NexGard Spectra", categoria: "Medicamentos", precio: 28.00, stock: 40, sku: "MED-002", estado: "Disponible" },
];

export default function ListaProductos() {
   const [searchTerm, setSearchTerm] = useState("");
  
    return (
      <div className="space-y-6">
        {/* BARRA DE HERRAMIENTAS / FILTROS */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 m-8">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text"
              placeholder="Buscar por nombre, SKU o categoría..."
              className="w-full pl-12 pr-4 py-3 bg-white border border-slate-100 rounded-2xl shadow-sm focus:ring-2 focus:ring-cyan-400/50 outline-none transition-all text-slate-600"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex items-center space-x-3">
            <button className="flex items-center space-x-2 px-4 py-3 bg-white border border-slate-100 rounded-2xl text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
              <Filter size={18} />
              <span className="text-sm font-semibold">Filtros</span>
            </button>
            <button className="flex items-center space-x-2 px-6 py-3 bg-[#0e314d] text-white rounded-2xl hover:bg-[#105174] transition-all shadow-lg shadow-blue-900/10">
              <Package size={18} />
              <span className="text-sm font-bold">Exportar PDF</span>
            </button>
          </div>
        </div>
  
        {/* CONTENEDOR DE LA TABLA */}
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-50">
                  <th className="px-6 py-5 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Producto</th>
                  <th className="px-6 py-5 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Categoría</th>
                  <th className="px-6 py-5 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Precio</th>
                  <th className="px-6 py-5 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Stock</th>
                  <th className="px-6 py-5 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Estado</th>
                  <th className="px-6 py-5 text-center text-xs font-bold text-slate-400 uppercase tracking-widest">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {productosData.map((prod) => (
                  <tr key={prod.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-50 to-emerald-50 flex items-center justify-center text-cyan-600 border border-cyan-100/50">
                          <Package size={20} />
                        </div>
                        <div>
                          <p className="font-bold text-slate-700 text-sm">{prod.nombre}</p>
                          <p className="text-[11px] text-slate-400 font-medium uppercase tracking-tighter">{prod.sku}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold">
                        {prod.categoria}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <p className="font-bold text-slate-700">${prod.precio.toFixed(2)}</p>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col space-y-1">
                        <p className={`font-bold text-sm ${prod.stock <= 5 ? 'text-orange-500' : 'text-slate-600'}`}>
                          {prod.stock} unidades
                        </p>
                        <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${prod.stock <= 5 ? 'bg-orange-400' : 'bg-emerald-400'}`}
                            style={{ width: `${Math.min((prod.stock / 50) * 100, 100)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      {prod.estado === "Disponible" && (
                        <div className="flex items-center text-emerald-600 space-x-1.5">
                          <CheckCircle2 size={16} />
                          <span className="text-xs font-bold uppercase tracking-wider">Disponible</span>
                        </div>
                      )}
                      {prod.estado === "Stock Bajo" && (
                        <div className="flex items-center text-orange-500 space-x-1.5">
                          <AlertCircle size={16} />
                          <span className="text-xs font-bold uppercase tracking-wider">Stock Bajo</span>
                        </div>
                      )}
                      {prod.estado === "Agotado" && (
                        <div className="flex items-center text-red-400 space-x-1.5">
                          <AlertCircle size={16} />
                          <span className="text-xs font-bold uppercase tracking-wider">Agotado</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center justify-center space-x-2">
                        <button className="p-2 text-slate-400 hover:text-cyan-600 hover:bg-cyan-50 rounded-xl transition-all">
                          <Edit size={18} />
                        </button>
                        <button className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                          <Trash2 size={18} />
                        </button>
                        <button className="p-2 text-slate-400 hover:bg-slate-100 rounded-xl transition-all">
                          <MoreVertical size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
  
          {/* PAGINACIÓN */}
          <div className="px-6 py-5 bg-slate-50/30 border-t border-slate-50 flex items-center justify-between">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Mostrando 1 - 5 de 24 productos
            </p>
            <div className="flex items-center space-x-2">
              <button className="p-2 rounded-xl border border-slate-200 text-slate-400 hover:bg-white transition-all disabled:opacity-50">
                <ChevronLeft size={18} />
              </button>
              <div className="flex items-center space-x-1">
                <button className="w-8 h-8 rounded-xl bg-cyan-600 text-white text-xs font-bold shadow-md shadow-cyan-600/20">1</button>
                <button className="w-8 h-8 rounded-xl text-slate-500 text-xs font-bold hover:bg-slate-100">2</button>
                <button className="w-8 h-8 rounded-xl text-slate-500 text-xs font-bold hover:bg-slate-100">3</button>
              </div>
              <button className="p-2 rounded-xl border border-slate-200 text-slate-400 hover:bg-white transition-all">
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }