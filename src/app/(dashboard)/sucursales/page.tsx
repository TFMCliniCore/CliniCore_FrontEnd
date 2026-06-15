'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Building2, CheckCircle2, Wrench, Stethoscope,
  MapPin, Phone, Clock, Plus, Pencil, Settings,
  RefreshCw, Loader2, AlertTriangle, Info, ShieldCheck,
  ChevronRight, Search, X,
} from 'lucide-react';
import { sucursalesApi } from '@/lib/api';
import type { Sucursal } from '@/lib/api';

// ── Extended type with mock fields ───────────────────────────────────────────

interface SucursalExtended extends Sucursal {
  estado: 'activa' | 'inactiva' | 'mantenimiento';
  telefono: string;
  horario: string;
  manager: string;
  especialidades: number;
  pacientesActivos: number;
  color: string;
}

// ── Modal nueva sucursal ──────────────────────────────────────────────────────

interface ModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: { nombre: string; direccion: string }) => void;
}

function ModalNuevaSucursal({ open, onClose, onSave }: ModalProps) {
  const [nombre, setNombre] = useState('');
  const [direccion, setDireccion] = useState('');
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-[slideUp_0.3s_ease]">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-gray-900">Nueva Sucursal</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"><X size={18} /></button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Nombre</label>
            <input value={nombre} onChange={e => setNombre(e.target.value)}
              placeholder="Ej. Sede Occidente"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 bg-gray-50 focus:bg-white transition-all" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Dirección</label>
            <input value={direccion} onChange={e => setDireccion(e.target.value)}
              placeholder="Ej. Cra. 50 #45-20, Bogotá"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 bg-gray-50 focus:bg-white transition-all" />
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">Cancelar</button>
          <button
            onClick={() => { if (nombre && direccion) { onSave({ nombre, direccion }); setNombre(''); setDireccion(''); } }}
            disabled={!nombre || !direccion}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50 hover:opacity-90 transition-all"
            style={{ background: 'linear-gradient(135deg,#0e314d,#0a8661)' }}>
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Colors por sucursal ───────────────────────────────────────────────────────

const COLORS = ['from-teal-600 to-cyan-500', 'from-blue-600 to-indigo-500', 'from-emerald-600 to-teal-500', 'from-violet-600 to-purple-500', 'from-rose-600 to-pink-500'];

const MOCK_EXTRA: Omit<SucursalExtended, 'id' | 'nombre' | 'direccion'>[] = [
  { estado: 'activa',       telefono: '+57 (1) 456-7890', horario: '08:00 – 20:00', manager: 'Dra. Elena Martínez', especialidades: 6, pacientesActivos: 142, color: COLORS[0] },
  { estado: 'activa',       telefono: '+57 (1) 555-1234', horario: '24 Horas',      manager: 'Dr. Roberto Sánchez', especialidades: 8, pacientesActivos: 89,  color: COLORS[1] },
  { estado: 'mantenimiento',telefono: '+57 (1) 334-9988', horario: 'En remodelación',manager: 'Dra. Clara Fuentes', especialidades: 4, pacientesActivos: 0,   color: COLORS[2] },
  { estado: 'activa',       telefono: '+57 (1) 223-4455', horario: '09:00 – 19:00', manager: 'Dr. Hugo Méndez',    especialidades: 5, pacientesActivos: 63,  color: COLORS[3] },
];

const ALERTS = [
  { tipo: 'error',   icon: AlertTriangle, titulo: 'Sede Este fuera de línea',      desc: 'Conexión perdida con el sistema de farmacia.',          tiempo: 'Hace 15 min'  },
  { tipo: 'info',    icon: Info,          titulo: 'Mantenimiento Sede Norte',       desc: 'Programado para este domingo a las 22:00.',            tiempo: 'Hace 2 horas' },
  { tipo: 'success', icon: ShieldCheck,   titulo: 'Auditoría Exitosa',              desc: 'Sede Central cumple 100% de los protocolos.',          tiempo: 'Hace 1 día'   },
];

const alertStyles: Record<string, string> = {
  error:   'border-l-red-400 bg-red-50',
  info:    'border-l-blue-400 bg-blue-50',
  success: 'border-l-emerald-400 bg-emerald-50',
};
const alertIconStyles: Record<string, string> = {
  error: 'text-red-500', info: 'text-blue-500', success: 'text-emerald-500',
};

const estadoBadge: Record<string, string> = {
  activa:       'bg-emerald-100 text-emerald-700 border-emerald-200',
  inactiva:     'bg-gray-100 text-gray-500 border-gray-200',
  mantenimiento:'bg-amber-100 text-amber-700 border-amber-200',
};
const estadoLabel: Record<string, string> = {
  activa: 'Activa', inactiva: 'Inactiva', mantenimiento: 'Mantenimiento',
};

// ── Page ─────────────────────────────────────────────────────────────────────

export default function SucursalesPage() {
  const [sucursales, setSucursales] = useState<SucursalExtended[]>([]);
  const [loading, setLoading]       = useState(true);
  const [busqueda, setBusqueda]     = useState('');
  const [filtro, setFiltro]         = useState<'todas' | 'activa' | 'mantenimiento'>('todas');
  const [modal, setModal]           = useState(false);

  const cargar = useCallback(async () => {
    setLoading(true);
    try {
      const data = await sucursalesApi.listar().catch(() => [
        { id: 1, nombre: 'Sede Norte',    direccion: 'Av. Libertadores 452, Sector Norte' },
        { id: 2, nombre: 'Sede Central',  direccion: 'Plaza Mayor 10, Edificio Ágora'     },
        { id: 3, nombre: 'Sede Este',     direccion: 'Camino Real 882, Parque Industrial' },
        { id: 4, nombre: 'Sede Sur',      direccion: 'Calle 44 Sur #12-34, Los Lagos'     },
      ] as Sucursal[]);

      const extended: SucursalExtended[] = data.map((s, i) => ({
        ...s,
        ...(MOCK_EXTRA[i % MOCK_EXTRA.length]),
      }));
      setSucursales(extended);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  const handleNueva = (data: { nombre: string; direccion: string }) => {
    const nueva: SucursalExtended = {
      id: Date.now(),
      nombre: data.nombre,
      direccion: data.direccion,
      estado: 'activa',
      telefono: '—',
      horario: '—',
      manager: 'Sin asignar',
      especialidades: 0,
      pacientesActivos: 0,
      color: COLORS[sucursales.length % COLORS.length],
    };
    setSucursales(prev => [...prev, nueva]);
    setModal(false);
  };

  const filtradas = sucursales.filter(s => {
    const coincide = s.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
                     s.direccion.toLowerCase().includes(busqueda.toLowerCase());
    if (filtro === 'todas') return coincide;
    return coincide && s.estado === filtro;
  });

  const stats = {
    total:        sucursales.length,
    activas:      sucursales.filter(s => s.estado === 'activa').length,
    mantenimiento:sucursales.filter(s => s.estado === 'mantenimiento').length,
    especialidades:sucursales.reduce((a, s) => a + s.especialidades, 0),
  };

  return (
    <div className="space-y-6 pb-8">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Sedes</h1>
          <p className="text-sm text-gray-500 mt-1 max-w-xl">
            Administra las ubicaciones de CliniCore, supervisa su operación y los responsables de cada centro.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={cargar} className="p-2 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-teal-600 transition-colors" title="Actualizar">
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
          <button onClick={() => setModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white hover:opacity-90 active:scale-95 transition-all"
            style={{ background: 'linear-gradient(135deg,#0e314d,#0a8661)' }}>
            <Plus size={16} /> Nueva Sucursal
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Sedes',    value: stats.total,         icon: Building2,    color: 'text-blue-600 bg-blue-50 border-blue-100'    },
          { label: 'Activas',        value: stats.activas,       icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
          { label: 'Especialidades', value: stats.especialidades, icon: Stethoscope, color: 'text-violet-600 bg-violet-50 border-violet-100' },
          { label: 'Mantenimiento',  value: stats.mantenimiento, icon: Wrench,       color: 'text-amber-600 bg-amber-50 border-amber-100'  },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-white rounded-2xl p-4 border border-gray-100 hover:shadow-sm transition-shadow flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${s.color}`}>
                <Icon size={22} />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">{s.label}</p>
                {loading
                  ? <div className="h-6 w-8 bg-gray-200 rounded animate-pulse mt-1" />
                  : <p className="text-xl font-bold text-gray-900">{s.value}</p>}
              </div>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={busqueda} onChange={e => setBusqueda(e.target.value)}
            placeholder="Buscar sedes…"
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 transition-all" />
        </div>
        <div className="flex gap-2">
          {(['todas', 'activa', 'mantenimiento'] as const).map((f) => (
            <button key={f} onClick={() => setFiltro(f)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${filtro === f ? 'text-white border-teal-600' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
              style={filtro === f ? { background: 'linear-gradient(135deg,#0e314d,#0a8661)' } : {}}>
              {f === 'todas' ? 'Todas' : f === 'activa' ? 'Activas' : 'Mantenimiento'}
            </button>
          ))}
        </div>
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
                <div className="h-28 bg-gray-200" />
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-2/3" />
                  <div className="h-3 bg-gray-200 rounded w-full" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            ))
          : filtradas.map((s) => (
              <div key={s.id}
                className={`bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all group flex flex-col ${s.estado === 'mantenimiento' ? 'opacity-80' : ''}`}>

                {/* Image header */}
                <div className={`h-28 bg-gradient-to-r ${s.color} relative flex items-end p-4`}>
                  <div className="absolute inset-0 bg-black/10" />
                  <div className="absolute top-3 right-3">
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border backdrop-blur-sm ${estadoBadge[s.estado]}`}>
                      {estadoLabel[s.estado]}
                    </span>
                  </div>
                  {/* Initial avatar */}
                  <div className="relative z-10 w-11 h-11 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center text-white font-black text-lg">
                    {s.nombre.charAt(0)}
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col">
                  {/* Name + address */}
                  <div className="mb-4">
                    <h3 className="text-base font-bold text-gray-900">{s.nombre}</h3>
                    <div className="flex items-start gap-1.5 mt-1">
                      <MapPin size={13} className="text-gray-400 mt-0.5 flex-shrink-0" />
                      <span className="text-xs text-gray-500 leading-relaxed">{s.direccion}</span>
                    </div>
                  </div>

                  {/* Manager */}
                  <div className="flex items-center gap-2.5 mb-4">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {s.manager.split(' ').pop()?.charAt(0) ?? 'M'}
                    </div>
                    <div>
                      <p className="text-[11px] text-gray-400">Manager</p>
                      <p className="text-xs font-semibold text-gray-700">{s.manager}</p>
                    </div>
                  </div>

                  {/* Phone + hours */}
                  <div className={`flex items-center justify-between py-3 border-y border-gray-100 mb-4 ${s.estado === 'mantenimiento' ? 'opacity-50' : ''}`}>
                    <div className="flex items-center gap-1.5">
                      <Phone size={12} className="text-teal-500" />
                      <span className="text-xs text-gray-600">{s.telefono}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock size={12} className="text-teal-500" />
                      <span className="text-xs text-gray-600">{s.horario}</span>
                    </div>
                  </div>

                  {/* Stats row */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-gray-50 rounded-xl p-3 text-center">
                      <p className="text-xs text-gray-400 mb-0.5">Especialidades</p>
                      <p className="text-base font-bold text-gray-900">{s.especialidades}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3 text-center">
                      <p className="text-xs text-gray-400 mb-0.5">Pacientes</p>
                      <p className="text-base font-bold text-gray-900">{s.pacientesActivos}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 mt-auto">
                    <button className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
                      <ChevronRight size={13} /> {s.estado === 'inactiva' ? 'Activar' : 'Detalles'}
                    </button>
                    <button className="p-2 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-teal-600 transition-colors">
                      {s.estado === 'mantenimiento' ? <Settings size={15} /> : <Pencil size={15} />}
                    </button>
                  </div>
                </div>
              </div>
            ))}

        {/* Add new placeholder */}
        {!loading && (
          <button onClick={() => setModal(true)}
            className="border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center p-12 hover:border-teal-300 hover:bg-teal-50/30 transition-all group min-h-[300px]">
            <div className="w-14 h-14 rounded-full bg-gray-100 group-hover:bg-teal-100 flex items-center justify-center transition-colors mb-3">
              <Plus size={24} className="text-gray-400 group-hover:text-teal-600 transition-colors" />
            </div>
            <span className="text-sm font-semibold text-gray-400 group-hover:text-teal-600 transition-colors">Añadir Nueva Sede</span>
          </button>
        )}
      </div>

      {/* Map + Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Map placeholder */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-gray-900">Vista Geográfica</h2>
            <div className="flex gap-2">
              {['Satélite', 'Relieve'].map((v, i) => (
                <span key={v} className={`text-[11px] px-2.5 py-1 rounded-lg border font-semibold ${i === 0 ? 'bg-teal-50 text-teal-700 border-teal-200' : 'bg-gray-50 text-gray-500 border-gray-200'}`}>{v}</span>
              ))}
            </div>
          </div>
          <div className="aspect-video w-full rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 border border-gray-200 flex items-center justify-center relative overflow-hidden">
            {/* Grid pattern */}
            <div className="absolute inset-0 opacity-30"
              style={{ backgroundImage: 'linear-gradient(rgba(14,165,233,0.2) 1px,transparent 1px),linear-gradient(90deg,rgba(14,165,233,0.2) 1px,transparent 1px)', backgroundSize: '40px 40px' }} />
            {/* Mock pins */}
            {[{x:'20%',y:'35%'},{x:'50%',y:'50%'},{x:'70%',y:'30%'},{x:'40%',y:'65%'}].map((p, i) => (
              <div key={i} className="absolute" style={{ left: p.x, top: p.y }}>
                <div className="w-3 h-3 rounded-full bg-teal-500 border-2 border-white shadow-md" />
              </div>
            ))}
            <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-teal-200 px-4 py-2 rounded-full shadow-sm z-10">
              <MapPin size={15} className="text-teal-500 animate-bounce" />
              <span className="text-xs font-semibold text-gray-700">Mapa interactivo — próximamente</span>
            </div>
          </div>
        </div>

        {/* Alerts */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="text-base font-bold text-gray-900 mb-5">Alertas Recientes</h2>
          <div className="space-y-3">
            {ALERTS.map((a, i) => {
              const Icon = a.icon;
              return (
                <div key={i} className={`flex gap-3 p-3 rounded-xl border-l-4 ${alertStyles[a.tipo]}`}>
                  <Icon size={15} className={`flex-shrink-0 mt-0.5 ${alertIconStyles[a.tipo]}`} />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-gray-900">{a.titulo}</p>
                    <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{a.desc}</p>
                    <p className="text-[11px] text-gray-400 mt-1.5">{a.tiempo}</p>
                  </div>
                </div>
              );
            })}
          </div>
          <button className="w-full mt-4 pt-4 border-t border-gray-100 text-xs font-semibold text-gray-400 hover:text-teal-600 transition-colors flex items-center justify-center gap-1">
            Ver historial de logs <ChevronRight size={13} />
          </button>
        </div>
      </div>

      {/* Modal */}
      <ModalNuevaSucursal open={modal} onClose={() => setModal(false)} onSave={handleNueva} />
    </div>
  );
}
