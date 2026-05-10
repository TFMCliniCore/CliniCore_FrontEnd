"use client";
import { useState, useEffect } from "react";
import { Plus, Search, Edit, Trash2, User, Loader2, X, Save, Mail, Phone, MapPin, Calendar, FileText, PawPrint } from "lucide-react";
import Link from "next/link";
import { clientesApi } from '@/lib/api'; 

// Actualizamos la interfaz con los campos de Prisma
interface PacienteMini {
  id: number;
  nombre: string;
}

interface Cliente {
  id: number;
  nombres: string;
  email: string;
  celular: string;
  telefonoAlterno?: string;
  direccion: string;
  ciudad: string;
  documento: string;
  cumpleanos?: string | Date;
  observaciones?: string;
  estado: string;
  pacientes?: PacienteMini[]; // Relación con mascotas
}

export default function ListarClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Estados para el Modal de Edición
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [clienteEditando, setClienteEditando] = useState<Cliente | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    cargarClientes();
  }, []);

  const cargarClientes = () => {
    setLoading(true);
    clientesApi.listar()
      .then(data => { setClientes(data); setLoading(false); })
      .catch(() => setLoading(false));
  };

  const abrirEdicion = (cliente: Cliente) => {
    setClienteEditando(cliente);
    setIsEditModalOpen(true);
  };

  const handleActualizar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clienteEditando) return;

    setIsUpdating(true);
    try {
      await clientesApi.actualizar(clienteEditando.id, clienteEditando);
      setIsEditModalOpen(false);
      cargarClientes();
    } catch (error) {
      console.error("Error al actualizar cliente:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleEliminar = async (id: number) => {
    if (confirm('¿Estás seguro de que deseas eliminar este cliente?')) {
      setDeletingId(id);
      try {
        await clientesApi.eliminar(id);
        cargarClientes();
      } catch (error) {
        console.error("Error al eliminar:", error);
      } finally {
        setDeletingId(null);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8 animate-in fade-in duration-500">
      <div className="max-w-7x2 mx-auto space-y-8">
        
        {/* --- ENCABEZADO --- */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
          <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">Directorio de Clientes</h1>
            <p className="text-slate-400 font-medium mt-1">Gestiona los propietarios y su información de contacto.</p>
          </div>
          <Link href="/clientes/crear" 
                className="inline-flex items-center gap-2 bg-[#00a8a8] hover:bg-[#008585] text-white px-6 py-3.5 rounded-2xl font-bold transition-all shadow-lg shadow-cyan-900/20 hover:shadow-cyan-900/40 hover:-translate-y-0.5">
            <Plus size={20} strokeWidth={2.5} />
            <span>Nuevo Cliente</span>
          </Link>
        </div>

        {/* --- TABLA PRINCIPAL --- */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">ID</th>
                  <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Cliente</th>
                  <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Contacto</th>
                  <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Ubicación</th>
                  <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Mascotas</th>
                  <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Estado</th>
                  <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {clientes.map((cliente) => (
                  <tr key={cliente.id} className="hover:bg-slate-50/50 transition-colors group">
                    
                    {/* ID DEL CLIENTE */}
                    <td className="px-8 py-4 whitespace-nowrap">
                      <span className="text-sm font-bold text-slate-400">
                        #{cliente.id}
                      </span>
                    </td>

                    {/* CLIENTE: Nombres, Doc, Cumpleaños y Observaciones */}
                    <td className="px-8 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-4">
                        <div className="relative h-12 w-12 rounded-2xl bg-slate-100 flex items-center justify-center border border-slate-200 flex-shrink-0">
                          <User size={20} className="text-slate-400" />
                        </div>
                        <div className="flex flex-col gap-1">
                          {/* Fila 1: Nombre y Documento */}
                          <div className="font-bold text-slate-800 text-base flex items-baseline gap-2">
                            {cliente.nombres}
                            <span className="text-xs font-normal text-slate-400">CC: {cliente.documento}</span>
                          </div>
                          
                          {/* Fila 2: Cumpleaños y Observaciones */}
                          <div className="text-sm text-slate-500 flex items-center gap-3">
                            {cliente.cumpleanos ? (
                              <span className="flex items-center gap-1.5">
                                <Calendar size={13} className="text-[#00a8a8]" />
                                {new Date(cliente.cumpleanos).toLocaleDateString()}
                              </span>
                            ) : (
                              <span className="text-xs text-slate-400 italic">Sin fecha nac.</span>
                            )}
                            
                            {cliente.observaciones && (
                              <span className="flex items-center gap-1.5 text-xs max-w-[150px] truncate" title={cliente.observaciones}>
                                <FileText size={13} className="text-slate-400" />
                                {cliente.observaciones}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* CONTACTO: Email y Celulares */}
                    <td className="px-8 py-4 whitespace-nowrap">
                      <div className="flex flex-col gap-1.5">
                        <div className="text-sm text-slate-600 flex items-center gap-2">
                          <Mail size={14} className="text-slate-400" /> {cliente.email}
                        </div>
                        <div className="text-sm text-slate-600 flex items-center gap-2">
                          <Phone size={14} className="text-slate-400" /> 
                          {cliente.celular}
                          {cliente.telefonoAlterno && (
                            <span className="text-xs text-slate-400 ml-1">/ {cliente.telefonoAlterno}</span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* UBICACIÓN: Ciudad y Dirección */}
                    <td className="px-8 py-4 whitespace-nowrap">
                      <div className="flex flex-col items-start gap-1">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                          <MapPin size={12} className="text-slate-400" />
                          {cliente.ciudad}
                        </span>
                        <span className="text-[11px] text-slate-400 pl-2 font-medium truncate max-w-[200px]" title={cliente.direccion}>
                          {cliente.direccion}
                        </span>
                      </div>
                    </td>

                    {/* MASCOTAS (Chips) */}
                    <td className="px-8 py-4">
                      <div className="flex flex-wrap gap-1.5 max-w-[180px]">
                        {cliente.pacientes && cliente.pacientes.length > 0 ? (
                          cliente.pacientes.map((mascota) => (
                            <span key={mascota.id} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-cyan-50 text-cyan-700 border border-cyan-100">
                              <PawPrint size={10} />
                              {mascota.nombre}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-slate-400 italic">Ninguna</span>
                        )}
                      </div>
                    </td>

                    {/* ESTADO */}
                    <td className="px-8 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                        cliente.estado === 'ACTIVO' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-red-50 text-red-600 border border-red-200'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${cliente.estado === 'ACTIVO' ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                        {cliente.estado || 'ACTIVO'}
                      </span>
                    </td>

                    {/* ACCIONES */}
                    <td className="px-8 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                            onClick={() => abrirEdicion(cliente)}
                            className="p-2 text-slate-400 hover:text-[#00a8a8] hover:bg-white rounded-lg transition-all hover:shadow-md">
                            <Edit size={18} />
                          </button>
                        <button 
                          onClick={() => handleEliminar(cliente.id)}
                          disabled={deletingId === cliente.id}
                          className="p-2 text-slate-400 hover:text-red-500 hover:bg-white rounded-lg transition-all hover:shadow-md disabled:opacity-50"
                        >
                          {deletingId === cliente.id ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ESTADOS DE CARGA Y VACÍO */}
          {loading && (
            <div className="p-20 text-center">
              <Loader2 className="animate-spin h-10 w-10 text-[#00a8a8] mx-auto" />
              <p className="mt-4 text-slate-400 animate-pulse font-medium">Sincronizando clientes...</p>
            </div>
          )}

          {!loading && clientes.length === 0 && (
            <div className="p-20 text-center text-slate-300">
              <Search size={48} className="mx-auto mb-4 opacity-20" />
              <p className="text-xl font-medium">No se encontraron clientes registrados.</p>
            </div>
          )}
        </div>

        {/* --- MODAL DE EDICIÓN DE CLIENTE --- */}
        {isEditModalOpen && clienteEditando && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-300">
              <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                <h2 className="text-2xl font-black text-slate-800">Editar Cliente</h2>
                <button onClick={() => setIsEditModalOpen(false)} className="p-2 hover:bg-white rounded-full text-slate-400 transition-colors">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleActualizar} className="p-8 space-y-5 max-h-[75vh] overflow-y-auto">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Nombres</label>
                    <input 
                      type="text" 
                      value={clienteEditando.nombres}
                      onChange={(e) => setClienteEditando({...clienteEditando, nombres: e.target.value})}
                      className="w-full px-5 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-[#00a8a8]/20 focus:border-[#00a8a8] outline-none transition-all font-medium bg-slate-50/50"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Documento</label>
                    <input 
                      type="text" 
                      value={clienteEditando.documento}
                      onChange={(e) => setClienteEditando({...clienteEditando, documento: e.target.value})}
                      className="w-full px-5 py-3 rounded-2xl border border-slate-200 bg-slate-50/50 outline-none font-medium"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Email</label>
                    <input 
                      type="email" 
                      value={clienteEditando.email}
                      onChange={(e) => setClienteEditando({...clienteEditando, email: e.target.value})}
                      className="w-full px-5 py-3 rounded-2xl border border-slate-200 bg-slate-50/50 outline-none font-medium"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Cumpleaños</label>
                    <input 
                      type="date" 
                      value={clienteEditando.cumpleanos ? new Date(clienteEditando.cumpleanos).toISOString().split('T')[0] : ''}
                      onChange={(e) => setClienteEditando({...clienteEditando, cumpleanos: e.target.value})}
                      className="w-full px-5 py-3 rounded-2xl border border-slate-200 bg-slate-50/50 outline-none font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Celular Principal</label>
                    <input 
                      type="text" 
                      value={clienteEditando.celular}
                      onChange={(e) => setClienteEditando({...clienteEditando, celular: e.target.value})}
                      className="w-full px-5 py-3 rounded-2xl border border-slate-200 bg-slate-50/50 outline-none font-medium"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Teléfono Alterno</label>
                    <input 
                      type="text" 
                      value={clienteEditando.telefonoAlterno || ""}
                      onChange={(e) => setClienteEditando({...clienteEditando, telefonoAlterno: e.target.value})}
                      className="w-full px-5 py-3 rounded-2xl border border-slate-200 bg-slate-50/50 outline-none font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Ciudad</label>
                    <input 
                      type="text" 
                      value={clienteEditando.ciudad}
                      onChange={(e) => setClienteEditando({...clienteEditando, ciudad: e.target.value})}
                      className="w-full px-5 py-3 rounded-2xl border border-slate-200 bg-slate-50/50 outline-none font-medium"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Estado</label>
                    <select 
                      value={clienteEditando.estado}
                      onChange={(e) => setClienteEditando({...clienteEditando, estado: e.target.value})}
                      className="w-full px-5 py-3 rounded-2xl border border-slate-200 bg-slate-50/50 outline-none font-medium"
                    >
                      <option value="ACTIVO">ACTIVO</option>
                      <option value="INACTIVO">INACTIVO</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Dirección</label>
                  <input 
                    type="text" 
                    value={clienteEditando.direccion}
                    onChange={(e) => setClienteEditando({...clienteEditando, direccion: e.target.value})}
                    className="w-full px-5 py-3 rounded-2xl border border-slate-200 bg-slate-50/50 outline-none font-medium"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Observaciones</label>
                  <textarea 
                    value={clienteEditando.observaciones || ""}
                    onChange={(e) => setClienteEditando({...clienteEditando, observaciones: e.target.value})}
                    rows={3}
                    className="w-full px-5 py-3 rounded-2xl border border-slate-200 bg-slate-50/50 outline-none font-medium resize-none"
                    placeholder="Notas adicionales..."
                  />
                </div>
                
                <div className="pt-6 flex gap-3">
                  <button type="button" onClick={() => setIsEditModalOpen(false)} className="flex-1 py-4 rounded-2xl font-bold text-slate-400 hover:bg-slate-50 transition-all">
                    Cancelar
                  </button>
                  <button type="submit" disabled={isUpdating} className="flex-[2] py-4 rounded-2xl bg-[#00a8a8] text-white font-bold flex items-center justify-center gap-2 hover:bg-[#008585] transition-all shadow-lg shadow-cyan-900/20 disabled:opacity-50">
                    {isUpdating ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                    Actualizar Cliente
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}