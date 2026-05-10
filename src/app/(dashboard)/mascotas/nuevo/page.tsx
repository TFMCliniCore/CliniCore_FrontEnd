"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  PawPrint, Bone, Save, ArrowLeft, ChevronRight, 
  User, Hash, Tag, Info, Scale, HeartPulse 
} from "lucide-react";
import Link from "next/link";
import { pacientesApi, clientesApi } from '@/lib/api';

export default function NuevoPacientePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [clientes, setClientes] = useState<any[]>([]);

  const [formData, setFormData] = useState({
  nombre: "",
  especie: "Canino",
  raza: "",
  sexo: "Macho",
  clienteId: "",
  edad: "",
  peso: "",
  castrado: false,
  foto: "", // <-- Añadir esto
  fechaIngreso: new Date().toISOString(),
  sedeId: "1",
  alimentoPrincipal: "No especificado"
  });

  useEffect(() => {
    clientesApi.listar()
      .then(setClientes)
      .catch(err => console.error("Error al cargar clientes", err));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...formData,
        clienteId: parseInt(formData.clienteId),
        sedeId: parseInt(formData.sedeId),
      };

      await pacientesApi.crear(payload);
      router.push("/mascotas/listar");
    } catch (error) {
      console.error("Error al guardar:", error);
      alert("Error al registrar el paciente. Revisa los datos.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen p-4 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-700 overflow-hidden">
      
      {/* MARCAS DE AGUA */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-20">
        <PawPrint size={150} className="absolute top-[5%] right-[5%] rotate-12 text-[#00a8a8]" />
        <Bone size={170} className="absolute top-[40%] left-[-2%] -rotate-12 text-slate-400" />
        <PawPrint size={220} className="absolute bottom-[-5%] left-1/2 -translate-x-1/2 rotate-45 text-slate-300" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/mascotas/listar" className="p-3 bg-white/90 hover:bg-white text-slate-400 hover:text-[#00a8a8] rounded-2xl shadow-sm transition-all border border-slate-100">
            <ArrowLeft size={24} />
          </Link>
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Registro de Paciente</h1>
            <p className="text-[#00a8a8] text-sm font-medium">CliniCore v2.0 • Sistema de Gestión</p>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-2xl border border-white p-8 md:p-12">
          <form onSubmit={handleSubmit} className="space-y-8">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* --- DATOS BÁSICOS --- */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-slate-600 font-bold ml-2">
                  <Tag size={18} className="text-[#00a8a8]" /> Nombre
                </label>
                <input
                  required
                  type="text"
                  placeholder="Ej: Max"
                  className="w-full px-6 py-4 rounded-2xl border-none bg-slate-100/50 focus:ring-4 focus:ring-[#00a8a8]/10 transition-all text-slate-700 font-medium shadow-inner"
                  value={formData.nombre}
                  onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-slate-600 font-bold ml-2">
                  <Hash size={18} className="text-[#00a8a8]" /> Edad
                </label>
                <input
                  required
                  type="text"
                  placeholder="Ej: 3 años"
                  className="w-full px-6 py-4 rounded-2xl border-none bg-slate-100/50 focus:ring-4 focus:ring-[#00a8a8]/10 transition-all text-slate-700 font-medium shadow-inner"
                  value={formData.edad}
                  onChange={(e) => setFormData({...formData, edad: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-slate-600 font-bold ml-2">
                  <Scale size={18} className="text-[#00a8a8]" /> Peso
                </label>
                <input
                  required
                  type="text"
                  placeholder="Ej: 12kg"
                  className="w-full px-6 py-4 rounded-2xl border-none bg-slate-100/50 focus:ring-4 focus:ring-[#00a8a8]/10 transition-all text-slate-700 font-medium shadow-inner"
                  value={formData.peso}
                  onChange={(e) => setFormData({...formData, peso: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-slate-600 font-bold ml-2">
                  <Info size={18} className="text-[#00a8a8]" /> Sexo
                </label>
                <select
                  className="w-full px-6 py-4 rounded-2xl border-none bg-slate-100/50 focus:ring-4 focus:ring-[#00a8a8]/10 transition-all text-slate-700 font-medium shadow-inner appearance-none"
                  value={formData.sexo}
                  onChange={(e) => setFormData({...formData, sexo: e.target.value})}
                >
                  <option value="Macho">Macho</option>
                  <option value="Hembra">Hembra</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-slate-600 font-bold ml-2">
                  <PawPrint size={18} className="text-[#00a8a8]" /> Especie
                </label>
                <select
                  className="w-full px-6 py-4 rounded-2xl border-none bg-slate-100/50 focus:ring-4 focus:ring-[#00a8a8]/10 transition-all text-slate-700 font-medium shadow-inner appearance-none"
                  value={formData.especie}
                  onChange={(e) => setFormData({...formData, especie: e.target.value})}
                >
                  <option value="Canino">Canino</option>
                  <option value="Felino">Felino</option>
                  <option value="Ave">Ave</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-slate-600 font-bold ml-2">
                  <Bone size={18} className="text-[#00a8a8]" /> Raza
                </label>
                <input
                  required
                  type="text"
                  placeholder="Ej: Golden Retriever"
                  className="w-full px-6 py-4 rounded-2xl border-none bg-slate-100/50 focus:ring-4 focus:ring-[#00a8a8]/10 transition-all text-slate-700 font-medium shadow-inner"
                  value={formData.raza}
                  onChange={(e) => setFormData({...formData, raza: e.target.value})}
                />
              </div>

              {/* --- INFO ADICIONAL --- */}
              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <HeartPulse className="text-[#00a8a8]" />
                <div className="flex items-center gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    id="castrado"
                    className="w-6 h-6 rounded-lg border-none bg-white text-[#00a8a8] focus:ring-[#00a8a8]/20 transition-all"
                    checked={formData.castrado}
                    onChange={(e) => setFormData({...formData, castrado: e.target.checked})}
                  />
                  <label htmlFor="castrado" className="text-slate-700 font-bold">¿Está castrado?</label>
                </div>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-slate-600 font-bold ml-2">
                  <User size={18} className="text-[#00a8a8]" /> Propietario
                </label>
                <select
                  required
                  className="w-full px-6 py-4 rounded-2xl border-none bg-slate-100/50 focus:ring-4 focus:ring-[#00a8a8]/10 transition-all text-slate-700 font-medium shadow-inner"
                  value={formData.clienteId}
                  onChange={(e) => setFormData({...formData, clienteId: e.target.value})}
                >
                  <option value="">Selecciona un dueño...</option>
                  {clientes.map(c => (
                    <option key={c.id} value={c.id}>{c.nombres} ({c.documento})</option>
                  ))}
                </select>
              </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-slate-600 font-bold ml-2">
                    <Tag size={18} className="text-[#00a8a8]" /> URL de la Foto
                  </label>
                  <input
                    type="url"
                    placeholder="https://ejemplo.com/foto.jpg"
                    className="w-full px-6 py-4 rounded-2xl border-none bg-slate-100/50 focus:ring-4 focus:ring-[#00a8a8]/10 transition-all text-slate-700 font-medium shadow-inner"
                    value={formData.foto}
                    onChange={(e) => setFormData({...formData, foto: e.target.value})}
                  />
                </div>

            </div>

            

            <button
              disabled={loading}
              type="submit"
              className="w-full flex items-center justify-center gap-3 bg-[#00a8a8] hover:bg-[#008585] text-white py-5 rounded-2xl shadow-xl shadow-cyan-900/20 transition-all font-bold text-xl active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" /> : <><Save size={24} /> Registrar Paciente</>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

// Importación faltante de Loader2
import { Loader2 } from "lucide-react";