const GATEWAY_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3002/api/v1';

export async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${GATEWAY_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  });
  if (!res.ok) {
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
  listar: () => apiFetch<Paciente[]>('/pacientes'),
};

export const usuariosApi = {
  listar: () => apiFetch<Usuario[]>('/usuarios'),
};

export const sucursalesApi = {
  listar: () => apiFetch<Sucursal[]>('/sucursales'),
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
