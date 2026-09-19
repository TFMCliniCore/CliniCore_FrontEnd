'use client';

import { HistorialPrecio } from '@/types/precios.types';
import { ArrowRight, Clock, User } from 'lucide-react';

interface TablaHistorialProps {
  historial: HistorialPrecio[];
}

export default function TablaHistorial({ historial }: TablaHistorialProps) {
  if (!historial || historial.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-50 rounded-lg border border-dashed border-gray-300">
        <p className="text-sm">No hay registros históricos para este producto.</p>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto rounded-lg border border-gray-200">
      <table className="w-full text-left text-sm whitespace-nowrap">
        <thead className="bg-gray-100 text-gray-600 font-semibold uppercase tracking-wider text-xs">
          <tr>
            <th className="px-4 py-3 border-b border-gray-200">Fecha y Hora</th>
            <th className="px-4 py-3 border-b border-gray-200">Usuario ID</th>
            <th className="px-4 py-3 border-b border-gray-200">Variación de Precio</th>
            <th className="px-4 py-3 border-b border-gray-200 text-right">Margen</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white">
          {historial.map((registro) => (
            <tr key={registro.id} className="hover:bg-blue-50/50 transition-colors">
              <td className="px-4 py-3 text-gray-600 flex items-center gap-2">
                <Clock size={14} className="text-gray-400" />
                {new Date(registro.fechaCambio).toLocaleString()}
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2 text-gray-600">
                  <User size={14} className="text-gray-400" />
                  User #{registro.usuarioId}
                </div>
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-3 font-medium">
                  <span className="text-gray-500 line-through">${registro.precioAnterior.toFixed(2)}</span>
                  <ArrowRight size={14} className="text-blue-400" />
                  <span className="text-gray-900">${registro.precioNuevo.toFixed(2)}</span>
                </div>
              </td>
              <td className="px-4 py-3 text-right">
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                  registro.margenAplicado >= 0 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {registro.margenAplicado}%
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}