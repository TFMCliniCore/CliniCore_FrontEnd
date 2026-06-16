'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

import { citasApi, pacientesApi, usuariosApi, type Paciente, type Usuario } from '@/lib/api';
import {
  Calendar, Clock, Dog, User, MapPin, FileText,
  Save, X, ChevronLeft, AlertCircle, CheckCircle2, Loader2
} from 'lucide-react';

type FormData = {
  pacienteId: number;
  usuarioId: number;
  fecha: string;
  hora: string;
  tipo: string;
  motivo: string;
  notas: string;
};

export default function NuevaCitaPage() {
  const router = useRouter();
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [usuarios, setUsuarios]   = useState<Usuario[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [errorData, setErrorData]     = useState<string | null>(null);
  const [guardando, setGuardando]     = useState(false);
  const [exito, setExito]             = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      fecha: new Date().toISOString().split('T')[0],
      hora: '09:00',
    },
  });

  useEffect(() => {
    Promise.all([pacientesApi.listar(), usuariosApi.listar()])
      .then(([p, u]) => { setPacientes(p); setUsuarios(u); })
      .catch(() => setErrorData('No se pudo cargar la información del servidor.'))
      .finally(() => setLoadingData(false));
  }, []);

  const onSubmit = async (data: FormData) => {
    try {
      setGuardando(true);
      const fecha = new Date(`${data.fecha}T${data.hora}:00`).toISOString();
      await citasApi.crear({
        pacienteId: Number(data.pacienteId),
        usuarioId:  Number(data.usuarioId),
        fecha,
        motivo: data.motivo,
        tipo:   data.tipo,
      });
      setExito(true);
      setTimeout(() => router.push('/agenda'), 1500);
    } catch (e: any) {
      setErrorData(e.message ?? 'Error al guardar la cita.');
    } finally {
      setGuardando(false);
    }
  };

  const FieldWrapper = ({ label, icon: Icon, error, children }: {
    label: string; icon: React.ElementType; error?: string; children: React.ReactNode;
  }) => (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-700">
        <Icon size={15} className="text-cyan-600" /> {label}
      </label>
      {children}
      {error && <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle size={12}/>{error}</p>}
    </div>
  );

  const inputClass = (hasError?: boolean) =>
    `w-full px-4 py-3 rounded-xl border text-sm bg-white transition-all outline-none focus:ring-2 focus:ring-cyan-400
    ${hasError ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-cyan-400'}`;

  const usuarioSeleccionado = usuarios.find(u => u.id === Number(watch('usuarioId')));

  return (
    <>
      <div className="relative min-h-screen overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 pointer-events-none opacity-60 select-none hidden xl:block">
          <Image src="/images/doctor-pets-bg.png" alt="" width={350} height={350} className="object-contain" />
        </div>

        <div className="flex items-center gap-2 mb-6 text-sm text-gray-500">
          <Link href="/agenda" className="flex items-center gap-1 hover:text-cyan-600 transition-colors font-medium">
            <ChevronLeft size={16} /> Agenda
          </Link>
          <span>/</span>
          <span className="text-gray-900 font-semibold">Nueva Cita</span>
        </div>

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Calendar className="text-cyan-600" size={26} /> Agendar Nueva Cita
          </h1>
          <p className="text-gray-500 text-sm mt-1">Completa los datos para registrar el turno</p>
        </div>

        {errorData && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center gap-2">
            <AlertCircle size={18} /> {errorData}
            <button onClick={() => setErrorData(null)} className="ml-auto"><X size={16}/></button>
          </div>
        )}

        {exito && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm flex items-center gap-2">
            <CheckCircle2 size={18} /> Cita creada correctamente. Redirigiendo...
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Card: Información de la cita */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
              <h2 className="text-base font-bold text-gray-800 pb-3 border-b border-gray-100 flex items-center gap-2">
                <Calendar size={18} className="text-cyan-600" /> Información de la Cita
              </h2>

              <div className="grid grid-cols-2 gap-4">
                <FieldWrapper label="Fecha" icon={Calendar} error={errors.fecha?.message}>
                  <input type="date" {...register('fecha', { required: 'Requerido' })} className={inputClass(!!errors.fecha)} />
                </FieldWrapper>
                <FieldWrapper label="Hora" icon={Clock} error={errors.hora?.message}>
                  <input type="time" {...register('hora', { required: 'Requerido' })} className={inputClass(!!errors.hora)} />
                </FieldWrapper>
              </div>

              <FieldWrapper label="Tipo de cita" icon={FileText} error={errors.tipo?.message}>
                <select {...register('tipo', { required: 'Selecciona un tipo' })} className={inputClass(!!errors.tipo)}>
                  <option value="">— Selecciona tipo —</option>
                  <option value="CONSULTA">Consulta</option>
                  <option value="VACUNACION">Vacunación</option>
                  <option value="CIRUGIA">Cirugía</option>
                  <option value="CONTROL">Control</option>
                  <option value="EMERGENCIA">Emergencia</option>
                  <option value="OTRO">Otro</option>
                </select>
              </FieldWrapper>

              <FieldWrapper label="Motivo de la consulta" icon={FileText} error={errors.motivo?.message}>
                <input
                  type="text"
                  placeholder="Ej: Control rutinario, vacunación, revisión..."
                  {...register('motivo', { required: 'El motivo es requerido', minLength: { value: 3, message: 'Mínimo 3 caracteres' } })}
                  className={inputClass(!!errors.motivo)}
                />
              </FieldWrapper>

              <FieldWrapper label="Notas adicionales (opcional)" icon={FileText}>
                <textarea
                  rows={3}
                  placeholder="Observaciones, síntomas, instrucciones especiales..."
                  {...register('notas')}
                  className={`${inputClass()} resize-none`}
                />
              </FieldWrapper>
            </div>

            {/* Card: Participantes */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
              <h2 className="text-base font-bold text-gray-800 pb-3 border-b border-gray-100 flex items-center gap-2">
                <User size={18} className="text-cyan-600" /> Participantes y Sede
              </h2>

              <FieldWrapper label="Paciente" icon={Dog} error={errors.pacienteId?.message}>
                <select
                  {...register('pacienteId', { required: 'Selecciona un paciente' })}
                  className={inputClass(!!errors.pacienteId)}
                  disabled={loadingData}
                >
                  <option value="">{loadingData ? 'Cargando pacientes...' : '— Selecciona paciente —'}</option>
                  {pacientes.map(p => (
                    <option key={p.id} value={p.id}>{p.nombre} ({p.especie}) — {p.cliente.nombres}</option>
                  ))}
                </select>
              </FieldWrapper>

              <FieldWrapper label="Veterinario / Responsable" icon={User} error={errors.usuarioId?.message}>
                <select
                  {...register('usuarioId', { required: 'Selecciona un responsable' })}
                  className={inputClass(!!errors.usuarioId)}
                  disabled={loadingData}
                >
                  <option value="">{loadingData ? 'Cargando usuarios...' : '— Selecciona responsable —'}</option>
                  {usuarios.map(u => (
                    <option key={u.id} value={u.id}>{u.nombres} — {u.cargo}</option>
                  ))}
                </select>
              </FieldWrapper>

              {/* Sede automática del usuario seleccionado */}
              {usuarioSeleccionado?.sucursal ? (
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-50 border border-gray-200">
                  <MapPin size={16} className="text-cyan-600 flex-shrink-0"/>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Sede asignada automáticamente</p>
                    <p className="text-sm font-semibold text-gray-800">{usuarioSeleccionado.sucursal.nombre}</p>
                    <p className="text-xs text-gray-400">{usuarioSeleccionado.sucursal.direccion}</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-50 border border-dashed border-gray-200">
                  <MapPin size={16} className="text-gray-300 flex-shrink-0"/>
                  <p className="text-xs text-gray-400">La sede se asignará según el veterinario seleccionado</p>
                </div>
              )}

              {loadingData && (
                <div className="flex items-center gap-2 text-sm text-cyan-600 bg-cyan-50 px-4 py-3 rounded-xl">
                  <Loader2 size={16} className="animate-spin" /> Conectando con el servidor...
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 mt-6">
            <Link href="/agenda" className="flex items-center gap-2 px-5 py-3 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 font-semibold text-sm transition-all">
              <X size={16} /> Cancelar
            </Link>
            <button
              type="submit"
              disabled={guardando || loadingData}
              className="flex items-center gap-2 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700 disabled:opacity-50 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-md transition-all"
            >
              {guardando ? <><Loader2 size={16} className="animate-spin" /> Guardando...</> : <><Save size={16} /> Guardar Cita</>}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}