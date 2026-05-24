'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  Users, PawPrint, DollarSign, CalendarClock,
  TrendingUp, AlertTriangle, Plus,
  FileText, ChevronRight, Clock, CheckCircle2,
  Circle, Loader2, RefreshCw, ShoppingCart,
} from 'lucide-react';
import { citasApi } from '@/lib/api';
import type { Cita } from '@/lib/api';

interface KpiData {
  clientes: number;
  mascotas: number;
  ventasMes: number;
  citasHoy: number;
}

interface ProductoCritico {
  id: number;
  nombre: string;
  categoria: string;
  stockActual: number;
  stockMinimo: number;
  estado: 'critico' | 'bajo';
}

const estadoCitaMap: Record<string, { label: string; color: string }> = {
  PENDIENTE:  { label: 'Pendiente',  color: 'text-amber-600 bg-amber-50 border-amber-200'  },
  CONFIRMADA: { label: 'Confirmada', color: 'text-blue-600 bg-blue-50 border-blue-200'    },
  EN_CURSO:   { label: 'En curso',   color: 'text-teal-600 bg-teal-50 border-teal-200'    },
  COMPLETADA: { label: 'Completada', color: 'text-green-600 bg-green-50 border-green-200' },
  CANCELADA:  { label: 'Cancelada',  color: 'text-red-500 bg-red-50 border-red-200'       },
};

const mockKpi: KpiData = { clientes: 1284, mascotas: 842, ventasMes: 45200000, citasHoy: 14 };

const mockInventario: ProductoCritico[] = [
  { id: 1, nombre: 'Amoxicilina 250mg',  categoria: 'Antibióticos', stockActual: 4,  stockMinimo: 20, estado: 'critico' },
  { id: 2, nombre: 'Pienso Senior 15kg', categoria: 'Nutrición',    stockActual: 2,  stockMinimo: 10, estado: 'critico' },
  { id: 3, nombre: 'Vacuna Parvovirus',  categoria: 'Vacunas',      stockActual: 8,  stockMinimo: 15, estado: 'bajo'   },
  { id: 4, nombre: 'Jeringa 10ml',       categoria: 'Insumos',      stockActual: 12, stockMinimo: 30, estado: 'bajo'   },
];

const mockCitas: Cita[] = [
  { id: 1, fechaHora: new Date().toISOString(), motivo: 'Cirugía General', estado: 'CONFIRMADA', pacienteId: 1, usuarioId: 1, sucursalId: 1, createdAt: '', paciente: { id: 1, nombre: 'Luzon', especie: 'Perro', cliente: { nombres: 'Juan Pérez' } } },
  { id: 2, fechaHora: new Date().toISOString(), motivo: 'Vacunación', estado: 'PENDIENTE', pacienteId: 2, usuarioId: 1, sucursalId: 1, createdAt: '', paciente: { id: 2, nombre: 'Carla', especie: 'Gato', cliente: { nombres: 'María López' } } },
  { id: 3, fechaHora: new Date().toISOString(), motivo: 'Desparasitación', estado: 'PENDIENTE', pacienteId: 3, usuarioId: 1, sucursalId: 1, createdAt: '', paciente: { id: 3, nombre: 'Bruno', especie: 'Perro', cliente: { nombres: 'Ana García' } } },
];

const ventasSemana = [
  { semana: 'Sem 1', valor: 32 },
  { semana: 'Sem 2', valor: 48 },
  { semana: 'Sem 3', valor: 38 },
  { semana: 'Sem 4', valor: 72 },
];

const especieEmoji: Record<string, string> = { Perro: '🐶', Gato: '🐱', Ave: '🦜', Conejo: '🐰' };

function formatMoneda(n: number) {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n);
}

function formatHora(iso: string) {
  try { return new Date(iso).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }); }
  catch { return '--:--'; }
}

function Sparkline({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data), min = Math.min(...data), W = 100, H = 40;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * W},${H - ((v - min) / (max - min || 1)) * H}`).join(' ');
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-10" preserveAspectRatio="none">
      <defs><linearGradient id={`g${color}`} x1="0" x2="0" y1="0" y2="1">
        <stop offset="0%" stopColor={color} stopOpacity="0.25"/><stop offset="100%" stopColor={color} stopOpacity="0"/>
      </linearGradient></defs>
      <polygon points={`0,${H} ${pts} ${W},${H}`} fill={`url(#g${color})`}/>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export default function DashboardPage() {
  const [kpi, setKpi] = useState<KpiData | null>(null);
  const [citas, setCitas] = useState<Cita[]>([]);
  const [inventario] = useState<ProductoCritico[]>(mockInventario);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  const cargarDatos = useCallback(async () => {
    setLoading(true);
    try {
      const todasCitas = await citasApi.listar().catch(() => mockCitas);
      const hoy = new Date().toDateString();
      const citasDeHoy = todasCitas.filter((c) => new Date(c.fechaHora).toDateString() === hoy);
      setKpi({ ...mockKpi, citasHoy: citasDeHoy.length || mockKpi.citasHoy });
      setCitas((citasDeHoy.length ? citasDeHoy : mockCitas).slice(0, 5));
      setLastUpdate(new Date());
    } catch {
      setKpi(mockKpi);
      setCitas(mockCitas);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { cargarDatos(); }, [cargarDatos]);

  const kpiCards = [
    { label: 'Total Clientes',   value: kpi?.clientes.toLocaleString('es-CO') ?? '—',  icon: Users,        trend: '+12%', color: 'blue',    spark: [60,65,58,72,80,75,90], sc: '#3b82f6', href: '/clientes' },
    { label: 'Mascotas Activas', value: kpi?.mascotas.toLocaleString('es-CO') ?? '—',  icon: PawPrint,     trend: '+5%',  color: 'teal',    spark: [40,45,42,55,50,60,65], sc: '#14b8a6', href: '/mascotas' },
    { label: 'Ventas del Mes',   value: kpi ? formatMoneda(kpi.ventasMes) : '—',       icon: DollarSign,   trend: '+18%', color: 'emerald', spark: [30,48,38,52,70,65,80], sc: '#10b981', href: '/pos' },
    { label: 'Citas Hoy',        value: kpi?.citasHoy.toString() ?? '—',               icon: CalendarClock,trend: 'Hoy',  color: 'violet',  spark: [8,12,10,14,11,13,14],  sc: '#8b5cf6', href: '/agenda' },
  ];

  const cm: Record<string, { border: string; icon: string }> = {
    blue:    { border: 'border-blue-100',    icon: 'bg-blue-50 text-blue-600'     },
    teal:    { border: 'border-teal-100',    icon: 'bg-teal-50 text-teal-600'     },
    emerald: { border: 'border-emerald-100', icon: 'bg-emerald-50 text-emerald-600'},
    violet:  { border: 'border-violet-100',  icon: 'bg-violet-50 text-violet-600' },
  };

  const maxVenta = Math.max(...ventasSemana.map((v) => v.valor));

  return (
    <div className="space-y-6 pb-8">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5 flex items-center gap-1.5">
            Resumen general · CliniCore
            {loading && <Loader2 size={13} className="animate-spin text-teal-500"/>}
            {!loading && <span className="text-xs text-gray-400">· {lastUpdate.toLocaleTimeString('es-CO',{hour:'2-digit',minute:'2-digit'})}</span>}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={cargarDatos} className="p-2 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-teal-600 transition-colors" title="Actualizar">
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''}/>
          </button>
          <Link href="/agenda/nueva-cita" className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white hover:opacity-90 active:scale-95 transition-all" style={{background:'linear-gradient(135deg,#0e314d,#0a8661)'}}>
            <Plus size={16}/> Nueva Cita
          </Link>
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors">
            <FileText size={16}/> Reporte
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {kpiCards.map((card) => {
          const c = cm[card.color];
          const Icon = card.icon;
          return (
            <Link key={card.label} href={card.href} className={`bg-white rounded-2xl p-5 border ${c.border} hover:shadow-md hover:-translate-y-0.5 transition-all`}>
              <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${c.icon}`}><Icon size={20}/></div>
                <span className="flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg text-emerald-600 bg-emerald-50">
                  <TrendingUp size={11}/>{card.trend}
                </span>
              </div>
              <p className="text-sm text-gray-500 font-medium mb-1">{card.label}</p>
              <p className="text-2xl font-bold text-gray-900">{card.value}</p>
              <div className="mt-3 -mx-1"><Sparkline data={card.spark} color={card.sc}/></div>
            </Link>
          );
        })}
      </div>

      {/* Chart + Citas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Bar chart ventas */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-bold text-gray-900">Ventas del Mes</h2>
              <p className="text-sm text-gray-500">Comparativo semanal</p>
            </div>
            <span className="flex items-center gap-2 text-xs text-gray-400">
              <span className="w-3 h-3 rounded-full bg-teal-500 inline-block"/> Mes actual
            </span>
          </div>
          <div className="flex items-end gap-4 h-40 px-2">
            {ventasSemana.map((s, i) => {
              const pct = (s.valor / maxVenta) * 100;
              const isLast = i === ventasSemana.length - 1;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <span className="text-xs font-bold text-gray-500">${s.valor}k</span>
                  <div className="w-full rounded-t-xl" style={{height:`${pct}%`,minHeight:'8px',background:isLast?'linear-gradient(180deg,#0a8661,#0e314d)':'linear-gradient(180deg,#e2f4ef,#c5e8e0)'}}/>
                  <span className="text-xs text-gray-400 font-medium">{s.semana}</span>
                </div>
              );
            })}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-3 gap-4">
            <div><p className="text-xs text-gray-500">Ingresos mes</p><p className="text-sm font-bold text-gray-900">{formatMoneda(45200000)}</p></div>
            <div><p className="text-xs text-gray-500">Vs mes anterior</p><p className="text-sm font-bold text-emerald-600">+18.4%</p></div>
            <div><p className="text-xs text-gray-500">Ticket promedio</p><p className="text-sm font-bold text-gray-900">{formatMoneda(320000)}</p></div>
          </div>
        </div>

        {/* Citas del día */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-md transition-shadow flex flex-col">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-bold text-gray-900">Citas de Hoy</h2>
              <p className="text-sm text-gray-500">{new Date().toLocaleDateString('es-CO',{weekday:'long',day:'numeric',month:'long'})}</p>
            </div>
            <Link href="/agenda" className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1">Ver todas<ChevronRight size={14}/></Link>
          </div>
          <div className="flex-1 space-y-3">
            {loading ? Array.from({length:3}).map((_,i)=>(
              <div key={i} className="animate-pulse flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                <div className="w-10 h-10 bg-gray-200 rounded-full"/><div className="flex-1 space-y-2"><div className="h-3 bg-gray-200 rounded w-3/4"/><div className="h-3 bg-gray-200 rounded w-1/2"/></div>
              </div>
            )) : citas.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-gray-400">
                <CalendarClock size={32} className="mb-2 opacity-40"/><p className="text-sm">Sin citas para hoy</p>
              </div>
            ) : citas.map((cita) => {
              const cfg = estadoCitaMap[cita.estado] ?? estadoCitaMap.PENDIENTE;
              const emoji = especieEmoji[cita.paciente?.especie ?? ''] ?? '🐾';
              return (
                <div key={cita.id} className="flex items-center gap-3 p-3 rounded-xl border border-transparent hover:border-gray-100 hover:bg-gray-50 transition-all cursor-pointer">
                  <div className="w-10 h-10 rounded-full bg-teal-50 border border-teal-100 flex items-center justify-center text-lg flex-shrink-0">{emoji}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{cita.paciente?.nombre} — {cita.paciente?.cliente?.nombres}</p>
                    <p className="text-xs text-gray-500 truncate">{cita.motivo} · {formatHora(cita.fechaHora)}</p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${cfg.color} flex-shrink-0`}>{cfg.label}</span>
                </div>
              );
            })}
          </div>
          <Link href="/agenda/nueva-cita" className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-dashed border-teal-200 text-teal-600 text-sm font-semibold hover:bg-teal-50 transition-colors">
            <Plus size={16}/> Agregar cita
          </Link>
        </div>
      </div>

      {/* Inventario crítico */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-red-50 border border-red-100 flex items-center justify-center">
              <AlertTriangle size={16} className="text-red-500"/>
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">Inventario Crítico</h2>
              <p className="text-xs text-gray-500">{inventario.length} productos bajo mínimo</p>
            </div>
          </div>
          <Link href="/inventario" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
            <ShoppingCart size={13}/> Gestionar stock
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[11px] font-bold uppercase tracking-wider text-gray-400 border-b border-gray-100 bg-gray-50">
                <th className="px-6 py-3">Producto</th>
                <th className="px-6 py-3">Categoría</th>
                <th className="px-6 py-3">Stock actual</th>
                <th className="px-6 py-3">Mínimo</th>
                <th className="px-6 py-3">Estado</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {inventario.map((prod) => (
                <tr key={prod.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900">{prod.nombre}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{prod.categoria}</td>
                  <td className="px-6 py-4"><span className={`text-sm font-bold ${prod.estado==='critico'?'text-red-600':'text-amber-600'}`}>{prod.stockActual} und</span></td>
                  <td className="px-6 py-4 text-sm text-gray-400">{prod.stockMinimo} und</td>
                  <td className="px-6 py-4">
                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${prod.estado==='critico'?'bg-red-50 text-red-600 border border-red-200':'bg-amber-50 text-amber-600 border border-amber-200'}`}>
                      {prod.estado==='critico'?'Crítico':'Bajo stock'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button className="opacity-0 group-hover:opacity-100 text-xs font-semibold text-teal-600 hover:text-teal-700 transition-all flex items-center gap-1">
                      Reponer<ChevronRight size={13}/>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
