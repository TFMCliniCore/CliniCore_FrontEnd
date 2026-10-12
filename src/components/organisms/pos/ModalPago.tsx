'use client';

import { useState, useEffect } from 'react';
import { X, DollarSign, CreditCard, SplitSquareHorizontal, FileText, Receipt, AlertTriangle, Loader2 } from 'lucide-react';
import { MetodoPago } from '@/types/ventas.types';

const METODO_PAGO_MAP: Record<MetodoPago, number> = {
  'EFECTIVO': 1,
  'TARJETA': 2,
  'MIXTO': 3
};

interface PagoPayload {
  metodoPagoId: number;
  monto: number;
  montoRecibido?: number; // 👈 Agregamos esto
  referencia?: string;
}

interface ModalPagoProps {
  isOpen: boolean;
  onClose: () => void;
  totalAPagar: number;
  onConfirmarPago: (
    pagos: PagoPayload[], 
    tipoComprobante: 'TICKET' | 'FACTURA'
  ) => void | Promise<void>; // Soporta asincronía para capturar errores
}

export default function ModalPago({ isOpen, onClose, totalAPagar, onConfirmarPago }: ModalPagoProps) {
  const [metodo, setMetodo] = useState<MetodoPago>('EFECTIVO');
  const [tipoComprobante, setTipoComprobante] = useState<'TICKET' | 'FACTURA'>('FACTURA');
  
  // Estados para montos e inputs
  const [montoRecibidoEfectivo, setMontoRecibidoEfectivo] = useState<string>('');
  const [montoMixtoTarjeta, setMontoMixtoTarjeta] = useState<string>('');
  const [referenciaPago, setReferenciaPago] = useState<string>('');

  // 🚀 NUEVOS ESTADOS PARA CONTROLAR EL FLUJO INTERNO
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorEfectivo, setErrorEfectivo] = useState<boolean>(false);

  // Limpieza preventiva si el padre no desmonta el componente internamente
  useEffect(() => {
    if (isOpen) {
      setMetodo('EFECTIVO');
      setMontoRecibidoEfectivo('');
      setMontoMixtoTarjeta('');
      setReferenciaPago('');
      setTipoComprobante('FACTURA');
      setErrorEfectivo(false);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Manejador del cambio de método (Limpia el error del botón al cambiar de pestaña)
  const handleCambiarMetodo = (nuevoMetodo: MetodoPago) => {
    setMetodo(nuevoMetodo);
    setErrorEfectivo(false);
  };

  // Cálculos reactivos automáticos seguros
  const tarjetaMontoNum = Number(montoMixtoTarjeta) || 0;
  const efectivoEnMixto = Math.max(0, totalAPagar - tarjetaMontoNum);
  
  const efectivoRecibidoNum = Number(montoRecibidoEfectivo) || 0;
  const vuelto = metodo === 'EFECTIVO' 
    ? (efectivoRecibidoNum > totalAPagar ? efectivoRecibidoNum - totalAPagar : 0)
    : 0;

  // Validación del botón de confirmación
  const esBotonDeshabilitado = () => {
    if (metodo === 'EFECTIVO') {
      return efectivoRecibidoNum < totalAPagar;
    }
    if (metodo === 'TARJETA') {
      return !referenciaPago.trim(); 
    }
    if (metodo === 'MIXTO') {
      return tarjetaMontoNum <= 0 || tarjetaMontoNum >= totalAPagar || !referenciaPago.trim();
    }
    return false;
  };

  // 🔄 ENVÍO ASÍNCRONO INTERCEPTOR DE ERRORES
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); 
    if (esBotonDeshabilitado() || isSubmitting) return;

    let pagosEnviados: PagoPayload[] = [];

    if (metodo === 'EFECTIVO') {
      pagosEnviados = [{
        metodoPagoId: METODO_PAGO_MAP['EFECTIVO'],
        monto: Number(totalAPagar.toFixed(2)),
        montoRecibido: efectivoRecibidoNum, 
        referencia: `Efectivo en ventanilla (Recibió: $${efectivoRecibidoNum.toFixed(2)}, Vuelto: $${vuelto.toFixed(2)})`
      }];
    } else if (metodo === 'TARJETA') {
      pagosEnviados = [{
        metodoPagoId: METODO_PAGO_MAP['TARJETA'],
        monto: Number(totalAPagar.toFixed(2)),
        referencia: referenciaPago.trim()
      }];
    } else if (metodo === 'MIXTO') {
      pagosEnviados = [
        {
          metodoPagoId: METODO_PAGO_MAP['EFECTIVO'],
          monto: Number(efectivoEnMixto.toFixed(2)),
          montoRecibido: Number(efectivoEnMixto.toFixed(2)), 
          referencia: 'Parte efectivo Mixto'
        },
        {
          metodoPagoId: METODO_PAGO_MAP['TARJETA'],
          monto: Number(tarjetaMontoNum.toFixed(2)),
          referencia: referenciaPago.trim()
        }
      ];
    }

    setIsSubmitting(true);
    setErrorEfectivo(false);

    try {
      // Ejecutamos la función del padre y esperamos a ver si falla
      await onConfirmarPago(pagosEnviados, tipoComprobante);
    } catch (error: any) {
      if (error?.message === 'FALTA_EFECTIVO') {
        setErrorEfectivo(true);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Atajo rápido para rellenar montos
  const handleMontoAccesoRapido = (monto: number) => {
    setMontoRecibidoEfectivo(monto.toString());
    setErrorEfectivo(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <form 
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden mx-4"
      >
        <div className="bg-blue-900 p-4 flex justify-between items-center text-white">
          <h2 className="text-xl font-bold">Procesar Cobro</h2>
          <button 
            type="button" 
            onClick={onClose} 
            className="hover:bg-white/20 p-1 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          <div className="text-center mb-6">
            <p className="text-sm text-gray-500 uppercase tracking-wide font-semibold">Total a Cobrar</p>
            <p className="text-4xl font-black text-blue-900">${totalAPagar.toFixed(2)}</p>
          </div>

          {/* Selector de Tipo de Comprobante */}
          <div className="mb-4">
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Tipo de Comprobante</label>
            <div className="grid grid-cols-2 gap-2">
              <button 
                type="button"
                onClick={() => setTipoComprobante('FACTURA')} 
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl border-2 font-bold text-sm transition-all ${tipoComprobante === 'FACTURA' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}
              >
                <FileText size={18} />
                Factura A4
              </button>
              <button 
                type="button"
                onClick={() => setTipoComprobante('TICKET')} 
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl border-2 font-bold text-sm transition-all ${tipoComprobante === 'TICKET' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}
              >
                <Receipt size={18} />
                Ticket POS
              </button>
            </div>
          </div>

          {/* Selector Métodos de Pago */}
          <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Método de Pago</label>
          <div className="grid grid-cols-3 gap-2 mb-6">
            <button type="button" onClick={() => handleCambiarMetodo('EFECTIVO')} className={`flex flex-col items-center p-3 rounded-xl border-2 transition-all ${metodo === 'EFECTIVO' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
              <DollarSign size={24} className="mb-1" />
              <span className="text-xs font-bold">Efectivo</span>
            </button>
            <button type="button" onClick={() => handleCambiarMetodo('TARJETA')} className={`flex flex-col items-center p-3 rounded-xl border-2 transition-all ${metodo === 'TARJETA' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
              <CreditCard size={24} className="mb-1" />
              <span className="text-xs font-bold">Tarjeta</span>
            </button>
            <button type="button" onClick={() => handleCambiarMetodo('MIXTO')} className={`flex flex-col items-center p-3 rounded-xl border-2 transition-all ${metodo === 'MIXTO' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
              <SplitSquareHorizontal size={24} className="mb-1" />
              <span className="text-xs font-bold">Mixto</span>
            </button>
          </div>

          {/* FLUJO EFECTIVO */}
          {metodo === 'EFECTIVO' && (
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Efectivo Recibido ($)</label>
                <input 
                  type="number" 
                  step="0.01"
                  min="0"
                  value={montoRecibidoEfectivo}
                  onChange={(e) => { setMontoRecibidoEfectivo(e.target.value); setErrorEfectivo(false); }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-lg font-semibold mb-2"
                  placeholder="0.00"
                  autoFocus
                />
                <div className="flex gap-1.5 flex-wrap">
                  <button 
                    type="button" 
                    onClick={() => handleMontoAccesoRapido(totalAPagar)}
                    className="text-xs px-2.5 py-1.5 bg-slate-100 hover:bg-blue-600 hover:text-white rounded-md text-slate-700 font-semibold transition-colors"
                  >
                    Exacto
                  </button>
                  <button 
                    type="button" 
                    onClick={() => handleMontoAccesoRapido(Math.ceil(totalAPagar / 1000) * 1000)}
                    className="text-xs px-2.5 py-1.5 bg-slate-100 hover:bg-blue-600 hover:text-white rounded-md text-slate-700 font-semibold transition-colors"
                  >
                    Próximo millar
                  </button>
                </div>
              </div>
              {vuelto > 0 && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex justify-between items-center text-green-800 animate-fadeIn">
                  <span className="font-semibold">Cambio a devolver:</span>
                  <span className="text-xl font-bold">${vuelto.toFixed(2)}</span>
                </div>
              )}
            </div>
          )}

          {/* FLUJO TARJETA */}
          {metodo === 'TARJETA' && (
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nº Operación / Referencia Voucher</label>
                <input 
                  type="text" 
                  value={referenciaPago}
                  onChange={(e) => setReferenciaPago(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-base"
                  placeholder="Ej: 123456"
                  autoFocus
                  required
                />
              </div>
            </div>
          )}

          {/* FLUJO MIXTO */}
          {metodo === 'MIXTO' && (
            <div className="space-y-4 mb-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Monto a cargar a TARJETA ($)</label>
                <input 
                  type="number" 
                  step="0.01"
                  min="0"
                  value={montoMixtoTarjeta}
                  onChange={(e) => { setMontoMixtoTarjeta(e.target.value); setErrorEfectivo(false); }}
                  max={totalAPagar}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-semibold"
                  placeholder="0.00"
                />
              </div>
              <div className="flex justify-between items-center text-sm font-medium text-slate-700 pt-2 border-t border-dashed">
                <span>Restante en EFECTIVO:</span>
                <span className="text-base font-bold text-blue-900">${efectivoEnMixto.toFixed(2)}</span>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nº Referencia Voucher Tarjeta</label>
                <input 
                  type="text" 
                  value={referenciaPago}
                  onChange={(e) => setReferenciaPago(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Ej: Op-9923"
                  required={metodo === 'MIXTO'}
                />
              </div>
            </div>
          )}

          {/* 🚀 BOTÓN REEMPLAZADO DINÁMICAMENTE POR EL MENSAJE DE ADVERTENCIA */}
          {errorEfectivo ? (
            <div className="w-full p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3 text-rose-900 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-200">
              <AlertTriangle className="text-rose-600 shrink-0 mt-0.5" size={20} />
              <div>
                <p className="text-sm font-bold leading-none">pago no puede continuar por falta de efectivo</p>
                <p className="text-xs text-rose-700 mt-1">por favor cambie de metodo de pago</p>
              </div>
            </div>
          ) : (
            <button 
              type="submit"
              disabled={esBotonDeshabilitado() || isSubmitting}
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-lg shadow-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting && <Loader2 className="animate-spin" size={20} />}
              <span>{isSubmitting ? 'Procesando...' : 'Confirmar Pago'}</span>
            </button>
          )}
        </div>
      </form>
    </div>
  );
}