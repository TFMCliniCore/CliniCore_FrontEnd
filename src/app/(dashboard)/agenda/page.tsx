'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';

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
  const [citas, setCitas] = useState<Cita[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtroEstado, setFiltroEstado] = useState<EstadoCita | 'TODAS'>('TODAS');
  const [hoy] = useState(new Date());
  const [mesActual, setMesActual] = useState(new Date(hoy.getFullYear(), hoy.getMonth(), 1));
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

  const citasPorDia = (fecha: Date) =>
    citas.filter(c => {
      const f = new Date(c.fechaHora);
      return f.getFullYear() === fecha.getFullYear() &&
             f.getMonth() === fecha.getMonth() &&
             f.getDate() === fecha.getDate();
    });

  const citasFiltradas = citas.filter(c => {
    const matchEstado = filtroEstado === 'TODAS' || c.estado === filtroEstado;
    const matchDia = diaSeleccionado
      ? (() => {
          const f = new Date(c.fechaHora);
          return f.getFullYear() === diaSeleccionado.getFullYear() &&
                 f.getMonth() === diaSeleccionado.getMonth() &&
                 f.getDate() === diaSeleccionado.getDate();
        })()
      : true;
    return matchEstado && matchDia;
  });

  const primerDia = new Date(mesActual.getFullYear(), mesActual.getMonth(), 1).getDay();
  const diasEnMes = new Date(mesActual.getFullYear(), mesActual.getMonth() + 1, 0).getDate();

  const celdas = Array.from({ length: primerDia + diasEnMes }, (_, i) =>
    i < primerDia ? null : new Date(mesActual.getFullYear(), mesActual.getMonth(), i - primerDia + 1)
  );

  const mesAnterior = () => setMesActual(m => new Date(m.getFullYear(), m.getMonth() - 1, 1));
  const mesSiguiente = () => setMesActual(m => new Date(m.getFullYear(), m.getMonth() + 1, 1));

  const esMismaFecha = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  return (
    <>
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
          <button onClick={cargarCitas} className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50">
            <RefreshCw size={18} className={loading ? 'animate-spin text-cyan-600' : 'text-gray-500'} />
          </button>

          <Link
            href="/agenda/nueva-cita"
            className="flex items-center gap-2 bg-cyan-600 text-white px-5 py-2.5 rounded-xl text-sm"
          >
            <Plus size={18} />
            Nueva Cita
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-y-1">
        {celdas.map((dia, i) => {
          if (!dia) return <div key={`empty-${i}`} />;

          const citasDia = citasPorDia(dia);
          const esHoy = esMismaFecha(dia, hoy);
          const esSelec = diaSeleccionado && esMismaFecha(dia, diaSeleccionado);

          return (
            <button
              key={i}
              onClick={() => setDiaSeleccionado(esSelec ? null : dia)}
              className={`py-2 text-xs rounded-lg
                ${esSelec ? 'bg-cyan-600 text-white' :
                  esHoy ? 'bg-cyan-100' :
                  'hover:bg-gray-100'}`}
            >
              {dia.getDate()}
              {citasDia.length > 0 && <div className="w-1 h-1 bg-cyan-500 mx-auto mt-1 rounded-full" />}
            </button>
          );
        })}
      </div>
    </>
  );
}