'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Users, Stethoscope, CheckCircle2, ShieldCheck,
  Search, Plus, Pencil, KeyRound, ChevronLeft, ChevronRight,
  RefreshCw, X, Circle,
} from 'lucide-react';
import { apiFetch } from '@/lib/api';
import type { Usuario } from '@/lib/api';

// ── Types ─────────────────────────────────────────────────────────────────────

type Rol = 'Veterinario' | 'Admin' | 'Recepcionista' | 'Superadmin';
type Estado = 'activo' | 'inactivo';

interface UsuarioExtended extends Usuario {
  username: string;
  rol: Rol;
  sucursal: string;
  estado: Estado;
  cargo: string;
}

// ── Config ────────────────────────────────────────────────────────────────────

const ROL_BADGE: Record<Rol, string> = {
  Veterinario:  'bg-blue-50 text-blue-700 border-blue-200',
  Admin:        'bg-violet-50 text-violet-700 border-violet-200',
  Recepcionista:'bg-gray-100 text-gray-600 border-gray-200',
  Superadmin:   'bg-teal-50 text-teal-700 border-teal-200',
};

const ROLES_RESUMEN = [
  { rol: 'Administrador',  desc: 'Acceso total a finanzas y configuración',      count: 4,  color: 'text-violet-600' },
  { rol: 'Veterinario',    desc: 'Gestión médica, farmacia e historias clínicas', count: 12, color: 'text-blue-600'   },
  { rol: 'Recepcionista',  desc: 'Citas, POS y gestión básica de clientes',       count: 26, color: 'text-gray-600'   },
];

const ACTIVIDAD = [
  { texto: 'Alejandro Ruiz editó el perfil de Carlos Méndez', tiempo: 'Hace 12 min', color: 'bg-blue-500'  },
  { texto: 'Nuevo usuario creado: mfernanda_adm',             tiempo: 'Hace 2 horas', color: 'bg-violet-500'},
  { texto: 'Sistema generó reporte de auditoría de accesos',  tiempo: 'Ayer 18:45',  color: 'bg-gray-400'  },
];

const MOCK_USUARIOS: UsuarioExtended[] = [
  { id: 1, nombres: 'Alejandro Ruiz',  email: 'aruiz@clinica.com',     cargo: 'Médico Principal',      username: 'aruiz_vet',     rol: 'Veterinario',   sucursal: 'Sede Norte',   estado: 'activo'   },
  { id: 2, nombres: 'Maria Fernanda',  email: 'mfernanda@clinica.com', cargo: 'Administración Central', username: 'mfernanda_adm', rol: 'Admin',         sucursal: 'Sede Central', estado: 'activo'   },
  { id: 3, nombres: 'Carlos Méndez',   email: 'cmendez@clinica.com',   cargo: 'Atención al Cliente',   username: 'cmendez_recep', rol: 'Recepcionista', sucursal: 'Sede Sur',     estado: 'inactivo' },
  { id: 4, nombres: 'Lucía Gómez',     email: 'lgomez@clinica.com',    cargo: 'Médico Cirujano',        username: 'lgomez_surg',   rol: 'Veterinario',   sucursal: 'Sede Central', estado: 'activo'   },
  { id: 5, nombres: 'Pedro Villamizar',email: 'pvillamizar@clinica.com',cargo: 'Farmacéutico',          username: 'pvillamizar',   rol: 'Veterinario',   sucursal: 'Sede Norte',   estado: 'activo'   },
  { id: 6, nombres: 'Sandra Ospina',   email: 'sospina@clinica.com',   cargo: 'Superadministrador',    username: 'sospina_sa',    rol: 'Superadmin',    sucursal: 'Todas',        estado: 'activo'   },
];

const PER_PAGE = 5;

// ── Modal ─────────────────────────────────────────────────────────────────────

function ModalUsuario({ open, onClose, onSave }: { open: boolean; onClose: () => void; onSave: (u: Partial<UsuarioExtended>) => void }) {
  const [form, setForm] = useState({ nombres: '', email: '', cargo: '', rol: 'Recepcionista' as Rol, sucursal: 'Sede Norte' });
  if (!open) return null;
  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-gray-900">Nuevo Usuario</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"><X size={18} /></button>
        </div>
        <div className="space-y-3">
          {[['nombres','Nombre completo','text'],['email','Correo electrónico','email'],['cargo','Cargo','text']].map(([k,ph,t]) => (
            <div key={k}>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">{ph}</label>
              <input type={t} value={(form as any)[k]} onChange={e => set(k, e.target.value)} placeholder={ph}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 bg-gray-50 focus:bg-white transition-all" />
            </div>
          ))}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Rol</label>
              <select value={form.rol} onChange={e => set('rol', e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-teal-400 bg-gray-50 transition-all">
                {['Veterinario','Admin','Recepcionista','Superadmin'].map(r => <option key={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Sucursal</label>
              <select value={form.sucursal} onChange={e => set('sucursal', e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-teal-400 bg-gray-50 transition-all">
                {['Sede Norte','Sede Central','Sede Sur','Todas'].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
        </div>
        <div className="flex gap-3 mt-5">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50">Cancelar</button>
          <button onClick={() => { onSave({ ...form, username: form.email.split('@')[0], estado: 'activo', id: Date.now() }); onClose(); }}
            disabled={!form.nombres || !form.email}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50 hover:opacity-90"
            style={{ background: 'linear-gradient(135deg,#0e314d,#0a8661)' }}>Guardar</button>
        </div>
      </div>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<UsuarioExtended[]>([]);
  const [loading, setLoading]   = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [rolFiltro, setRolFiltro] = useState('');
  const [sucFiltro, setSucFiltro] = useState('');
  const [pagina, setPagina]     = useState(1);
  const [modal, setModal]       = useState(false);

  const cargar = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiFetch<Usuario[]>('/usuarios').catch(() => []);
      const ext: UsuarioExtended[] = (data.length ? data.map((u, i) => ({
        ...u,
        username: u.email.split('@')[0],
        rol: (['Veterinario','Admin','Recepcionista','Superadmin'] as Rol[])[i % 4],
        sucursal: ['Sede Norte','Sede Central','Sede Sur'][i % 3],
        estado: i % 5 === 2 ? 'inactivo' : 'activo',
      })) : MOCK_USUARIOS);
      setUsuarios(ext);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  const filtrados = usuarios.filter(u => {
    const q = busqueda.toLowerCase();
    return (!q || u.nombres.toLowerCase().includes(q) || u.email.includes(q) || u.username.includes(q))
      && (!rolFiltro || u.rol === rolFiltro)
      && (!sucFiltro || u.sucursal === sucFiltro);
  });

  const totalPag = Math.ceil(filtrados.length / PER_PAGE);
  const pagActual = filtrados.slice((pagina - 1) * PER_PAGE, pagina * PER_PAGE);

  const stats = {
    total:    usuarios.length,
    vets:     usuarios.filter(u => u.rol === 'Veterinario').length,
    activos:  usuarios.filter(u => u.estado === 'activo').length,
    admins:   usuarios.filter(u => u.rol === 'Admin' || u.rol === 'Superadmin').length,
  };

  const initials = (n: string) => n.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const avatarColor = (id: number) => ['from-teal-400 to-cyan-500','from-blue-400 to-indigo-500','from-violet-400 to-purple-500','from-rose-400 to-pink-500','from-amber-400 to-orange-500'][id % 5];

  return (
    <div className="space-y-6 pb-8">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Usuarios</h1>
          <p className="text-sm text-gray-500 mt-1">Administra accesos, roles y permisos del personal.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={cargar} className="p-2 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-teal-600 transition-colors">
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
          <button onClick={() => setModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white hover:opacity-90 active:scale-95 transition-all"
            style={{ background: 'linear-gradient(135deg,#0e314d,#0a8661)' }}>
            <Plus size={16} /> Nuevo Usuario
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Usuarios',    value: stats.total,   icon: Users,        color: 'text-blue-600 bg-blue-50 border-blue-100'      },
          { label: 'Veterinarios',      value: stats.vets,    icon: Stethoscope,  color: 'text-violet-600 bg-violet-50 border-violet-100' },
          { label: 'Activos',           value: stats.activos, icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-50 border-emerald-100'},
          { label: 'Administradores',   value: stats.admins,  icon: ShieldCheck,  color: 'text-amber-600 bg-amber-50 border-amber-100'    },
        ].map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-white rounded-2xl p-4 border border-gray-100 flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${s.color}`}><Icon size={22} /></div>
              <div>
                <p className="text-xs text-gray-500 font-medium">{s.label}</p>
                {loading ? <div className="h-6 w-8 bg-gray-200 rounded animate-pulse mt-1" />
                  : <p className="text-xl font-bold text-gray-900">{s.value}</p>}
              </div>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={busqueda} onChange={e => { setBusqueda(e.target.value); setPagina(1); }}
            placeholder="Buscar por nombre o email…"
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 transition-all" />
        </div>
        <select value={rolFiltro} onChange={e => { setRolFiltro(e.target.value); setPagina(1); }}
          className="px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-teal-400 transition-all bg-white text-gray-700">
          <option value="">Todos los Roles</option>
          {['Veterinario','Admin','Recepcionista','Superadmin'].map(r => <option key={r}>{r}</option>)}
        </select>
        <select value={sucFiltro} onChange={e => { setSucFiltro(e.target.value); setPagina(1); }}
          className="px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-teal-400 transition-all bg-white text-gray-700">
          <option value="">Todas las Sucursales</option>
          {['Sede Norte','Sede Central','Sede Sur','Todas'].map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[11px] font-bold uppercase tracking-wider text-gray-400 border-b border-gray-100 bg-gray-50">
                <th className="px-6 py-3">Nombre</th>
                <th className="px-6 py-3">Usuario</th>
                <th className="px-6 py-3">Rol</th>
                <th className="px-6 py-3">Sucursal</th>
                <th className="px-6 py-3">Estado</th>
                <th className="px-6 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="px-6 py-4"><div className="flex items-center gap-3"><div className="w-10 h-10 bg-gray-200 rounded-xl"/><div className="space-y-1"><div className="h-3 w-32 bg-gray-200 rounded"/><div className="h-2 w-20 bg-gray-200 rounded"/></div></div></td>
                  {Array.from({length:4}).map((_,j) => <td key={j} className="px-6 py-4"><div className="h-3 w-20 bg-gray-200 rounded"/></td>)}
                  <td className="px-6 py-4"><div className="h-3 w-16 bg-gray-200 rounded ml-auto"/></td>
                </tr>
              )) : pagActual.map(u => (
                <tr key={u.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${avatarColor(u.id)} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                        {initials(u.nombres)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{u.nombres}</p>
                        <p className="text-xs text-gray-400">{u.cargo}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 font-mono">{u.username}</td>
                  <td className="px-6 py-4">
                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${ROL_BADGE[u.rol]}`}>{u.rol}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{u.sucursal}</td>
                  <td className="px-6 py-4">
                    <div className={`flex items-center gap-1.5 text-xs font-semibold ${u.estado === 'activo' ? 'text-emerald-600' : 'text-gray-400'}`}>
                      <span className={`w-2 h-2 rounded-full ${u.estado === 'activo' ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                      {u.estado === 'activo' ? 'Activo' : 'Inactivo'}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500 transition-colors" title="Editar"><Pencil size={15} /></button>
                      <button className="p-1.5 rounded-lg hover:bg-violet-50 text-violet-500 transition-colors" title="Permisos"><KeyRound size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 flex items-center justify-between border-t border-gray-100 bg-gray-50">
          <p className="text-xs text-gray-500">
            Mostrando {Math.min((pagina - 1) * PER_PAGE + 1, filtrados.length)}–{Math.min(pagina * PER_PAGE, filtrados.length)} de {filtrados.length} usuarios
          </p>
          <div className="flex items-center gap-1.5">
            <button onClick={() => setPagina(p => Math.max(1, p - 1))} disabled={pagina === 1}
              className="p-1.5 rounded-lg border border-gray-200 hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
              <ChevronLeft size={15} className="text-gray-600" />
            </button>
            {Array.from({ length: totalPag }).map((_, i) => (
              <button key={i} onClick={() => setPagina(i + 1)}
                className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${pagina === i + 1 ? 'text-white' : 'hover:bg-gray-100 text-gray-500 border border-gray-200'}`}
                style={pagina === i + 1 ? { background: 'linear-gradient(135deg,#0e314d,#0a8661)' } : {}}>
                {i + 1}
              </button>
            ))}
            <button onClick={() => setPagina(p => Math.min(totalPag, p + 1))} disabled={pagina === totalPag}
              className="p-1.5 rounded-lg border border-gray-200 hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
              <ChevronRight size={15} className="text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Roles + Actividad */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Resumen roles */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
            <ShieldCheck size={18} className="text-teal-600" /> Resumen de Roles
          </h2>
          <div className="space-y-3">
            {ROLES_RESUMEN.map(r => (
              <div key={r.rol} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100">
                <div>
                  <p className="text-sm font-semibold text-gray-900">{r.rol}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{r.desc}</p>
                </div>
                <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-white border border-gray-200 ${r.color}`}>
                  {r.count} USR
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Actividad reciente */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 relative overflow-hidden">
          <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-teal-100 rounded-full blur-3xl opacity-40" />
          <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Circle size={18} className="text-violet-500" /> Actividad Reciente
          </h2>
          <ul className="space-y-5 relative">
            {ACTIVIDAD.map((a, i) => (
              <li key={i} className="flex gap-4">
                <div className={`w-2 h-2 rounded-full ${a.color} mt-1.5 flex-shrink-0`} />
                <div>
                  <p className="text-sm text-gray-700" dangerouslySetInnerHTML={{ __html: a.texto.replace(/([A-Z][a-záéíóú]+ [A-Z][a-záéíóú]+)/g, '<span class="font-bold text-gray-900">$1</span>') }} />
                  <p className="text-[11px] text-gray-400 uppercase tracking-wide mt-1">{a.tiempo}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <ModalUsuario open={modal} onClose={() => setModal(false)}
        onSave={u => setUsuarios(p => [...p, u as UsuarioExtended])} />
    </div>
  );
}
