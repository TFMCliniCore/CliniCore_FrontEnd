const GATEWAY_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3002/api/v1';

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
  return res.json();
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
  fechaHora: string;
  motivo: string;
  notas?: string;
  estado: EstadoCita;
  pacienteId: number;
  usuarioId: number;
  sucursalId: number;
  paciente?: { id: number; nombre: string; especie: string; cliente: { nombres: string } };
  usuario?: { id: number; nombres: string; cargo: string };
  sucursal?: { id: number; nombre: string };
  createdAt: string;
}

export interface CrearCitaDto {
  pacienteId: number;
  usuarioId: number;
  sucursalId: number;
  fechaHora: string;
  motivo: string;
  notas?: string;
  estado?: EstadoCita;
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
}

export interface Sucursal {
  id: number;
  nombre: string;
  direccion: string;
}
