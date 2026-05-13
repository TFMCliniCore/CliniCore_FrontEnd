"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, User, Mail, Phone, Hash, MapPin, Building } from "lucide-react";
import Link from "next/link";
import { clientesApi } from '@/lib/api'; 

export default function NuevoClientePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Estado del formulario basado en tu modelo de Prisma
  const [formData, setFormData] = useState({
    nombres: "",
    documento: "",
    email: "",
    celular: "",
    direccion: "",
    ciudad: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await clientesApi.crear(formData);
      // Si es exitoso, volvemos a la lista de clientes
      router.push('/clientes/listar');
    } catch (err: any) {
      console.error("Error al crear cliente:", err);
      setError(err.message || "Ocurrió un error al guardar el cliente.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="bg-white p-8 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight">
            Registrar Nuevo Cliente
          </h1>
          <p className="text-slate-500 mt-2 text-lg font-medium">
            Ingresa los datos del propietario para añadirlo al sistema.
          </p>
        </div>
        <Link 
          href="/clientes/listar"
          className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-600 px-6 py-3 rounded-2xl transition-all shadow-sm border border-slate-200 font-bold text-base active:scale-95"
        >
          <ArrowLeft size={20} />
          Volver a la lista
        </Link>
      </div>

      {/* Formulario */}
      <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-50 overflow-hidden">
        <form onSubmit={handleSubmit} className="p-8 md:p-10">
          
          {error && (
            <div className="mb-8 p-4 bg-red-50 text-red-600 rounded-2xl border border-red-100 flex items-center gap-3 font-medium">
              <span className="flex-shrink-0 bg-red-100 p-1 rounded-full">⚠️</span>
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Campo Nombres */}
            <div className="space-y-3">
              <label className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                <User size={16} className="text-[#00a8a8]" />
                Nombre Completo *
              </label>
              <input 
                type="text" 
                name="nombres"
                value={formData.nombres}
                onChange={handleChange}
                required
                placeholder="Ej. Camila Rodriguez" 
                className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-[#00a8a8]/20 focus:border-[#00a8a8] transition-all bg-slate-50/50 focus:bg-white text-slate-700 font-medium placeholder:text-slate-400 outline-none"
              />
            </div>

            {/* Campo Documento */}
            <div className="space-y-3">
              <label className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                <Hash size={16} className="text-[#00a8a8]" />
                Documento de Identidad *
              </label>
              <input 
                type="text" 
                name="documento"
                value={formData.documento}
                onChange={handleChange}
                required
                placeholder="Ej. CC10203040" 
                className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-[#00a8a8]/20 focus:border-[#00a8a8] transition-all bg-slate-50/50 focus:bg-white text-slate-700 font-medium placeholder:text-slate-400 outline-none"
              />
            </div>

            {/* Campo Email */}
            <div className="space-y-3">
              <label className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                <Mail size={16} className="text-[#00a8a8]" />
                Correo Electrónico *
              </label>
              <input 
                type="email" 
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="ejemplo@correo.com" 
                className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-[#00a8a8]/20 focus:border-[#00a8a8] transition-all bg-slate-50/50 focus:bg-white text-slate-700 font-medium placeholder:text-slate-400 outline-none"
              />
            </div>

            {/* Campo Celular */}
            <div className="space-y-3">
              <label className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                <Phone size={16} className="text-[#00a8a8]" />
                Celular / Teléfono *
              </label>
              <input 
                type="text" 
                name="celular"
                value={formData.celular}
                onChange={handleChange}
                required
                placeholder="Ej. 3001112233" 
                className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-[#00a8a8]/20 focus:border-[#00a8a8] transition-all bg-slate-50/50 focus:bg-white text-slate-700 font-medium placeholder:text-slate-400 outline-none"
              />
            </div>

            {/* Campo Dirección */}
            <div className="space-y-3">
              <label className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                <MapPin size={16} className="text-[#00a8a8]" />
                Dirección
              </label>
              <input 
                type="text" 
                name="direccion"
                value={formData.direccion}
                onChange={handleChange}
                placeholder="Ej. Cra 45 #12-89" 
                className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-[#00a8a8]/20 focus:border-[#00a8a8] transition-all bg-slate-50/50 focus:bg-white text-slate-700 font-medium placeholder:text-slate-400 outline-none"
              />
            </div>

            {/* Campo Ciudad */}
            <div className="space-y-3">
              <label className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                <Building size={16} className="text-[#00a8a8]" />
                Ciudad
              </label>
              <input 
                type="text" 
                name="ciudad"
                value={formData.ciudad}
                onChange={handleChange}
                placeholder="Ej. Bogotá" 
                className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-[#00a8a8]/20 focus:border-[#00a8a8] transition-all bg-slate-50/50 focus:bg-white text-slate-700 font-medium placeholder:text-slate-400 outline-none"
              />
            </div>
          </div>

          {/* Acciones del Formulario */}
          <div className="mt-12 flex items-center justify-end gap-4 border-t border-slate-100 pt-8">
            <Link 
              href="/clientes/listar"
              className="px-8 py-4 rounded-2xl text-slate-500 hover:bg-slate-100 font-bold transition-all"
            >
              Cancelar
            </Link>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="flex items-center gap-3 bg-[#00a8a8] hover:bg-[#008585] disabled:bg-cyan-300 disabled:cursor-not-allowed text-white px-10 py-4 rounded-2xl transition-all shadow-lg shadow-cyan-900/20 font-bold text-lg active:scale-95"
            >
              {isSubmitting ? (
                <>
                  <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Guardando...
                </>
              ) : (
                <>
                  <Save size={24} />
                  Guardar Cliente
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}