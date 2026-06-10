// app/inventario/page.tsx
"use client";

import { useEffect, useMemo, useState, useCallback, useRef } from "react";

import {
  AlertTriangle,
  Bone,
  Boxes,
  CalendarClock,
  Camera,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  DollarSign,
  Download,
  Eye,
  Filter,
  ImageIcon,
  Package,
  PawPrint,
  Pencil,
  Plus,
  RefreshCcw,
  Search,
  ShieldAlert,
  Trash2,
  TrendingUp,
} from "lucide-react";

import {
  productosApi,
  resolveImageUrl,
  Producto as ProductoApi,
  type ProductoMutationPayload,
} from "@/lib/api";
import ProductoDetalleModal, {
  type ProductoModalMode,
} from "@/components/organisms/productos/ProductoDetalleModal";

const PAGE_SIZE = 5;

type Estado =
  | "Disponible"
  | "Bajo stock"
  | "Agotado";

interface Producto {
  id: number;
  nombre: string;
  categoria: string;
  stock: number;
  minimo: number;
  precio: number;
  proveedor: string;
  estado: Estado;
  imagen: string;
  actualizado: string;
  vencimiento?: string;
}

const IMAGEN_DEFAULT =
  "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?q=80&w=1200&auto=format&fit=crop";

function mapApiToView(p: ProductoApi): Producto {
  const stock = p.cantidadActual;
  const minimo = p.cantidadMinima;
  const estado: Estado =
    stock === 0
      ? "Agotado"
      : stock <= minimo
      ? "Bajo stock"
      : "Disponible";

  const diff =
    Date.now() - new Date(p.updatedAt).getTime();
  const mins = Math.floor(diff / 60000);
  const actualizado =
    mins < 1
      ? "Ahora"
      : mins < 60
      ? `Hace ${mins} min`
      : `Hace ${Math.floor(mins / 60)}h`;

  return {
    id: p.id,
    nombre: p.nombre,
    categoria: p.categoria?.nombre ?? "Sin categoría",
    stock,
    minimo,
    precio: parseFloat(p.precioVenta),
    proveedor:
      p.fabricante ?? p.marca ?? "Sin proveedor",
    estado,
    imagen: resolveImageUrl(p.imagen, p.updatedAt) ?? IMAGEN_DEFAULT,
    actualizado,
    vencimiento: p.fechaVencimiento
      ? p.fechaVencimiento.substring(0, 10)
      : undefined,
  };
}

export default function InventarioPage() {
  const [productos, setProductos] =
    useState<Producto[]>([]);

  const [loading, setLoading] =
    useState(false);

  const [search, setSearch] =
    useState("");

  const [pagina, setPagina] =
    useState(1);

  const [nuevoProducto, setNuevoProducto] =
    useState({
      nombre: "",
      categoria: "",
      stock: "",
      precio: "",
      proveedor: "",
      imagen: "",
      vencimiento: "",
    });

  const [archivoNuevo, setArchivoNuevo] = useState<File | null>(null);
  const [previewNuevo, setPreviewNuevo] = useState<string | null>(null);
  const fileInputNuevoRef = useRef<HTMLInputElement>(null);

  // Datos crudos de la API (necesarios para el modal)
  const productosRawRef = useRef<ProductoApi[]>([]);

  // ── Estado modal ──────────────────────────────────────────────────────
  const [modalAbierto, setModalAbierto]         = useState(false);
  const [modalModo, setModalModo]               = useState<ProductoModalMode>("detalle");
  const [productoDetalle, setProductoDetalle]   = useState<ProductoApi | null>(null);
  const [detalleLoading, setDetalleLoading]     = useState(false);
  const [detalleError, setDetalleError]         = useState<string | null>(null);
  const [accionError, setAccionError]           = useState<string | null>(null);
  const [guardando, setGuardando]               = useState(false);
  const [eliminando, setEliminando]             = useState(false);
  const detalleRequestRef                       = useRef(0);

  const cargarProductos = useCallback(async () => {
    setLoading(true);
    try {
      const data = await productosApi.listar();
      productosRawRef.current = data;
      setProductos(data.map(mapApiToView));
    } catch (err: any) {
      console.error("Error cargando productos:", err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarProductos();
  }, [cargarProductos]);

  const productosFiltrados = useMemo(() => {
    return productos.filter((producto) =>
      `${producto.nombre} ${producto.categoria} ${producto.proveedor}`
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [productos, search]);

  // Resetear a página 1 cuando cambia la búsqueda
  useEffect(() => {
    setPagina(1);
  }, [search]);

  const totalPaginas = Math.max(
    1,
    Math.ceil(productosFiltrados.length / PAGE_SIZE)
  );

  const productosPaginados = useMemo(() => {
    const inicio = (pagina - 1) * PAGE_SIZE;
    return productosFiltrados.slice(inicio, inicio + PAGE_SIZE);
  }, [productosFiltrados, pagina]);

  const estadisticas = useMemo(() => {
    return {
      total: productos.length,

      bajoStock: productos.filter(
        (p) =>
          p.estado === "Bajo stock"
      ).length,

      agotados: productos.filter(
        (p) =>
          p.estado === "Agotado"
      ).length,

      valor: productos.reduce(
        (acc, item) =>
          acc +
          item.stock * item.precio,
        0
      ),
    };
  }, [productos]);

  const handleCrear = async () => {
    if (
      !nuevoProducto.nombre ||
      !nuevoProducto.stock ||
      !nuevoProducto.precio
    ) {
      alert("Completa los campos obligatorios");
      return;
    }

    try {
      const creado = await productosApi.crear({
        nombre: nuevoProducto.nombre,
        precioVenta: nuevoProducto.precio,
        cantidadActual: Number(nuevoProducto.stock),
        fabricante: nuevoProducto.proveedor || undefined,
        imagen: nuevoProducto.imagen || undefined,
        fechaVencimiento: nuevoProducto.vencimiento || undefined,
      });

      // Si seleccionaron un archivo, subirlo al producto recién creado
      if (archivoNuevo) {
        await productosApi.subirImagen(creado.id, archivoNuevo);
      }

      setNuevoProducto({
        nombre: "",
        categoria: "",
        stock: "",
        precio: "",
        proveedor: "",
        imagen: "",
        vencimiento: "",
      });
      setArchivoNuevo(null);
      setPreviewNuevo(null);
      if (fileInputNuevoRef.current) fileInputNuevoRef.current.value = "";

      await cargarProductos();
    } catch (err: any) {
      alert(err.message ?? "Error al crear producto");
    }
  };

  const handleRefresh = () => {
    cargarProductos();
  };

  // ── Handlers del modal ────────────────────────────────────────────────
  const cargarDetalleProducto = useCallback(async (base: ProductoApi) => {
    const reqId = detalleRequestRef.current + 1;
    detalleRequestRef.current = reqId;
    setProductoDetalle(base);
    setDetalleLoading(true);
    setDetalleError(null);
    try {
      const detalle = await productosApi.obtener(base.id);
      if (detalleRequestRef.current !== reqId) return;
      setProductoDetalle(detalle);
    } catch (e: unknown) {
      if (detalleRequestRef.current !== reqId) return;
      setDetalleError(e instanceof Error ? e.message : "Error desconocido");
    } finally {
      if (detalleRequestRef.current === reqId) setDetalleLoading(false);
    }
  }, []);

  const abrirModal = useCallback((modo: ProductoModalMode, id: number) => {
    const raw = productosRawRef.current.find((p) => p.id === id);
    if (!raw) return;
    setModalModo(modo);
    setModalAbierto(true);
    setAccionError(null);
    void cargarDetalleProducto(raw);
  }, [cargarDetalleProducto]);

  const resetearModal = useCallback(() => {
    detalleRequestRef.current += 1;
    setModalAbierto(false);
    setModalModo("detalle");
    setDetalleLoading(false);
    setDetalleError(null);
    setAccionError(null);
    setGuardando(false);
    setEliminando(false);
    setProductoDetalle(null);
  }, []);

  const cerrarModal = useCallback(() => {
    if (guardando || eliminando) return;
    resetearModal();
  }, [guardando, eliminando, resetearModal]);

  const guardarCambios = useCallback(async (payload: ProductoMutationPayload) => {
    if (!productoDetalle) return;
    try {
      setGuardando(true);
      setAccionError(null);
      const actualizado = await productosApi.actualizar(productoDetalle.id, payload);
      setModalModo("detalle");
      await cargarDetalleProducto(actualizado);
      await cargarProductos();
    } catch (e: unknown) {
      setAccionError(e instanceof Error ? `No se pudo guardar: ${e.message}` : "Error desconocido");
    } finally {
      setGuardando(false);
    }
  }, [productoDetalle, cargarDetalleProducto, cargarProductos]);

  const confirmarEliminar = useCallback(async () => {
    if (!productoDetalle) return;
    try {
      setEliminando(true);
      setAccionError(null);
      await productosApi.eliminar(productoDetalle.id);
      resetearModal();
      await cargarProductos();
    } catch (e: unknown) {
      setAccionError(e instanceof Error ? `No se pudo eliminar: ${e.message}` : "Error desconocido");
      setEliminando(false);
    }
  }, [productoDetalle, resetearModal, cargarProductos]);

  // Cerrar modal con Escape
  useEffect(() => {
    if (!modalAbierto) return;
    const orig = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") cerrarModal(); };
    window.addEventListener("keydown", handler);
    return () => { document.body.style.overflow = orig; window.removeEventListener("keydown", handler); };
  }, [modalAbierto, cerrarModal]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50">

      {/* WATERMARKS */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.04] overflow-hidden">

        <PawPrint
          size={260}
          className="absolute top-[8%] left-[4%] text-teal-600 -rotate-12"
        />

        <Bone
          size={220}
          className="absolute right-[8%] top-[18%] text-slate-700 rotate-12"
        />

        <Boxes
          size={260}
          className="absolute bottom-[8%] left-[30%] text-slate-700 rotate-12"
        />
      </div>

      <div className="relative z-10 p-6 md:p-8 space-y-8">

        {/* HEADER */}
        <div className="bg-white/90 backdrop-blur-xl border border-white rounded-[2rem] shadow-xl shadow-slate-200/60 overflow-hidden">

          <div className="px-8 py-7 bg-gradient-to-r from-teal-50 via-white to-cyan-50 border-b border-slate-100">

            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">

              <div className="flex items-center gap-5">

                <div className="w-20 h-20 rounded-[1.8rem] bg-gradient-to-br from-teal-500 to-cyan-600 text-white flex items-center justify-center shadow-xl shadow-cyan-900/20">
                  <Boxes size={38} />
                </div>

                <div>
                  <h1 className="text-4xl font-black tracking-tight text-slate-900">
                    Inventario
                  </h1>

                  <p className="text-slate-500 mt-2 font-medium">
                    Gestión avanzada
                    de stock,
                    medicamentos,
                    alimentos y
                    productos
                    veterinarios
                  </p>

                  <div className="flex flex-wrap gap-2 mt-4">

                    <span className="px-3 py-1 rounded-full bg-teal-50 border border-teal-100 text-teal-700 text-xs font-bold">
                      CliniCore
                      Veterinary
                    </span>

                    <span className="px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold">
                      {productos.length}{" "}
                      Productos
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">

                <button
                  onClick={
                    handleRefresh
                  }
                  className="h-12 px-5 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 font-semibold text-sm flex items-center gap-2 transition-all"
                >
                  <RefreshCcw
                    size={16}
                    className={
                      loading
                        ? "animate-spin"
                        : ""
                    }
                  />
                  Actualizar
                </button>

                <button
                  onClick={() =>
                    alert(
                      "Exportando inventario..."
                    )
                  }
                  className="h-12 px-5 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 font-semibold text-sm flex items-center gap-2 transition-all"
                >
                  <Download size={16} />
                  Exportar
                </button>

                <button
                  onClick={() =>
                    window.scrollTo({
                      top:
                        document.body
                          .scrollHeight,
                      behavior:
                        "smooth",
                    })
                  }
                  className="h-12 px-6 rounded-2xl bg-gradient-to-r from-teal-600 to-cyan-600 hover:opacity-90 text-white font-bold text-sm flex items-center gap-2 shadow-xl shadow-cyan-900/20"
                >
                  <Plus size={17} />
                  Nuevo Producto
                </button>
              </div>
            </div>
          </div>

          {/* STATS */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 p-8">

            <StatCard
              title="Productos"
              value={
                estadisticas.total
              }
              icon={
                <Package size={24} />
              }
              description="Activos en inventario"
            />

            <StatCard
              title="Bajo stock"
              value={
                estadisticas.bajoStock
              }
              icon={
                <AlertTriangle size={24} />
              }
              description="Requieren reposición"
            />

            <StatCard
              title="Agotados"
              value={
                estadisticas.agotados
              }
              icon={
                <ShieldAlert size={24} />
              }
              description="Sin unidades"
            />

            <StatCard
              title="Valor total"
              value={`$${estadisticas.valor.toLocaleString()}`}
              icon={
                <DollarSign size={24} />
              }
              description="Capital inventario"
            />
          </div>
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-[2rem] border border-slate-200 shadow-lg overflow-hidden">

          <div className="p-6 border-b border-slate-100 flex flex-col xl:flex-row justify-between gap-4">

            <div className="relative w-full xl:max-w-md">

              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                value={search}
                onChange={(e) =>
                  setSearch(
                    e.target.value
                  )
                }
                placeholder="Buscar producto..."
                className="w-full h-12 rounded-2xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              />
            </div>

            <button
              onClick={() =>
                alert(
                  "Filtros próximamente"
                )
              }
              className="h-12 px-5 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 font-semibold text-sm flex items-center gap-2"
            >
              <Filter size={16} />
              Filtros
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1200px]">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider text-slate-500">
                    Producto
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider text-slate-500">
                    Categoría
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider text-slate-500">
                    Stock
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider text-slate-500">
                    Precio
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider text-slate-500">
                    Vencimiento
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider text-slate-500">
                    Estado
                  </th>

                  <th className="px-6 py-4 text-right text-xs font-black uppercase tracking-wider text-slate-500">
                    Acciones
                  </th>
                </tr>
              </thead>

              <tbody>

                {productosPaginados.map(
                  (producto) => (
                    <tr
                      key={
                        producto.id
                      }
                      className="border-b border-slate-100 hover:bg-slate-50/70 transition-all"
                    >

                      {/* PRODUCTO */}
                      <td className="px-6 py-5">

                        <div className="flex items-center gap-4">

                          <div className="w-16 h-16 rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 shrink-0">

                            <img
                              src={
                                producto.imagen
                              }
                              alt={
                                producto.nombre
                              }
                              className="w-full h-full object-cover"
                            />
                          </div>

                          <div>

                            <h3 className="font-black text-slate-900">
                              {
                                producto.nombre
                              }
                            </h3>

                            <p className="text-sm text-slate-500 mt-1">
                              {
                                producto.proveedor
                              }
                            </p>

                            <div className="flex items-center gap-2 mt-2">

                              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                ID #
                                {
                                  producto.id
                                }
                              </span>

                              <span className="w-1 h-1 rounded-full bg-slate-300"></span>

                              <span className="text-[11px] font-bold uppercase tracking-wider text-teal-600">
                                CliniCore
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* CATEGORIA */}
                      <td className="px-6 py-5">

                        <span className="px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700">
                          {
                            producto.categoria
                          }
                        </span>
                      </td>

                      {/* STOCK */}
                      <td className="px-6 py-5">

                        <div className="space-y-2">

                          <div className="flex items-center gap-2">

                            <span className="text-lg font-black text-slate-900">
                              {
                                producto.stock
                              }
                            </span>

                            <span className="text-xs text-slate-400 font-semibold">
                              mín{" "}
                              {
                                producto.minimo
                              }
                            </span>
                          </div>

                          <div className="w-32 h-2 rounded-full bg-slate-100 overflow-hidden">

                            <div
                              className={`h-full rounded-full ${
                                producto.stock <=
                                producto.minimo
                                  ? "bg-red-500"
                                  : "bg-emerald-500"
                              }`}
                              style={{
                                width: `${Math.min(
                                  producto.stock *
                                    2,
                                  100
                                )}%`,
                              }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* PRECIO */}
                      <td className="px-6 py-5">

                        <div className="font-black text-slate-800">
                          $
                          {producto.precio.toLocaleString()}
                        </div>
                      </td>

                      {/* FECHA */}
                      <td className="px-6 py-5">

                        <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">

                          <CalendarClock
                            size={15}
                          />

                          {producto.vencimiento ||
                            "N/A"}
                        </div>
                      </td>

                      {/* ESTADO */}
                      <td className="px-6 py-5">

                        <EstadoBadge
                          estado={
                            producto.estado
                          }
                        />

                        <div className="flex items-center gap-2 mt-2 text-xs text-slate-400">

                          <Clock3
                            size={13}
                          />

                          {
                            producto.actualizado
                          }
                        </div>
                      </td>

                      {/* ACTIONS */}
                      <td className="px-6 py-5">

                        <div className="flex items-center justify-end gap-2">

                          <ActionButton
                            icon={<Eye size={16} />}
                            onClick={() => abrirModal("detalle", producto.id)}
                          />

                          <ActionButton
                            icon={<Pencil size={16} />}
                            onClick={() => abrirModal("editar", producto.id)}
                          />

                          <ActionButton
                            danger
                            icon={<Trash2 size={16} />}
                            onClick={() => abrirModal("eliminar", producto.id)}
                          />
                        </div>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>

          {/* PAGINACIÓN */}
          <div className="px-6 py-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">

            <p className="text-sm text-slate-500 font-medium">
              Mostrando{" "}
              <span className="font-bold text-slate-700">
                {productosFiltrados.length === 0
                  ? 0
                  : (pagina - 1) * PAGE_SIZE + 1}
                –
                {Math.min(pagina * PAGE_SIZE, productosFiltrados.length)}
              </span>{" "}
              de{" "}
              <span className="font-bold text-slate-700">
                {productosFiltrados.length}
              </span>{" "}
              productos
            </p>

            <div className="flex items-center gap-1">

              {/* Anterior */}
              <button
                onClick={() => setPagina((p) => Math.max(1, p - 1))}
                disabled={pagina === 1}
                className="w-9 h-9 rounded-xl border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft size={16} />
              </button>

              {/* Números de página */}
              {Array.from({ length: totalPaginas }, (_, i) => i + 1)
                .filter(
                  (n) =>
                    n === 1 ||
                    n === totalPaginas ||
                    Math.abs(n - pagina) <= 1
                )
                .reduce<(number | "…")[]>((acc, n, idx, arr) => {
                  if (idx > 0 && n - (arr[idx - 1] as number) > 1) acc.push("…");
                  acc.push(n);
                  return acc;
                }, [])
                .map((item, idx) =>
                  item === "…" ? (
                    <span
                      key={`ellipsis-${idx}`}
                      className="w-9 h-9 flex items-center justify-center text-slate-400 text-sm"
                    >
                      …
                    </span>
                  ) : (
                    <button
                      key={item}
                      onClick={() => setPagina(item as number)}
                      className={`w-9 h-9 rounded-xl border text-sm font-bold transition-all ${
                        pagina === item
                          ? "bg-teal-600 border-teal-600 text-white shadow-md shadow-teal-900/20"
                          : "border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {item}
                    </button>
                  )
                )}

              {/* Siguiente */}
              <button
                onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
                disabled={pagina === totalPaginas}
                className="w-9 h-9 rounded-xl border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* FORM */}
        <div className="bg-white rounded-[2rem] border border-slate-200 shadow-lg overflow-hidden">

          <div className="p-8 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">

            <div className="flex items-center gap-4">

              <div className="w-16 h-16 rounded-[1.5rem] bg-gradient-to-br from-teal-500 to-cyan-600 text-white flex items-center justify-center shadow-lg shadow-cyan-900/20">
                <TrendingUp size={30} />
              </div>

              <div>
                <h2 className="text-2xl font-black text-slate-900">
                  Registrar
                  Producto
                </h2>

                <p className="text-slate-500 mt-1">
                  Agrega nuevos
                  productos al
                  inventario
                  clínico
                </p>
              </div>
            </div>
          </div>

          <div className="p-8 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

            <Input
              placeholder="Nombre producto"
              value={
                nuevoProducto.nombre
              }
              onChange={(e) =>
                setNuevoProducto({
                  ...nuevoProducto,
                  nombre:
                    e.target.value,
                })
              }
              icon={
                <Package
                  size={17}
                />
              }
            />

            <Input
              placeholder="Categoría"
              value={
                nuevoProducto.categoria
              }
              onChange={(e) =>
                setNuevoProducto({
                  ...nuevoProducto,
                  categoria:
                    e.target.value,
                })
              }
              icon={
                <Boxes
                  size={17}
                />
              }
            />

            <Input
              placeholder="Proveedor"
              value={
                nuevoProducto.proveedor
              }
              onChange={(e) =>
                setNuevoProducto({
                  ...nuevoProducto,
                  proveedor:
                    e.target.value,
                })
              }
              icon={
                <Bone
                  size={17}
                />
              }
            />

            <Input
              placeholder="Stock"
              type="number"
              value={
                nuevoProducto.stock
              }
              onChange={(e) =>
                setNuevoProducto({
                  ...nuevoProducto,
                  stock:
                    e.target.value,
                })
              }
              icon={
                <TrendingUp
                  size={17}
                />
              }
            />

            <Input
              placeholder="Precio"
              type="number"
              value={
                nuevoProducto.precio
              }
              onChange={(e) =>
                setNuevoProducto({
                  ...nuevoProducto,
                  precio:
                    e.target.value,
                })
              }
              icon={
                <DollarSign
                  size={17}
                />
              }
            />

            <Input
              placeholder="Fecha vencimiento"
              type="date"
              value={
                nuevoProducto.vencimiento
              }
              onChange={(e) =>
                setNuevoProducto({
                  ...nuevoProducto,
                  vencimiento:
                    e.target.value,
                })
              }
              icon={
                <CalendarClock
                  size={17}
                />
              }
            />

            {/* IMAGEN */}
            <div className="xl:col-span-3 space-y-4">

              <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
                <ImageIcon size={16} className="text-teal-600" />
                Imagen del producto
              </label>

              <div className="grid grid-cols-1 lg:grid-cols-[1fr_180px] gap-5">

                <div className="space-y-3">
                  {/* Subir archivo */}
                  <div className="flex items-center gap-3">
                    <input
                      ref={fileInputNuevoRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0] ?? null;
                        setArchivoNuevo(file);
                        if (file) {
                          setPreviewNuevo(URL.createObjectURL(file));
                          setNuevoProducto({ ...nuevoProducto, imagen: "" });
                        } else {
                          setPreviewNuevo(null);
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => fileInputNuevoRef.current?.click()}
                      className="h-12 px-4 rounded-2xl border border-slate-200 bg-white hover:border-teal-400 hover:text-teal-700 font-semibold text-sm flex items-center gap-2 transition-all"
                    >
                      <Camera size={16} />
                      {archivoNuevo ? archivoNuevo.name : "Subir archivo"}
                    </button>
                    {archivoNuevo && (
                      <button
                        type="button"
                        onClick={() => { setArchivoNuevo(null); setPreviewNuevo(null); if (fileInputNuevoRef.current) fileInputNuevoRef.current.value = ""; }}
                        className="text-xs font-bold text-red-500 hover:text-red-700"
                      >
                        Quitar
                      </button>
                    )}
                  </div>

                  {/* O URL externa */}
                  <div className="relative">
                    <Camera size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="url"
                      placeholder="O pega una URL externa: https://..."
                      value={nuevoProducto.imagen}
                      onChange={(e) => {
                        setNuevoProducto({ ...nuevoProducto, imagen: e.target.value });
                        if (e.target.value) { setArchivoNuevo(null); setPreviewNuevo(null); }
                      }}
                      className="w-full h-12 rounded-2xl border border-slate-200 bg-slate-50 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                    />
                  </div>
                  <p className="text-xs text-slate-400">JPEG, PNG, WebP, GIF · Máx. 5 MB</p>
                </div>

                <div className="h-40 rounded-3xl overflow-hidden border border-slate-200 bg-slate-100">
                  {(previewNuevo || nuevoProducto.imagen) ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={previewNuevo || nuevoProducto.imagen}
                      alt="preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                      <ImageIcon size={34} />
                      <span className="text-xs font-semibold mt-2">Vista previa</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="px-8 pb-8">

            <button
              onClick={
                handleCrear
              }
              className="h-14 px-7 rounded-2xl bg-gradient-to-r from-teal-600 to-cyan-600 hover:opacity-90 text-white font-black flex items-center gap-3 shadow-xl shadow-cyan-900/20"
            >
              <CheckCircle2
                size={20}
              />
              Guardar Producto
            </button>
          </div>
        </div>
      </div>

      <ProductoDetalleModal
        abierto={modalAbierto}
        modo={modalModo}
        producto={productoDetalle}
        cargando={detalleLoading}
        error={detalleError}
        accionError={accionError}
        guardando={guardando}
        eliminando={eliminando}
        onClose={cerrarModal}
        onRetry={() => productoDetalle && void cargarDetalleProducto(productoDetalle)}
        onGuardar={guardarCambios}
        onEliminar={confirmarEliminar}
      />
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  description,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description: string;
}) {
  return (
    <div className="relative overflow-hidden bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm">

      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-teal-50 to-cyan-50 rounded-full blur-3xl opacity-70" />

      <div className="relative flex items-start justify-between">

        <div>
          <p className="text-sm font-bold uppercase tracking-wider text-slate-400">
            {title}
          </p>

          <h3 className="text-4xl font-black text-slate-900 mt-3 tracking-tight">
            {value}
          </h3>

          <p className="text-sm text-slate-500 mt-2 font-medium">
            {description}
          </p>
        </div>

        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-50 border border-slate-200 flex items-center justify-center text-slate-700 shadow-sm">
          {icon}
        </div>
      </div>
    </div>
  );
}

function EstadoBadge({
  estado,
}: {
  estado: Estado;
}) {
  const styles = {
    Disponible:
      "bg-emerald-50 text-emerald-700 border border-emerald-200",
    "Bajo stock":
      "bg-amber-50 text-amber-700 border border-amber-200",
    Agotado:
      "bg-red-50 text-red-700 border border-red-200",
  };

  return (
    <span
      className={`inline-flex px-3 py-1 rounded-full text-xs font-black ${styles[estado]}`}
    >
      {estado}
    </span>
  );
}

function ActionButton({
  icon,
  onClick,
  danger,
}: {
  icon: React.ReactNode;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-11 h-11 rounded-2xl border flex items-center justify-center transition-all ${
        danger
          ? "border-red-200 text-red-500 hover:bg-red-50"
          : "border-slate-200 text-slate-500 hover:bg-slate-50"
      }`}
    >
      {icon}
    </button>
  );
}

function Input({
  icon,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  icon?: React.ReactNode;
}) {
  return (
    <div className="relative">

      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
        {icon}
      </div>

      <input
        {...props}
        className="w-full h-14 rounded-2xl border border-slate-200 bg-slate-50 pl-12 pr-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/20"
      />
    </div>
  );
}