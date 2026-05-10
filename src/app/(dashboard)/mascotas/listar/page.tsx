"use client";
import { useState, useEffect } from "react";
import { Plus, Search, Edit, Trash2, PawPrint, Bone, Loader2, ChevronRight, Mail, Phone, MapPin, ShieldAlert, Save, X, FileText } from "lucide-react";
import Link from "next/link";
import { pacientesApi } from '@/lib/api'; 

export default function ListarPacientesPage() {
  const [pacientes, setPacientes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [pacienteEditando, setPacienteEditando] = useState<any>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [errorFoto, setErrorFoto] = useState<string | null>(null);
  const MAX_SIZE_MB = 25; // El límite de tu servidor

  const cargarPacientes = async () => {
  setLoading(true);
  setError(null);
  try {
    const data = await pacientesApi.listar();
    setPacientes(Array.isArray(data) ? data : []);
  } catch (err: any) {
    // Si el error es 401 o 403, activamos la alerta
    if (err.response?.status === 401 || err.response?.status === 403) {
      setError("unauthorized");
    }
  } finally {
    setLoading(false);
  }
};
  useEffect(() => {
    cargarPacientes();
  }, []);

const handleEliminar = async (id: string | number) => {
  if (!confirm("¿Estás seguro de que deseas eliminar este paciente?")) return;
  
  try {
    await pacientesApi.eliminar(id);
    setPacientes(prev => prev.filter(p => p.id !== id));
  } catch (err: any) {
    // Si el error al eliminar es por permisos
    if (err.response?.status === 401 || err.response?.status === 403) {
      alert("No tienes permiso para eliminar pacientes.");
      window.location.href = "/";
    } else {
      alert("Error al eliminar. Asegúrate de que el backend esté activo.");
    }
  }
};

const handleActualizar = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsUpdating(true);
  try {
    
    const payload = {
      nombre: pacienteEditando.nombre,
      edad: pacienteEditando.edad,
      sexo: pacienteEditando.sexo,
      especie: pacienteEditando.especie,
      raza: pacienteEditando.raza,
      peso: pacienteEditando.peso,
      castrado: pacienteEditando.castrado,
      foto: pacienteEditando.foto, // <-- La URL de la foto
      fechaNacimiento: pacienteEditando.fechaNacimiento,
      fechaIngreso: pacienteEditando.fechaIngreso,
      estado: pacienteEditando.estado,
      alimentoPrincipal: pacienteEditando.alimentoPrincipal,
      clienteId: parseInt(pacienteEditando.clienteId),
      sedeId: parseInt(pacienteEditando.sedeId || "1"),
      historiaClinicaId: pacienteEditando.historiaClinicaId ? parseInt(pacienteEditando.historiaClinicaId) : null
    };
    
    await pacientesApi.actualizar(pacienteEditando.id, payload);
    
    setPacientes(prev => prev.map(p => p.id === pacienteEditando.id ? { ...p, ...payload } : p));
    setIsEditModalOpen(false);
  } catch (error: any) {
    console.error("Error completo:", error);
    alert("Error 400: Revisa la consola del Gateway (NestJS) para ver qué campo exacto falló.");
  } finally {
    setIsUpdating(false);
  }
};

// Función para abrir el modal
const abrirEdicion = (paciente: any) => {
  setPacienteEditando({ ...paciente });
  setIsEditModalOpen(true);
};

const validarTamanoFoto = (valor: string) => {
  if (valor.startsWith('data:image')) {
    // Cálculo aproximado para Base64: cada 4 caracteres son ~3 bytes
    const tamañoBytes = (valor.length * 3) / 4;
    const tamañoMB = tamañoBytes / (1024 * 1024);
    
    if (tamañoMB > MAX_SIZE_MB) {
      setErrorFoto(`La imagen es muy pesada (${tamañoMB.toFixed(2)}MB). El máximo es ${MAX_SIZE_MB}MB.`);
      return false;
    }
  }
  setErrorFoto(null);
  return true;
};

return (
  <div className="relative min-h-screen p-4 md:p-8 animate-in fade-in duration-500 overflow-hidden">
    
    {/* CORRECCIÓN: Solo mostrar si el estado 'error' es 'unauthorized' */}
    {error === "unauthorized" && (
      <div className="mx-8 mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl shadow-sm">
        <div className="flex items-center gap-3">
          <ShieldAlert className="text-red-500" size={24} />
          <div>
            <p className="text-red-800 font-bold">Sin autorización</p>
            <p className="text-red-700 text-sm">No tiene permiso para ver a los pacientes.</p>
          </div>
        </div>
      </div>
    )}
      
      {/* --- MARCAS DE AGUA (OPACIDAD 20%) --- */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-20">
        <PawPrint size={140} className="absolute top-[10%] left-[5%] -rotate-12 text-[#00a8a8]" />
        <Bone size={160} className="absolute top-[25%] right-[10%] rotate-45 text-slate-400" />
        <PawPrint size={180} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-45 text-slate-300" />
        <Bone size={120} className="absolute bottom-[10%] right-[20%] -rotate-12 text-[#00a8a8]" />
      </div>

      <div className="relative z-10 space-y-8">
        
        {/* Header */}
        <div className="bg-white/90 backdrop-blur-md p-8 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-white flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight">Pacientes</h1>
            <p className="text-slate-500 font-medium mt-1 flex items-center gap-2">
              Gestión clínica de CliniCore <ChevronRight size={14} className="text-[#00a8a8]" /> {pacientes.length} Registrados
            </p>
          </div>
          
          <Link 
            href="/mascotas/nuevo" 
            className="flex items-center justify-center gap-2 bg-[#00a8a8] hover:bg-[#008585] text-white px-8 py-4 rounded-2xl font-bold shadow-lg shadow-cyan-900/20 transition-all active:scale-95"
          >
            <Plus size={24} />
            Nuevo Paciente
          </Link>
        </div>

        {/* Tabla */}
<div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-2xl shadow-slate-200/40 border border-white overflow-hidden">
  <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
    {/* Aumentamos el min-w a 1200px porque añadimos más información y una columna extra */}
    <table className="w-full border-collapse min-w-[1200px]"> 
      <thead>
        <tr className="border-b border-slate-100 bg-slate-50/50 text-left">
          {/* NUEVA COLUMNA PARA EL ID */}
          <th className="px-8 py-6 text-slate-400 font-bold uppercase text-xs tracking-widest w-20">ID</th>
          <th className="px-8 py-6 text-slate-400 font-bold uppercase text-xs tracking-widest">Paciente</th>
          <th className="px-8 py-6 text-slate-400 font-bold uppercase text-xs tracking-widest">Propietario / ID</th>
          <th className="px-8 py-6 text-slate-400 font-bold uppercase text-xs tracking-widest">Contacto</th>
          <th className="px-8 py-6 text-slate-400 font-bold uppercase text-xs tracking-widest">Sede</th>
          <th className="px-8 py-6 text-slate-400 font-bold uppercase text-xs tracking-widest">Estado</th>
          <th className="px-8 py-6 text-right text-slate-400 font-bold uppercase text-xs tracking-widest">Acciones</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-50">
        {pacientes.map((paciente) => (
          <tr key={paciente.id} className="hover:bg-slate-50/80 transition-colors group border-b border-slate-100 last:border-0">
            
            {/* NUEVA CELDA: ID DEL PACIENTE */}
            <td className="px-8 py-4 whitespace-nowrap">
              <span className="text-sm font-bold text-slate-400">
                #{paciente.id}
              </span>
            </td>

            {/* PACIENTE: Ahora con Sexo, Peso, Castrado y Fechas */}
            <td className="px-8 py-4 whitespace-nowrap">
              <div className="flex items-center gap-4">
                <div className="relative h-14 w-14 rounded-2xl overflow-hidden bg-slate-100 flex-shrink-0 border border-slate-200">
                  {paciente.foto ? (
                    <img src={paciente.foto} alt={paciente.nombre} className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center">
                      <Bone size={20} className="text-slate-300" />
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-1">
                  {/* Fila 1: Nombre y HC */}
                  <div className="font-bold text-slate-800 text-base flex items-baseline gap-2">
                    {paciente.nombre}
                    <span className="text-xs font-normal text-slate-400">HC: #{paciente.historiaClinicaId || 'N/A'}</span>
                  </div>
                  
                  {/* Fila 2: Datos biológicos */}
                  <div className="text-sm text-slate-500 flex items-center gap-1.5">
                    <PawPrint size={13} className="text-[#00a8a8]" />
                    {paciente.especie} {paciente.raza ? `| ${paciente.raza}` : ''} • {paciente.sexo} • 
                    <span className="text-xs px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium">
                      {paciente.peso}
                    </span>
                    {paciente.castrado && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-600 font-medium border border-amber-100 uppercase">
                        Castrado
                      </span>
                    )}
                  </div>
                  {/* Fila 3: Fechas */}
                  <div className="text-xs text-slate-400 flex items-center gap-3">
                    <span><strong className="font-medium text-slate-500">Nac:</strong> {paciente.fechaNacimiento ? new Date(paciente.fechaNacimiento).toLocaleDateString() : 'N/A'}</span>
                    <span><strong className="font-medium text-slate-500">Ingreso:</strong> {paciente.fechaIngreso ? new Date(paciente.fechaIngreso).toLocaleDateString() : 'N/A'}</span>
                  </div>

                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Alimento</span>
                    <span className="text-sm font-bold text-slate-700 truncate">
                      {paciente.alimentoPrincipal || "No especificado"}
                    </span>
                  </div>

                </div>
              </div>
            </td>

            {/* PROPIETARIO / ID */}
            <td className="px-8 py-4 whitespace-nowrap">
              <div className="text-sm font-semibold text-slate-700">{paciente.cliente?.nombres}</div>
              <div className="text-xs text-slate-500 mt-1">ID: {paciente.cliente?.documento}</div>
            </td>

            {/* CONTACTO */}
            <td className="px-8 py-4 whitespace-nowrap">
              <div className="flex flex-col gap-1">
                <div className="text-sm text-slate-600 flex items-center gap-2">
                  <Mail size={14} className="text-slate-400" /> {paciente.cliente?.email}
                </div>
                <div className="text-sm text-slate-600 flex items-center gap-2">
                  <Phone size={14} className="text-slate-400" /> {paciente.cliente?.celular}
                </div>
              </div>
            </td>

            {/* SEDE: Ahora incluye su ID */}
            <td className="px-8 py-4 whitespace-nowrap">
              <div className="flex flex-col items-start gap-1">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                  <MapPin size={12} className="text-slate-400" />
                  {paciente.sede?.nombre}
                </span>
                <span className="text-[11px] text-slate-400 pl-2 font-medium">
                  ID Sede: #{paciente.sede?.id || paciente.sedeId}
                </span>
              </div>
            </td>

            {/* ESTADO */}
            <td className="px-8 py-4 whitespace-nowrap">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                paciente.estado === 'ACTIVO' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-red-50 text-red-600 border border-red-200'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${paciente.estado === 'ACTIVO' ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                {paciente.estado}
              </span>
            </td>

            {/* ACCIONES */}
            <td className="px-8 py-4 whitespace-nowrap text-right text-sm font-medium">
              <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                    onClick={() => abrirEdicion(paciente)}
                    className="p-2 text-slate-400 hover:text-[#00a8a8] hover:bg-white rounded-lg transition-all hover:shadow-md">
                    <Edit size={18} />
                  </button>
                <button 
                  onClick={() => handleEliminar(paciente.id)}
                  className="p-2 text-slate-400 hover:text-red-500 hover:bg-white rounded-lg transition-all hover:shadow-md"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </td>
          </tr>
        ))}
              </tbody>
            </table>
          </div>

          {loading && (
            <div className="p-20 text-center">
              <Loader2 className="animate-spin h-10 w-10 text-[#00a8a8] mx-auto" />
              <p className="mt-4 text-slate-400 animate-pulse font-medium">Sincronizando pacientes...</p>
            </div>
          )}

          {!loading && pacientes.length === 0 && (
            <div className="p-20 text-center text-slate-300">
              <Search size={48} className="mx-auto mb-4 opacity-20" />
              <p className="text-xl font-medium">No se encontraron pacientes registrados.</p>
            </div>
          )}
          
    

        </div>
        {/* --- VENTANA MODAL DE EDICIÓN DE PACIENTE --- */}
    {isEditModalOpen && pacienteEditando && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
        <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-300">
          <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
            <h2 className="text-2xl font-black text-slate-800">Editar Paciente</h2>
            <button onClick={() => setIsEditModalOpen(false)} className="p-2 hover:bg-white rounded-full text-slate-400 transition-colors">
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleActualizar} className="p-8 space-y-5 max-h-[70vh] overflow-y-auto">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Nombre de la Mascota</label>
              <input 
                type="text" 
                value={pacienteEditando.nombre}
                onChange={(e) => setPacienteEditando({...pacienteEditando, nombre: e.target.value})}
                className="w-full px-5 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-[#00a8a8]/20 focus:border-[#00a8a8] outline-none transition-all font-medium bg-slate-50/50"
              />
            </div>

            {/* --- CAMPO: URL DE LA FOTO --- */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">URL de la Foto</label>
                <div className="flex gap-3">
                  <input 
                    type="text" 
                    placeholder="https://... o data:image..."
                    value={pacienteEditando.foto || ""}
                    onChange={(e) => {
                      const val = e.target.value;
                      setPacienteEditando({...pacienteEditando, foto: val});
                      validarTamanoFoto(val); // Validamos en tiempo real
                    }}
                    className={`flex-1 px-5 py-3 rounded-2xl border ${errorFoto ? 'border-red-400' : 'border-slate-200'} focus:ring-2 focus:ring-[#00a8a8]/20 focus:border-[#00a8a8] outline-none transition-all font-medium bg-slate-50/50`}
                  />
                  {pacienteEditando.foto && (
                    <div className="w-12 h-12 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 shrink-0">
                      <img src={pacienteEditando.foto} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
                
                {/* ALERTA DE TAMAÑO */}
                {errorFoto && (
                  <p className="text-red-500 text-xs font-bold animate-pulse ml-2">
                    ⚠️ {errorFoto}
                  </p>
                )}
              </div> 

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Especie</label>
                <select 
                  value={pacienteEditando.especie}
                  onChange={(e) => setPacienteEditando({...pacienteEditando, especie: e.target.value})}
                  className="w-full px-5 py-3 rounded-2xl border border-slate-200 bg-slate-50/50 outline-none font-medium"
                >
                  <option value="Canino">Canino</option>
                  <option value="Felino">Felino</option>
                  <option value="Ave">Ave</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Sexo</label>
                <select 
                  value={pacienteEditando.sexo}
                  onChange={(e) => setPacienteEditando({...pacienteEditando, sexo: e.target.value})}
                  className="w-full px-5 py-3 rounded-2xl border border-slate-200 bg-slate-50/50 outline-none font-medium"
                >
                  <option value="Macho">Macho</option>
                  <option value="Hembra">Hembra</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Edad</label>
                <input 
                  type="text" 
                  value={pacienteEditando.edad}
                  onChange={(e) => setPacienteEditando({...pacienteEditando, edad: e.target.value})}
                  className="w-full px-5 py-3 rounded-2xl border border-slate-200 bg-slate-50/50 outline-none font-medium"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Peso</label>
                <input 
                  type="text" 
                  value={pacienteEditando.peso}
                  onChange={(e) => setPacienteEditando({...pacienteEditando, peso: e.target.value})}
                  className="w-full px-5 py-3 rounded-2xl border border-slate-200 bg-slate-50/50 outline-none font-medium"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl">
              <input 
                type="checkbox" 
                id="edit-castrado"
                checked={pacienteEditando.castrado}
                onChange={(e) => setPacienteEditando({...pacienteEditando, castrado: e.target.checked})}
                className="w-5 h-5 text-[#00a8a8] rounded"
              />
              <label htmlFor="edit-castrado" className="text-sm font-bold text-slate-600">¿Está castrado?</label>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Alimento Principal</label>
              <div className="relative">
                <Bone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  value={pacienteEditando.alimentoPrincipal || ""}
                  onChange={(e) => setPacienteEditando({...pacienteEditando, alimentoPrincipal: e.target.value})}
                  placeholder="Ej: ProPlan Adultos"
                  className="w-full pl-12 pr-5 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-[#00a8a8]/20 focus:border-[#00a8a8] outline-none transition-all font-medium bg-slate-50/50"
                />
              </div>
            </div>

            {/* --- ID HISTORIA CLÍNICA --- */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">ID Historia Clínica</label>
              <div className="relative">
                <FileText className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="number" 
                  value={pacienteEditando.historiaClinicaId || ""}
                  onChange={(e) => setPacienteEditando({...pacienteEditando, historiaClinicaId: e.target.value})}
                  placeholder="Número de historia..."
                  className="w-full pl-12 pr-5 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-[#00a8a8]/20 focus:border-[#00a8a8] outline-none transition-all font-medium bg-slate-50/50"
                />
              </div>
            </div>
            
            <div className="pt-6 flex gap-3">
              <button type="button" onClick={() => setIsEditModalOpen(false)} className="flex-1 py-4 rounded-2xl font-bold text-slate-400 hover:bg-slate-50 transition-all">
                Cancelar
              </button>
              <button 
                  type="submit" 
                  disabled={isUpdating || !!errorFoto}
                  className="flex-[2] py-4 rounded-2xl bg-[#00a8a8] text-white font-bold flex items-center justify-center gap-2 hover:bg-[#008585] transition-all shadow-lg shadow-cyan-900/20 disabled:opacity-50 disabled:bg-slate-300">
                  {isUpdating ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                  Actualizar Mascota
                </button>
            </div>

            {/* --- ALIMENTO PRINCIPAL --- */}

            
          </form>
        </div>
      </div>
    )}
      </div>
    </div>
  );
}