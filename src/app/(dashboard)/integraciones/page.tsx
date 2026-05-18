"use client";

import { useMemo, useState } from "react";

import {
  Activity,
  CheckCircle2,
  Clock3,
  Cloud,
  Database,
  ExternalLink,
  Link2,
  RefreshCcw,
  Search,
  Server,
  ShieldCheck,
  Unplug,
  WifiOff,
  XCircle,
} from "lucide-react";

interface Integracion {
  id: number;
  nombre: string;
  categoria: string;
  estado: "ACTIVA" | "ERROR" | "DESCONECTADA" | "PENDIENTE";
  proveedor: string;
  ultimaSync: string;
  webhook: boolean;
  apiKey: string;
}

const MOCK_INTEGRACIONES: Integracion[] = [
  {
    id: 1,
    nombre: "DIAN Electrónica",
    categoria: "Facturación",
    estado: "ACTIVA",
    proveedor: "Carvajal",
    ultimaSync: "Hace 3 min",
    webhook: true,
    apiKey: "••••••••12A",
  },
  {
    id: 2,
    nombre: "WhatsApp Cloud API",
    categoria: "Mensajería",
    estado: "ACTIVA",
    proveedor: "Meta",
    ultimaSync: "Hace 1 min",
    webhook: true,
    apiKey: "••••••••88K",
  },
  {
    id: 3,
    nombre: "Pasarela de Pago",
    categoria: "Pagos",
    estado: "ERROR",
    proveedor: "Wompi",
    ultimaSync: "Hace 40 min",
    webhook: false,
    apiKey: "••••••••91W",
  },
  {
    id: 4,
    nombre: "Google Calendar",
    categoria: "Agenda",
    estado: "PENDIENTE",
    proveedor: "Google",
    ultimaSync: "Sin sincronizar",
    webhook: false,
    apiKey: "••••••••72G",
  },
  {
    id: 5,
    nombre: "AWS S3",
    categoria: "Storage",
    estado: "ACTIVA",
    proveedor: "Amazon",
    ultimaSync: "Hace 5 min",
    webhook: true,
    apiKey: "••••••••44S",
  },
];

export default function IntegracionesPage() {
  const [busqueda, setBusqueda] = useState("");
  const [integraciones, setIntegraciones] =
    useState<Integracion[]>(MOCK_INTEGRACIONES);

  const [syncingId, setSyncingId] = useState<number | null>(
    null
  );

  const filtradas = useMemo(() => {
    return integraciones.filter((item) =>
      [
        item.nombre,
        item.categoria,
        item.proveedor,
      ]
        .join(" ")
        .toLowerCase()
        .includes(busqueda.toLowerCase())
    );
  }, [busqueda, integraciones]);

  const estadisticas = {
    total: integraciones.length,
    activas: integraciones.filter(
      (i) => i.estado === "ACTIVA"
    ).length,
    errores: integraciones.filter(
      (i) => i.estado === "ERROR"
    ).length,
    pendientes: integraciones.filter(
      (i) => i.estado === "PENDIENTE"
    ).length,
  };

  const toggleEstado = (id: number) => {
    setIntegraciones((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;

        return {
          ...item,
          estado:
            item.estado === "ACTIVA"
              ? "DESCONECTADA"
              : "ACTIVA",
        };
      })
    );
  };

  const sincronizar = async (id: number) => {
    setSyncingId(id);

    await new Promise((resolve) =>
      setTimeout(resolve, 1500)
    );

    setIntegraciones((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              estado: "ACTIVA",
              ultimaSync: "Ahora mismo",
            }
          : item
      )
    );

    setSyncingId(null);
  };

  return (
    <div className="space-y-6 pb-10 animate-in fade-in duration-500">

      {/* HEADER */}
      <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">

        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-5">

          <div>
            <div className="flex items-center gap-3">

              <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                <Link2 size={28} />
              </div>

              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Integraciones
                </h1>

                <p className="text-sm text-gray-500 mt-1">
                  APIs · Webhooks · Servicios externos
                </p>
              </div>
            </div>
          </div>

          <button
            className="h-12 px-5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex items-center gap-2 transition-colors"
          >
            <Cloud size={18} />
            Nueva Integración
          </button>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">

        <CardStat
          title="Integraciones"
          value={estadisticas.total}
          icon={<Database size={20} />}
        />

        <CardStat
          title="Activas"
          value={estadisticas.activas}
          icon={<CheckCircle2 size={20} />}
        />

        <CardStat
          title="Errores"
          value={estadisticas.errores}
          icon={<XCircle size={20} />}
        />

        <CardStat
          title="Pendientes"
          value={estadisticas.pendientes}
          icon={<Clock3 size={20} />}
        />
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">

        {/* TOP */}
        <div className="p-6 border-b border-gray-100">

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">

            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Servicios conectados
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Estado de sincronización en tiempo real.
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
                placeholder="Buscar integración..."
                className="w-full h-12 rounded-2xl border border-gray-200 bg-white pl-11 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
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
                  Integración
                </th>

                <th className="px-6 py-4 font-semibold">
                  Categoría
                </th>

                <th className="px-6 py-4 font-semibold">
                  Proveedor
                </th>

                <th className="px-6 py-4 font-semibold">
                  Estado
                </th>

                <th className="px-6 py-4 font-semibold">
                  Webhook
                </th>

                <th className="px-6 py-4 font-semibold">
                  Última Sync
                </th>

                <th className="px-6 py-4 font-semibold">
                  API Key
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

                    <div className="flex items-center gap-4">

                      <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                        <Server size={22} />
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

                  <td className="px-6 py-5">
                    <span className="text-sm font-medium text-gray-700">
                      {item.categoria}
                    </span>
                  </td>

                  <td className="px-6 py-5">
                    <span className="text-sm text-gray-700">
                      {item.proveedor}
                    </span>
                  </td>

                  <td className="px-6 py-5">
                    <EstadoBadge
                      estado={item.estado}
                    />
                  </td>

                  <td className="px-6 py-5">

                    {item.webhook ? (
                      <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-100">
                        <ShieldCheck size={14} />
                        Activo
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 text-red-700 text-xs font-semibold border border-red-100">
                        <WifiOff size={14} />
                        Inactivo
                      </span>
                    )}
                  </td>

                  <td className="px-6 py-5">
                    <span className="text-sm text-gray-600">
                      {item.ultimaSync}
                    </span>
                  </td>

                  <td className="px-6 py-5">

                    <code className="text-xs font-semibold bg-gray-100 px-3 py-2 rounded-xl text-gray-700">
                      {item.apiKey}
                    </code>
                  </td>

                  <td className="px-6 py-5">

                    <div className="flex items-center justify-end gap-2">

                      <button
                        onClick={() =>
                          sincronizar(item.id)
                        }
                        className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
                      >
                        <RefreshCcw
                          size={16}
                          className={
                            syncingId === item.id
                              ? "animate-spin"
                              : ""
                          }
                        />
                      </button>

                      <button
                        className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
                      >
                        <ExternalLink size={16} />
                      </button>

                      <button
                        onClick={() =>
                          toggleEstado(item.id)
                        }
                        className={`h-10 px-4 rounded-xl text-sm font-semibold transition-colors ${
                          item.estado === "ACTIVA"
                            ? "bg-red-50 text-red-700 hover:bg-red-100"
                            : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                        }`}
                      >
                        {item.estado === "ACTIVA"
                          ? "Desconectar"
                          : "Activar"}
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

        <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
          {icon}
        </div>
      </div>
    </div>
  );
}

function EstadoBadge({
  estado,
}: {
  estado: Integracion["estado"];
}) {
  const styles = {
    ACTIVA:
      "bg-emerald-50 text-emerald-700 border-emerald-100",
    ERROR:
      "bg-red-50 text-red-700 border-red-100",
    DESCONECTADA:
      "bg-gray-100 text-gray-700 border-gray-200",
    PENDIENTE:
      "bg-amber-50 text-amber-700 border-amber-100",
  };

  const icons = {
    ACTIVA: <Activity size={14} />,
    ERROR: <XCircle size={14} />,
    DESCONECTADA: <Unplug size={14} />,
    PENDIENTE: <Clock3 size={14} />,
  };

  return (
    <span
      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border ${styles[estado]}`}
    >
      {icons[estado]}
      {estado}
    </span>
  );
}