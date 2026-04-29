'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { citasApi, type Cita, type EstadoCita } from '@/lib/api';
import {
  Calendar, Plus, Clock, User, MapPin, Dog,
  CheckCircle2, XCircle, AlertCircle, PlayCircle,
  ChevronLeft, ChevronRight, RefreshCw, Filter
} from 'lucide-react';

const ESTADO_CONFIG: Record<EstadoCita, { label: string; color: string; icon: React.ElementType }> = {
  PENDIENTE:  { label: 'Pendiente',  color: 'bg-amber-100 text-amber-800 border-amber-200',   icon: AlertCircle  },
  CONFIRMADA: { label: 'Confirmada', color: 'bg-blue-100 text-blue-800 border-blue-200',       icon: CheckCircle2 },
  EN_CURSO:   { label: 'En curso',   color: 'bg-purple-100 text-purple-800 border-purple-200', icon: PlayCircle   },
  COMPLETADA: { label: 'Completada', color: 'bg-green-100 text-green-800 border-green-200',    icon: CheckCircle2 },
  CANCELADA:  { label: 'Cancelada',  color: 'bg-red-100 text-red-800 border-red-200',          icon: XCircle      },
};

const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
const DIAS  = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];

export default function AgendaPage() {
  const [citas, setCitas]           = useState<Cita[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState<string | null>(null);
  const [filtroEstado, setFiltroEstado] = useState<EstadoCita | 'TODAS'>('TODAS');
  const [hoy]                       = useState(new Date());
  const [mesActual, setMesActual]   = useState(new Date(hoy.getFullYear(), hoy.getMonth(), 1));
  const [diaSeleccionado, setDiaSeleccionado] = useState<Date | null>(hoy);

  const cargarCitas = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await citasApi.listar();
      setCitas(data);
    } catch {
      setError('No se pudo conectar con el servidor. Verifica que el API Gateway esté corriendo.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { cargarCitas(); }, [cargarCitas]);

  // ── Helpers ───────────────────────────────────────────────────────────────
  const citasPorDia = (fecha: Date) =>
    citas.filter(c => {
      const f = new Date(c.fechaHora);
      return f.getFullYear() === fecha.getFullYear() &&
             f.getMonth()    === fecha.getMonth()    &&
             f.getDate()     === fecha.getDate();
    });

  const citasFiltradas = citas.filter(c => {
    const matchEstado = filtroEstado === 'TODAS' || c.estado === filtroEstado;
    const matchDia = diaSeleccionado
      ? (() => { const f = new Date(c.fechaHora);
          return f.getFullYear() === diaSeleccionado.getFullYear() &&
                 f.getMonth()    === diaSeleccionado.getMonth()    &&
                 f.getDate()     === diaSeleccionado.getDate(); })()
      : true;
    return matchEstado && matchDia;
  });

  // ── Días del mes ──────────────────────────────────────────────────────────
  const primerDia  = new Date(mesActual.getFullYear(), mesActual.getMonth(), 1).getDay();
  const diasEnMes  = new Date(mesActual.getFullYear(), mesActual.getMonth() + 1, 0).getDate();
  const celdas     = Array.from({ length: primerDia + diasEnMes }, (_, i) =>
    i < primerDia ? null : new Date(mesActual.getFullYear(), mesActual.getMonth(), i - primerDia + 1)
  );

  const mesAnterior  = () => setMesActual(m => new Date(m.getFullYear(), m.getMonth() - 1, 1));
  const mesSiguiente = () => setMesActual(m => new Date(m.getFullYear(), m.getMonth() + 1, 1));

  const esMismaFecha = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

  return (
    <DashboardLayout>
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Calendar className="text-cyan-600" size={26} />
            Agenda de Citas
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {citas.length} cita{citas.length !== 1 ? 's' : ''} registrada{citas.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={cargarCitas} className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors" title="Actualizar">
            <RefreshCw size={18} className={loading ? 'animate-spin text-cyan-600' : 'text-gray-500'} />
          </button>
          <Link
            href="/agenda/nueva-cita"
            className="flex items-center gap-2 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700 text-white px-5 py-2.5 rounded-xl font-semibold text-sm shadow-md transition-all"
          >
            <Plus size={18} />
            Nueva Cita
          </Link>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center gap-2">
          <XCircle size={18} /> {error}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* CALENDARIO */}
        <div className="xl:col-span-1 bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          {/* Navegación mes */}
          <div className="flex items-center justify-between mb-4">
            <button onClick={mesAnterior} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
              <ChevronLeft size={18} className="text-gray-600" />
            </button>
            <h2 className="text-sm font-bold text-gray-800">
              {MESES[mesActual.getMonth()]} {mesActual.getFullYear()}
            </h2>
            <button onClick={mesSiguiente} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
              <ChevronRight size={18} className="text-gray-600" />
            </button>
          </div>

          {/* Cabecera días */}
          <div className="grid grid-cols-7 mb-2">
            {DIAS.map(d => (
              <div key={d} className="text-center text-[10px] font-bold text-gray-400 py-1">{d}</div>
            ))}
          </div>

          {/* Celdas */}
          <div className="grid grid-cols-7 gap-y-1">
            {celdas.map((dia, i) => {
              if (!dia) return <div key={`empty-${i}`} />;
              const citasDia   = citasPorDia(dia);
              const esHoy      = esMismaFecha(dia, hoy);
              const esSelec    = diaSeleccionado && esMismaFecha(dia, diaSeleccionado);
              return (
                <button
                  key={i}
                  onClick={() => setDiaSeleccionado(esSelec ? null : dia)}
                  className={`relative flex flex-col items-center py-1.5 rounded-xl text-xs font-medium transition-all
                    ${esSelec ? 'bg-cyan-600 text-white shadow-md' :
                      esHoy   ? 'bg-cyan-50 text-cyan-700 ring-2 ring-cyan-300' :
                                'text-gray-600 hover:bg-gray-50'}`}
                >
                  {dia.getDate()}
                  {citasDia.length > 0 && (
                    <span className={`w-1.5 h-1.5 rounded-full mt-0.5 ${esSelec ? 'bg-white' : 'bg-cyan-500'}`} />
                  )}
                </button>
              );
            })}
          </div>

          {/* Stats rápidas */}
          <div className="mt-5 pt-4 border-t border-gray-100 grid grid-cols-2 gap-2">
            {(['PENDIENTE','CONFIRMADA','EN_CURSO','COMPLETADA'] as EstadoCita[]).map(e => (
              <div key={e} className={`text-center py-2 rounded-xl border text-xs font-semibold ${ESTADO_CONFIG[e].color}`}>
                {citas.filter(c => c.estado === e).length} {ESTADO_CONFIG[e].label}
              </div>
            ))}
          </div>
        </div>

        {/* LISTA DE CITAS */}
        <div className="xl:col-span-2 space-y-4">

          {/* Filtros */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <div className="flex items-center gap-2 flex-wrap">
              <Filter size={15} className="text-gray-400" />
              {(['TODAS', 'PENDIENTE', 'CONFIRMADA', 'EN_CURSO', 'COMPLETADA', 'CANCELADA'] as const).map(e => (
                <button
                  key={e}
                  onClick={() => setFiltroEstado(e)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all
                    ${filtroEstado === e
                      ? 'bg-cyan-600 text-white border-cyan-600 shadow-sm'
                      : e === 'TODAS' ? 'border-gray-200 text-gray-600 hover:bg-gray-50'
                        : `${ESTADO_CONFIG[e].color} hover:opacity-80`}`}
                >
                  {e === 'TODAS' ? 'Todas' : ESTADO_CONFIG[e].label}
                </button>
              ))}
              {diaSeleccionado && (
                <span className="ml-auto text-xs text-cyan-600 font-semibold">
                  {diaSeleccionado.toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' })}
                </span>
              )}
            </div>
          </div>

          {/* Cards de citas */}
          {loading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => (
                <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-1/3 mb-3" />
                  <div className="h-3 bg-gray-100 rounded w-2/3" />
                </div>
              ))}
            </div>
          ) : citasFiltradas.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
              <Calendar size={40} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500 font-medium">No hay citas para mostrar</p>
              <p className="text-gray-400 text-sm mt-1">
                {diaSeleccionado ? 'Selecciona otro día o' : ''} Crea una nueva cita
              </p>
              <Link href="/agenda/nueva-cita"
                className="inline-flex items-center gap-2 mt-4 text-cyan-600 hover:text-cyan-700 text-sm font-semibold">
                <Plus size={16} /> Nueva Cita
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {citasFiltradas.map(cita => {
                const cfg   = ESTADO_CONFIG[cita.estado];
                const Icono = cfg.icon;
                const fecha = new Date(cita.fechaHora);
                return (
                  <div key={cita.id}
                    className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold border ${cfg.color}`}>
                            <Icono size={12} /> {cfg.label}
                          </span>
                          <span className="text-xs text-gray-400">#{cita.id}</span>
                        </div>
                        <h3 className="font-bold text-gray-900 text-sm mb-2 truncate">{cita.motivo}</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 text-xs text-gray-500">
                          <span className="flex items-center gap-1.5">
                            <Clock size={13} className="text-cyan-500 shrink-0" />
                            {fecha.toLocaleDateString('es-CO', { day:'numeric', month:'short' })} · {fecha.toLocaleTimeString('es-CO', { hour:'2-digit', minute:'2-digit' })}
                          </span>
                          <span className="flex items-center gap-1.5 truncate">
                            <Dog size={13} className="text-teal-500 shrink-0" />
                            {cita.paciente?.nombre ?? `Paciente #${cita.pacienteId}`}
                          </span>
                          <span className="flex items-center gap-1.5 truncate">
                            <User size={13} className="text-indigo-500 shrink-0" />
                            {cita.usuario?.nombres ?? `Usuario #${cita.usuarioId}`}
                          </span>
                        </div>
                        {cita.sucursal && (
                          <span className="flex items-center gap-1.5 text-xs text-gray-400 mt-1">
                            <MapPin size={12} className="text-gray-400 shrink-0" />
                            {cita.sucursal.nombre}
                          </span>
                        )}
                        {cita.notas && (
                          <p className="mt-2 text-xs text-gray-400 italic truncate">{cita.notas}</p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
