"use client";

import { useMemo, useState } from "react";

import {
  ArchiveRestore,
  CheckCircle2,
  Clock3,
  DatabaseBackup,
  Download,
  HardDrive,
  Loader2,
  RefreshCcw,
  Save,
  Search,
  ServerCrash,
  ShieldCheck,
  Trash2,
} from "lucide-react";

interface BackupItem {
  id: number;
  nombre: string;
  fecha: string;
  tamaño: string;
  estado: "COMPLETADO" | "PROCESANDO" | "ERROR";
  tipo: "AUTOMÁTICO" | "MANUAL";
  servidor: string;
}

const MOCK_BACKUPS: BackupItem[] = [
  {
    id: 1,
    nombre: "clinicore_backup_13052026.sql",
    fecha: "13/05/2026 10:32 PM",
    tamaño: "2.1 GB",
    estado: "COMPLETADO",
    tipo: "AUTOMÁTICO",
    servidor: "AWS-SQL-01",
  },
  {
    id: 2,
    nombre: "clinicore_media_13052026.zip",
    fecha: "13/05/2026 09:15 PM",
    tamaño: "5.4 GB",
    estado: "PROCESANDO",
    tipo: "MANUAL",
    servidor: "AWS-STORAGE-02",
  },
  {
    id: 3,
    nombre: "clinicore_backup_12052026.sql",
    fecha: "12/05/2026 11:59 PM",
    tamaño: "2.0 GB",
    estado: "COMPLETADO",
    tipo: "AUTOMÁTICO",
    servidor: "AWS-SQL-01",
  },
];

export default function BackupPage() {
  const [busqueda, setBusqueda] = useState("");
  const [loading, setLoading] = useState(false);

  const [backups, setBackups] =
    useState<BackupItem[]>(MOCK_BACKUPS);

  const filtrados = useMemo(() => {
    return backups.filter((item) =>
      [
        item.nombre,
        item.estado,
        item.tipo,
        item.servidor,
      ]
        .join(" ")
        .toLowerCase()
        .includes(busqueda.toLowerCase())
    );
  }, [busqueda, backups]);

  const crearBackup = async () => {
    setLoading(true);

    await new Promise((resolve) =>
      setTimeout(resolve, 2500)
    );

    const nuevo: BackupItem = {
      id: Date.now(),
      nombre: `clinicore_backup_${Date.now()}.sql`,
      fecha: "Ahora mismo",
      tamaño: "0.8 GB",
      estado: "COMPLETADO",
      tipo: "MANUAL",
      servidor: "AWS-SQL-01",
    };

    setBackups((prev) => [nuevo, ...prev]);

    setLoading(false);
  };

  const eliminarBackup = (id: number) => {
    setBackups((prev) =>
      prev.filter((item) => item.id !== id)
    );
  };

  return (
    <div className="space-y-6 pb-10 animate-in fade-in duration-500">

      {/* HEADER */}
      <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">

        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-5">

          <div className="flex items-center gap-4">

            <div className="w-14 h-14 rounded-2xl bg-cyan-50 text-cyan-700 flex items-center justify-center">
              <DatabaseBackup size={28} />
            </div>

            <div>

              <h1 className="text-3xl font-bold text-gray-900">
                Backups
              </h1>

              <p className="text-sm text-gray-500 mt-1">
                Respaldos automáticos y recuperación
              </p>
            </div>
          </div>

          <button
            onClick={crearBackup}
            disabled={loading}
            className="h-12 px-5 rounded-2xl bg-cyan-600 hover:bg-cyan-700 disabled:opacity-60 text-white font-semibold flex items-center gap-2 transition-colors"
          >
            {loading ? (
              <Loader2
                size={18}
                className="animate-spin"
              />
            ) : (
              <Save size={18} />
            )}

            Crear Backup
          </button>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">

        <CardBackup
          title="Backups"
          value={backups.length}
          icon={<HardDrive size={20} />}
        />

        <CardBackup
          title="Completados"
          value={
            backups.filter(
              (b) => b.estado === "COMPLETADO"
            ).length
          }
          icon={<CheckCircle2 size={20} />}
        />

        <CardBackup
          title="Procesando"
          value={
            backups.filter(
              (b) => b.estado === "PROCESANDO"
            ).length
          }
          icon={<Clock3 size={20} />}
        />

        <CardBackup
          title="Errores"
          value={
            backups.filter(
              (b) => b.estado === "ERROR"
            ).length
          }
          icon={<ServerCrash size={20} />}
        />
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">

        {/* TOP */}
        <div className="p-6 border-b border-gray-100">

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">

            <div>

              <h2 className="text-lg font-bold text-gray-900">
                Historial de respaldos
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Gestión centralizada de snapshots.
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
                placeholder="Buscar backup..."
                className="w-full h-12 rounded-2xl border border-gray-200 bg-white pl-11 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
              />
            </div>
          </div>
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto">

          <table className="w-full min-w-[1100px]">

            <thead className="bg-gray-50 border-b border-gray-100">

              <tr className="text-left text-xs uppercase tracking-wider text-gray-500">

                <th className="px-6 py-4 font-semibold">
                  Archivo
                </th>

                <th className="px-6 py-4 font-semibold">
                  Fecha
                </th>

                <th className="px-6 py-4 font-semibold">
                  Tamaño
                </th>

                <th className="px-6 py-4 font-semibold">
                  Estado
                </th>

                <th className="px-6 py-4 font-semibold">
                  Tipo
                </th>

                <th className="px-6 py-4 font-semibold">
                  Servidor
                </th>

                <th className="px-6 py-4 font-semibold text-right">
                  Acciones
                </th>
              </tr>
            </thead>

            <tbody>

              {filtrados.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-gray-100 hover:bg-gray-50/70 transition-colors"
                >

                  <td className="px-6 py-5">

                    <div className="flex items-center gap-4">

                      <div className="w-12 h-12 rounded-2xl bg-cyan-50 text-cyan-700 flex items-center justify-center">
                        <DatabaseBackup size={22} />
                      </div>

                      <div>

                        <h3 className="text-sm font-semibold text-gray-900">
                          {item.nombre}
                        </h3>

                        <p className="text-xs text-gray-500 mt-1">
                          ID #{item.id}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-5 text-sm text-gray-700">
                    {item.fecha}
                  </td>

                  <td className="px-6 py-5 text-sm text-gray-700">
                    {item.tamaño}
                  </td>

                  <td className="px-6 py-5">

                    <EstadoBackup
                      estado={item.estado}
                    />
                  </td>

                  <td className="px-6 py-5">

                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-50 border border-cyan-100 text-cyan-700 text-xs font-semibold">
                      <ShieldCheck size={14} />
                      {item.tipo}
                    </span>
                  </td>

                  <td className="px-6 py-5 text-sm text-gray-700">
                    {item.servidor}
                  </td>

                  <td className="px-6 py-5">

                    <div className="flex items-center justify-end gap-2">

                      <button
                        className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
                      >
                        <Download size={16} />
                      </button>

                      <button
                        className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
                      >
                        <ArchiveRestore size={16} />
                      </button>

                      <button
                        className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
                      >
                        <RefreshCcw size={16} />
                      </button>

                      <button
                        onClick={() =>
                          eliminarBackup(item.id)
                        }
                        className="w-10 h-10 rounded-xl border border-red-200 text-red-600 flex items-center justify-center hover:bg-red-50 transition-colors"
                      >
                        <Trash2 size={16} />
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

function CardBackup({
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

        <div className="w-12 h-12 rounded-2xl bg-cyan-50 text-cyan-700 flex items-center justify-center">
          {icon}
        </div>
      </div>
    </div>
  );
}

function EstadoBackup({
  estado,
}: {
  estado: BackupItem["estado"];
}) {
  const styles = {
    COMPLETADO:
      "bg-emerald-50 text-emerald-700 border-emerald-100",
    PROCESANDO:
      "bg-amber-50 text-amber-700 border-amber-100",
    ERROR:
      "bg-red-50 text-red-700 border-red-100",
  };

  return (
    <span
      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border ${styles[estado]}`}
    >
      {estado === "COMPLETADO" && (
        <CheckCircle2 size={14} />
      )}

      {estado === "PROCESANDO" && (
        <Loader2
          size={14}
          className="animate-spin"
        />
      )}

      {estado === "ERROR" && (
        <ServerCrash size={14} />
      )}

      {estado}
    </span>
  );
}