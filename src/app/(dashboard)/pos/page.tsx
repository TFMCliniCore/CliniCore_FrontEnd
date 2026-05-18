"use client";

import { useState, useMemo } from 'react';
import {
  Search, Star, Trash2, Plus, Minus, ShoppingCart,
  User, ChevronRight, Ticket, FileText, CreditCard,
  Stethoscope, Syringe, PawPrint, Scissors, FlaskConical,
  Pill, Clock, X,
} from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────

interface Producto {
  id: number;
  nombre: string;
  categoria: string;
  precio: number;
  icon: React.ElementType;
  color: string;
  favorito: boolean;
}

interface ItemCarrito extends Producto {
  cantidad: number;
}

// ── Catálogo ──────────────────────────────────────────────────────────────────

const CATALOGO: Producto[] = [
  { id: 1,  nombre: 'Consulta General',       categoria: 'Servicios',   precio: 85000,  icon: Stethoscope, color: 'bg-blue-50 text-blue-600',    favorito: true  },
  { id: 2,  nombre: 'Vacuna Antirrábica',      categoria: 'Vacunas',     precio: 55000,  icon: Syringe,     color: 'bg-violet-50 text-violet-600', favorito: true  },
  { id: 3,  nombre: 'Alimento ProPlan 3kg',    categoria: 'Nutrición',   precio: 89000,  icon: PawPrint,    color: 'bg-teal-50 text-teal-600',     favorito: true  },
  { id: 4,  nombre: 'Desparasitación',         categoria: 'Servicios',   precio: 38000,  icon: Pill,        color: 'bg-emerald-50 text-emerald-600',favorito: true  },
  { id: 5,  nombre: 'Grooming Completo',       categoria: 'Estética',    precio: 75000,  icon: Scissors,    color: 'bg-rose-50 text-rose-600',     favorito: true  },
  { id: 6,  nombre: 'Perfil Bioquímico',       categoria: 'Laboratorio', precio: 120000, icon: FlaskConical,color: 'bg-amber-50 text-amber-600',   favorito: true  },
  { id: 7,  nombre: 'Amoxicilina 250mg',       categoria: 'Farmacia',    precio: 18000,  icon: Pill,        color: 'bg-pink-50 text-pink-600',     favorito: false },
  { id: 8,  nombre: 'Vacuna Parvovirus',       categoria: 'Vacunas',     precio: 62000,  icon: Syringe,     color: 'bg-violet-50 text-violet-600', favorito: false },
  { id: 9,  nombre: 'Consulta Especializada',  categoria: 'Servicios',   precio: 140000, icon: Stethoscope, color: 'bg-blue-50 text-blue-600',    favorito: false },
  { id: 10, nombre: 'Baño y Secado',           categoria: 'Estética',    precio: 45000,  icon: Scissors,    color: 'bg-rose-50 text-rose-600',     favorito: false },
  { id: 11, nombre: 'Rx Torax',                categoria: 'Laboratorio', precio: 95000,  icon: FlaskConical,color: 'bg-amber-50 text-amber-600',   favorito: false },
  { id: 12, nombre: 'Alimento Hills 2kg',      categoria: 'Nutrición',   precio: 72000,  icon: PawPrint,    color: 'bg-teal-50 text-teal-600',     favorito: false },
];

const CATEGORIAS = ['Todos', 'Servicios', 'Vacunas', 'Farmacia', 'Nutrición', 'Estética', 'Laboratorio'];

const IVA = 0.19;

function formatCOP(n: number) {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n);
}

// ── Modal pago ────────────────────────────────────────────────────────────────

function ModalPago({ total, onClose, onConfirm }: { total: number; onClose: () => void; onConfirm: () => void }) {
  const [metodo, setMetodo] = useState<'efectivo' | 'tarjeta' | 'transferencia'>('efectivo');
  const [recibido, setRecibido] = useState('');
  const cambio = metodo === 'efectivo' ? Math.max(0, parseFloat(recibido || '0') - total) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-gray-900">Procesar Pago</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"><X size={18} /></button>
        </div>
        <div className="text-center mb-5 py-4 bg-gray-50 rounded-xl">
          <p className="text-sm text-gray-500 mb-1">Total a pagar</p>
          <p className="text-3xl font-black text-gray-900">{formatCOP(total)}</p>
        </div>
        <div className="grid grid-cols-3 gap-2 mb-5">
          {(['efectivo','tarjeta','transferencia'] as const).map(m => (
            <button key={m} onClick={() => setMetodo(m)}
              className={`py-2.5 rounded-xl text-xs font-bold capitalize border transition-all ${metodo === m ? 'text-white border-transparent' : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'}`}
              style={metodo === m ? { background: 'linear-gradient(135deg,#0e314d,#0a8661)' } : {}}>
              {m === 'efectivo' ? 'Efectivo' : m === 'tarjeta' ? 'Tarjeta' : 'Transferencia'}
            </button>
          ))}
        </div>
        {metodo === 'efectivo' && (
          <div className="mb-4">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Monto recibido</label>
            <input type="number" value={recibido} onChange={e => setRecibido(e.target.value)}
              placeholder="0"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-lg font-bold text-center focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 transition-all" />
            {parseFloat(recibido) >= total && (
              <div className="mt-2 flex justify-between text-sm font-semibold">
                <span className="text-gray-500">Cambio:</span>
                <span className="text-emerald-600">{formatCOP(cambio)}</span>
              </div>
            )}
          </div>
        )}
        <button onClick={onConfirm}
          disabled={metodo === 'efectivo' && parseFloat(recibido || '0') < total}
          className="w-full py-3.5 rounded-xl text-sm font-bold text-white disabled:opacity-40 hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2"
          style={{ background: 'linear-gradient(135deg,#0e314d,#0a8661)' }}>
          <CreditCard size={18} /> Confirmar Pago
        </button>
      </div>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function POSPage() {
  const [carrito, setCarrito]     = useState<ItemCarrito[]>([]);
  const [busqueda, setBusqueda]   = useState('');
  const [categoria, setCategoria] = useState('Todos');
  const [cliente, setCliente]     = useState('Juan Pérez');
  const [notas, setNotas]         = useState('');
  const [modalPago, setModalPago] = useState(false);
  const [exito, setExito]         = useState(false);

  const productos = useMemo(() => CATALOGO.filter(p => {
    const q = busqueda.toLowerCase();
    return (!q || p.nombre.toLowerCase().includes(q) || p.categoria.toLowerCase().includes(q))
      && (categoria === 'Todos' || p.categoria === categoria);
  }), [busqueda, categoria]);

  const favoritos = CATALOGO.filter(p => p.favorito);

  const agregar = (p: Producto) => {
    setCarrito(prev => {
      const ex = prev.find(i => i.id === p.id);
      if (ex) return prev.map(i => i.id === p.id ? { ...i, cantidad: i.cantidad + 1 } : i);
      return [...prev, { ...p, cantidad: 1 }];
    });
  };

  const cambiarCantidad = (id: number, delta: number) => {
    setCarrito(prev => prev
      .map(i => i.id === id ? { ...i, cantidad: Math.max(0, i.cantidad + delta) } : i)
      .filter(i => i.cantidad > 0));
  };

  const eliminar = (id: number) => setCarrito(prev => prev.filter(i => i.id !== id));
  const limpiar  = () => setCarrito([]);

  const subtotal  = carrito.reduce((s, i) => s + i.precio * i.cantidad, 0);
  const iva       = Math.round(subtotal * IVA);
  const total     = subtotal + iva;
  const totalItems = carrito.reduce((s, i) => s + i.cantidad, 0);

  const confirmarPago = () => {
    setModalPago(false);
    setExito(true);
    setTimeout(() => { setExito(false); limpiar(); }, 3000);
  };

  return (
    <div className="flex gap-0 -m-6 h-[calc(100vh-64px)]" style={{ margin: '-1.5rem' }}>

      {/* ── Panel izquierdo: catálogo ───────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Barra búsqueda + cliente */}
        <div className="p-4 border-b border-gray-100 bg-white space-y-3">

          {/* Search */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={busqueda} onChange={e => setBusqueda(e.target.value)}
                placeholder="Buscar producto, servicio o código de barras…"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 transition-all" />
            </div>
          </div>

          {/* Cliente */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center">
                <User size={15} className="text-teal-600" />
              </div>
              <div>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">Cliente</p>
                <p className="text-sm font-semibold text-gray-900">{cliente}</p>
              </div>
            </div>
            <button className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1">
              Cambiar <ChevronRight size={13} />
            </button>
          </div>

          {/* Categorías */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {CATEGORIAS.map(c => (
              <button key={c} onClick={() => setCategoria(c)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap border transition-all flex-shrink-0 ${categoria === c ? 'text-white border-transparent' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                style={categoria === c ? { background: 'linear-gradient(135deg,#0e314d,#0a8661)' } : {}}>
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-5">

          {/* Favoritos */}
          {categoria === 'Todos' && !busqueda && (
            <div>
              <h2 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                <Star size={15} className="text-amber-500 fill-amber-500" /> Productos Favoritos
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {favoritos.map(p => {
                  const Icon = p.icon;
                  const en = carrito.find(i => i.id === p.id);
                  return (
                    <button key={p.id} onClick={() => agregar(p)}
                      className={`relative p-4 rounded-xl border text-left hover:shadow-md active:scale-95 transition-all group ${en ? 'border-teal-300 bg-teal-50' : 'bg-white border-gray-100 hover:border-teal-200'}`}>
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform ${p.color}`}>
                        <Icon size={20} />
                      </div>
                      <p className="text-xs font-semibold text-gray-900 leading-tight mb-1">{p.nombre}</p>
                      <p className="text-xs font-bold text-teal-600">{formatCOP(p.precio)}</p>
                      {en && (
                        <span className="absolute top-2 right-2 w-5 h-5 bg-teal-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                          {en.cantidad}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Todos los productos */}
          <div>
            {(categoria !== 'Todos' || busqueda) && (
              <h2 className="text-sm font-bold text-gray-700 mb-3">{categoria === 'Todos' ? 'Resultados' : categoria}</h2>
            )}
            {categoria === 'Todos' && !busqueda && (
              <h2 className="text-sm font-bold text-gray-700 mb-3">Todos los productos</h2>
            )}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {productos.map(p => {
                const Icon = p.icon;
                const en = carrito.find(i => i.id === p.id);
                return (
                  <button key={p.id} onClick={() => agregar(p)}
                    className={`relative p-4 rounded-xl border text-left hover:shadow-md active:scale-95 transition-all group ${en ? 'border-teal-300 bg-teal-50' : 'bg-white border-gray-100 hover:border-teal-200'}`}>
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform ${p.color}`}>
                      <Icon size={20} />
                    </div>
                    <p className="text-xs font-semibold text-gray-900 leading-tight mb-1">{p.nombre}</p>
                    <p className="text-xs font-bold text-teal-600">{formatCOP(p.precio)}</p>
                    {en && (
                      <span className="absolute top-2 right-2 w-5 h-5 bg-teal-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                        {en.cantidad}
                      </span>
                    )}
                  </button>
                );
              })}
              {productos.length === 0 && (
                <div className="col-span-4 py-12 text-center text-gray-400 text-sm">Sin resultados para "{busqueda}"</div>
              )}
            </div>
          </div>

          {/* Notas */}
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <h3 className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-2"><FileText size={14} /> Notas de venta</h3>
            <textarea value={notas} onChange={e => setNotas(e.target.value)}
              placeholder="Añadir observación interna…"
              className="w-full h-20 resize-none rounded-xl border border-gray-200 p-3 text-sm focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 transition-all bg-gray-50" />
          </div>
        </div>
      </div>

      {/* ── Panel derecho: carrito ─────────────────────────────────────────── */}
      <div className="w-[360px] flex-shrink-0 border-l border-gray-200 bg-white flex flex-col">

        {/* Header carrito */}
        <div className="p-5 border-b border-gray-100">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <ShoppingCart size={20} className="text-teal-600" /> Carrito
            </h2>
            <span className="bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full text-xs font-bold">
              {totalItems} items
            </span>
          </div>
          <p className="text-xs text-gray-400 flex items-center gap-1">
            <Clock size={12} /> Sesión: {new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {carrito.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-gray-300">
              <ShoppingCart size={40} className="mb-3 opacity-30" />
              <p className="text-sm">El carrito está vacío</p>
              <p className="text-xs mt-1">Selecciona productos del catálogo</p>
            </div>
          ) : carrito.map(item => (
            <div key={item.id} className="p-3 rounded-xl border border-gray-100 bg-gray-50 space-y-2.5">
              <div className="flex justify-between items-start gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{item.nombre}</p>
                  <p className="text-xs text-gray-400">{item.categoria}</p>
                </div>
                <button onClick={() => eliminar(item.id)} className="text-gray-300 hover:text-red-500 transition-colors flex-shrink-0">
                  <Trash2 size={15} />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <button onClick={() => cambiarCantidad(item.id, -1)} className="px-2 py-1 hover:bg-gray-100 text-teal-600 transition-colors">
                    <Minus size={13} />
                  </button>
                  <span className="px-2.5 text-sm font-bold text-gray-900 min-w-[24px] text-center">{item.cantidad}</span>
                  <button onClick={() => cambiarCantidad(item.id, 1)} className="px-2 py-1 hover:bg-gray-100 text-teal-600 transition-colors">
                    <Plus size={13} />
                  </button>
                </div>
                <p className="text-sm font-bold text-gray-900">{formatCOP(item.precio * item.cantidad)}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Totales + acciones */}
        <div className="p-5 border-t border-gray-100 bg-gray-50 space-y-4">
          {exito && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-semibold text-center">
              ✓ Pago procesado exitosamente
            </div>
          )}
          <div className="space-y-2">
            <div className="flex justify-between text-sm"><span className="text-gray-500">Subtotal</span><span className="text-gray-900">{formatCOP(subtotal)}</span></div>
            <div className="flex justify-between text-sm"><span className="text-gray-500">IVA (19%)</span><span className="text-gray-900">{formatCOP(iva)}</span></div>
            <div className="flex justify-between text-sm"><span className="text-gray-500 flex items-center gap-1"><Ticket size={13}/> Descuento</span><span className="text-violet-600">-{formatCOP(0)}</span></div>
            <div className="flex justify-between items-center pt-2 border-t border-gray-200">
              <span className="font-bold text-gray-900">Total</span>
              <span className="text-2xl font-black text-teal-700">{formatCOP(total)}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button onClick={limpiar} className="py-2.5 rounded-xl border border-red-200 text-red-500 hover:bg-red-50 text-xs font-bold transition-colors">
              Cancelar
            </button>
            <button className="py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-100 text-xs font-bold transition-colors">
              Cotización
            </button>
          </div>

          <button onClick={() => carrito.length > 0 && setModalPago(true)} disabled={carrito.length === 0}
            className="w-full py-4 rounded-xl text-sm font-black text-white disabled:opacity-40 hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2"
            style={{ background: 'linear-gradient(135deg,#0e314d,#0a8661)' }}>
            <CreditCard size={18} /> PAGAR · {formatCOP(total)}
          </button>
        </div>
      </div>

      {modalPago && <ModalPago total={total} onClose={() => setModalPago(false)} onConfirm={confirmarPago} />}
    </div>
  );
}
