const GATEWAY_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3002/api/v1';
const GATEWAY_ORIGIN = GATEWAY_URL.replace(/\/api\/v1\/?$/, '');

/**
 * Convierte una ruta de imagen (relativa o absoluta) a una URL completa
 * accesible desde el navegador. Soporta rutas del microservicio y URLs externas.
 *
 * @param updatedAt  Si se provee, añade `?v=<timestamp>` para evitar caché
 *                   obsoleta del browser (especialmente tras cambios de gateway).
 */
export function resolveImageUrl(
  imagen?: string | null,
  updatedAt?: string | null,
): string | null {
  if (!imagen) return null;

  // URL absoluta o data URI — usar tal cual (sin cache-buster)
  if (/^(https?:)?\/\//i.test(imagen) || imagen.startsWith('data:')) return imagen;

  // Ruta relativa → construir URL completa con el origen del gateway
  const base = imagen.startsWith('/') ? `${GATEWAY_ORIGIN}${imagen}` : `${GATEWAY_ORIGIN}/${imagen}`;

  // Añadir cache-buster basado en updatedAt para evitar respuestas cacheadas incorrectas
  const ts = updatedAt ? new Date(updatedAt).getTime() : null;
  return ts ? `${base}?v=${ts}` : base;
}

export async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options?.headers as Record<string, string>),
  };

  // Solo inyectar si el token es un string válido y largo (un JWT real)
  if (token && token.length > 20) { 
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${GATEWAY_URL}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    if (res.status === 401) {
      console.error("No autorizado. Redirigiendo...");
      // Opcional: localStorage.removeItem('token'); window.location.href = '/login';
    }
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message ?? `Error ${res.status}`);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  const text = await res.text();
  if (!text) {
    return undefined as T;
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    return text as T;
  }
}

export const citasApi = {
  listar: () => apiFetch<Cita[]>('/citas'),
  obtener: (id: number) => apiFetch<Cita>(`/citas/${id}`),
  crear: (data: CrearCitaDto) =>
    apiFetch<Cita>('/citas', { method: 'POST', body: JSON.stringify(data) }),
  actualizar: (id: number, data: Partial<CrearCitaDto>) =>
    apiFetch<Cita>(`/citas/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  eliminar: (id: number) =>
    apiFetch<void>(`/citas/${id}`, { method: 'DELETE' }),
};

export const pacientesApi = {
  listar: () => apiFetch<any[]>('/pacientes'),
  obtener: (id: number | string) => apiFetch<any>(`/pacientes/${id}`),
  crear: (data: any) => apiFetch<any>('/pacientes', { method: 'POST', body: JSON.stringify(data) }),
  eliminar: (id: string | number) => apiFetch<void>(`/pacientes/${id}`, { method: 'DELETE' }),
  
  // AGREGA ESTA FUNCIÓN:
  actualizar: (id: string | number, data: any) => {
    // 1. Limpiamos el objeto para enviar solo datos planos (evitar enviar objetos anidados como cliente: {})
    const { cliente, sede, historiaClinica, ...datosLimpios } = data;

    // 2. Aseguramos que los IDs sean números si el backend los pide así
    if (datosLimpios.clienteId) datosLimpios.clienteId = Number(datosLimpios.clienteId);
    if (datosLimpios.sedeId) datosLimpios.sedeId = Number(datosLimpios.sedeId);

    return apiFetch<any>(`/pacientes/${id}`, { 
      method: 'PATCH', 
      body: JSON.stringify(datosLimpios) 
    });
  },
};

export const usuariosApi = {
  listar: () => apiFetch<Usuario[]>('/usuarios'),
};

export const sucursalesApi = {
  listar: () => apiFetch<Sucursal[]>('/sucursales'),
};

export const clientesApi = {
  listar: () => apiFetch<any[]>('/clientes'), 
  obtener: (id: string | number) => apiFetch<any>(`/clientes/${id}`),
  crear: (data: any) => apiFetch<any>('/clientes', { method: 'POST', body: JSON.stringify(data) }),
  // Nuevos métodos:
  actualizar: (id: string | number, data: any) => 
    apiFetch<any>(`/clientes/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  eliminar: (id: string | number) => 
    apiFetch<void>(`/clientes/${id}`, { method: 'DELETE' }),
};



// ── Types ────────────────────────────────────────────────────────────────────

export type EstadoCita = 'PENDIENTE' | 'CONFIRMADA' | 'EN_CURSO' | 'COMPLETADA' | 'CANCELADA';

export interface Cita {
  id: number;
  fecha: string;
  motivo: string;
  tipo: string;
  estado: EstadoCita;
  pacienteId: number;
  usuarioId?: number;
  paciente?: { id: number; nombre: string; especie: string; cliente: { nombres: string } };
  usuario?: { id: number; nombres: string; cargo: string; sucursal?: { nombre: string } };
  createdAt: string;
}

export interface CrearCitaDto {
  pacienteId: number;
  usuarioId?: number;
  fecha: string;
  motivo: string;
  tipo: string;
}

export interface Paciente {
  id: number;
  nombre: string;
  especie: string;
  raza: string;
  cliente: { id: number; nombres: string };
}

export interface Usuario {
  id: number;
  nombres: string;
  email: string;
  cargo: string;
  sucursalId?: number;
  sucursal?: { id: number; nombre: string; direccion: string };
}

export interface Sucursal {
  id: number;
  nombre: string;
  direccion: string;
}

export interface MovimientoStock {
  id: number;
  tipo: string;
  cantidad: number;
  cantidadAnterior: number;
  cantidadPosterior: number;
  motivo?: string;
  usuarioId?: number;
  sucursalId?: number;
  productoId: number;
  createdAt: string;
}

export interface Producto {
  id: number;
  nombre: string;
  descripcion?: string;
  codigoBarras?: string;
  codigoInterno?: string;
  marca?: string;
  fabricante?: string;
  precioCompra?: string;
  precioVenta: string;
  cantidadActual: number;
  cantidadMinima: number;
  cantidadMaxima?: number;
  fechaVencimiento?: string;
  imagen?: string;
  eliminado: boolean;
  createdAt: string;
  updatedAt: string;
  categoriaId?: number;
  sucursalId?: number;
  categoria?: { id: number; nombre: string; descripcion?: string };
  sucursal?: { id: number; nombre: string; direccion?: string };
  movimientos?: MovimientoStock[];
}

export interface ProductoMutationPayload {
  nombre?: string;
  descripcion?: string | null;
  codigoBarras?: string | null;
  codigoInterno?: string | null;
  marca?: string | null;
  fabricante?: string | null;
  precioCompra?: string | null;
  precioVenta?: string;
  cantidadActual?: number;
  cantidadMinima?: number;
  cantidadMaxima?: number | null;
  fechaVencimiento?: string | null;
  imagen?: string | null;
  categoriaId?: number | null;
  sucursalId?: number | null;
  eliminado?: boolean;
}

export interface FiltrosProducto {
  nombre?: string;
  codigo?: string;
  categoriaId?: number;
  stockBajo?: boolean;
}

export const productosApi = {
  listar: (filtros?: FiltrosProducto) => {
    const params = new URLSearchParams();
    if (filtros?.nombre)      params.set('nombre',      filtros.nombre);
    if (filtros?.codigo)      params.set('codigo',      filtros.codigo);
    if (filtros?.categoriaId) params.set('categoriaId', String(filtros.categoriaId));
    if (filtros?.stockBajo)   params.set('stockBajo',   'true');
    const qs = params.toString();
    return apiFetch<Producto[]>(`/productos${qs ? `?${qs}` : ''}`);
  },

  buscar: (q: string) =>
    apiFetch<Producto[]>(`/productos/buscar?q=${encodeURIComponent(q)}`),

  obtener: (id: number) =>
    apiFetch<Producto>(`/productos/${id}`),

  crear: (data: ProductoMutationPayload) =>
    apiFetch<Producto>('/productos', { method: 'POST', body: JSON.stringify(data) }),

  actualizar: (id: number, data: ProductoMutationPayload) =>
    apiFetch<Producto>(`/productos/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),

  eliminar: (id: number) =>
    apiFetch<void>(`/productos/${id}`, { method: 'DELETE' }),

  /** Sube una imagen al microservicio y actualiza el campo imagen del producto. */
  subirImagen: async (id: number, file: File): Promise<Producto> => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const formData = new FormData();
    formData.append('imagen', file);

    // NO incluir Content-Type: el navegador lo pone con el boundary correcto
    const headers: Record<string, string> = {};
    if (token && token.length > 20) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${GATEWAY_URL}/productos/${id}/imagen`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error((error as any).message ?? `Error ${res.status}`);
    }
    return res.json() as Promise<Producto>;
  },
};
