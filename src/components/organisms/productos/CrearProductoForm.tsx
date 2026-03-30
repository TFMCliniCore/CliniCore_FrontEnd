"use client";

import React, { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import Image from "next/image"; // Importante para la ilustración de fondo
import { 
  Package, Tag, DollarSign, Database, 
  Plus, Save, X, Calendar 
} from "lucide-react";  

type ProductoFormData = {
  nombre: string;
  categoria: string;
  marca: string;
  codigoBarras: string;
  referenciaInterna: string;
  proveedor: string;
  sede: string;
  fechaIngreso: string;
  fechaFabricacion: string;
  fechaVencimiento: string;
  cantidadTotal: number;
  unidadMedida: string;
  cantidadMinima: number;
  cantidadMaxima: number;
  peso: string;
  precioCosto: number;
  impuesto: number;
  precioMasImpuestos: number;
  precioVenta: number;
};

export default function CrearProductoForm() {
  const { 
    register, 
    handleSubmit, 
    setValue, 
    control,
    formState: { errors } 
  } = useForm<ProductoFormData>({
    defaultValues: {
      impuesto: 0,
      precioCosto: 0,
      precioMasImpuestos: 0
    }
  });

  const precioCosto = useWatch({ control, name: "precioCosto" });
  const impuesto = useWatch({ control, name: "impuesto" });

  useEffect(() => {
    const costo = Number(precioCosto) || 0;
    const porcentaje = Number(impuesto) || 0;
    const total = costo + (costo * (porcentaje / 100));
    setValue("precioMasImpuestos", parseFloat(total.toFixed(2)));
  }, [precioCosto, impuesto, setValue]);

  const onSubmit = (data: ProductoFormData) => {
    console.log("Datos del Producto:", data);
  };

  return (
    /* CONTENEDOR PRINCIPAL CON POSICIÓN RELATIVA */
    <div className="relative w-full min-h-screen overflow-hidden pt-2">
      
      {/* ILUSTRACIÓN DE FONDO (DOCTOR Y MASCOTAS) */}
      <div className="absolute top-[-15px] right-[-250px] w-[600px] h-[600px] pointer-events-none opacity-70 z-1000 select-none">
        <Image 
          src="/images/doctor-pets-bg.png"
          alt="Background Illustration"
          width={410}
          height={410}
          className="object-contain"
        />
      </div>

      {/* TEXTURAS ADICIONALES (Huellas/Paw prints similares a Home.png) */}
      <div className="absolute top-0 pointer-events-none z-0  opacity-60 select-none" >
      <Image 
          src="/images/paws-pattern.png"
          alt="Background Illustration"
          width={1100}
          height={900}
          className="object-contain"
        />
      </div>


      {/* CONTENIDO DEL FORMULARIO (Z-10 para estar sobre el fondo) */}
      <div className="relative z-10 w-full max-w-[1600px] mx-auto px-4 md:px-8 pt-300px">
        
        {/* HEADER */}
        <div className="flex items-center justify-between pt-200px">
          <div>
            <h2 className="text-2xl font-bold text-emerald-600 tracking-tight">Crear Nuevo Producto</h2>
            <p className="text-slate-500 text-sm font-medium">Registra un nuevo artículo en tu inventario veterinario.</p>
          </div>
          <button type="button" className="flex items-center space-x-2 px-4 py-2 text-slate-500 hover:bg-white hover:shadow-sm rounded-xl transition-all font-medium border border-transparent hover:border-slate-200">
            <X size={18} />
            <span>Cancelar</span>
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 items-start mt-40">
          
          {/* TARJETA 1: Imagen (Glassmorphism sutil) */}
          <div className="xl:col-span-1 bg-white/80 backdrop-blur-md p-6 rounded-[2.5rem] shadow-sm border border-white flex flex-col items-center justify-center text-center space-y-4 h-full min-h-[350px]">
            <span className="text-sm font-bold text-slate-700 w-full text-left mb-2 px-2">Imagen del Producto</span>
            <div className="w-full aspect-square bg-slate-50/50 border-2 border-dashed border-slate-200 rounded-[2rem] flex flex-col items-center justify-center group hover:border-cyan-400 transition-colors cursor-pointer relative overflow-hidden shadow-inner">
              <div className="bg-white p-4 rounded-full shadow-md group-hover:scale-110 transition-transform">
                <Plus size={32} className="text-cyan-500" />
              </div>
              <span className="mt-4 text-xs text-slate-400 font-bold px-6">Click para subir imagen</span>
            </div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-auto pt-4">Formatos: JPG, PNG</p>
          </div>

          {/* TARJETA 2: Información General */}
          <div className="md:col-span-2 xl:col-span-2 bg-white/80 backdrop-blur-md p-8 rounded-[2.5rem] shadow-sm border border-white space-y-6 h-full">
            <div className="flex items-center space-x-2 text-cyan-600 border-b border-slate-100 pb-4 mb-2">
              <Package size={20} />
              <h3 className="font-bold uppercase tracking-widest text-xs">Información General</h3>
            </div>

            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase ml-1">Nombre del Producto</label>
                <input 
                  {...register("nombre", { required: true })}
                  className={`w-full px-5 py-3.5 bg-slate-50/50 border border-slate-100 rounded-2xl focus:ring-2 transition-all outline-none ${errors.nombre ? 'ring-2 ring-red-400' : 'focus:ring-cyan-400/50 focus:bg-white'}`}
                  placeholder="Ej. Alimento Premium Adulto"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase ml-1">Categoría</label>
                  <select {...register("categoria", { required: true })} className="w-full px-5 py-3.5 bg-slate-50/50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-cyan-400/50 transition-all outline-none appearance-none cursor-pointer">
                    <option value="">Seleccione:</option>
                    <option value="medicamentos">Medicamentos</option>
                    <option value="alimentos">Alimentos</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase ml-1">Referencia</label>
                  <input {...register("referenciaInterna", { required: true })} className="w-full px-5 py-3.5 bg-slate-50/50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-cyan-400/50 transition-all outline-none" placeholder="REF-001" />
                </div>
              </div>
            </div>
          </div>

          {/* TARJETA 3: Fechas */}
          <div className="xl:col-span-1 bg-white/80 backdrop-blur-md p-8 rounded-[2.5rem] shadow-sm border border-white space-y-6 h-full">
            <div className="flex items-center space-x-2 text-indigo-500 border-b border-slate-100 pb-4 mb-2">
              <Calendar size={20} />
              <h3 className="font-bold uppercase tracking-widest text-xs">Fechas de Control</h3>
            </div>
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase ml-1">Vencimiento</label>
                <input type="date" {...register("fechaVencimiento")} className="w-full px-5 py-3.5 bg-slate-50/50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-400/50 transition-all outline-none text-slate-600 cursor-pointer" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase ml-1">Fabricación</label>
                <input type="date" {...register("fechaFabricacion")} className="w-full px-5 py-3.5 bg-slate-50/50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-400/50 transition-all outline-none text-slate-600 cursor-pointer" />
              </div>
            </div>
          </div>

          {/* TARJETA 4: Finanzas */}
          <div className="md:col-span-2 xl:col-span-4 bg-white/90 backdrop-blur-lg p-8 rounded-[2.5rem] shadow-xl border border-white mt-4">
            <div className="flex items-center space-x-2 text-emerald-600 border-b border-slate-100 pb-4 mb-6">
              <DollarSign size={22} />
              <h3 className="font-bold uppercase tracking-widest text-sm">Resumen de Costos y Venta</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase ml-1">Precio Costo</label>
                <div className="relative group">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                  <input type="number" step="0.01" {...register("precioCosto")} className="w-full pl-10 pr-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-emerald-400/50 transition-all outline-none group-hover:bg-white" />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase ml-1">IVA / Impuesto (%)</label>
                <select {...register("impuesto")} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-emerald-400/50 transition-all outline-none appearance-none cursor-pointer">
                  <option value="0">Exento (0%)</option>
                  <option value="19">IVA (19%)</option>
                  <option value="5">IVA (5%)</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase ml-1">Costo con Impuestos</label>
                <div className="relative">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 font-bold">$</span>
                  <input type="number" {...register("precioMasImpuestos")} disabled className="w-full pl-10 pr-5 py-4 bg-slate-100/50 border border-slate-50 rounded-2xl text-slate-400 font-bold outline-none cursor-not-allowed" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-emerald-600 uppercase ml-1">Precio Venta Final</label>
                <div className="relative">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 text-emerald-500 font-bold text-lg">$</span>
                  <input type="number" step="0.01" {...register("precioVenta", { required: true })} className="w-full pl-10 pr-5 py-4 bg-emerald-50/50 border border-emerald-100 rounded-2xl focus:ring-2 focus:ring-emerald-400/50 transition-all text-emerald-700 text-xl font-black outline-none placeholder:text-emerald-200" placeholder="0.00" />
                </div>
              </div>
            </div>
          </div>

          {/* ACCIÓN FINAL */}
          <div className="md:col-span-2 xl:col-span-4 flex justify-center sm:justify-end pt-8">
            <button type="submit" className="group relative flex items-center space-x-3 px-16 py-5 bg-gradient-to-r from-cyan-600 via-cyan-500 to-emerald-500 text-white rounded-[2rem] font-black uppercase tracking-widest text-sm shadow-[0_20px_40px_-15px_rgba(16,185,129,0.3)] hover:scale-[1.03] active:scale-95 transition-all overflow-hidden">
              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity" />
              <Save size={20} className="group-hover:rotate-12 transition-transform" />
              <span>Guardar Producto</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}