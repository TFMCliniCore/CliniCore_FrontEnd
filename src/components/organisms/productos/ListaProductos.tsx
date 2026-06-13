"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Search, Edit, Trash2,
  ChevronLeft, ChevronRight, AlertCircle,
  CheckCircle2, Package, RefreshCw, Loader2,
  Eye,
} from "lucide-react";
import {
  productosApi,
  resolveImageUrl,
  type Producto,
  type ProductoMutationPayload,
} from "@/lib/api";
import ProductoDetalleModal, { type ProductoModalMode } from "./ProductoDetalleModal";

function resolverEstado(p: Producto): "Disponible" | "Stock Bajo" | "Agotado" {
  if (p.cantidadActual <= 0)               return "Agotado";
  if (p.cantidadActual <= p.cantidadMinima) return "Stock Bajo";
  return "Disponible";
}

const POR_PAGINA = 15;

export default function ListaProductos() {
  const [productos, setProductos]                   = useState<Producto[]>([]);
  const [loading, setLoading]                       = useState(true);
  const [error, setError]                           = useState<string | null>(null);
  const [searchTerm, setSearchTerm]                 = useState("");
  const [pagina, setPagina]                         = useState(1);
  const [modalDetalleAbierto, setModalDetalleAbierto] = useState(false);
  const [modalModo, setModalModo]                   = useState<ProductoModalMode>("detalle");
  const [productoDetalle, setProductoDetalle]       = useState<Producto | null>(null);
  const [detalleLoading, setDetalleLoading]         = useState(false);
  const [detalleError, setDetalleError]             = useState<string | null>(null);
  const [accionError, setAccionError]               = useState<string | null>(null);
  const [guardandoProducto, setGuardandoProducto]   = useState(false);
  const [eliminandoProducto, setEliminandoProducto] = useState(false);
  const detalleRequestRef                           = useRef(0);

  const cargarProductos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await productosApi.listar();
      setProductos(data);
      setPagina(1);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Error desconocido";
      setError(`No se pudo conectar con el API Gateway: ${msg}`);
    } finally {
      setLoading(false);
    }
  }, []);

  // Carga inicial
  useEffect(() => { cargarProductos(); }, [cargarProductos]);

  // Búsqueda con debounce (400 ms)
  useEffect(() => {
    if (!searchTerm.trim()) { cargarProductos(); return; }
    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        const data = await productosApi.buscar(searchTerm.trim());
        setProductos(data);
        setPagina(1);
      } catch {
        // mantiene resultados anteriores
      } finally {
        setLoading(false);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm, cargarProductos]);

  const totalPaginas = Math.max(1, Math.ceil(productos.length / POR_PAGINA));
  const inicio       = (pagina - 1) * POR_PAGINA;
  const pagActual    = productos.slice(inicio, inicio + POR_PAGINA);

  const recargarListadoActual = useCallback(async () => {
    const termino = searchTerm.trim();

    if (!termino) {
      await cargarProductos();
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await productosApi.buscar(termino);
      setProductos(data);
      setPagina(1);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Error desconocido";
      setError(`No se pudo actualizar la busqueda de productos: ${msg}`);
    } finally {
      setLoading(false);
    }
  }, [cargarProductos, searchTerm]);

  const cargarDetalleProducto = useCallback(async (productoBase: Producto) => {
    const requestId = detalleRequestRef.current + 1;
    detalleRequestRef.current = requestId;

    setProductoDetalle(productoBase);
    setDetalleLoading(true);
    setDetalleError(null);

    try {
      const detalle = await productosApi.obtener(productoBase.id);
      if (detalleRequestRef.current !== requestId) return;
      setProductoDetalle(detalle);
    } catch (e: unknown) {
      if (detalleRequestRef.current !== requestId) return;
      const msg = e instanceof Error ? e.message : "Error desconocido";
      setDetalleError(msg);
    } finally {
      if (detalleRequestRef.current === requestId) {
        setDetalleLoading(false);
      }
    }
  }, []);

  const abrirModalProducto = useCallback((modo: ProductoModalMode, producto: Producto) => {
    setModalModo(modo);
    setModalDetalleAbierto(true);
    setAccionError(null);
    void cargarDetalleProducto(producto);
  }, [cargarDetalleProducto]);

  const resetearModalDetalle = useCallback(() => {
    detalleRequestRef.current += 1;
    setModalDetalleAbierto(false);
    setModalModo("detalle");
    setDetalleLoading(false);
    setDetalleError(null);
    setAccionError(null);
    setGuardandoProducto(false);
    setEliminandoProducto(false);
    setProductoDetalle(null);
  }, []);

  const cerrarDetalleProducto = useCallback(() => {
    if (guardandoProducto || eliminandoProducto) return;
    resetearModalDetalle();
  }, [eliminandoProducto, guardandoProducto, resetearModalDetalle]);

  const reintentarDetalleProducto = useCallback(() => {
    if (!productoDetalle) return;
    void cargarDetalleProducto(productoDetalle);
  }, [cargarDetalleProducto, productoDetalle]);

  const guardarCambiosProducto = useCallback(async (payload: ProductoMutationPayload) => {
    if (!productoDetalle) return;

    try {
      setGuardandoProducto(true);
      setAccionError(null);

      const actualizado = await productosApi.actualizar(productoDetalle.id, payload);

      setModalModo("detalle");
      await cargarDetalleProducto(actualizado);
      await recargarListadoActual();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Error desconocido";
      setAccionError(`No se pudo guardar el producto: ${msg}`);
    } finally {
      setGuardandoProducto(false);
    }
  }, [cargarDetalleProducto, productoDetalle, recargarListadoActual]);

  const confirmarEliminarProducto = useCallback(async () => {
    if (!productoDetalle) return;

    try {
      setEliminandoProducto(true);
      setAccionError(null);

      await productosApi.eliminar(productoDetalle.id);
      resetearModalDetalle();
      await recargarListadoActual();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Error desconocido";
      setAccionError(`No se pudo eliminar el producto: ${msg}`);
      setEliminandoProducto(false);
    }
  }, [productoDetalle, recargarListadoActual, resetearModalDetalle]);

  useEffect(() => {
    if (!modalDetalleAbierto) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        cerrarDetalleProducto();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [cerrarDetalleProducto, modalDetalleAbierto]);

  return (
    <div className="space-y-6">

      {/* BARRA DE HERRAMIENTAS */}
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
          <button
            onClick={cargarProductos}
            title="Recargar desde el servidor"
            className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-500 hover:bg-slate-50 transition-all shadow-sm"
          >
            <RefreshCw size={18} className={loading ? "animate-spin text-cyan-500" : ""} />
          </button>
          {/* <button className="flex items-center space-x-2 px-4 py-3 bg-white border border-slate-100 rounded-2xl text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
            <Filter size={18} />
            <span className="text-sm font-semibold">Filtros</span>
          </button> */}
        </div>
      </div>

      {/* ERROR */}
      {error && (
        <div className="mx-8 flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm">
          <AlertCircle size={18} className="flex-shrink-0" />
          <span>{error}</span>
          <button
            onClick={cargarProductos}
            className="ml-auto underline font-semibold hover:text-red-900"
          >
            Reintentar
          </button>
        </div>
      )}

      {/* TABLA */}
      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">

        {/* Estado de carga */}
        {loading && (
          <div className="flex items-center justify-center py-20 gap-3 text-slate-400">
            <Loader2 size={24} className="animate-spin text-cyan-500" />
            <span className="text-sm font-medium">Cargando productos...</span>
          </div>
        )}

        {/* Sin resultados */}
        {!loading && productos.length === 0 && !error && (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-400">
            <Package size={40} className="opacity-30" />
            <p className="text-sm font-medium">No se encontraron productos</p>
          </div>
        )}

        {/* Tabla con datos */}
        {!loading && productos.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-50">
                  <th className="px-6 py-5 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Producto</th>
                  <th className="px-6 py-5 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Categoría</th>
                  <th className="px-6 py-5 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Precio venta</th>
                  <th className="px-6 py-5 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Stock</th>
                  <th className="px-6 py-5 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Estado</th>
                  <th className="px-6 py-5 text-center text-xs font-bold text-slate-400 uppercase tracking-widest">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {pagActual.map((prod) => {
                  const estado     = resolverEstado(prod);
                  const maxStock   = prod.cantidadMaxima ?? 50;
                  const porcentaje = Math.min((prod.cantidadActual / Math.max(maxStock, 1)) * 100, 100);

                  return (
                    <tr key={prod.id} className="hover:bg-slate-50/80 transition-colors group">

                      {/* Producto */}
                      <td className="px-6 py-5">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-xl overflow-hidden border border-slate-100 bg-gradient-to-br from-cyan-50 to-emerald-50 flex-shrink-0">
                            {resolveImageUrl(prod.imagen, prod.updatedAt) ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={resolveImageUrl(prod.imagen, prod.updatedAt)!}
                                alt={prod.nombre}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.currentTarget as HTMLImageElement).style.display = "none";
                                  (e.currentTarget.nextSibling as HTMLElement | null)?.style.setProperty("display", "flex");
                                }}
                              />
                            ) : null}
                            <div
                              className="w-full h-full items-center justify-center text-cyan-600"
                              style={{ display: resolveImageUrl(prod.imagen, prod.updatedAt) ? "none" : "flex" }}
                            >
                              <Package size={20} />
                            </div>
                          </div>
                          <div>
                            <p className="font-bold text-slate-700 text-sm">{prod.nombre}</p>
                            <p className="text-[11px] text-slate-400 font-medium uppercase tracking-tighter">
                              {prod.codigoInterno ?? prod.codigoBarras ?? `ID-${prod.id}`}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Categoría */}
                      <td className="px-6 py-5">
                        <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold">
                          {prod.categoria?.nombre ?? "Sin categoría"}
                        </span>
                      </td>

                      {/* Precio */}
                      <td className="px-6 py-5">
                        <p className="font-bold text-slate-700">
                          ${parseFloat(prod.precioVenta).toFixed(2)}
                        </p>
                        {prod.precioCompra && (
                          <p className="text-xs text-slate-400">
                            Costo: ${parseFloat(prod.precioCompra).toFixed(2)}
                          </p>
                        )}
                      </td>

                      {/* Stock */}
                      <td className="px-6 py-5">
                        <div className="flex flex-col space-y-1">
                          <p className={`font-bold text-sm ${prod.cantidadActual <= prod.cantidadMinima ? "text-orange-500" : "text-slate-600"}`}>
                            {prod.cantidadActual} unidades
                          </p>
                          <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${
                                prod.cantidadActual <= 0
                                  ? "bg-red-400"
                                  : prod.cantidadActual <= prod.cantidadMinima
                                  ? "bg-orange-400"
                                  : "bg-emerald-400"
                              }`}
                              style={{ width: `${porcentaje}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Estado */}
                      <td className="px-6 py-5">
                        {estado === "Disponible" && (
                          <div className="flex items-center text-emerald-600 space-x-1.5">
                            <CheckCircle2 size={16} />
                            <span className="text-xs font-bold uppercase tracking-wider">Disponible</span>
                          </div>
                        )}
                        {estado === "Stock Bajo" && (
                          <div className="flex items-center text-orange-500 space-x-1.5">
                            <AlertCircle size={16} />
                            <span className="text-xs font-bold uppercase tracking-wider">Stock Bajo</span>
                          </div>
                        )}
                        {estado === "Agotado" && (
                          <div className="flex items-center text-red-400 space-x-1.5">
                            <AlertCircle size={16} />
                            <span className="text-xs font-bold uppercase tracking-wider">Agotado</span>
                          </div>
                        )}
                      </td>

                      {/* Acciones */}
                      <td className="px-6 py-5">
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            type="button"
                            title={`Ver detalle de ${prod.nombre}`}
                            onClick={() => abrirModalProducto("detalle", prod)}
                            className="p-2 text-slate-400 hover:bg-slate-100 hover:text-cyan-600 rounded-xl transition-all"
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            type="button"
                            title={`Editar ${prod.nombre}`}
                            onClick={() => abrirModalProducto("editar", prod)}
                            className="p-2 text-slate-400 hover:text-cyan-600 hover:bg-cyan-50 rounded-xl transition-all"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            type="button"
                            title={`Eliminar ${prod.nombre}`}
                            onClick={() => abrirModalProducto("eliminar", prod)}
                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* PAGINACIÓN */}
        {!loading && productos.length > 0 && (
          <div className="px-6 py-5 bg-slate-50/30 border-t border-slate-50 flex items-center justify-between">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              {inicio + 1} – {Math.min(inicio + POR_PAGINA, productos.length)} de {productos.length} productos
            </p>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setPagina((p) => Math.max(1, p - 1))}
                disabled={pagina === 1}
                className="p-2 rounded-xl border border-slate-200 text-slate-400 hover:bg-white transition-all disabled:opacity-40"
              >
                <ChevronLeft size={18} />
              </button>
              <div className="flex items-center space-x-1">
                {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((n) => (
                  <button
                    key={n}
                    onClick={() => setPagina(n)}
                    className={`w-8 h-8 rounded-xl text-xs font-bold transition-all ${
                      n === pagina
                        ? "bg-cyan-600 text-white shadow-md shadow-cyan-600/20"
                        : "text-slate-500 hover:bg-slate-100"
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
                disabled={pagina === totalPaginas}
                className="p-2 rounded-xl border border-slate-200 text-slate-400 hover:bg-white transition-all disabled:opacity-40"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>

      <ProductoDetalleModal
        abierto={modalDetalleAbierto}
        modo={modalModo}
        producto={productoDetalle}
        cargando={detalleLoading}
        error={detalleError}
        accionError={accionError}
        guardando={guardandoProducto}
        eliminando={eliminandoProducto}
        onClose={cerrarDetalleProducto}
        onRetry={reintentarDetalleProducto}
        onGuardar={guardarCambiosProducto}
        onEliminar={confirmarEliminarProducto}
      />
    </div>
  );
}
