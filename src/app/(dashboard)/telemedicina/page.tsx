"use client";

import { useMemo, useState } from "react";

import {
  Activity,
  CalendarDays,
  Camera,
  CheckCircle2,
  Clock3,
  Mic,
  MonitorSmartphone,
  Phone,
  Play,
  Search,
  Square,
  Stethoscope,
  UserRound,
  Video,
  VideoOff,
  Wifi,
  WifiOff,
} from "lucide-react";

interface Teleconsulta {
  id: number;
  paciente: string;
  propietario: string;
  veterinario: string;
  fecha: string;
  hora: string;
  estado:
    | "PROGRAMADA"
    | "EN_CURSO"
    | "FINALIZADA"
    | "CANCELADA";
  conexion: "ESTABLE" | "INACTIVA";
  duracion: string;
}

const MOCK_TELECONSULTAS: Teleconsulta[] = [
  {
    id: 1,
    paciente: "Max",
    propietario: "Carlos Ruiz",
    veterinario: "Dra. Laura Gómez",
    fecha: "13/05/2026",
    hora: "09:00 PM",
    estado: "EN_CURSO",
    conexion: "ESTABLE",
    duracion: "18 min",
  },
  {
    id: 2,
    paciente: "Luna",
    propietario: "Ana Torres",
    veterinario: "Dr. Felipe Mora",
    fecha: "14/05/2026",
    hora: "08:00 AM",
    estado: "PROGRAMADA",
    conexion: "INACTIVA",
    duracion: "-",
  },
  {
    id: 3,
    paciente: "Rocky",
    propietario: "Luis Pérez",
    veterinario: "Dra. Sara León",
    fecha: "12/05/2026",
    hora: "06:30 PM",
    estado: "FINALIZADA",
    conexion: "INACTIVA",
    duracion: "42 min",
  },
];

export default function TelemedicinaPage() {
  const [consultas, setConsultas] =
    useState<Teleconsulta[]>(MOCK_TELECONSULTAS);

  const [busqueda, setBusqueda] = useState("");

  const [camaraActiva, setCamaraActiva] =
    useState(true);

  const [microfonoActivo, setMicrofonoActivo] =
    useState(true);

  const [llamadaActiva, setLlamadaActiva] =
    useState(true);

  const filtradas = useMemo(() => {
    return consultas.filter((item) =>
      [
        item.paciente,
        item.propietario,
        item.veterinario,
      ]
        .join(" ")
        .toLowerCase()
        .includes(busqueda.toLowerCase())
    );
  }, [busqueda, consultas]);

  const stats = {
    total: consultas.length,
    activas: consultas.filter(
      (c) => c.estado === "EN_CURSO"
    ).length,
    programadas: consultas.filter(
      (c) => c.estado === "PROGRAMADA"
    ).length,
    finalizadas: consultas.filter(
      (c) => c.estado === "FINALIZADA"
    ).length,
  };

  const iniciarConsulta = (id: number) => {
    setConsultas((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              estado: "EN_CURSO",
              conexion: "ESTABLE",
            }
          : item
      )
    );
  };

  const finalizarConsulta = (id: number) => {
    setConsultas((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              estado: "FINALIZADA",
              conexion: "INACTIVA",
            }
          : item
      )
    );
  };

  return (
    <div className="space-y-6 pb-10 animate-in fade-in duration-500">

      {/* HEADER */}
      <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">

        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-5">

          <div className="flex items-center gap-4">

            <div className="w-14 h-14 rounded-2xl bg-violet-50 text-violet-700 flex items-center justify-center">
              <MonitorSmartphone size={28} />
            </div>

            <div>

              <h1 className="text-3xl font-bold text-gray-900">
                Telemedicina
              </h1>

              <p className="text-sm text-gray-500 mt-1">
                Videoconsultas veterinarias
              </p>
            </div>
          </div>

          <button className="h-12 px-5 rounded-2xl bg-violet-600 hover:bg-violet-700 text-white font-semibold flex items-center gap-2 transition-colors">
            <Video size={18} />
            Nueva Consulta
          </button>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">

        <CardStat
          title="Consultas"
          value={stats.total}
          icon={<Stethoscope size={20} />}
        />

        <CardStat
          title="En Curso"
          value={stats.activas}
          icon={<Activity size={20} />}
        />

        <CardStat
          title="Programadas"
          value={stats.programadas}
          icon={<CalendarDays size={20} />}
        />

        <CardStat
          title="Finalizadas"
          value={stats.finalizadas}
          icon={<CheckCircle2 size={20} />}
        />
      </div>

      {/* VIDEO PANEL */}
      <div className="grid grid-cols-1 2xl:grid-cols-3 gap-6">

        {/* VIDEO */}
        <div className="2xl:col-span-2 bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">

          <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">

            <div>

              <h2 className="text-lg font-bold text-gray-900">
                Consulta Activa
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Max · Dra. Laura Gómez
              </p>
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700 text-sm font-semibold">
              <Wifi size={16} />
              Conectado
            </div>
          </div>

          <div className="relative h-[500px] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">

            <div className="absolute inset-0 flex items-center justify-center">

              <div className="text-center">

                <div className="w-28 h-28 rounded-full bg-white/10 backdrop-blur-xl flex items-center justify-center mx-auto">
                  <UserRound
                    size={52}
                    className="text-white"
                  />
                </div>

                <h3 className="text-white text-xl font-bold mt-5">
                  Dra. Laura Gómez
                </h3>

                <p className="text-gray-300 text-sm mt-1">
                  Consulta en progreso
                </p>
              </div>
            </div>

            {/* MINI CAM */}
            <div className="absolute bottom-5 right-5 w-52 h-36 rounded-2xl border border-white/10 overflow-hidden bg-slate-700 shadow-2xl">

              <div className="h-full flex flex-col items-center justify-center">

                <Camera
                  size={28}
                  className="text-white"
                />

                <span className="text-white text-sm mt-3 font-medium">
                  Cámara local
                </span>
              </div>
            </div>
          </div>

          {/* CONTROLS */}
          <div className="p-6 border-t border-gray-100 flex flex-wrap items-center justify-center gap-4">

            <button
              onClick={() =>
                setMicrofonoActivo(
                  !microfonoActivo
                )
              }
              className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${
                microfonoActivo
                  ? "bg-gray-100 text-gray-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {microfonoActivo ? (
                <Mic size={22} />
              ) : (
                <Mic size={22} />
              )}
            </button>

            <button
              onClick={() =>
                setCamaraActiva(!camaraActiva)
              }
              className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${
                camaraActiva
                  ? "bg-gray-100 text-gray-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {camaraActiva ? (
                <Camera size={22} />
              ) : (
                <VideoOff size={22} />
              )}
            </button>

            <button
              onClick={() =>
                setLlamadaActiva(
                  !llamadaActiva
                )
              }
              className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-colors ${
                llamadaActiva
                  ? "bg-red-600 text-white"
                  : "bg-emerald-600 text-white"
              }`}
            >
              {llamadaActiva ? (
                <Phone size={24} />
              ) : (
                <Play size={24} />
              )}
            </button>
          </div>
        </div>

        {/* SIDEBAR */}
        <div className="space-y-6">

          {/* QUICK STATUS */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">

            <h3 className="text-lg font-bold text-gray-900">
              Estado del Sistema
            </h3>

            <div className="space-y-4 mt-6">

              <StatusItem
                title="Servidor WebRTC"
                active
              />

              <StatusItem
                title="Audio"
                active={microfonoActivo}
              />

              <StatusItem
                title="Video"
                active={camaraActiva}
              />

              <StatusItem
                title="Conexión"
                active={llamadaActiva}
              />
            </div>
          </div>

          {/* LIVE INFO */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">

            <h3 className="text-lg font-bold text-gray-900">
              Sesión Actual
            </h3>

            <div className="space-y-5 mt-6">

              <InfoRow
                label="Paciente"
                value="Max"
              />

              <InfoRow
                label="Propietario"
                value="Carlos Ruiz"
              />

              <InfoRow
                label="Duración"
                value="18 min"
              />

              <InfoRow
                label="Estado"
                value="En curso"
              />
            </div>
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">

        {/* TOP */}
        <div className="p-6 border-b border-gray-100">

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">

            <div>

              <h2 className="text-lg font-bold text-gray-900">
                Historial de Teleconsultas
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Agenda y monitoreo clínico remoto
              </p>
            </div>

            <div className="relative w-full lg:w-80">

              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                value={busqueda}
                onChange={(e) =>
                  setBusqueda(e.target.value)
                }
                placeholder="Buscar consulta..."
                className="w-full h-12 rounded-2xl border border-gray-200 bg-white pl-11 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20"
              />
            </div>
          </div>
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto">

          <table className="w-full min-w-[1200px]">

            <thead className="bg-gray-50 border-b border-gray-100">

              <tr className="text-left text-xs uppercase tracking-wider text-gray-500">

                <th className="px-6 py-4 font-semibold">
                  Paciente
                </th>

                <th className="px-6 py-4 font-semibold">
                  Propietario
                </th>

                <th className="px-6 py-4 font-semibold">
                  Veterinario
                </th>

                <th className="px-6 py-4 font-semibold">
                  Fecha
                </th>

                <th className="px-6 py-4 font-semibold">
                  Estado
                </th>

                <th className="px-6 py-4 font-semibold">
                  Conexión
                </th>

                <th className="px-6 py-4 font-semibold">
                  Duración
                </th>

                <th className="px-6 py-4 font-semibold text-right">
                  Acciones
                </th>
              </tr>
            </thead>

            <tbody>

              {filtradas.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-gray-100 hover:bg-gray-50/70 transition-colors"
                >

                  <td className="px-6 py-5">

                    <div>

                      <h3 className="text-sm font-semibold text-gray-900">
                        {item.paciente}
                      </h3>

                      <p className="text-xs text-gray-500 mt-1">
                        Consulta #{item.id}
                      </p>
                    </div>
                  </td>

                  <td className="px-6 py-5 text-sm text-gray-700">
                    {item.propietario}
                  </td>

                  <td className="px-6 py-5 text-sm text-gray-700">
                    {item.veterinario}
                  </td>

                  <td className="px-6 py-5">

                    <div className="text-sm text-gray-700">
                      {item.fecha}
                    </div>

                    <div className="text-xs text-gray-500 mt-1">
                      {item.hora}
                    </div>
                  </td>

                  <td className="px-6 py-5">
                    <EstadoBadge
                      estado={item.estado}
                    />
                  </td>

                  <td className="px-6 py-5">

                    {item.conexion ===
                    "ESTABLE" ? (
                      <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-semibold">
                        <Wifi size={14} />
                        Estable
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 border border-red-100 text-red-700 text-xs font-semibold">
                        <WifiOff size={14} />
                        Offline
                      </span>
                    )}
                  </td>

                  <td className="px-6 py-5 text-sm text-gray-700">
                    {item.duracion}
                  </td>

                  <td className="px-6 py-5">

                    <div className="flex items-center justify-end gap-2">

                      <button
                        onClick={() =>
                          iniciarConsulta(
                            item.id
                          )
                        }
                        className="w-10 h-10 rounded-xl border border-emerald-200 text-emerald-700 flex items-center justify-center hover:bg-emerald-50 transition-colors"
                      >
                        <Play size={16} />
                      </button>

                      <button
                        onClick={() =>
                          finalizarConsulta(
                            item.id
                          )
                        }
                        className="w-10 h-10 rounded-xl border border-red-200 text-red-700 flex items-center justify-center hover:bg-red-50 transition-colors"
                      >
                        <Square size={16} />
                      </button>
                    </div>
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

function CardStat({
  title,
  value,
  icon,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-3xl border border-gray-100 p-5 shadow-sm">

      <div className="flex items-center justify-between">

        <div>

          <p className="text-sm font-medium text-gray-500">
            {title}
          </p>

          <h3 className="text-3xl font-bold text-gray-900 mt-2">
            {value}
          </h3>
        </div>

        <div className="w-12 h-12 rounded-2xl bg-violet-50 text-violet-700 flex items-center justify-center">
          {icon}
        </div>
      </div>
    </div>
  );
}

function EstadoBadge({
  estado,
}: {
  estado: Teleconsulta["estado"];
}) {
  const styles = {
    PROGRAMADA:
      "bg-amber-50 text-amber-700 border-amber-100",
    EN_CURSO:
      "bg-emerald-50 text-emerald-700 border-emerald-100",
    FINALIZADA:
      "bg-blue-50 text-blue-700 border-blue-100",
    CANCELADA:
      "bg-red-50 text-red-700 border-red-100",
  };

  return (
    <span
      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-semibold ${styles[estado]}`}
    >
      {estado}
    </span>
  );
}

function StatusItem({
  title,
  active,
}: {
  title: string;
  active: boolean;
}) {
  return (
    <div className="flex items-center justify-between">

      <span className="text-sm font-medium text-gray-700">
        {title}
      </span>

      <span
        className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-semibold ${
          active
            ? "bg-emerald-50 text-emerald-700 border-emerald-100"
            : "bg-red-50 text-red-700 border-red-100"
        }`}
      >
        {active ? (
          <CheckCircle2 size={14} />
        ) : (
          <WifiOff size={14} />
        )}

        {active ? "Activo" : "Offline"}
      </span>
    </div>
  );
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4">

      <span className="text-sm text-gray-500">
        {label}
      </span>

      <span className="text-sm font-semibold text-gray-900">
        {value}
      </span>
    </div>
  );
}