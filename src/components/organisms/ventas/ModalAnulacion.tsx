'use client';

import { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ModalAnulacionProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (motivo: string) => void;
  codigoFactura: string;
}

export default function ModalAnulacion({ isOpen, onClose, onConfirm, codigoFactura }: ModalAnulacionProps) {
  const [motivo, setMotivo] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden border-t-4 border-red-500">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 text-red-600 rounded-full">
                <AlertTriangle size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Anular Comprobante</h3>
                <p className="text-sm text-gray-500">Factura: <span className="font-bold text-gray-700">{codigoFactura}</span></p>
              </div>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X size={20} />
            </button>
          </div>

          <p className="text-sm text-gray-600 mb-4 border-l-4 border-amber-400 pl-3 bg-amber-50 py-2">
            Esta acción es irreversible. Liberará el stock de vuelta al inventario y marcará la factura como anulada en auditoría.
          </p>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">Motivo de la anulación (Obligatorio)</label>
            <textarea
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="Ej: Cliente canceló la compra, error en digitación..."
            />
          </div>

          <div className="flex justify-end gap-3">
            <button 
              onClick={onClose}
              className="px-4 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button 
              onClick={() => onConfirm(motivo)}
              disabled={motivo.trim().length < 5}
              className="px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <AlertTriangle size={16} />
              Proceder con Anulación
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}