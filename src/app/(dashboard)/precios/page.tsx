'use client';

import { useState, useEffect, useMemo } from 'react';
import { Calculator, History, Save, Info, TrendingUp, Percent } from 'lucide-react';

type RegistroAuditoria = {
  id: number;
  productoId: number;
  precioCosto: number;
  precioVenta: number;
  margen: number;
  fechaCambio: string;
  usuarioId: number;
};

type Producto = {
  id: number;
  nombre: string;
  precioVenta: number;    
  cantidadActual: number; 
  categoria?: string;    
  costo?: number;         
};

export default function GestionPreciosPage() {
  const API_BASE_URL = 'http://localhost:3008/api/v1';

  // Estados principales
  const [productos, setProductos] = useState<Producto[]>([]); 
  const [productoSeleccionadoId, setProductoSeleccionadoId] = useState<number>(0);
  const [costoBase, setCostoBase] = useState<number>(0);
  const [margenDeseado, setMargenDeseado] = useState<number>(50);
  
  // 🚀 NUEVO ESTADO: IVA dinámico (Valor por defecto alineado con tu 15%)
  const [iva, setIva] = useState<number>(15);

  const [historial, setHistorial] = useState<RegistroAuditoria[]>([]);
  const [mensajeError, setMensajeError] = useState<string>('');
  const [mensajeExito, setMensajeExito] = useState<string>('');
  const [cargandoProductos, setCargandoProductos] = useState<boolean>(true);

  const cargarProductosReales = async () => {
    try {
      setCargandoProductos(true);
      const respuesta = await fetch(`${API_BASE_URL}/ventas/productos`);
      
      if (respuesta.ok) {
        const datos: Producto[] = await respuesta.json();
        setProductos(datos);
        
        if (datos.length > 0) {
          setProductoSeleccionadoId(datos[0].id);
          setCostoBase(Number(datos[0].costo || datos[0].precioVenta || 0));
        }
      } else {
        console.error(`Error al traer productos: Código ${respuesta.status}`);
        setMensajeError('No se pudo cargar el catálogo de productos desde la BD.');
      }
    } catch (error) {
      console.error('Error al conectar con el endpoint de productos', error);
      setMensajeError('Error de comunicación con el servidor de productos.');
    } finally {
      setCargandoProductos(false);
    }
  };

  const cargarHistorialPrecios = async () => {
    try {
      const respuesta = await fetch(`${API_BASE_URL}/precios/historial`);
      if (respuesta.ok) {
        const datos = await respuesta.json();
        setHistorial(datos);
      } else {
        console.warn(`El endpoint ${API_BASE_URL}/precios/historial retornó estado ${respuesta.status}.`);
        setHistorial([]);
      }
    } catch (error) {
      console.error('Error al conectar con el servidor de ventas', error);
    }
  };

  useEffect(() => {
    cargarProductosReales();
    cargarHistorialPrecios();
  }, []);

  const datosProductoActual = useMemo(() => {
    return productos.find(p => p.id === productoSeleccionadoId) || null;
  }, [productos, productoSeleccionadoId]);

  const gestionarCambioProducto = (id: number) => {
    setProductoSeleccionadoId(id);
    const encontrado = productos.find(p => p.id === id);
    if (encontrado) {
      setCostoBase(Number(encontrado.costo || encontrado.precioVenta || 0));
    }
    setMensajeError('');
    setMensajeExito('');
  };

  // 🚀 CÁLCULOS FINANCIEROS DIALÉCTICOS DINÁMICOS
  // 1. Precio antes de impuestos aplicando el margen comercial sobre el costo
  const precioAntesIva = useMemo(() => {
    if (margenDeseado >= 100) return 0;
    const factorMargen = 1 - (margenDeseado / 100);
    return costoBase / factorMargen;
  }, [costoBase, margenDeseado]);

  // 2. Ganancia bruta comercial real (Neto)
  const gananciaBruta = useMemo(() => {
    const resultado = precioAntesIva - costoBase;
    return resultado > 0 ? resultado : 0;
  }, [costoBase, precioAntesIva]);

  // 3. Importe del impuesto correspondiente
  const montoIva = useMemo(() => {
    return precioAntesIva * (iva / 100);
  }, [precioAntesIva, iva]);

  // 4. Precio Venta Público (PVP) sugerido con IVA consolidado
  const precioFinalSugerido = useMemo(() => {
    return precioAntesIva + montoIva;
  }, [precioAntesIva, montoIva]);


  const gestionarEnvioTarifa = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensajeError('');
    setMensajeExito('');

    if (productoSeleccionadoId === 0) {
      setMensajeError('Por favor, selecciona un producto válido.');
      return;
    }

    if (margenDeseado >= 100) {
      setMensajeError('El margen de ganancia comercial no puede ser igual o superior al 100 por ciento.');
      return;
    }

    try {
      const respuesta = await fetch(`${API_BASE_URL}/precios`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productoId: productoSeleccionadoId,
          costo: costoBase,
          porcentajeMargenDeseado: margenDeseado,
          // Nota opcional: si tu backend acepta el campo IVA, puedes descomentar la siguiente línea:
          // ivaAplicado: iva,
          usuarioId: 1, 
          permitirMargenNegativo: false
        }),
      });

      const resultado = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(resultado.message || 'Error al procesar la tarifa en el sistema.');
      }

      setMensajeExito('Estrategia de precio guardada y aplicada en el punto de venta de forma exitosa.');
      cargarHistorialPrecios();
      cargarProductosReales(); 
    } catch (error: any) {
      setMensajeError(error.message || 'No se pudo establecer comunicación con el microservicio.');
    }
  };

  const obtenerNombreProducto = (id: number) => {
    return productos.find(p => p.id === id)?.nombre || `Producto Referencia ${id}`;
  };

  const obtenerCategoriaProducto = (id: number) => {
    return productos.find(p => p.id === id)?.categoria || 'General';
  };

  return (
   <div className="p-6 bg-slate-50 min-h-screen text-slate-800 font-sans">
      
  {/* Cabecera Principal con Panel Fiscal Integrado a la Derecha */}
  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8 bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
    <div>
      <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Simulador y Gestión de Precios</h1>
      <p className="text-slate-500 text-sm mt-1">Calculadora de márgenes comerciales y auditoría en tiempo real de tarifas corporativas con datos reales de la BD.</p>
    </div>

    {/* SECCIÓN REUBICADA: IVA Ajustable de Simulación */}
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2.5 min-w-[290px] lg:w-80 shadow-inner">
      <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1">
        <Percent size={14} className="text-blue-500" /> IVA Ajustable de Simulación
      </label>
      
      {/* Selectores Rápidos */}
      <div className="grid grid-cols-4 gap-1.5">
        {[0, 5, 15, 19].map((valorTasa) => (
          <button
            key={valorTasa}
            type="button"
            onClick={() => setIva(valorTasa)}
            className={`py-1 text-xs font-bold rounded-lg border transition-all active:scale-95 ${
              iva === valorTasa 
                ? 'bg-blue-600 border-blue-600 text-white shadow-sm' 
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            {valorTasa}%
          </button>
        ))}
      </div>

      {/* Input Numérico Personalizado */}
      <div className="relative">
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-[10px] pointer-events-none">
          % Personalizado
        </span>
        <input 
          type="number"
          min="0"
          max="100"
          step="0.1"
          value={iva}
          onChange={(e) => setIva(parseFloat(e.target.value) || 0)}
          className="w-full pl-3 pr-28 py-1.5 bg-white border border-slate-200 text-slate-800 rounded-lg text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>
  </div>

  <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
    
    {/* Panel Izquierdo: Formulario del Simulador (Limpio) */}
    <div className="xl:col-span-1 bg-white rounded-xl shadow-xl shadow-slate-200/50 border border-slate-200 p-6">
      <h2 className="text-xl font-bold text-slate-900 mb-6 border-b border-slate-100 pb-3 flex items-center gap-2">
        <Calculator className="text-blue-600 h-5 w-5" />
        Simulador Comercial
      </h2>
      
      <form onSubmit={gestionarEnvioTarifa} className="space-y-5">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Producto o Servicio Activo</label>
          <select 
            value={productoSeleccionadoId}
            onChange={(e) => gestionarCambioProducto(Number(e.target.value))}
            disabled={cargandoProductos || productos.length === 0}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 text-slate-800 rounded-xl font-medium text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all shadow-sm"
          >
            {cargandoProductos ? (
              <option value={0}>Cargando productos de la base de datos...</option>
            ) : productos.length === 0 ? (
              <option value={0}>No hay productos reales en el almacén</option>
            ) : (
              productos.map(p => (
                <option key={p.id} value={p.id}>{p.nombre}</option>
              ))
            )}
          </select>
        </div>

        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex justify-between items-center">
          <span className="text-xs font-bold text-amber-900 uppercase tracking-wide">Existencias en Inventario:</span>
          <span className="text-sm font-black text-amber-700 bg-white px-2.5 py-0.5 rounded-md border border-amber-200 shadow-sm">
            {datosProductoActual ? (datosProductoActual.cantidadActual ?? 0) : 0} unidades
          </span>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Costo Base de Adquisición</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">$</span>
            <input 
              type="number" 
              step="0.01" 
              min="0"
              value={costoBase || ''}
              onChange={(e) => setCostoBase(parseFloat(e.target.value) || 0)}
              className="w-full pl-8 pr-4 py-2.5 bg-slate-50 border border-slate-200 text-slate-800 rounded-xl font-bold text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all shadow-sm"
              placeholder="0.00"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Margen Comercial Solicitado</label>
          <div className="relative">
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">%</span>
            <input 
              type="number" 
              min="0"
              max="99"
              value={margenDeseado || ''}
              onChange={(e) => setMargenDeseado(parseInt(e.target.value) || 0)}
              className="w-full pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-200 text-slate-800 rounded-xl font-bold text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all shadow-sm"
              placeholder="0"
            />
          </div>
        </div>

        {/* Desglose Económico Completo */}
        <div className="bg-slate-900 text-white rounded-xl p-4 mt-6 flex flex-col gap-2.5 shadow-md">
          <div className="flex justify-between items-center text-xs text-slate-400 font-semibold">
            <span>Ganancia Bruta (Neto):</span>
            <span className="text-emerald-400 font-bold">${gananciaBruta.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center text-xs text-slate-400 font-semibold">
            <span>Precio Neto (Base):</span>
            <span className="text-slate-200 font-medium">${precioAntesIva.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center text-xs text-slate-400 font-semibold">
            <span>Impuesto IVA ({iva}%):</span>
            <span className="text-slate-200 font-medium">${montoIva.toFixed(2)}</span>
          </div>
          <div className="h-px bg-slate-800 w-full my-1" />
          <div className="flex justify-between items-baseline">
            <span className="text-sm font-bold text-slate-300">Total PVP Sugerido:</span>
            <span className="text-2xl font-black text-blue-400">${precioFinalSugerido.toFixed(2)}</span>
          </div>
        </div>

        {/* Alertas */}
        {mensajeError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium">
            {mensajeError}
          </div>
        )}

        {mensajeExito && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700 font-medium">
            {mensajeExito}
          </div>
        )}
        
        <div className="pt-2">
          <button 
            type="submit" 
            disabled={productos.length === 0}
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl shadow-lg shadow-blue-600/20 active:scale-95 transition-all flex items-center justify-center gap-2 text-sm tracking-wide disabled:opacity-50 disabled:scale-100"
          >
            <Save className="h-4 w-4" />
            Calcular y Aplicar Tarifa
          </button>
        </div>
      </form>
    </div>

    {/* Panel Derecho: Historial General de Cambios */}
    <div className="xl:col-span-2 bg-white rounded-xl shadow-xl shadow-slate-200/50 border border-slate-200 p-6 flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 border-b border-slate-100 pb-3">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <History className="text-slate-500 h-5 w-5" />
          Historial de Auditoría de Precios
        </h2>
        <span className="text-xs bg-slate-100 border border-slate-200 text-slate-600 px-3 py-1 rounded-full font-bold">Variaciones Recientes</span>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-100">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold text-xs uppercase tracking-wider">
              <th className="px-5 py-3.5 font-bold">Producto / Categoría</th>
              <th className="px-4 py-3.5 font-bold text-center">Costo Inicial</th>
              <th className="px-4 py-3.5 font-bold text-center">Margen Real</th>
              <th className="px-4 py-3.5 font-bold text-center">Tarifa Consolidada</th>
              <th className="px-5 py-3.5 font-bold text-right">Editor / Fecha</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
            {historial.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-8 text-slate-400 font-medium">
                  No se registran cambios de tarifas en la base de datos de este turno operativo o el endpoint no se encuentra disponible.
                </td>
              </tr>
            ) : (
              historial.map((registro) => {
                return (
                  <tr key={registro.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-5 py-4">
                      <p className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {obtenerNombreProducto(registro.productoId)}
                      </p>
                      <p className="text-[10px] text-slate-400 font-medium tracking-wide mt-0.5 uppercase">
                        {obtenerCategoriaProducto(registro.productoId)}
                      </p>
                    </td>
                    <td className="px-4 py-4 text-center font-medium text-slate-500">
                      ${Number(registro.precioCosto).toFixed(2)}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-bold">
                        {Number(registro.margen).toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className="font-extrabold px-2 py-1 rounded-lg inline-flex items-center gap-1 text-emerald-700 bg-emerald-50">
                        <TrendingUp className="h-3 w-3" />
                        ${Number(registro.precioVenta).toFixed(2)}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <p className="font-bold text-slate-800">
                        {registro.usuarioId === 1 ? 'Gonzalo Alfonso' : 'Sistema'}
                      </p>
                      <p className="text-[10px] text-slate-400 font-normal mt-0.5">
                        {new Date(registro.fechaCambio).toLocaleString('es-ES')}
                      </p>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      
      <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-xl flex items-center gap-2.5">
        <Info className="text-blue-600 h-5 w-5 flex-shrink-0" />
        <p className="text-xs text-blue-800 font-medium">
          Cada alteración tarifaria impacta instantáneamente en los módulos activos del <strong>Punto de Venta</strong>.
        </p>
      </div>
    </div>

  </div>
</div>
  );
}