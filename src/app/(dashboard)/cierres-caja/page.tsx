'use client';

import { useState, useEffect } from 'react';
import { Lock, Unlock, CreditCard, History, X, DollarSign, Send, Eye } from 'lucide-react';

// 1. TIPADO ROBUSTO Y COMPLETO
type VentaCaja = {
  id: number;
  codigo: string;
  total: string | number;
  estado: string;
  createdAt: string;
  cierreCajaId: number;
};

type CierreCaja = {
  id: number;
  usuarioId: number;
  nombreUsuario?: string; 
  sucursalId: number;
  fechaApertura: string;
  fechaCierre: string | null;
  montoInicial: string | number;     
  totalCalculado: string | number;   
  totalReal: string | number | null; 
  efectivoReal?: string | number | null;      
  tarjetaReal?: string | number | null;       
  transferenciaReal?: string | number | null; 
  diferencia: string | number | null;
  observaciones: string | null;
  estado: 'ABIERTA' | 'CERRADA';
  ventas?: VentaCaja[]; // Arreglo embebido devuelto por el backend
  flujoEfectivoVentas?: number;
  transaccionesDigitales?: number;
};

export default function CierresCajaPage() {
  // Estados esenciales y limpios
  const [cajaActiva, setCajaActiva] = useState<CierreCaja | null>(null);
  const [historialCierres, setHistorialCierres] = useState<CierreCaja[]>([]);
  const [montoBase, setMontoBase] = useState<number>(50); // Ajustado a tu base común de $50
  const [isLoading, setIsLoading] = useState(true);

  // Modales
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [cierreSeleccionado, setCierreSeleccionado] = useState<CierreCaja | null>(null);
  
  const [formCierre, setFormCierre] = useState({
    efectivoReal: 0,
    tarjetaReal: 0,
    transferenciaReal: 0,
    observaciones: ''
  });

  // 2. CARGA DE DATOS CON POLLING ASÍNCRONO CLEAN
  useEffect(() => {
    cargarDatosCaja();
    const intervalo = setInterval(cargarDatosCaja, 10000); 
    return () => clearInterval(intervalo);
  }, []);

  const cargarDatosCaja = async () => {
    try {
      const [resActiva, resHistorial] = await Promise.all([
        fetch('http://localhost:3008/api/v1/cierres-caja/activa'),
        fetch('http://localhost:3008/api/v1/cierres-caja?limite=10&estado=CERRADA')
      ]);

      if (resActiva.ok) {
        const textActiva = await resActiva.text();
        const activa = textActiva ? JSON.parse(textActiva) : null;
        setCajaActiva(activa && activa.id ? activa : null);
      }

      if (resHistorial.ok) {
        const textHistorial = await resHistorial.text();
        setHistorialCierres(textHistorial ? JSON.parse(textHistorial) : []);
      }
    } catch (error) {
      console.error('❌ Error conectando al MS Ventas:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 3. 🔥 CÁLCULOS DEREVADOS (ESTADO DERIVADO - AQUÍ SE RESUELVE TU BUG)
  const isCajaAbierta = cajaActiva !== null;
  const montoInicialNum = Number(cajaActiva?.montoInicial || 0);

  // Si el backend devuelve 0 en las propiedades agregadas, calculamos la suma real usando el arreglo de ventas
  const totalVentasRegistradas = cajaActiva?.ventas?.reduce((acc, v) => acc + Number(v.total || 0), 0) || 0;

  // Fallback inteligente: si flujoEfectivoVentas viene en 0 pero hay ventas en el arreglo, asumimos el total de las ventas
  const efectivoVentas = Number(cajaActiva?.flujoEfectivoVentas || 0) || totalVentasRegistradas;
  const tarjetaVentas = Number(cajaActiva?.transaccionesDigitales || 0);
  
  const totalEsperadoCaja = isCajaAbierta ? montoInicialNum + efectivoVentas : 0;

  // 4. ACCIONES DE FLUJO
  const handleAbrirCaja = async () => {
    try {
      const response = await fetch('http://localhost:3008/api/v1/cierres-caja', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ montoApertura: Number(montoBase), usuarioId: 1, sucursalId: 1 })
      });

      if (!response.ok) throw new Error('No se pudo abrir la caja');
      
      const nuevaCaja = await response.json();
      setCajaActiva(nuevaCaja);
      alert('🚀 Turno operativo iniciado con éxito.');
    } catch (error: any) {
      alert(`Error al intentar abrir el turno: ${error.message}`);
    }
  };

  const handleAbrirModalCierre = () => {
    if (!cajaActiva) return;
    setFormCierre({
      efectivoReal: totalEsperadoCaja, 
      tarjetaReal: tarjetaVentas,    
      transferenciaReal: 0,
      observaciones: ''
    });
    setIsModalOpen(true);
  };

  const handleSubmitCierre = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cajaActiva) return;

    try {
      const response = await fetch(`http://localhost:3008/api/v1/cierres-caja/${cajaActiva.id}/cerrar`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          efectivoReal: Number(formCierre.efectivoReal),
          tarjetaReal: Number(formCierre.tarjetaReal),
          transferenciaReal: Number(formCierre.transferenciaReal),
          observaciones: formCierre.observaciones
        })
      });

      if (!response.ok) throw new Error('Error al procesar el cuadre');
      
      setIsModalOpen(false); 
      setCajaActiva(null);
      await cargarDatosCaja(); 
      alert('🔒 Turno de caja cerrado correctamente.');
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen text-slate-800 font-sans relative">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Control de Caja y Turnos</h1>
        <p className="text-slate-500 text-sm mt-1">Apertura, supervisión de flujo de efectivo y cuadre operativo de cajas.</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Panel Operativo Principal */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-xl shadow-slate-200/50 border border-slate-200 p-6">
            <div className="flex items-center gap-4 mb-8 p-4 rounded-xl bg-slate-50 border border-slate-100">
              <div className="relative flex h-3 w-3">
                {isCajaAbierta && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>}
                <span className={`relative inline-flex rounded-full h-3 w-3 ${isCajaAbierta ? 'bg-emerald-500 shadow-[0_0_10px_rgba(34,197,94,0.4)]' : 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.4)]'}`}></span>
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-slate-900 text-sm">
                  Estado de Terminal: {isCajaAbierta ? `ESTACIÓN ACTIVA (Turno #${cajaActiva.id})` : 'ESTACIÓN BLOQUEADA'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {isCajaAbierta ? 'Las operaciones del terminal de ventas están sincronizadas y registrando transacciones.' : 'Registre el saldo base inicial para reanudar ventas.'}
                </p>
              </div>
            </div>

            {!isCajaAbierta ? (
              /* Formulario de Apertura */
              <div className="space-y-6 max-w-md">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 mb-1">Apertura de Turno Operativo</h2>
                  <p className="text-xs text-slate-400 font-medium">Asigne el fondo de efectivo para dar cambio antes de inicializar ventas.</p>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Monto Inicial en Base</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">$</span>
                      <input 
                        type="number" 
                        value={montoBase || ''}
                        onChange={(e) => setMontoBase(parseFloat(e.target.value) || 0)}
                        className="w-full pl-8 pr-4 py-2.5 bg-slate-50 border border-slate-200 text-slate-800 rounded-xl font-bold text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all shadow-sm" 
                        placeholder="0.00" 
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {[50, 100, 200].map(val => (
                      <button key={val} type="button" onClick={() => setMontoBase(val)} className="px-3 py-1 text-xs font-bold bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-600 transition-colors">+${val}</button>
                    ))}
                  </div>
                </div>
                <button onClick={handleAbrirCaja} className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl shadow-lg shadow-blue-600/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-sm tracking-wide">
                  <Unlock size={18} /> Abrir Turno y Habilitar Punto de Venta
                </button>
              </div>
            ) : (
              /* Monitor de Turno Abierto */
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-slate-100 pb-4 gap-2">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">Arqueo y Desglose de Caja Activa</h2>
                    <p className="text-xs text-slate-400 font-medium">Turno iniciado por <span className="text-slate-600 font-bold">{cajaActiva.nombreUsuario || `Usuario ID: ${cajaActiva.usuarioId}`}</span> el {new Date(cajaActiva.fechaApertura).toLocaleString()}</p>
                  </div>
                  <span className="text-xs bg-blue-50 text-blue-700 font-bold px-3 py-1 rounded-full border border-blue-100">Sesión #{cajaActiva.id}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Fondo Inicial (Base)</p>
                    <p className="text-xl font-black text-slate-800 mt-1">${montoInicialNum.toFixed(2)}</p>
                  </div>
                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Flujo Efectivo (Ventas)</p>
                    <p className="text-xl font-black text-slate-800 mt-1">${efectivoVentas.toFixed(2)}</p>
                  </div>
                  <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-xl">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-blue-500">Efectivo Total Esperado</p>
                    <p className="text-xl font-black text-blue-600 mt-1">${totalEsperadoCaja.toFixed(2)}</p>
                  </div>
                </div>

                <div className="p-4 bg-white border border-slate-200 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-600 font-semibold text-xs">
                    <CreditCard size={16} className="text-slate-400" /> Transacciones Digitales (Tarjetas / Datáfono):
                  </div>
                  <span className="font-bold text-sm text-slate-800">${tarjetaVentas.toFixed(2)}</span>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <button onClick={handleAbrirModalCierre} className="w-full sm:w-auto px-6 py-3.5 bg-red-600 hover:bg-red-700 text-white font-extrabold rounded-xl shadow-lg shadow-red-600/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-sm tracking-wide">
                    <Lock size={18} /> Cerrar Caja (Realizar Cuadre)
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Panel Lateral: Historial */}
          <div className="lg:col-span-1 bg-white rounded-xl shadow-xl shadow-slate-200/50 border border-slate-200 p-6">
            <h2 className="text-md font-bold text-slate-900 mb-5 flex items-center gap-2">
              <History size={18} className="text-slate-400" /> Cierres Recientes
            </h2>
            <div className="flex flex-col gap-4 max-h-[600px] overflow-y-auto pr-2">
              {historialCierres.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-4">No hay cierres registrados.</p>
              ) : (
                historialCierres.map(turno => {
                  const diferenciaNum = Number(turno.diferencia ?? 0);
                  const estaCuadrado = diferenciaNum === 0;
                  const totalRealCalculado = Number(turno.totalReal) || (Number(turno.efectivoReal ?? 0) + Number(turno.tarjetaReal ?? 0) + Number(turno.transferenciaReal ?? 0));
                  
                  return (
                    <div key={turno.id} className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl flex flex-col gap-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-900">TURNO-{turno.id}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${estaCuadrado ? 'text-emerald-700 bg-emerald-50' : 'text-amber-700 bg-amber-50'}`}>
                          {estaCuadrado ? 'Cuadrado' : 'Discrepancia'}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs text-slate-500 font-medium">
                        <span>Cajero: {turno.nombreUsuario || `ID: ${turno.usuarioId}`}</span>
                        <span>{turno.fechaCierre ? new Date(turno.fechaCierre).toLocaleDateString() : ''}</span>
                      </div>
                      <div className="h-px bg-slate-200/40 w-full my-0.5" />
                      <div className="flex justify-between items-baseline text-xs">
                        <span className="font-semibold text-slate-400">Total Neto En Caja:</span>
                        <span className="font-bold text-slate-800">${totalRealCalculado.toFixed(2)}</span>
                      </div>
                      {!estaCuadrado && (
                        <p className={`text-[11px] font-bold text-right ${diferenciaNum < 0 ? 'text-red-600' : 'text-blue-600'}`}>
                          {diferenciaNum < 0 ? 'Faltante:' : 'Sobrante:'} ${Math.abs(diferenciaNum).toFixed(2)}
                        </p>
                      )}
                      <button onClick={() => setCierreSeleccionado(turno)} className="mt-2 w-full py-1.5 bg-white hover:bg-blue-50 text-slate-600 hover:text-blue-700 text-xs font-bold rounded-lg border border-slate-200 hover:border-blue-200 flex items-center justify-center gap-1.5 transition-all shadow-sm">
                        <Eye size={13} /> Ver Detalles del Cuadre
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>
      )}

      {/* MODAL DE ARQUEO FÍSICO */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-slate-50">
              <div className="flex items-center gap-2">
                <Lock className="text-red-500" size={18} />
                <h3 className="font-bold text-slate-900 text-base">Arqueo y Cierre de Caja</h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmitCierre} className="p-6 space-y-4">
              <p className="text-xs text-slate-500 font-medium">Ingrese el dinero físico real que se encuentra en caja.</p>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1.5"><DollarSign size={14} className="text-emerald-500" /> Efectivo Real</label>
                  <input type="number" step="0.01" value={formCierre.efectivoReal} onChange={(e) => setFormCierre({ ...formCierre, efectivoReal: parseFloat(e.target.value) || 0 })} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 text-slate-800 rounded-xl font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white" required />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1.5"><CreditCard size={14} className="text-blue-500" /> Tarjeta Real</label>
                  <input type="number" step="0.01" value={formCierre.tarjetaReal} onChange={(e) => setFormCierre({ ...formCierre, tarjetaReal: parseFloat(e.target.value) || 0 })} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 text-slate-800 rounded-xl font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white" required />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1.5"><Send size={14} className="text-indigo-500" /> Transferencia Real</label>
                  <input type="number" step="0.01" value={formCierre.transferenciaReal} onChange={(e) => setFormCierre({ ...formCierre, transferenciaReal: parseFloat(e.target.value) || 0 })} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 text-slate-800 rounded-xl font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white" required />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Observaciones</label>
                  <textarea value={formCierre.observaciones} onChange={(e) => setFormCierre({ ...formCierre, observaciones: e.target.value })} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 text-slate-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 h-16 resize-none" placeholder="Motivos de faltantes o comentarios..." />
                </div>
              </div>
              <div className="pt-2 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2.5 bg-slate-100 text-slate-600 font-bold rounded-xl text-xs">Cancelar</button>
                <button type="submit" className="flex-1 py-2.5 bg-red-600 text-white font-bold rounded-xl text-xs">Confirmar Cierre</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: DETALLE DE AUDITORÍA */}
      {cierreSeleccionado && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-slate-50">
              <div className="flex items-center gap-2">
                <History className="text-blue-600" size={18} />
                <h3 className="font-bold text-slate-900 text-base">Auditoría de Turno #{cierreSeleccionado.id}</h3>
              </div>
              <button onClick={() => setCierreSeleccionado(null)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100">
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3 text-xs border-b border-slate-100 pb-3">
                <div>
                  <p className="text-slate-400 font-medium">Cajero asignado:</p>
                  <p className="font-bold text-slate-800">{cierreSeleccionado.nombreUsuario || `ID: ${cierreSeleccionado.usuarioId}`}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-medium">Estado actual:</p>
                  <span className="inline-block px-2 py-0.5 font-bold rounded bg-slate-100 text-slate-700 text-[10px] uppercase">{cierreSeleccionado.estado}</span>
                </div>
                <div className="col-span-2 mt-1">
                  <p className="text-slate-400 font-medium">Fecha Apertura:</p>
                  <p className="font-semibold text-slate-700">{new Date(cierreSeleccionado.fechaApertura).toLocaleString()}</p>
                </div>
              </div>

              <div className="space-y-2.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Resultados del Cuadre</h4>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Monto Base Inicial:</span>
                    <span className="font-semibold">${Number(cierreSeleccionado.montoInicial).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Total Calculado (Sistema):</span>
                    <span className="font-semibold text-blue-600">${Number(cierreSeleccionado.totalCalculado).toFixed(2)}</span>
                  </div>
                  <div className="h-px bg-slate-200 my-1" />
                  <div className="flex justify-between font-bold text-sm">
                    <span className="text-slate-800">Total Físico Declarado:</span>
                    <span className="text-slate-900">${(Number(cierreSeleccionado.totalReal) || (Number(cierreSeleccionado.efectivoReal ?? 0) + Number(cierreSeleccionado.tarjetaReal ?? 0) + Number(cierreSeleccionado.transferenciaReal ?? 0))).toFixed(2)}</span>
                  </div>
                </div>

                <div className={`p-3 rounded-xl border flex justify-between items-center text-xs font-bold ${Number(cierreSeleccionado.diferencia ?? 0) === 0 ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-amber-50 border-amber-200 text-amber-800'}`}>
                  <span>Discrepancia final:</span>
                  <span>
                    {Number(cierreSeleccionado.diferencia ?? 0) === 0 ? '✓ Turno Cuadrado Exitosamente' : `${Number(cierreSeleccionado.diferencia) < 0 ? 'Faltante:' : 'Sobrante:'} $${Math.abs(Number(cierreSeleccionado.diferencia)).toFixed(2)}`}
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <button onClick={() => setCierreSeleccionado(null)} className="w-full py-2.5 bg-slate-900 text-white font-bold rounded-xl text-xs">Cerrar Auditoría</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}