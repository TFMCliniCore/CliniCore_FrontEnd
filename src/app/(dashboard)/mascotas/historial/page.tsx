"use client";

import { useMemo, useState } from "react";

import {
  PawPrint,
  HeartPulse,
  ShieldAlert,
  Syringe,
  Activity,
  FileText,
  Plus,
  Printer,
  Upload,
  Stethoscope,
  Clock3,
  Weight,
  Thermometer,
  Heart,
  ChevronRight,
  Dog,
} from "lucide-react";

/* =========================================================
   TYPES
========================================================= */

interface MedicalEvent {
  id: number;
  tipo:
    | "CONSULTA"
    | "VACUNA"
    | "CIRUGIA"
    | "EXAMEN"
    | "HOSPITALIZACION";
  titulo: string;
  descripcion: string;
  fecha: string;
  medico: string;
  estado?: string;
}

interface PacienteHistorial {
  id: number;
  nombre: string;
  especie: string;
  raza: string;
  sexo: string;
  edad: string;
  peso: string;
  propietario: string;
  foto: string;
  estado: "ACTIVO" | "CRITICO";
  alergias: string[];
  medicamentos: string[];
  vacunasPendientes: number;
}

/* =========================================================
   MOCK DATA
========================================================= */

const paciente: PacienteHistorial = {
  id: 1023,
  nombre: "Max",
  especie: "Canino",
  raza: "Golden Retriever",
  sexo: "Macho",
  edad: "4 años",
  peso: "28kg",
  propietario: "Carlos Mendoza",
  foto:
    "https://images.unsplash.com/photo-1517849845537-4d257902454a?q=80&w=1200&auto=format&fit=crop",
  estado: "ACTIVO",
  alergias: ["Penicilina", "Pollo"],
  medicamentos: ["Omeprazol", "Carprofeno"],
  vacunasPendientes: 2,
};

const historial: MedicalEvent[] = [
  {
    id: 1,
    tipo: "CONSULTA",
    titulo: "Consulta General",
    descripcion:
      "Paciente estable. Se detecta inflamación leve en oído derecho.",
    fecha: "2026-05-12",
    medico: "Dra. Laura Méndez",
  },
  {
    id: 2,
    tipo: "VACUNA",
    titulo: "Vacuna Antirrábica",
    descripcion:
      "Aplicación de vacuna anual sin complicaciones.",
    fecha: "2026-04-22",
    medico: "Dr. Felipe Rojas",
  },
  {
    id: 3,
    tipo: "EXAMEN",
    titulo: "Hemograma Completo",
    descripcion:
      "Resultados normales. Sin signos de infección.",
    fecha: "2026-04-10",
    medico: "Laboratorio Central",
  },
  {
    id: 4,
    tipo: "HOSPITALIZACION",
    titulo: "Observación Clínica",
    descripcion:
      "Paciente hospitalizado 24h por vómitos recurrentes.",
    fecha: "2026-03-28",
    medico: "Dra. Valentina Ruiz",
  },
];

/* =========================================================
   PAGE
========================================================= */

export default function HistorialClinicoPage() {
  const [tab, setTab] = useState("RESUMEN");

  const totalConsultas = useMemo(
    () =>
      historial.filter(
        (e) => e.tipo === "CONSULTA"
      ).length,
    []
  );

  return (
    <div className="space-y-6 pb-10 animate-in fade-in duration-500">

      {/* =========================================================
          HEADER
      ========================================================= */}

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">

        <div className="relative h-36 bg-gradient-to-r from-teal-600 via-cyan-600 to-slate-800">

          <div className="absolute inset-0 bg-black/10" />

          <div className="absolute bottom-0 left-0 right-0 p-6">

            <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6">

              {/* INFO */}
              <div className="flex items-end gap-5">

                {/* FOTO */}
                <div className="w-28 h-28 rounded-3xl overflow-hidden border-4 border-white shadow-xl bg-white shrink-0">

                  <img
                    src={paciente.foto}
                    alt={paciente.nombre}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* DATA */}
                <div className="text-white pb-1">

                  <div className="flex items-center gap-2 flex-wrap">

                    <h1 className="text-3xl font-bold">
                      {paciente.nombre}
                    </h1>

                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                        paciente.estado === "ACTIVO"
                          ? "bg-emerald-500/20 border-emerald-300/20 text-emerald-50"
                          : "bg-red-500/20 border-red-300/20 text-red-50"
                      }`}
                    >
                      {paciente.estado}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-sm text-white/80 mt-2">

                    <span className="flex items-center gap-1">
                      <Dog size={14} />
                      {paciente.especie}
                    </span>

                    <span>
                      {paciente.raza}
                    </span>

                    <span>
                      {paciente.edad}
                    </span>

                    <span>
                      {paciente.peso}
                    </span>

                    <span>
                      HC #{paciente.id}
                    </span>
                  </div>

                  <div className="text-sm text-white/70 mt-2">
                    Propietario:
                    <span className="font-medium ml-1">
                      {paciente.propietario}
                    </span>
                  </div>
                </div>
              </div>

              {/* ACTIONS */}
              <div className="flex flex-wrap gap-3">

                <button className="h-11 px-5 rounded-xl bg-white text-gray-800 text-sm font-semibold flex items-center gap-2 hover:bg-gray-100 transition-colors">
                  <Plus size={18} />
                  Nueva Consulta
                </button>

                <button className="h-11 px-5 rounded-xl bg-white/10 border border-white/20 text-white text-sm font-semibold flex items-center gap-2 hover:bg-white/20 transition-colors">
                  <Upload size={18} />
                  Subir Examen
                </button>

                <button className="h-11 px-5 rounded-xl bg-white/10 border border-white/20 text-white text-sm font-semibold flex items-center gap-2 hover:bg-white/20 transition-colors">
                  <Printer size={18} />
                  Imprimir HC
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* TABS */}
        <div className="px-6 border-t border-gray-100 bg-white">

          <div className="flex gap-2 overflow-x-auto py-4">

            {[
              "RESUMEN",
              "CONSULTAS",
              "VACUNAS",
              "EXAMENES",
              "HOSPITALIZACION",
            ].map((item) => (
              <button
                key={item}
                onClick={() => setTab(item)}
                className={`px-4 h-11 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
                  tab === item
                    ? "bg-teal-600 text-white shadow-lg shadow-teal-600/20"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* =========================================================
          STATS
      ========================================================= */}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">

        {/* CONSULTAS */}
        <div className="bg-white rounded-3xl border border-gray-100 p-5 shadow-sm">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm text-gray-500">
                Consultas
              </p>

              <h3 className="text-3xl font-bold text-gray-900 mt-2">
                {totalConsultas}
              </h3>
            </div>

            <div className="w-14 h-14 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <Stethoscope size={26} />
            </div>
          </div>
        </div>

        {/* VACUNAS */}
        <div className="bg-white rounded-3xl border border-gray-100 p-5 shadow-sm">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm text-gray-500">
                Vacunas Pendientes
              </p>

              <h3 className="text-3xl font-bold text-gray-900 mt-2">
                {paciente.vacunasPendientes}
              </h3>
            </div>

            <div className="w-14 h-14 rounded-2xl bg-cyan-50 text-cyan-600 flex items-center justify-center">
              <Syringe size={26} />
            </div>
          </div>
        </div>

        {/* MEDICAMENTOS */}
        <div className="bg-white rounded-3xl border border-gray-100 p-5 shadow-sm">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm text-gray-500">
                Medicamentos
              </p>

              <h3 className="text-3xl font-bold text-gray-900 mt-2">
                {paciente.medicamentos.length}
              </h3>
            </div>

            <div className="w-14 h-14 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center">
              <HeartPulse size={26} />
            </div>
          </div>
        </div>

        {/* ALERGIAS */}
        <div className="bg-white rounded-3xl border border-gray-100 p-5 shadow-sm">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm text-gray-500">
                Alergias
              </p>

              <h3 className="text-3xl font-bold text-gray-900 mt-2">
                {paciente.alergias.length}
              </h3>
            </div>

            <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center">
              <ShieldAlert size={26} />
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================
          CONTENT
      ========================================================= */}

      <div className="grid grid-cols-1 2xl:grid-cols-[1fr_350px] gap-6">

        {/* LEFT */}
        <div className="space-y-6">

          {/* RESUMEN */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">

            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">

              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Resumen Clínico
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  Información médica general del paciente.
                </p>
              </div>

              <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center">
                <FileText size={22} />
              </div>
            </div>

            <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-5">

              {/* ALERGIAS */}
              <div className="rounded-2xl border border-red-100 bg-red-50 p-5">

                <div className="flex items-center gap-2 text-red-700 font-semibold">

                  <ShieldAlert size={18} />
                  Alergias
                </div>

                <div className="flex flex-wrap gap-2 mt-4">

                  {paciente.alergias.map(
                    (item, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 rounded-full bg-white border border-red-200 text-red-700 text-xs font-semibold"
                      >
                        {item}
                      </span>
                    )
                  )}
                </div>
              </div>

              {/* MEDICAMENTOS */}
              <div className="rounded-2xl border border-violet-100 bg-violet-50 p-5">

                <div className="flex items-center gap-2 text-violet-700 font-semibold">

                  <HeartPulse size={18} />
                  Medicamentos Activos
                </div>

                <div className="flex flex-wrap gap-2 mt-4">

                  {paciente.medicamentos.map(
                    (item, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 rounded-full bg-white border border-violet-200 text-violet-700 text-xs font-semibold"
                      >
                        {item}
                      </span>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* TIMELINE */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">

            <div className="px-6 py-5 border-b border-gray-100">

              <h2 className="text-lg font-bold text-gray-900">
                Timeline Médica
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Evolución clínica y eventos médicos.
              </p>
            </div>

            <div className="p-6">

              <div className="space-y-5">

                {historial.map((evento) => (

                  <div
                    key={evento.id}
                    className="relative pl-8"
                  >

                    {/* LINE */}
                    <div className="absolute left-[9px] top-10 bottom-[-24px] w-[2px] bg-gray-200" />

                    {/* DOT */}
                    <div className="absolute left-0 top-2 w-5 h-5 rounded-full bg-teal-600 border-4 border-teal-100" />

                    {/* CARD */}
                    <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5 hover:bg-white hover:shadow-md transition-all">

                      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">

                        <div>

                          <div className="flex items-center gap-2 flex-wrap">

                            <span className="px-3 py-1 rounded-full bg-teal-50 text-teal-700 text-xs font-semibold border border-teal-100">
                              {evento.tipo}
                            </span>

                            <h3 className="font-bold text-gray-900">
                              {evento.titulo}
                            </h3>
                          </div>

                          <p className="text-sm text-gray-600 mt-3 leading-relaxed">
                            {evento.descripcion}
                          </p>

                          <div className="flex flex-wrap items-center gap-4 mt-4 text-xs text-gray-500">

                            <span className="flex items-center gap-1">
                              <Clock3 size={13} />
                              {evento.fecha}
                            </span>

                            <span>
                              {evento.medico}
                            </span>
                          </div>
                        </div>

                        <button className="h-10 px-4 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors flex items-center gap-2 whitespace-nowrap">
                          Ver Detalle
                          <ChevronRight size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="space-y-6">

          {/* SIGNOS */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">

            <div className="px-6 py-5 border-b border-gray-100">

              <h2 className="text-lg font-bold text-gray-900">
                Signos Vitales
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Último monitoreo clínico.
              </p>
            </div>

            <div className="p-6 space-y-4">

              {/* TEMP */}
              <div className="rounded-2xl border border-gray-100 p-4 flex items-center justify-between">

                <div className="flex items-center gap-3">

                  <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center">
                    <Thermometer size={22} />
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">
                      Temperatura
                    </p>

                    <h4 className="font-bold text-gray-900">
                      38.2°C
                    </h4>
                  </div>
                </div>
              </div>

              {/* FC */}
              <div className="rounded-2xl border border-gray-100 p-4 flex items-center justify-between">

                <div className="flex items-center gap-3">

                  <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center">
                    <Heart size={22} />
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">
                      Frecuencia Cardíaca
                    </p>

                    <h4 className="font-bold text-gray-900">
                      96 bpm
                    </h4>
                  </div>
                </div>
              </div>

              {/* PESO */}
              <div className="rounded-2xl border border-gray-100 p-4 flex items-center justify-between">

                <div className="flex items-center gap-3">

                  <div className="w-12 h-12 rounded-2xl bg-cyan-50 text-cyan-600 flex items-center justify-center">
                    <Weight size={22} />
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">
                      Peso Actual
                    </p>

                    <h4 className="font-bold text-gray-900">
                      {paciente.peso}
                    </h4>
                  </div>
                </div>
              </div>

              {/* ACTIVIDAD */}
              <div className="rounded-2xl border border-gray-100 p-4 flex items-center justify-between">

                <div className="flex items-center gap-3">

                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <Activity size={22} />
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">
                      Estado General
                    </p>

                    <h4 className="font-bold text-emerald-700">
                      Estable
                    </h4>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ALERTAS */}
          <div className="bg-gradient-to-br from-red-500 to-rose-600 rounded-3xl p-6 text-white shadow-xl shadow-red-500/20">

            <div className="flex items-center gap-3">

              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
                <ShieldAlert size={24} />
              </div>

              <div>
                <h3 className="font-bold text-lg">
                  Alertas Clínicas
                </h3>

                <p className="text-sm text-red-100 mt-1">
                  Información importante del paciente.
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-3">

              <div className="rounded-2xl bg-white/10 border border-white/10 p-4">

                <p className="font-semibold text-sm">
                  Alergia a Penicilina
                </p>

                <p className="text-xs text-red-100 mt-1">
                  Evitar medicamentos derivados.
                </p>
              </div>

              <div className="rounded-2xl bg-white/10 border border-white/10 p-4">

                <p className="font-semibold text-sm">
                  Vacunas pendientes
                </p>

                <p className="text-xs text-red-100 mt-1">
                  Programar refuerzo anual.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}