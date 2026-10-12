'use client';

import { Trash2, Plus, Minus, Tag } from 'lucide-react';
import { DetalleVenta } from '@/types/ventas.types';

interface PosCarritoProps {
  items: DetalleVenta[];
  onUpdateQuantity: (id: number, cantidad: number) => void;
  onRemoveItem: (id: number) => void;
}

export default function PosCarrito({ items, onUpdateQuantity, onRemoveItem }: PosCarritoProps) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-400">
        <Tag size={48} className="mb-4 opacity-50" />
        <p className="italic">El carrito está vacío</p>
        <p className="text-sm">Selecciona productos del catálogo</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.productoId} className="flex flex-col p-3 bg-white border border-gray-100 rounded-lg shadow-sm hover:border-blue-200 transition-colors">
          <div className="flex justify-between items-start mb-2">
            <span className="font-medium text-gray-800 text-sm line-clamp-2">{item.nombreProducto}</span>
            <button 
              onClick={() => onRemoveItem(item.productoId)}
              className="text-gray-400 hover:text-red-500 transition-colors"
            >
              <Trash2 size={16} />
            </button>
          </div>
          
          <div className="flex justify-between items-center mt-1">
            <div className="flex items-center space-x-2 bg-gray-50 border border-gray-200 rounded-md">
              <button 
                onClick={() => onUpdateQuantity(item.productoId, item.cantidad - 1)}
                disabled={item.cantidad <= 1}
                className="p-1 text-gray-500 hover:text-blue-600 disabled:opacity-30"
              >
                <Minus size={14} />
              </button>
              <span className="text-sm font-semibold w-6 text-center text-gray-700">{item.cantidad}</span>
              <button 
                onClick={() => onUpdateQuantity(item.productoId, item.cantidad + 1)}
                className="p-1 text-gray-500 hover:text-blue-600"
              >
                <Plus size={14} />
              </button>
            </div>
            
            <div className="text-right">
              <p className="text-xs text-gray-500">${item.precioUnitario.toFixed(2)} c/u</p>
              <p className="font-bold text-gray-800">${item.subtotal.toFixed(2)}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}