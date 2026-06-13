"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Hash,
  ImageOff,
  Loader2,
  Package,
  RefreshCw,
  Save,
  Tag,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import type {
  MovimientoStock,
  Producto,
  ProductoMutationPayload,
} from "@/lib/api";
import { productosApi } from "@/lib/api";

export type ProductoModalMode = "detalle" | "editar" | "eliminar";

type ProductoDetalleModalProps = {
  abierto: boolean;
  modo: ProductoModalMode;
  cargando?: boolean;
  guardando?: boolean;
  eliminando?: boolean;
  error?: string | null;
  accionError?: string | null;
  producto: Producto | null;
  onClose: () => void;
  onRetry?: () => void;
  onGuardar?: (payload: ProductoMutationPayload) => void | Promise<void>;
  onEliminar?: () => void | Promise<void>;
};

type ProductoFormState = {
  nombre: string;
  descripcion: string;
  codigoBarras: string;
  codigoInterno: string;
  marca: string;
  fabricante: string;
  precioCompra: string;
  precioVenta: string;
  cantidadActual: string;
  cantidadMinima: string;
  cantidadMaxima: string;
  fechaVencimiento: string;
  imagen: string;
  categoriaId: string;
  sucursalId: string;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3002/api/v1";
const API_ORIGIN = API_URL.replace(/\/api\/v1\/?$/, "");

function resolverEstado(producto: Producto): "Disponible" | "Stock Bajo" | "Agotado" {
  if (producto.cantidadActual <= 0) return "Agotado";
  if (producto.cantidadActual <= producto.cantidadMinima) return "Stock Bajo";
  return "Disponible";
}

function resolverImagen(imagen?: string | null) {
  if (!imagen) return null;
  if (/^(https?:)?\/\//i.test(imagen) || imagen.startsWith("data:")) return imagen;
  if (imagen.startsWith("/")) return `${API_ORIGIN}${imagen}`;
  return `${API_ORIGIN}/${imagen}`;
}

function formatearMoneda(valor?: string | number | null) {
  if (valor === undefined || valor === null || valor === "") return "No registrado";

  const numero = typeof valor === "number" ? valor : Number(valor);
  if (Number.isNaN(numero)) return String(valor);

  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numero);
}

function formatearFecha(fecha?: string | null, incluirHora = false) {
  if (!fecha) return "No registrado";

  const parsed = new Date(fecha);
  if (Number.isNaN(parsed.getTime())) return fecha;

  return new Intl.DateTimeFormat("es-CO", {
    dateStyle: "medium",
    ...(incluirHora ? { timeStyle: "short" } : {}),
  }).format(parsed);
}

function formatearCantidad(valor?: number | null) {
  if (valor === undefined || valor === null) return "No registrado";
  return `${valor} unidades`;
}

function valorTexto(valor?: string | number | null) {
  if (valor === undefined || valor === null || valor === "") return "No registrado";
  return String(valor);
}

function claseEstado(estado: ReturnType<typeof resolverEstado>) {
  if (estado === "Disponible") return "bg-emerald-50 text-emerald-700 border-emerald-100";
  if (estado === "Stock Bajo") return "bg-orange-50 text-orange-700 border-orange-100";
  return "bg-red-50 text-red-700 border-red-100";
}

function toDateInputValue(fecha?: string | null) {
  if (!fecha) return "";

  const parsed = new Date(fecha);
  if (Number.isNaN(parsed.getTime())) return "";

  const year = parsed.getFullYear();
  const month = `${parsed.getMonth() + 1}`.padStart(2, "0");
  const day = `${parsed.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function crearFormularioProducto(producto: Producto | null): ProductoFormState {
  return {
    nombre: producto?.nombre ?? "",
    descripcion: producto?.descripcion ?? "",
    codigoBarras: producto?.codigoBarras ?? "",
    codigoInterno: producto?.codigoInterno ?? "",
    marca: producto?.marca ?? "",
    fabricante: producto?.fabricante ?? "",
    precioCompra: producto?.precioCompra ?? "",
    precioVenta: producto?.precioVenta ?? "",
    cantidadActual: producto?.cantidadActual?.toString() ?? "0",
    cantidadMinima: producto?.cantidadMinima?.toString() ?? "0",
    cantidadMaxima:
      producto?.cantidadMaxima === undefined || producto?.cantidadMaxima === null
        ? ""
        : producto.cantidadMaxima.toString(),
    fechaVencimiento: toDateInputValue(producto?.fechaVencimiento),
    imagen: producto?.imagen ?? "",
    categoriaId:
      producto?.categoriaId === undefined || producto?.categoriaId === null
        ? ""
        : producto.categoriaId.toString(),
    sucursalId:
      producto?.sucursalId === undefined || producto?.sucursalId === null
        ? ""
        : producto.sucursalId.toString(),
  };
}

function stringOpcional(valor: string) {
  const limpio = valor.trim();
  return limpio ? limpio : null;
}

function numeroOpcional(valor: string) {
  const limpio = valor.trim();
  if (!limpio) return null;

  const numero = Number(limpio);
  if (Number.isNaN(numero)) {
    throw new Error("Revisa los campos numericos antes de guardar.");
  }

  return numero;
}

function numeroTextoOpcional(valor: string) {
  const limpio = valor.trim();
  if (!limpio) return null;

  const numero = Number(limpio);
  if (Number.isNaN(numero)) {
    throw new Error("Revisa los campos numericos antes de guardar.");
  }

  return limpio;
}

function enteroOpcional(valor: string) {
  const limpio = valor.trim();
  if (!limpio) return null;

  const numero = Number.parseInt(limpio, 10);
  if (Number.isNaN(numero)) {
    throw new Error("Revisa los campos enteros antes de guardar.");
  }

  return numero;
}

function enteroRequerido(valor: string, etiqueta: string) {
  const numero = enteroOpcional(valor);
  if (numero === null) {
    throw new Error(`El campo ${etiqueta} es obligatorio.`);
  }
  return numero;
}

function decimalRequerido(valor: string, etiqueta: string) {
  const numero = numeroTextoOpcional(valor);
  if (numero === null) {
    throw new Error(`El campo ${etiqueta} es obligatorio.`);
  }
  return numero;
}

function construirPayloadProducto(formulario: ProductoFormState): ProductoMutationPayload {
  const nombre = formulario.nombre.trim();
  if (!nombre) {
    throw new Error("El nombre del producto es obligatorio.");
  }

  return {
    nombre,
    descripcion: stringOpcional(formulario.descripcion),
    codigoBarras: stringOpcional(formulario.codigoBarras),
    codigoInterno: stringOpcional(formulario.codigoInterno),
    marca: stringOpcional(formulario.marca),
    fabricante: stringOpcional(formulario.fabricante),
    precioCompra: numeroTextoOpcional(formulario.precioCompra),
    precioVenta: decimalRequerido(formulario.precioVenta, "precio de venta"),
    cantidadActual: enteroRequerido(formulario.cantidadActual, "cantidad actual"),
    cantidadMinima: enteroRequerido(formulario.cantidadMinima, "cantidad minima"),
    cantidadMaxima: enteroOpcional(formulario.cantidadMaxima),
    fechaVencimiento: stringOpcional(formulario.fechaVencimiento),
    imagen: stringOpcional(formulario.imagen),
    categoriaId: enteroOpcional(formulario.categoriaId),
    sucursalId: enteroOpcional(formulario.sucursalId),
  };
}

function CampoDetalle({
  etiqueta,
  valor,
  expandido = false,
}: {
  etiqueta: string;
  valor: React.ReactNode;
  expandido?: boolean;
}) {
  return (
    <div
      className={`rounded-[1.35rem] border border-slate-100 bg-slate-50/70 p-4 ${
        expandido ? "md:col-span-2" : ""
      }`}
    >
      <p className="text-[11px] font-black uppercase tracking-[0.22em] text-slate-400">
        {etiqueta}
      </p>
      <div className="mt-2 text-sm font-semibold leading-relaxed text-slate-700">{valor}</div>
    </div>
  );
}

function FilaResumen({ etiqueta, valor }: { etiqueta: string; valor: React.ReactNode }) {
  return (
    <div className="rounded-[1.15rem] border border-slate-100 bg-slate-50/70 px-4 py-3">
      <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">
        {etiqueta}
      </p>
      <div className="mt-2 text-sm font-semibold text-slate-700">{valor}</div>
    </div>
  );
}

function MovimientoCard({ movimiento }: { movimiento: MovimientoStock }) {
  const esEntrada = movimiento.tipo.toLowerCase().includes("entrada");

  return (
    <div className="rounded-[1.25rem] border border-slate-100 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.18em] text-slate-700">
            {movimiento.tipo}
          </p>
          <p className="mt-1 text-xs font-medium text-slate-400">
            {formatearFecha(movimiento.createdAt, true)}
          </p>
        </div>
        <span
          className={`rounded-full border px-3 py-1 text-xs font-black uppercase tracking-[0.18em] ${
            esEntrada
              ? "border-emerald-100 bg-emerald-50 text-emerald-700"
              : "border-orange-100 bg-orange-50 text-orange-700"
          }`}
        >
          {movimiento.cantidad > 0 ? `+${movimiento.cantidad}` : movimiento.cantidad}
        </span>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <CampoDetalle etiqueta="Cantidad anterior" valor={movimiento.cantidadAnterior} />
        <CampoDetalle etiqueta="Cantidad posterior" valor={movimiento.cantidadPosterior} />
        <CampoDetalle etiqueta="Usuario ID" valor={valorTexto(movimiento.usuarioId)} />
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <CampoDetalle etiqueta="Sucursal ID" valor={valorTexto(movimiento.sucursalId)} />
        <CampoDetalle etiqueta="Motivo" valor={valorTexto(movimiento.motivo)} />
      </div>
    </div>
  );
}

function CampoInput({
  etiqueta,
  valor,
  onChange,
  type = "text",
  placeholder,
  expandido = false,
  step,
  min,
  required = false,
}: {
  etiqueta: string;
  valor: string;
  onChange: (value: string) => void;
  type?: React.HTMLInputTypeAttribute;
  placeholder?: string;
  expandido?: boolean;
  step?: string;
  min?: string;
  required?: boolean;
}) {
  return (
    <label
      className={`block rounded-[1.35rem] border border-slate-100 bg-slate-50/70 p-4 ${
        expandido ? "md:col-span-2" : ""
      }`}
    >
      <span className="text-[11px] font-black uppercase tracking-[0.22em] text-slate-400">
        {etiqueta}
      </span>
      <input
        type={type}
        value={valor}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        step={step}
        min={min}
        required={required}
        className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 outline-none transition-all placeholder:text-slate-300 focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100"
      />
    </label>
  );
}

function CampoTextarea({
  etiqueta,
  valor,
  onChange,
}: {
  etiqueta: string;
  valor: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block rounded-[1.35rem] border border-slate-100 bg-slate-50/70 p-4 md:col-span-2">
      <span className="text-[11px] font-black uppercase tracking-[0.22em] text-slate-400">
        {etiqueta}
      </span>
      <textarea
        value={valor}
        onChange={(event) => onChange(event.target.value)}
        rows={4}
        className="mt-2 w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 outline-none transition-all placeholder:text-slate-300 focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100"
      />
    </label>
  );
}

export default function ProductoDetalleModal({
  abierto,
  modo,
  cargando = false,
  guardando = false,
  eliminando = false,
  error,
  accionError,
  producto,
  onClose,
  onRetry,
  onGuardar,
  onEliminar,
}: ProductoDetalleModalProps) {
  const [imageError, setImageError] = useState(false);
  const [formulario, setFormulario] = useState<ProductoFormState>(crearFormularioProducto(producto));
  const [errorFormulario, setErrorFormulario] = useState<string | null>(null);
  const [archivoImagen, setArchivoImagen] = useState<File | null>(null);
  const [previewLocal, setPreviewLocal] = useState<string | null>(null);
  const [subiendoImagen, setSubiendoImagen] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  // En edición: preview local > URL del formulario > imagen guardada en BD
  const imagenActual = previewLocal ?? (modo === "editar" ? formulario.imagen : producto?.imagen);
  const imageSrc = useMemo(() => {
    // Preview local (blob URL) — usar tal cual, no necesita cache-buster
    if (previewLocal) return previewLocal;

    const base = resolverImagen(imagenActual);
    if (!base) return null;

    // Para URLs externas (https://unsplash…) no añadir query
    if (/^https?:\/\//i.test(imagenActual ?? "")) return base;

    // Para rutas del microservicio: añadir updatedAt como cache-buster
    // Evita que el browser sirva respuestas en caché corruptas del gateway anterior
    const ts = producto?.updatedAt
      ? new Date(producto.updatedAt).getTime()
      : Date.now();
    return `${base}?v=${ts}`;
  }, [previewLocal, imagenActual, producto?.updatedAt]);
  const estado = producto ? resolverEstado(producto) : null;
  const bloqueadoEdicion = cargando || guardando;

  // Resetear error de imagen cada vez que cambie la URL o el producto
  useEffect(() => {
    setImageError(false);
  }, [imageSrc]);

  // Resetear estado local al cambiar modo o producto
  useEffect(() => {
    setFormulario(crearFormularioProducto(producto));
    setErrorFormulario(null);
    setArchivoImagen(null);
    setPreviewLocal(null);
    setIsDragOver(false);
    setImageError(false);
  }, [modo, producto]);

  const aplicarArchivo = (file: File) => {
    const TIPOS_VALIDOS = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!TIPOS_VALIDOS.includes(file.type)) return;
    setArchivoImagen(file);
    setPreviewLocal(URL.createObjectURL(file));
    setFormulario((prev) => ({ ...prev, imagen: "" }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) aplicarArchivo(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) aplicarArchivo(file);
  };

  const quitarArchivo = () => {
    setArchivoImagen(null);
    setPreviewLocal(null);
    const input = document.getElementById("file-upload-modal-edit") as HTMLInputElement | null;
    if (input) input.value = "";
  };

  if (!abierto || !producto) return null;

  const tituloModal =
    modo === "editar"
      ? "Editar producto"
      : modo === "eliminar"
      ? "Eliminar producto"
      : "Detalle de producto";

  const subtituloModal =
    modo === "editar"
      ? "Actualiza los campos del producto y guarda los cambios."
      : modo === "eliminar"
      ? "Confirma si deseas aplicar el borrado logico del producto."
      : "Consulta la informacion completa del producto.";

  const categoriaResumen =
    modo === "editar"
      ? formulario.categoriaId.trim()
        ? `Categoria ID ${formulario.categoriaId.trim()}`
        : "Sin categoria"
      : producto.categoria?.nombre ?? "Sin categoria";

  const referenciaResumen =
    modo === "editar"
      ? formulario.codigoInterno.trim() || formulario.codigoBarras.trim() || `ID-${producto.id}`
      : producto.codigoInterno ?? producto.codigoBarras ?? `ID-${producto.id}`;

  const fabricanteResumen =
    modo === "editar"
      ? formulario.fabricante.trim() || formulario.marca.trim() || "No registrado"
      : valorTexto(producto.fabricante ?? producto.marca);

  const descripcionResumen =
    modo === "editar"
      ? formulario.descripcion.trim() || "Este producto no tiene descripcion registrada en MS_Inventario."
      : producto.descripcion?.trim() || "Este producto no tiene descripcion registrada en MS_Inventario.";

  const actualizarCampo = <K extends keyof ProductoFormState>(campo: K, valor: ProductoFormState[K]) => {
    setFormulario((prev) => ({ ...prev, [campo]: valor }));
  };

  const manejarGuardar = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!onGuardar || !producto) return;

    try {
      setErrorFormulario(null);

      // Capturar la ruta de imagen en una variable local (sin mutar estado)
      let imagenPath: string | null | undefined = undefined;

      if (archivoImagen) {
        setSubiendoImagen(true);
        try {
          const subido = await productosApi.subirImagen(producto.id, archivoImagen);
          imagenPath = subido.imagen ?? null;
        } finally {
          setSubiendoImagen(false);
        }
      }

      const payload = construirPayloadProducto(formulario);

      // Sobreescribir la imagen con la ruta recién subida si aplica
      if (imagenPath !== undefined) {
        payload.imagen = imagenPath;
      }

      await onGuardar(payload);
    } catch (err) {
      setSubiendoImagen(false);
      if (err instanceof Error) {
        setErrorFormulario(err.message);
        return;
      }
      setErrorFormulario("No se pudo validar el formulario.");
    }
  };

  const contenidoPrincipal = (
    <>
      {error && (
        <div className="mb-6 flex flex-wrap items-center gap-3 rounded-[1.5rem] border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <AlertCircle size={18} className="flex-shrink-0" />
          <span className="min-w-[220px] flex-1">
            No se pudo refrescar el detalle desde el servidor. Se muestran los datos disponibles.
          </span>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="inline-flex items-center gap-2 rounded-xl bg-white px-3 py-2 font-bold text-amber-700 shadow-sm transition-all hover:bg-amber-100"
            >
              <RefreshCw size={16} />
              Reintentar
            </button>
          )}
        </div>
      )}

      {(accionError || errorFormulario) && (
        <div className="mb-6 rounded-[1.5rem] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <div className="flex items-start gap-3">
            <AlertCircle size={18} className="mt-0.5 flex-shrink-0" />
            <span>{accionError ?? errorFormulario}</span>
          </div>
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] xl:items-start">
        <div className="space-y-4">
          <div className="rounded-[1.75rem] border border-slate-100 bg-[linear-gradient(180deg,_rgba(248,250,252,0.98),_rgba(255,255,255,1))] p-5 shadow-sm">
            <div className="mx-auto w-full max-w-[240px] sm:max-w-[280px] xl:max-w-[300px]">

              {/* ── Zona de imagen: drag&drop en edición, estática en los demás modos ── */}
              {modo === "editar" ? (
                <>
                  {/* Input oculto — accesible vía label */}
                  <input
                    id="file-upload-modal-edit"
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="sr-only"
                    onChange={handleFileChange}
                  />
                  <label
                    htmlFor="file-upload-modal-edit"
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`group block cursor-pointer overflow-hidden rounded-[1.6rem] border-2 border-dashed shadow-inner transition-all ${
                      isDragOver
                        ? "border-cyan-400 bg-cyan-50/60"
                        : "border-slate-200 bg-slate-50 hover:border-cyan-300"
                    }`}
                  >
                    <div className="relative aspect-[4/4.6] w-full overflow-hidden">
                      {imageSrc && !imageError ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          key={imageSrc}
                          src={imageSrc}
                          alt={`Imagen de ${formulario.nombre || producto.nombre}`}
                          className="absolute inset-0 h-full w-full object-contain p-4"
                          onLoad={() => setImageError(false)}
                        onError={() => setImageError(true)}
                        />
                      ) : (
                        <div className="absolute inset-0 flex h-full w-full flex-col items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.12),_transparent_34%),linear-gradient(180deg,_rgba(248,250,252,1),_rgba(226,232,240,0.85))] px-6 text-center">
                          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/90 shadow-sm">
                            <Upload size={22} className="text-slate-400" />
                          </div>
                          <p className="mt-3 text-xs font-black uppercase tracking-[0.18em] text-slate-500">
                            Sin imagen
                          </p>
                        </div>
                      )}

                      {/* Overlay hover/drag */}
                      <div className={`absolute inset-0 flex flex-col items-center justify-center gap-1 rounded-[1.4rem] transition-all ${
                        isDragOver
                          ? "bg-cyan-500/50 opacity-100"
                          : "bg-slate-900/50 opacity-0 group-hover:opacity-100"
                      }`}>
                        <Upload size={26} className="text-white drop-shadow" />
                        <p className="text-xs font-black text-white drop-shadow">
                          {isDragOver ? "Suelta aquí" : "Cambiar imagen"}
                        </p>
                        <p className="text-[11px] text-white/80">clic o arrastra</p>
                      </div>
                    </div>
                  </label>

                  {/* Info del archivo / ruta actual */}
                  <div className="mt-2 min-h-[32px] text-center">
                    {archivoImagen ? (
                      <div className="flex items-center justify-center gap-2">
                        <span className="max-w-[160px] truncate text-[11px] font-semibold text-slate-600" title={archivoImagen.name}>
                          {archivoImagen.name}
                        </span>
                        <button
                          type="button"
                          onClick={quitarArchivo}
                          className="text-[11px] font-bold text-red-500 hover:text-red-700"
                        >
                          Quitar
                        </button>
                      </div>
                    ) : formulario.imagen ? (
                      <p className="truncate px-1 text-[11px] text-slate-400" title={formulario.imagen}>
                        {formulario.imagen}
                      </p>
                    ) : (
                      <p className="text-[11px] text-slate-400">JPEG · PNG · WebP · GIF · Máx 5 MB</p>
                    )}
                  </div>
                </>
              ) : (
                /* Modos detalle / eliminar — imagen estática */
                <div className="overflow-hidden rounded-[1.6rem] border border-slate-100 bg-slate-50 shadow-inner">
                  <div className="relative aspect-[4/4.6] w-full overflow-hidden">
                    {imageSrc && !imageError ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        key={imageSrc}
                        src={imageSrc}
                        alt={`Imagen de ${producto.nombre}`}
                        className="absolute inset-0 h-full w-full object-contain p-4"
                        onLoad={() => setImageError(false)}
                        onError={() => setImageError(true)}
                      />
                    ) : (
                      <div className="absolute inset-0 flex h-full w-full flex-col items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.12),_transparent_34%),linear-gradient(180deg,_rgba(248,250,252,1),_rgba(226,232,240,0.85))] px-6 text-center">
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/90 shadow-sm">
                          <ImageOff size={24} className="text-slate-400" />
                        </div>
                        <p className="mt-4 text-sm font-black uppercase tracking-[0.18em] text-slate-500">
                          Imagen no disponible
                        </p>
                        <p className="mt-2 text-sm text-slate-400">
                          Este producto aun no tiene una foto asociada en MS_Inventario.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-5 space-y-3">
              <FilaResumen etiqueta="Codigo" valor={referenciaResumen} />
              <FilaResumen etiqueta="Categoria" valor={categoriaResumen} />
              <FilaResumen etiqueta="Fabricante" valor={fabricanteResumen} />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {modo === "eliminar" ? (
            <>
              <section className="rounded-[1.75rem] border border-red-100 bg-red-50/70 p-5 shadow-sm sm:p-6">
                <div className="flex items-center gap-2 text-red-700">
                  <AlertCircle size={18} />
                  <h3 className="text-sm font-black uppercase tracking-[0.22em]">
                    Confirmacion de borrado
                  </h3>
                </div>
                <div className="mt-4 space-y-3 text-sm leading-7 text-red-700">
                  <p>
                    Estas seguro de eliminar este producto? Esta accion usara el API Gateway
                    para aplicar el borrado logico y el producto dejara de mostrarse en el
                    listado habitual.
                  </p>
                  <p>
                    Revisa el nombre, el codigo y la categoria antes de confirmar la
                    eliminacion.
                  </p>
                </div>
              </section>

              <section className="rounded-[1.75rem] border border-slate-100 bg-white p-5 shadow-sm sm:p-6">
                <div className="flex items-center gap-2 text-slate-800">
                  <Package size={18} className="text-cyan-600" />
                  <h3 className="text-sm font-black uppercase tracking-[0.22em]">
                    Producto a eliminar
                  </h3>
                </div>
                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <CampoDetalle etiqueta="Nombre" valor={producto.nombre} />
                  <CampoDetalle etiqueta="Codigo" valor={referenciaResumen} />
                  <CampoDetalle etiqueta="Categoria" valor={categoriaResumen} />
                  <CampoDetalle etiqueta="Precio venta" valor={formatearMoneda(producto.precioVenta)} />
                  <CampoDetalle etiqueta="Stock actual" valor={formatearCantidad(producto.cantidadActual)} />
                  <CampoDetalle etiqueta="Sucursal" valor={producto.sucursal?.nombre ?? valorTexto(producto.sucursalId)} />
                </div>
              </section>
            </>
          ) : modo === "editar" ? (
            <>
              <section className="rounded-[1.75rem] border border-slate-100 bg-white p-5 shadow-sm sm:p-6">
                <div className="flex items-center gap-2 text-slate-800">
                  <Package size={18} className="text-cyan-600" />
                  <h3 className="text-sm font-black uppercase tracking-[0.22em]">
                    Informacion general
                  </h3>
                </div>

                <fieldset disabled={bloqueadoEdicion} className="mt-5 grid gap-4 md:grid-cols-2">
                  <CampoInput
                    etiqueta="Nombre"
                    valor={formulario.nombre}
                    onChange={(valor) => actualizarCampo("nombre", valor)}
                    required
                  />
                  <CampoTextarea
                    etiqueta="Descripcion"
                    valor={formulario.descripcion}
                    onChange={(valor) => actualizarCampo("descripcion", valor)}
                  />
                  <CampoInput
                    etiqueta="Codigo interno"
                    valor={formulario.codigoInterno}
                    onChange={(valor) => actualizarCampo("codigoInterno", valor)}
                  />
                  <CampoInput
                    etiqueta="Codigo de barras"
                    valor={formulario.codigoBarras}
                    onChange={(valor) => actualizarCampo("codigoBarras", valor)}
                  />
                  <CampoInput
                    etiqueta="Marca"
                    valor={formulario.marca}
                    onChange={(valor) => actualizarCampo("marca", valor)}
                  />
                  <CampoInput
                    etiqueta="Fabricante"
                    valor={formulario.fabricante}
                    onChange={(valor) => actualizarCampo("fabricante", valor)}
                  />
                  <CampoInput
                    etiqueta="Categoria ID"
                    valor={formulario.categoriaId}
                    onChange={(valor) => actualizarCampo("categoriaId", valor)}
                    type="number"
                    min="1"
                  />
                  <CampoInput
                    etiqueta="Sucursal ID"
                    valor={formulario.sucursalId}
                    onChange={(valor) => actualizarCampo("sucursalId", valor)}
                    type="number"
                    min="1"
                  />
                  <CampoInput
                    etiqueta="Imagen (URL externa)"
                    valor={formulario.imagen}
                    onChange={(valor) => {
                      actualizarCampo("imagen", valor);
                      if (valor) { setArchivoImagen(null); setPreviewLocal(null); }
                    }}
                    placeholder="https://... (o usa el área de imagen para subir archivo)"
                    expandido
                  />
                </fieldset>
              </section>

              <section className="rounded-[1.75rem] border border-slate-100 bg-white p-5 shadow-sm sm:p-6">
                <div className="flex items-center gap-2 text-slate-800">
                  <Hash size={18} className="text-emerald-600" />
                  <h3 className="text-sm font-black uppercase tracking-[0.22em]">
                    Inventario y precios
                  </h3>
                </div>

                <fieldset disabled={bloqueadoEdicion} className="mt-5 grid gap-4 md:grid-cols-2">
                  <CampoInput
                    etiqueta="Cantidad actual"
                    valor={formulario.cantidadActual}
                    onChange={(valor) => actualizarCampo("cantidadActual", valor)}
                    type="number"
                    min="0"
                    required
                  />
                  <CampoInput
                    etiqueta="Cantidad minima"
                    valor={formulario.cantidadMinima}
                    onChange={(valor) => actualizarCampo("cantidadMinima", valor)}
                    type="number"
                    min="0"
                    required
                  />
                  <CampoInput
                    etiqueta="Cantidad maxima"
                    valor={formulario.cantidadMaxima}
                    onChange={(valor) => actualizarCampo("cantidadMaxima", valor)}
                    type="number"
                    min="0"
                  />
                  <CampoInput
                    etiqueta="Fecha de vencimiento"
                    valor={formulario.fechaVencimiento}
                    onChange={(valor) => actualizarCampo("fechaVencimiento", valor)}
                    type="date"
                  />
                  <CampoInput
                    etiqueta="Precio compra"
                    valor={formulario.precioCompra}
                    onChange={(valor) => actualizarCampo("precioCompra", valor)}
                    type="number"
                    step="0.01"
                    min="0"
                  />
                  <CampoInput
                    etiqueta="Precio venta"
                    valor={formulario.precioVenta}
                    onChange={(valor) => actualizarCampo("precioVenta", valor)}
                    type="number"
                    step="0.01"
                    min="0"
                    required
                  />
                </fieldset>
              </section>

              <section className="rounded-[1.75rem] border border-slate-100 bg-white p-5 shadow-sm sm:p-6">
                <div className="flex items-center gap-2 text-slate-800">
                  <Calendar size={18} className="text-indigo-500" />
                  <h3 className="text-sm font-black uppercase tracking-[0.22em]">
                    Metadatos
                  </h3>
                </div>
                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <CampoDetalle etiqueta="Creado" valor={formatearFecha(producto.createdAt, true)} />
                  <CampoDetalle
                    etiqueta="Ultima actualizacion"
                    valor={formatearFecha(producto.updatedAt, true)}
                  />
                </div>
              </section>
            </>
          ) : (
            <>
              <section className="rounded-[1.75rem] border border-slate-100 bg-white p-5 shadow-sm sm:p-6">
                <div className="flex items-center gap-2 text-slate-800">
                  <Package size={18} className="text-cyan-600" />
                  <h3 className="text-sm font-black uppercase tracking-[0.22em]">
                    Resumen del producto
                  </h3>
                </div>

                <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
                  <div className="space-y-4">
                    <div className="rounded-[1.35rem] border border-slate-100 bg-slate-50/70 p-4">
                      <p className="text-[11px] font-black uppercase tracking-[0.22em] text-slate-400">
                        Descripcion
                      </p>
                      <p className="mt-3 text-sm leading-7 text-slate-600">{descripcionResumen}</p>
                    </div>

                    <div className="grid gap-3 md:grid-cols-2">
                      <FilaResumen
                        etiqueta="Sucursal"
                        valor={producto.sucursal?.nombre ?? valorTexto(producto.sucursalId)}
                      />
                      <FilaResumen etiqueta="Marca" valor={valorTexto(producto.marca)} />
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                    <div className="rounded-[1.35rem] border border-emerald-100 bg-emerald-50/70 p-4">
                      <p className="text-[11px] font-black uppercase tracking-[0.22em] text-emerald-600/80">
                        Precio venta
                      </p>
                      <p className="mt-2 text-lg font-black text-emerald-700">
                        {formatearMoneda(producto.precioVenta)}
                      </p>
                    </div>
                    <div className="rounded-[1.35rem] border border-cyan-100 bg-cyan-50/70 p-4">
                      <p className="text-[11px] font-black uppercase tracking-[0.22em] text-cyan-600/80">
                        Stock actual
                      </p>
                      <p className="mt-2 text-lg font-black text-cyan-700">
                        {formatearCantidad(producto.cantidadActual)}
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              <section className="rounded-[1.75rem] border border-slate-100 bg-white p-5 shadow-sm sm:p-6">
                <div className="flex items-center gap-2 text-slate-800">
                  <Tag size={18} className="text-cyan-600" />
                  <h3 className="text-sm font-black uppercase tracking-[0.22em]">
                    Informacion general
                  </h3>
                </div>

                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <CampoDetalle etiqueta="Nombre" valor={valorTexto(producto.nombre)} />
                  <CampoDetalle etiqueta="ID del producto" valor={`#${producto.id}`} />
                  <CampoDetalle etiqueta="Codigo interno" valor={valorTexto(producto.codigoInterno)} />
                  <CampoDetalle etiqueta="Codigo de barras" valor={valorTexto(producto.codigoBarras)} />
                  <CampoDetalle etiqueta="Marca" valor={valorTexto(producto.marca)} />
                  <CampoDetalle etiqueta="Fabricante" valor={valorTexto(producto.fabricante)} />
                  <CampoDetalle etiqueta="Categoria" valor={producto.categoria?.nombre ?? "Sin categoria"} />
                  <CampoDetalle etiqueta="Categoria ID" valor={valorTexto(producto.categoriaId)} />
                  <CampoDetalle
                    etiqueta="Descripcion"
                    valor={descripcionResumen}
                    expandido
                  />
                </div>
              </section>

              <section className="rounded-[1.75rem] border border-slate-100 bg-white p-5 shadow-sm sm:p-6">
                <div className="flex items-center gap-2 text-slate-800">
                  <Hash size={18} className="text-emerald-600" />
                  <h3 className="text-sm font-black uppercase tracking-[0.22em]">
                    Inventario y precios
                  </h3>
                </div>

                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <CampoDetalle etiqueta="Cantidad actual" valor={formatearCantidad(producto.cantidadActual)} />
                  <CampoDetalle etiqueta="Cantidad minima" valor={formatearCantidad(producto.cantidadMinima)} />
                  <CampoDetalle etiqueta="Cantidad maxima" valor={formatearCantidad(producto.cantidadMaxima)} />
                  <CampoDetalle etiqueta="Sucursal ID" valor={valorTexto(producto.sucursalId)} />
                  <CampoDetalle etiqueta="Precio compra" valor={formatearMoneda(producto.precioCompra)} />
                  <CampoDetalle etiqueta="Precio venta" valor={formatearMoneda(producto.precioVenta)} />
                  <CampoDetalle
                    etiqueta="Estado"
                    valor={
                      <span
                        className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-black uppercase tracking-[0.18em] ${
                          producto.eliminado
                            ? "bg-red-50 text-red-700"
                            : "bg-emerald-50 text-emerald-700"
                        }`}
                      >
                        {producto.eliminado ? (
                          <>
                            <AlertCircle size={14} />
                            Eliminado
                          </>
                        ) : (
                          <>
                            <CheckCircle2 size={14} />
                            Activo
                          </>
                        )}
                      </span>
                    }
                  />
                  <CampoDetalle
                    etiqueta="Movimientos registrados"
                    valor={
                      producto.movimientos === undefined
                        ? "No informado por el API"
                        : `${producto.movimientos.length} movimiento(s)`
                    }
                  />
                </div>
              </section>

              <section className="rounded-[1.75rem] border border-slate-100 bg-white p-5 shadow-sm sm:p-6">
                <div className="flex items-center gap-2 text-slate-800">
                  <Calendar size={18} className="text-indigo-500" />
                  <h3 className="text-sm font-black uppercase tracking-[0.22em]">
                    Fechas y trazabilidad
                  </h3>
                </div>

                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <CampoDetalle
                    etiqueta="Fecha de vencimiento"
                    valor={formatearFecha(producto.fechaVencimiento)}
                  />
                  <CampoDetalle etiqueta="Creado" valor={formatearFecha(producto.createdAt, true)} />
                  <CampoDetalle
                    etiqueta="Ultima actualizacion"
                    valor={formatearFecha(producto.updatedAt, true)}
                  />
                  <CampoDetalle etiqueta="Imagen registrada" valor={producto.imagen || "No registrada"} />
                </div>
              </section>

              {producto.movimientos !== undefined && (
                <section className="rounded-[1.75rem] border border-slate-100 bg-slate-50/70 p-5 shadow-sm sm:p-6">
                  <div className="flex items-center gap-2 text-slate-800">
                    <Package size={18} className="text-orange-500" />
                    <h3 className="text-sm font-black uppercase tracking-[0.22em]">
                      Movimientos de stock
                    </h3>
                  </div>

                  <div className="mt-5 space-y-4">
                    {producto.movimientos.length === 0 ? (
                      <div className="rounded-[1.35rem] border border-dashed border-slate-200 bg-white px-4 py-5 text-sm text-slate-500">
                        No hay movimientos asociados a este producto.
                      </div>
                    ) : (
                      producto.movimientos.map((movimiento) => (
                        <MovimientoCard key={movimiento.id} movimiento={movimiento} />
                      ))
                    )}
                  </div>
                </section>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );

  const pieModal = (
    <div className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50/70 px-6 py-4 sm:flex-row sm:items-center sm:justify-end sm:px-8">
      <button
        type="button"
        onClick={onClose}
        className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-600 transition-all hover:border-slate-300 hover:text-slate-800"
      >
        {modo === "detalle" ? "Cerrar" : "Cancelar"}
      </button>

      {modo === "editar" && (
        <button
          type="submit"
          form="producto-edicion-form"
          disabled={guardando || subiendoImagen}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-cyan-600 px-5 py-3 text-sm font-bold text-white transition-all hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {(guardando || subiendoImagen) ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {subiendoImagen ? "Subiendo imagen..." : guardando ? "Guardando..." : "Guardar cambios"}
        </button>
      )}

      {modo === "eliminar" && (
        <button
          type="button"
          onClick={() => void onEliminar?.()}
          disabled={eliminando}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-red-600 px-5 py-3 text-sm font-bold text-white transition-all hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {eliminando ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
          {eliminando ? "Eliminando..." : "Eliminar producto"}
        </button>
      )}
    </div>
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative flex max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-[2rem] bg-white shadow-[0_30px_100px_-30px_rgba(15,23,42,0.55)]"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="producto-detalle-titulo"
      >
        <div className="border-b border-slate-100 bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.14),_transparent_36%),radial-gradient(circle_at_top_right,_rgba(16,185,129,0.14),_transparent_28%),linear-gradient(180deg,_rgba(248,250,252,0.98),_rgba(255,255,255,1))] px-6 py-5 sm:px-8">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[11px] font-black uppercase tracking-[0.28em] text-cyan-600/80">
                {tituloModal}
              </p>
              <h2
                id="producto-detalle-titulo"
                className="mt-2 truncate text-2xl font-black text-slate-800 sm:text-[2rem]"
              >
                {modo === "editar" ? formulario.nombre || producto.nombre : producto.nombre}
              </h2>
              <p className="mt-3 max-w-2xl text-sm text-slate-500">{subtituloModal}</p>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                  {referenciaResumen}
                </span>
                {estado && (
                  <span
                    className={`rounded-full border px-3 py-1 text-xs font-black uppercase tracking-[0.18em] ${claseEstado(
                      estado,
                    )}`}
                  >
                    {estado}
                  </span>
                )}
                {cargando && (
                  <span className="flex items-center gap-2 rounded-full border border-cyan-100 bg-cyan-50 px-3 py-1 text-xs font-bold text-cyan-700">
                    <Loader2 size={14} className="animate-spin" />
                    Actualizando detalle
                  </span>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 transition-all hover:border-slate-300 hover:text-slate-700"
              aria-label="Cerrar modal de producto"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {modo === "editar" ? (
          <form id="producto-edicion-form" onSubmit={manejarGuardar} className="contents">
            <div className="overflow-y-auto px-6 py-6 sm:px-8">{contenidoPrincipal}</div>
            {pieModal}
          </form>
        ) : (
          <>
            <div className="overflow-y-auto px-6 py-6 sm:px-8">{contenidoPrincipal}</div>
            {pieModal}
          </>
        )}
      </div>
    </div>
  );
}
