'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, ScanBarcode, Filter, User, ChevronRight, Loader2, ShoppingBag, Printer, Pause, Tag, RefreshCw, X, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import PosCarrito from '@/components/organisms/pos/PosCarrito';
import ModalPago from '@/components/organisms/pos/ModalPago';
import { DetalleVenta } from '@/types/ventas.types';
import { promocionesService } from '@/services/promociones.service';

// --- Tipos de Datos alineados con el Backend ---
type Product = {
  id: number;
  name: string;
  category: string;
  price: number;
  stock: number | null;
  isService: boolean;
  image?: string;
};

type Notificacion = {
  id: number;
  mensaje: string;
  tipo: 'success' | 'error' | 'warning';
};

const CATEGORIES = ['Todos', 'Servicios Médicos', 'Vacunas', 'Farmacia', 'Alimentos', 'Accesorios'];

export default function PosPage() {
  const [carrito, setCarrito] = useState<DetalleVenta[]>([]);
  const [promociones, setPromociones] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [isModalPagoOpen, setIsModalPagoOpen] = useState(false);
  const [productos, setProductos] = useState<Product[]>([]);
  const [loadingPromos, setLoadingPromos] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
// 🛡️ CONTROL DE ACCESOS
  const esAdmin = true;
  
  // Estado para manejar las notificaciones dinámicas de la app
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);

  // Estado para controlar la tasa impositiva dinámica (por defecto 15%)
  const [tasaIva, setTasaIva] = useState<number>(15);

  // Función helper para disparar las notificaciones visuales
  const lanzarNotificacion = useCallback((mensaje: string, tipo: 'success' | 'error' | 'warning') => {
    const id = Date.now();
    setNotificaciones(prev => [...prev, { id, mensaje, tipo }]);
    
    // Auto-eliminar la notificación después de 4 segundos
    setTimeout(() => {
      setNotificaciones(prev => prev.filter(n => n.id !== id));
    }, 4000);
  }, []);

  // 1. Carga inicial unificada mediante useCallback
  const cargarDatosIniciales = useCallback(async () => {
    setLoadingPromos(true);
    try {
      const promosVigentes = await promocionesService.getVigentes();
      setPromociones(promosVigentes);

      const res = await fetch('http://localhost:3008/api/v1/ventas/productos');
      const data = await res.json();

      const productosMapeados = data.map((p: any) => ({
        id: p.id,
        name: p.nombre,
        category: p.categoria?.nombre || 'General',
        price: Number(p.precioVenta),
        stock: p.cantidadActual,
        isService: p.categoria?.nombre.toLowerCase().includes('servicio'),
        image: p.imagen || undefined
      }));

      setProductos(productosMapeados);
    } catch (error) {
      lanzarNotificacion("Error crítico al cargar el catálogo de productos.", "error");
      console.error(error);
    } finally {
      setLoadingPromos(false);
    }
  }, [lanzarNotificacion]);

  // 2. Un único useEffect controlador de ciclo de vida
  useEffect(() => {
    cargarDatosIniciales();
  }, [cargarDatosIniciales]);

  // 3. Acción del botón para sincronización manual entre microservicios
  const handleSyncCatalog = async () => {
    try {
      setIsSyncing(true);
      const res = await fetch('http://localhost:3008/api/v1/ventas/sync-productos', { method: 'POST' }); 
      if (!res.ok) throw new Error('Error en la respuesta del servidor');

      await cargarDatosIniciales();
      lanzarNotificacion('Catálogo sincronizado con éxito desde el inventario maestro.', 'success');
    } catch (error) {
      console.error("Error en sincronización manual:", error);
      lanzarNotificacion('No se pudo sincronizar el catálogo de productos.', 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  // Filtrado reactivo del catálogo
  const filteredProducts = activeCategory === 'Todos' 
    ? productos 
    : productos.filter(p => p.category === activeCategory);

  // Candado 1: Validación de stock al hacer click en la tarjeta del producto
  const handleAgregarAlCarrito = (producto: Product) => {
    if (!producto.isService && producto.stock !== null && producto.stock <= 0) {
      lanzarNotificacion(`El producto "${producto.name}" se encuentra totalmente agotado.`, 'error');
      return;
    }

    let limiteAlcanzado = false;

    setCarrito(prev => {
      const existente = prev.find(item => item.productoId === producto.id);
      
      if (existente) {
        // Validamos si agregar 1 más supera las existencias físicas
        if (!producto.isService && producto.stock !== null && existente.cantidad >= producto.stock) {
          limiteAlcanzado = true;
          return prev;
        }
        return prev.map(item => item.productoId === producto.id 
          ? { ...item, cantidad: item.cantidad + 1, subtotal: (item.cantidad + 1) * item.precioUnitario }
          : item
        );
      }
      
      return [...prev, {
        id: Date.now(),
        productoId: producto.id,
        nombreProducto: producto.name,
        cantidad: 1,
        precioUnitario: producto.price,
        subtotal: producto.price
      }];
    });

    if (limiteAlcanzado) {
      lanzarNotificacion(`Acción bloqueada: Solo hay ${producto.stock} unidades de "${producto.name}" disponibles.`, 'warning');
    }
  };

  // Candado 2: Validación al alterar las cantidades desde el input o botones del carrito (+/-)
  const handleUpdateQuantity = (productoId: number, nuevaCantidad: number) => {
    const productoOriginal = productos.find(p => p.id === productoId);

    if (productoOriginal && !productoOriginal.isService && productoOriginal.stock !== null) {
      if (nuevaCantidad > productoOriginal.stock) {
        lanzarNotificacion(`Operación inválida: El stock máximo de ${productoOriginal.name} es de ${productoOriginal.stock} unidades.`, 'warning');
        return; 
      }
    }

    if (nuevaCantidad <= 0) {
      handleRemoveItem(productoId);
      return;
    }

    setCarrito(prev => prev.map(item => item.productoId === productoId
      ? { ...item, cantidad: nuevaCantidad, subtotal: nuevaCantidad * item.precioUnitario }
      : item
    ));
  };

  const handleRemoveItem = (productoId: number) => {
    setCarrito(prev => prev.filter(item => item.productoId !== productoId));
  };

  const handleClearCart = () => setCarrito([]);

  // Cálculos consolidados aplicando el IVA corporativo del 15%
  const subtotal = carrito.reduce((acc, item) => acc + item.subtotal, 0);
  const impuesto = subtotal * (tasaIva / 100); 
  const total = subtotal + impuesto;

// Cambiar la firma de la función para tipar estrictamente los pagos admitidos
const handleConfirmarCobro = async (
    pagosRegistrados: { metodoPagoId: number; monto: number; montoRecibido?: number; referencia?: string }[], 
    tipoComprobanteSeleccionado: 'TICKET' | 'FACTURA'
  ) => {
    
    if (!pagosRegistrados || pagosRegistrados.length === 0) {
      lanzarNotificacion('⚠️ Debes especificar al menos un método de pago válido.', 'error');
      return;
    }

    const pagoEfectivo = pagosRegistrados.find(p => p.metodoPagoId === 1);
    const totalRedondeado = Math.round(total * 100) / 100;
    
    // 1. Identificar el tipo de pago real para la raíz
    let metodoPagoRaiz = 2; // Por defecto Tarjeta
    if (pagosRegistrados.length > 1) {
      metodoPagoRaiz = 3; // 👈 Si hay más de un método, es MIXTO (ID: 3)
    } else if (pagoEfectivo) {
      metodoPagoRaiz = 1; // Si hay solo uno y es efectivo
    }

    // 2. Si es efectivo o mixto, usamos el montoRecibido numérico directo enviado por el modal.
    let montoRecibido = pagoEfectivo && pagoEfectivo.montoRecibido !== undefined 
      ? pagoEfectivo.montoRecibido 
      : totalRedondeado;

    const payloadVenta = {
      tipoComprobante: tipoComprobanteSeleccionado, 
      clienteId: 1, 
      total: totalRedondeado,                                 
      montoPagadoCon: Math.round(montoRecibido * 100) / 100,                
      metodoPagoId: metodoPagoRaiz, 
      pagos: pagosRegistrados.map(p => ({
        metodoPagoId: Number(p.metodoPagoId),
        monto: Math.round(Number(p.monto) * 100) / 100,
        referencia: p.referencia || null
      })), 
      detalles: carrito.map(item => ({
        productoId: item.productoId,
        cantidad: item.cantidad,
        precioUnitario: Math.round(Number(item.precioUnitario) * 100) / 100
      }))
    };

    try {
      const response = await fetch("http://localhost:3008/api/v1/ventas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payloadVenta),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error detallado del servidor:", errorData);
        
        const servidorMensaje = errorData.message || '';
        const mensajePlano = Array.isArray(servidorMensaje) ? servidorMensaje.join(' ') : servidorMensaje;

        if (mensajePlano.toLowerCase().includes('falta de efectivo') || mensajePlano.toLowerCase().includes('insuficientes')) {
          throw new Error('FALTA_EFECTIVO');
        } else {
          lanzarNotificacion(`Error del servidor: ${mensajePlano}`, 'error');
          throw new Error(mensajePlano);
        }
      }
      
      lanzarNotificacion('🎉 ¡Venta procesada con éxito y stock descontado!', 'success');
      setCarrito([]);
      setIsModalPagoOpen(false);
      
      await cargarDatosIniciales();
    } catch (err: any) {
      console.error("Error capturado en PosPage:", err);
      if (err.message === 'FALTA_EFECTIVO') {
        throw err; 
      }
      lanzarNotificacion('Hubo un problema de conexión al enviar la transacción.', 'error');
      throw err;
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-4rem)] bg-slate-50 text-slate-800 font-sans -m-6 overflow-hidden relative">
      
      {/* CONTENEDOR DE NOTIFICACIONES FLOTANTES */}
      <div className="absolute top-4 right-4 z-50 flex flex-col gap-2 max-w-md w-full sm:w-96">
        {notificaciones.map(n => (
          <div 
            key={n.id} 
            className={`p-4 rounded-xl shadow-xl border flex items-start gap-3 transition-all duration-300 transform translate-y-0 animate-in fade-in slide-in-from-top-4 ${
              n.tipo === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-900' :
              n.tipo === 'error' ? 'bg-rose-50 border-rose-200 text-rose-900' :
              'bg-amber-50 border-amber-200 text-amber-900'
            }`}
          >
            <div className="mt-0.5">
              {n.tipo === 'success' && <CheckCircle2 size={18} className="text-emerald-600" />}
              {n.tipo === 'error' && <XCircle size={18} className="text-rose-600" />}
              {n.tipo === 'warning' && <AlertTriangle size={18} className="text-amber-600" />}
            </div>
            <div className="flex-1 text-xs font-semibold leading-normal">{n.mensaje}</div>
            <button 
              onClick={() => setNotificaciones(prev => prev.filter(item => item.id !== n.id))}
              className="text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>

      {/* SECCIÓN IZQUIERDA: CATÁLOGO */}
      <section className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-6xl mx-auto space-y-6">
          
          <div className="flex justify-between items-end mb-4">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Punto de Venta</h1>
              <p className="text-slate-500 text-sm mt-1">Selecciona productos o servicios para la transacción actual.</p>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={handleSyncCatalog}
                disabled={isSyncing}
                className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 text-blue-700 rounded-xl font-medium text-sm hover:bg-blue-100 shadow-sm transition-colors disabled:opacity-50"
              >
                <RefreshCw size={16} className={isSyncing ? "animate-spin" : ""} /> 
                {isSyncing ? 'Sincronizando...' : 'Sincronizar'}
              </button>

              <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl font-medium text-sm hover:bg-slate-50 shadow-sm">
                <ScanBarcode size={16} /> Escanear
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl font-medium text-sm hover:bg-slate-50 shadow-sm">
                <Filter size={16} /> Filtros
              </button>
            </div>
          </div>

          {/* Filtros de Categoría */}
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-5 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
                  activeCategory === cat 
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' 
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Grid del Catálogo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
            {filteredProducts.map(product => (
              <div 
                key={product.id}
                onClick={() => handleAgregarAlCarrito(product)}
                className="group bg-white rounded-xl p-4 flex flex-col gap-3 transition-all hover:shadow-xl border border-slate-100 cursor-pointer overflow-hidden"
              >
                <div className={`aspect-square rounded-lg overflow-hidden flex items-center justify-center ${product.isService ? 'bg-blue-50' : 'bg-slate-100'}`}>
                  {product.image ? (
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <Tag size={40} className="text-blue-400 opacity-60" />
                  )}
                </div>
                <div className="flex flex-col flex-1 justify-between">
                  <div>
                    <span className="text-xs font-bold text-blue-600 tracking-wider uppercase opacity-80">{product.category}</span>
                    <h3 className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors line-clamp-2 mt-1 text-sm">{product.name}</h3>
                  </div>
                  <div className="flex justify-between items-center mt-3">
                    <span className="text-base font-black text-slate-900">${product.price.toFixed(2)}</span>
                    {product.isService ? (
                      <span className="text-xs font-medium text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">Servicio</span>
                    ) : (
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        (product.stock ?? 0) <= 0 
                          ? 'text-rose-700 bg-rose-100' 
                          : (product.stock ?? 0) <= 5 
                          ? 'text-amber-700 bg-amber-100' 
                          : 'text-emerald-700 bg-emerald-100'
                      }`}>
                        Stock: {product.stock}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ================= BARRA LATERAL DE CONFIGURACIONES COMERCIALES ================= */}
        <div className="space-y-4">
          
          {/* Monitor de Campañas */}
          <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
            <h3 className="font-bold text-slate-700 text-xs uppercase tracking-wider mb-2">Promociones Activas (Backend)</h3>
            {loadingPromos ? (
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Loader2 className="animate-spin" size={14}/> Sincronizando políticas de precio...
              </div>
            ) : promociones.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No hay reglas promocionales registradas para hoy.</p>
            ) : (
              <div className="space-y-2">
                {promociones.map((p: any) => (
                  <div key={p.id} className="p-2 bg-purple-50 text-purple-800 rounded-lg text-xs font-medium border border-purple-100">
                    {p.nombre} — {p.tipoDescuento} ({p.valorDescuento}%)
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* 🚀 CONTROLADOR DINÁMICO FISCAL (IVA OPERATIVO) - PREPARADO PARA ROLES */}
            {esAdmin && (
              <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm space-y-3 animate-fade-in">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-slate-700 text-xs uppercase tracking-wider">Regulación Fiscal (IVA)</h3>
                  <span className="text-[10px] font-black bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded-full">
                    Activo: {tasaIva}%
                  </span>
                </div>

                {/* Selectores rápidos de tasas comunes */}
                <div className="grid grid-cols-4 gap-1.5">
                  {[0, 5, 15, 19].map((tasa) => (
                    <button
                      key={tasa}
                      type="button"
                      onClick={() => setTasaIva(tasa)}
                      className={`py-1 text-[11px] font-bold rounded-lg border transition-all active:scale-95 ${
                        tasaIva === tasa
                          ? 'bg-slate-900 border-slate-900 text-white shadow-sm'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {tasa}%
                    </button>
                  ))}
                </div>

                {/* Entrada manual fina */}
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.5"
                    placeholder="Tasa personalizada"
                    value={tasaIva}
                    onChange={(e) => setTasaIva(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 text-slate-800 rounded-lg text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-bold pointer-events-none">
                    % Manual
                  </span>
                </div>
              </div>
            )}
        </div>

        </div>
      </section>

      {/* SECCIÓN DERECHA: SIDEBAR DE COMPRA */}
      <aside className="w-full lg:w-96 bg-white shadow-2xl flex flex-col z-10 border-l border-slate-200">
        <div className="p-6 flex flex-col h-full">
          
          <div className="mb-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-slate-900">Orden Actual</h2>
              {carrito.length > 0 && (
                <button onClick={handleClearCart} className="text-red-500 text-xs font-bold flex items-center gap-1 hover:bg-red-50 px-2 py-1 rounded-lg transition-colors">
                  Vaciar Carrito
                </button>
              )}
            </div>
            
            <div className="p-3 bg-slate-50 rounded-xl border border-dashed border-slate-300 flex items-center gap-3 cursor-pointer hover:bg-slate-100 transition-colors">
              <div className="w-9 h-9 rounded-full bg-white shadow-sm flex items-center justify-center text-blue-600">
                <User size={18} />
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold text-slate-800">Público General</p>
                <p className="text-[11px] text-slate-500">Venta de mostrador directa</p>
              </div>
              <ChevronRight size={16} className="text-slate-400" />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto pr-1">
            <PosCarrito 
              items={carrito} 
              onUpdateQuantity={handleUpdateQuantity} 
              onRemoveItem={handleRemoveItem} 
            />
          </div>

          <div className="mt-4 pt-4 border-t border-slate-200 space-y-4">
            <div className="space-y-1.5 text-xs text-slate-600">
              <div className="flex justify-between"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between text-sm text-slate-600 font-medium">
                <span>Impuesto ({tasaIva}%)</span>
                <span className="text-slate-900 font-bold">${impuesto.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t font-bold text-slate-950 text-sm">
                <span>Total</span><span className="text-2xl font-black text-blue-600">${total.toFixed(2)}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button className="py-2 bg-slate-100 text-slate-700 font-bold rounded-xl text-xs flex flex-col items-center gap-1 hover:bg-slate-200 transition-colors">
                <Printer size={16} /> <span>Imprimir</span>
              </button>
              <button className="py-2 bg-slate-100 text-slate-700 font-bold rounded-xl text-xs flex flex-col items-center gap-1 hover:bg-slate-200 transition-colors">
                <Pause size={16} /> <span>Pausar</span>
              </button>
            </div>

            <button 
              onClick={() => setIsModalPagoOpen(true)}
              disabled={carrito.length === 0}
              className="w-full py-3.5 bg-blue-600 text-white font-extrabold rounded-xl shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>Proceder al Cobro</span>
            </button>
          </div>
        </div>
      </aside>

      <ModalPago 
        isOpen={isModalPagoOpen} 
        onClose={() => setIsModalPagoOpen(false)} 
        totalAPagar={total} 
        onConfirmarPago={handleConfirmarCobro} 
      />
    </div>
  );
}