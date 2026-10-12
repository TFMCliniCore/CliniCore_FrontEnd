'use client';

import { useState, useEffect } from 'react';

// Mapeo inverso para mostrar los nombres de los métodos de pago según su ID
const ID_METODO_PAGO_MAP: Record<number, string> = {
  1: 'EFECTIVO',
  2: 'TARJETA',
  3: 'MIXTO'
};

type PagoDetalle = {
  id?: number;
  metodoPagoId: number;
  monto: number;
  referencia?: string;
};

type ItemDetalle = {
  id?: number;
  productoId: number;
  cantidad: number;
  precioUnitario: string | number;
  producto?: {
    nombre: string;
    codigo?: string;
  };
};

type FacturaVenta = {
  id: number;
  numeroComprobante: string;
  tipoComprobante: 'TICKET' | 'FACTURA';
  urlPdf: string;
  fechaEmision: string;
  venta: {
    codigo: string;
    total: string | number;
    estado: 'COMPLETADA' | 'PENDIENTE' | 'ANULADA';
    clienteId: number;
    pagos: PagoDetalle[];    // 👈 Agregado para auditoría financiera
    detalles: ItemDetalle[]; // 👈 Agregado para ver los productos vendidos
    motivoAnulacion?: string;
  };
};

const ESTADOS_FILTRO = ['Todas', 'Completadas', 'Anuladas'];

export default function HistorialVentasPage() {
  const [isModalAnulacionOpen, setIsModalAnulacionOpen] = useState(false);
  const [isModalDetalleOpen, setIsModalDetalleOpen] = useState(false);
  const [ventaSeleccionada, setVentaSeleccionada] = useState<FacturaVenta | null>(null);
  
  const [filtroEstado, setFiltroEstado] = useState('Todas');
  const [busqueda, setBusqueda] = useState('');
  
  // ESTADOS PARA LOS DATOS REALES
  const [facturas, setFacturas] = useState<FacturaVenta[]>([]);
  const [cargando, setCargando] = useState(true);
  const [anulandoId, setAnulandoId] = useState<number | null>(null);
  const [motivoAnulacion, setMotivoAnulacion] = useState('');
  const [mensajeAlerta, setMensajeAlerta] = useState<string | null>(null);

  // FETCH PARA TRAER LAS VENTAS DEL BACKEND
  useEffect(() => {
    const fetchVentas = async () => {
      try {
        const respuesta = await fetch('http://localhost:3008/api/v1/ventas');
        if (!respuesta.ok) throw new Error('Error al obtener el historial');
        
        const datos = await respuesta.json();
        
        const historialMapeado: FacturaVenta[] = datos.map((item: any) => {
          const facturaData = Array.isArray(item.factura) ? item.factura[0] : item.factura;
          
          const tipoDetectado = 
            facturaData?.tipoComprobante || 
            item.tipoComprobante || 
            (item.codigo?.startsWith('FACT') ? 'FACTURA' : 'FACTURA');

          return {
            id: item.id,
            numeroComprobante: facturaData?.numeroComprobante || item.codigo,
            tipoComprobante: tipoDetectado,
            urlPdf: facturaData?.urlPdf || `/facturas/${item.codigo}.pdf`,
            fechaEmision: item.createdAt,
            venta: {
              codigo: item.codigo,
              total: item.total,
              estado: item.estado,
              clienteId: item.clienteId,
              pagos: item.pagos || [],        // 👈 Mapeamos los pagos reales del backend
              detalles: item.detalles || [],  // 👈 Mapeamos los ítems del carrito vendidos
              motivoAnulacion: item.motivoAnulacion || ''
            }
          };
        });

        setFacturas(historialMapeado);
      } catch (error) {
        console.error('Error cargando historial de ventas:', error);
      } finally {
        setCargando(false);
      }
    };

    fetchVentas();
  }, []);
  
  // ACCIÓN: IMPRIMIR COMPROBANTE
  const handleImprimirComprobante = async (urlPdf: string) => {
    if (!urlPdf) {
      alert("Este comprobante no cuenta con un archivo PDF asociado.");
      return;
    }

    const BACKEND_URL = 'http://localhost:3008'; 
    let urlCompleta = urlPdf.startsWith('http') ? urlPdf : `${BACKEND_URL}${urlPdf}`;

    const conector = urlCompleta.includes('?') ? '&' : '?';
    urlCompleta = `${urlCompleta}${conector}v=${new Date().getTime()}`;

    try {
      const respuesta = await fetch(urlCompleta, { cache: 'no-store' });
      if (!respuesta.ok) throw new Error(`Error al obtener el PDF: ${respuesta.statusText}`);
      
      const blobPdf = await respuesta.blob();
      const urlBlobLocal = URL.createObjectURL(blobPdf);

      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = '0';
      iframe.src = urlBlobLocal;

      iframe.onload = () => {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
        
        setTimeout(() => {
          document.body.removeChild(iframe);
          URL.revokeObjectURL(urlBlobLocal); 
        }, 2000);
      };

      document.body.appendChild(iframe);
    } catch (error) {
      console.error("Error al intentar imprimir mediante Blob:", error);
      window.open(urlCompleta.split('?')[0], '_blank');
    }
  };

  // ACCIÓN: ANULAR VENTA EN EL BACKEND
  const handleAnularVenta = async (id: number) => {
    if (!motivoAnulacion || motivoAnulacion.trim().length < 10) {
      setMensajeAlerta('El motivo de anulación debe tener al menos 10 caracteres.');
      setTimeout(() => setMensajeAlerta(null), 4000);
      return;
    }

    setAnulandoId(id);
    try {
      const respuesta = await fetch(`http://localhost:3008/api/v1/ventas/${id}/anular`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ motivoAnulacion: motivoAnulacion.trim() })
      });

      if (!respuesta.ok) throw new Error('No se pudo anular la venta en el servidor');

      setFacturas(prevFacturas => 
        prevFacturas.map(item => 
          item.id === id 
            ? { ...item, venta: { ...item.venta, estado: 'ANULADA', motivoAnulacion: motivoAnulacion.trim() } }
            : item
        )
      );
      
      setIsModalAnulacionOpen(false);
      setVentaSeleccionada(null);
      setMotivoAnulacion('');

      setMensajeAlerta('Compra cancelada y comprobante anulado con éxito.');
      setTimeout(() => setMensajeAlerta(null), 4000);

    } catch (error) {
      console.error('Error al anular la venta:', error);
      setMensajeAlerta('Ocurrió un error al intentar anular la venta en el sistema.');
      setTimeout(() => setMensajeAlerta(null), 4000);
    } finally {
      setAnulandoId(null);
    }
  };

  const facturasFiltradas = facturas.filter(item => {
    const cumpleEstado = filtroEstado === 'Todas' || 
      (filtroEstado === 'Completadas' && item.venta.estado === 'COMPLETADA') ||
      (filtroEstado === 'Anuladas' && item.venta.estado === 'ANULADA');
    
    const cumpleBusqueda = item.numeroComprobante.toLowerCase().includes(busqueda.toLowerCase());

    return cumpleEstado && cumpleBusqueda;
  });

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'COMPLETADA':
        return <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full inline-flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>Completada</span>;
      case 'ANULADA':
        return <span className="text-xs font-bold text-red-700 bg-red-100 px-3 py-1 rounded-full inline-flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>Anulada</span>;
      default:
        return <span className="text-xs font-bold text-amber-700 bg-amber-100 px-3 py-1 rounded-full inline-flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>Pendiente</span>;
    }
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen text-slate-800 font-sans">
      {/* Alerta flotante de notificación */}
      {mensajeAlerta && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-xl shadow-2xl border border-slate-700 flex items-center gap-3 animate-bounce transition-all">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
          <p className="text-xs font-bold tracking-wide uppercase">{mensajeAlerta}</p>
        </div>
      )}
      
      {/* Cabecera */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Historial de Ventas</h1>
          <p className="text-slate-500 text-sm mt-1">Auditoría, facturación y control de comprobantes emitidos.</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <button className="flex flex-1 md:flex-none justify-center items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl font-medium text-sm hover:bg-slate-50 transition-colors shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
            Rango de Fechas
          </button>
          <button className="flex flex-1 md:flex-none justify-center items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl font-medium text-sm hover:bg-slate-50 transition-colors shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
            Exportar
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-6">
        <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-1 scrollbar-hide">
          {ESTADOS_FILTRO.map(estado => (
            <button
              key={estado}
              onClick={() => setFiltroEstado(estado)}
              className={`px-5 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
                filtroEstado === estado 
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' 
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              {estado}
            </button>
          ))}
        </div>

        {/* Buscador */}
        <div className="relative w-full md:w-96">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          </div>
          <input 
            type="text" 
            placeholder="Buscar por código..." 
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 text-slate-800 placeholder-slate-400 rounded-xl font-medium text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm"
          />
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-xl shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-bold">Comprobante</th>
                <th className="px-6 py-4 font-bold">Tipo</th>
                <th className="px-6 py-4 font-bold">Fecha Emisión</th>
                <th className="px-6 py-4 font-bold">Total</th>
                <th className="px-6 py-4 font-bold">Estado</th>
                <th className="px-6 py-4 font-bold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm font-medium text-slate-700">
              {cargando ? (
                <tr>
                  <td className="px-6 py-12 text-slate-400 text-center" colSpan={6}>
                    Cargando historial...
                  </td>
                </tr>
              ) : facturasFiltradas.length === 0 ? (
                <tr>
                  <td className="px-6 py-12 text-slate-400 italic text-center" colSpan={6}>
                    <div className="flex flex-col items-center justify-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-50"><path d="M4 22h14a2 2 0 0 0 2-2V7.5L14.5 2H6a2 2 0 0 0-2 2v4"/><polyline points="14 2 14 8 20 8"/><path d="M2 15h10"/><path d="m9 18 3-3-3-3"/></svg>
                      <p>No se encontraron comprobantes emitidos</p>
                    </div>
                  </td>
                </tr>
              ) : (
                facturasFiltradas.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-6 py-4 font-bold text-slate-900">{item.numeroComprobante}</td>
                    <td className="px-6 py-4 text-xs font-semibold text-slate-600">{item.tipoComprobante}</td>
                    <td className="px-6 py-4 text-slate-500 text-xs font-normal">
                      <span suppressHydrationWarning>
                        {new Date(item.fechaEmision).toLocaleString('es-CO', { hour12: false })}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-extrabold text-slate-900">
                      ${Number(item.venta.total).toLocaleString('es-CO', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4">{getEstadoBadge(item.venta.estado)}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                        
                        {/* ICONO: VER DETALLE EXTENDIDO */}
                        <button 
                          onClick={() => {
                            setVentaSeleccionada(item);
                            setIsModalDetalleOpen(true);
                          }}
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" 
                          title="Ver Detalle"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                        </button>
                        
                        {/* ICONO: IMPRIMIR */}
                        <button 
                          onClick={() => handleImprimirComprobante(item.urlPdf)}
                          className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors" 
                          title="Imprimir Comprobante"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect width="12" height="8" x="6" y="14"/></svg>
                        </button>

                        {/* ICONO: BLOCK / ANULAR */}
                        {item.venta.estado !== 'ANULADA' && (
                          <button 
                            onClick={() => {
                              setVentaSeleccionada(item);
                              setIsModalAnulacionOpen(true);
                            }}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" 
                            title="Anular Venta"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="4.93" x2="19.07" y1="4.93" y2="19.07"/></svg>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* ✨ NUEVO MODAL COMPLETO: DETALLE DE TRANSACCIÓN Y AUDITORÍA FINANCIERA */}
      {/* ========================================================================= */}
      {isModalDetalleOpen && ventaSeleccionada && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden mx-4 border border-slate-200">
            
            {/* Cabecera del Modal */}
            <div className="bg-slate-900 p-4 flex justify-between items-center text-white">
              <div>
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                  Detalle de Transacción
                </h2>
                <p className="text-slate-400 text-xs mt-0.5">Código Único POS: {ventaSeleccionada.venta.codigo}</p>
              </div>
              <button 
                onClick={() => {
                  setIsModalDetalleOpen(false);
                  setVentaSeleccionada(null);
                }} 
                className="hover:bg-white/20 p-1.5 rounded-full transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" x2="6" y1="6" y2="18"/><line x1="6" x2="18" y1="6" y2="18"/></svg>
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              {/* Bloque 1: Resumen General */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase">Nº Comprobante</p>
                  <p className="text-sm font-bold text-slate-900">{ventaSeleccionada.numeroComprobante}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase">Tipo Emisión</p>
                  <p className="text-sm font-semibold text-slate-700">{ventaSeleccionada.tipoComprobante}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase">Fecha / Hora</p>
                  <p className="text-xs font-medium text-slate-700 mt-0.5">
                    {new Date(ventaSeleccionada.fechaEmision).toLocaleString('es-CO', { hour12: false })}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase">Estado Venta</p>
                  <div className="mt-0.5">{getEstadoBadge(ventaSeleccionada.venta.estado)}</div>
                </div>
              </div>

              {/* Si la venta está ANULADA, mostrar el motivo */}
              {ventaSeleccionada.venta.estado === 'ANULADA' && ventaSeleccionada.venta.motivoAnulacion && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-800">
                  <p className="text-xs font-bold uppercase tracking-wide">Motivo de Anulación Fiscal:</p>
                  <p className="text-sm mt-0.5 italic">"{ventaSeleccionada.venta.motivoAnulacion}"</p>
                </div>
              )}

              {/* Bloque 2: Desglose de Métodos de Pago */}
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Flujo Financiero (Caja / Auditoría)</h3>
                <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
                  {ventaSeleccionada.venta.pagos && ventaSeleccionada.venta.pagos.length > 0 ? (
                    ventaSeleccionada.venta.pagos.map((pago, index) => (
                      <div key={pago.id || index} className="p-3 flex justify-between items-center bg-white hover:bg-slate-50/50 transition-colors">
                        <div className="flex items-center gap-2.5">
                          <span className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                          </span>
                          <div>
                            <p className="text-sm font-bold text-slate-900">
                              {ID_METODO_PAGO_MAP[pago.metodoPagoId] || `MÉTODO ID: ${pago.metodoPagoId}`}
                            </p>
                            {pago.referencia && (
                              <p className="text-xs text-slate-400 font-normal">Ref: {pago.referencia}</p>
                            )}
                          </div>
                        </div>
                        <p className="text-sm font-extrabold text-slate-900">
                          ${Number(pago.monto).toLocaleString('es-CO', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-xs text-slate-400 italic bg-amber-50/40 border border-dashed border-amber-200 text-amber-800 rounded-xl">
                      ⚠️ Transacción migrada o sin desglose analítico de caja registrado.
                    </div>
                  )}
                </div>
              </div>

              {/* Bloque 3: Artículos Comprados (Detalles) */}
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Artículos Emitidos</h3>
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold text-xs uppercase">
                        <th className="p-3">Producto / SKU</th>
                        <th className="p-3 text-center">Cant.</th>
                        <th className="p-3 text-right">P. Unitario</th>
                        <th className="p-3 text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm font-medium">
                      {ventaSeleccionada.venta.detalles && ventaSeleccionada.venta.detalles.length > 0 ? (
                        ventaSeleccionada.venta.detalles.map((item, idx) => {
                          const cant = Number(item.cantidad);
                          const precio = Number(item.precioUnitario);
                          const subtotal = cant * precio;
                          return (
                            <tr key={item.id || idx} className="hover:bg-slate-50/50 transition-colors">
                              <td className="p-3">
                                <p className="font-bold text-slate-900">{item.producto?.nombre || `Producto ID: ${item.productoId}`}</p>
                                {item.producto?.codigo && <p className="text-xs text-slate-400 font-normal">SKU: {item.producto.codigo}</p>}
                              </td>
                              <td className="p-3 text-center text-slate-600 font-semibold">{cant}</td>
                              <td className="p-3 text-right text-slate-600">${precio.toLocaleString('es-CO', { minimumFractionDigits: 2 })}</td>
                              <td className="p-3 text-right font-bold text-slate-900">${subtotal.toLocaleString('es-CO', { minimumFractionDigits: 2 })}</td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={4} className="p-4 text-center text-xs text-slate-400 italic">
                            No hay desglose de productos para esta transacción.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Footer del Modal */}
            <div className="bg-slate-50 p-4 border-t border-slate-100 flex justify-between items-center">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase">Total Liquidado</p>
                <p className="text-2xl font-black text-slate-900">
                  ${Number(ventaSeleccionada.venta.total).toLocaleString('es-CO', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsModalDetalleOpen(false);
                  setVentaSeleccionada(null);
                }}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-bold shadow-md transition-colors"
              >
                Cerrar Panel
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Modal de Anulación Histórica */}
      {isModalAnulacionOpen && ventaSeleccionada && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="bg-red-900 p-4 flex justify-between items-center text-white">
              <h2 className="text-lg font-bold">Solicitud de Anulación Fiscal</h2>
              <button onClick={() => { setIsModalAnulacionOpen(false); setVentaSeleccionada(null); setMotivoAnulacion(''); }} className="hover:bg-white/20 p-1 rounded-full transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" x2="6" y1="6" y2="18"/><line x1="6" x2="18" y1="6" y2="18"/></svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-slate-600">
                Está a punto de anular el comprobante <strong className="text-slate-900">{ventaSeleccionada.numeroComprobante}</strong> por un total de <strong>${Number(ventaSeleccionada.venta.total).toLocaleString('es-CO', { minimumFractionDigits: 2 })}</strong>. Esta operación devolverá la mercadería al inventario.
              </p>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Motivo de la baja (Mín. 10 caracteres)</label>
                <textarea 
                  rows={3}
                  value={motivoAnulacion}
                  onChange={(e) => setMotivoAnulacion(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Ej: Cliente solicita cambio de mercadería / Error en tipeo de datos"
                />
              </div>
              <div className="grid grid-cols-2 gap-2 pt-2">
                <button 
                  type="button"
                  onClick={() => { setIsModalAnulacionOpen(false); setVentaSeleccionada(null); setMotivoAnulacion(''); }}
                  className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-sm transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="button"
                  disabled={anulandoId !== null || motivoAnulacion.trim().length < 10}
                  onClick={() => handleAnularVenta(ventaSeleccionada.id)}
                  className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-sm shadow-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {anulandoId !== null ? 'Procesando...' : 'Confirmar Baja'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}