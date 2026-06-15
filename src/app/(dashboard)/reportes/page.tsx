"use client";

import { useMemo, useState } from "react";
import {
  Activity,
  ArrowDown,
  ArrowUp,
  CalendarDays,
  Download,
  Eye,
  FileBarChart,
  FileSpreadsheet,
  Filter,
  Printer,
  Search,
  TrendingUp,
  Users,
  Wallet,
  PawPrint,
  ShoppingCart,
  RefreshCw,
} from "lucide-react";

interface ReporteItem {
  id: number;
  nombre: string;
  categoria: string;
  fecha: string;
  generadoPor: string;
  formato: "PDF" | "Excel";
  estado: "Generado" | "Pendiente";
  descargas: number;
}

const reportesMock: ReporteItem[] = [
  {
    id: 1,
    nombre: "Ventas mensuales",
    categoria: "Financiero",
    fecha: "2026-05-10",
    generadoPor: "Administrador",
    formato: "PDF",
    estado: "Generado",
    descargas: 24,
  },
  {
    id: 2,
    nombre: "Inventario crítico",
    categoria: "Inventario",
    fecha: "2026-05-09",
    generadoPor: "Carlos Ruiz",
    formato: "Excel",
    estado: "Pendiente",
    descargas: 8,
  },
  {
    id: 3,
    nombre: "Pacientes atendidos",
    categoria: "Clínico",
    fecha: "2026-05-08",
    generadoPor: "Andrea López",
    formato: "PDF",
    estado: "Generado",
    descargas: 12,
  },
  {
    id: 4,
    nombre: "Facturación diaria",
    categoria: "Facturación",
    fecha: "2026-05-07",
    generadoPor: "Caja Principal",
    formato: "Excel",
    estado: "Generado",
    descargas: 31,
  },
];

export default function ReportesPage() {
  const [search, setSearch] = useState("");
  const [categoria, setCategoria] = useState("Todos");
  const [loading, setLoading] = useState(false);

  const [reportes, setReportes] =
    useState<ReporteItem[]>(reportesMock);

  const filtrados = useMemo(() => {
    return reportes.filter((r) => {
      const matchSearch =
        r.nombre
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        r.generadoPor
          .toLowerCase()
          .includes(search.toLowerCase());

      const matchCategoria =
        categoria === "Todos" ||
        r.categoria === categoria;

      return matchSearch && matchCategoria;
    });
  }, [reportes, search, categoria]);

  const handleGenerar = () => {
    setLoading(true);

    setTimeout(() => {
      const nuevo: ReporteItem = {
        id: Date.now(),
        nombre: "Reporte automático",
        categoria: "General",
        fecha: new Date()
          .toISOString()
          .split("T")[0],
        generadoPor: "Sistema",
        formato: "PDF",
        estado: "Generado",
        descargas: 0,
      };

      setReportes((prev) => [nuevo, ...prev]);
      setLoading(false);
    }, 1200);
  };

  const handleDescargar = (
    nombre: string
  ) => {
    alert(`Descargando ${nombre}`);
  };

  const handlePreview = (
    nombre: string
  ) => {
    alert(`Vista previa de ${nombre}`);
  };

  const handlePrint = (
    nombre: string
  ) => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">

      {/* HEADER */}
      <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">

        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-5">

          <div>
            <div className="flex items-center gap-3">

              <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center">
                <FileBarChart className="text-indigo-600" />
              </div>

              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Reportes
                </h1>

                <p className="text-sm text-gray-500 mt-1">
                  Centro analítico y exportación
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">

            <button
              onClick={handleGenerar}
              className="h-12 px-5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex items-center gap-2 transition-all"
            >
              {loading ? (
                <RefreshCw className="animate-spin" size={18} />
              ) : (
                <FileSpreadsheet size={18} />
              )}

              Generar Reporte
            </button>

            <button
              className="h-12 px-5 rounded-2xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-semibold flex items-center gap-2"
            >
              <CalendarDays size={18} />
              Mayo 2026
            </button>
          </div>
        </div>
      </div>

      {/* KPIS */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">

        <div className="rounded-3xl bg-white border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm text-gray-500">
                Reportes Generados
              </p>

              <h2 className="text-3xl font-bold text-gray-900 mt-2">
                128
              </h2>
            </div>

            <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center">
              <FileBarChart className="text-indigo-600" />
            </div>
          </div>

          <div className="flex items-center gap-1 text-emerald-600 text-sm font-semibold mt-4">
            <ArrowUp size={16} />
            +18% este mes
          </div>
        </div>

        <div className="rounded-3xl bg-white border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm text-gray-500">
                Ventas Analizadas
              </p>

              <h2 className="text-3xl font-bold text-gray-900 mt-2">
                $42M
              </h2>
            </div>

            <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center">
              <Wallet className="text-emerald-600" />
            </div>
          </div>

          <div className="flex items-center gap-1 text-emerald-600 text-sm font-semibold mt-4">
            <TrendingUp size={16} />
            Crecimiento positivo
          </div>
        </div>

        <div className="rounded-3xl bg-white border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm text-gray-500">
                Pacientes
              </p>

              <h2 className="text-3xl font-bold text-gray-900 mt-2">
                2.304
              </h2>
            </div>

            <div className="w-12 h-12 rounded-2xl bg-cyan-50 flex items-center justify-center">
              <PawPrint className="text-cyan-600" />
            </div>
          </div>

          <div className="flex items-center gap-1 text-emerald-600 text-sm font-semibold mt-4">
            <ArrowUp size={16} />
            +12%
          </div>
        </div>

        <div className="rounded-3xl bg-white border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm text-gray-500">
                Usuarios Activos
              </p>

              <h2 className="text-3xl font-bold text-gray-900 mt-2">
                84
              </h2>
            </div>

            <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center">
              <Users className="text-amber-600" />
            </div>
          </div>

          <div className="flex items-center gap-1 text-red-500 text-sm font-semibold mt-4">
            <ArrowDown size={16} />
            -2%
          </div>
        </div>
      </div>

      {/* FILTROS */}
      <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">

        <div className="flex flex-col xl:flex-row gap-4 xl:items-center justify-between">

          <div className="relative flex-1">

            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              placeholder="Buscar reporte..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              className="w-full h-12 rounded-2xl border border-gray-200 bg-white pl-11 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div className="flex gap-3 flex-wrap">

            <div className="relative">

              <Filter
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <select
                value={categoria}
                onChange={(e) =>
                  setCategoria(e.target.value)
                }
                className="h-12 rounded-2xl border border-gray-200 bg-white pl-10 pr-5 text-sm focus:outline-none"
              >
                <option value="Todos">
                  Todas
                </option>

                <option value="Financiero">
                  Financiero
                </option>

                <option value="Inventario">
                  Inventario
                </option>

                <option value="Clínico">
                  Clínico
                </option>

                <option value="Facturación">
                  Facturación
                </option>
              </select>
            </div>

            <button
              onClick={() => {
                setSearch("");
                setCategoria("Todos");
              }}
              className="h-12 px-5 rounded-2xl border border-gray-200 bg-white hover:bg-gray-50 text-sm font-semibold text-gray-700"
            >
              Limpiar
            </button>
          </div>
        </div>
      </div>

      {/* TABLA */}
      <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">

        <div className="overflow-x-auto">

          <table className="min-w-full">

            <thead className="bg-gray-50 border-b border-gray-100">

              <tr className="text-left text-xs uppercase tracking-wider text-gray-500">

                <th className="px-6 py-4">
                  Reporte
                </th>

                <th className="px-6 py-4">
                  Categoría
                </th>

                <th className="px-6 py-4">
                  Fecha
                </th>

                <th className="px-6 py-4">
                  Generado por
                </th>

                <th className="px-6 py-4">
                  Formato
                </th>

                <th className="px-6 py-4">
                  Estado
                </th>

                <th className="px-6 py-4">
                  Descargas
                </th>

                <th className="px-6 py-4 text-right">
                  Acciones
                </th>
              </tr>
            </thead>

            <tbody>

              {filtrados.map((reporte) => (

                <tr
                  key={reporte.id}
                  className="border-b border-gray-100 hover:bg-gray-50/60 transition-colors"
                >

                  <td className="px-6 py-5">

                    <div className="flex items-center gap-3">

                      <div className="w-11 h-11 rounded-2xl bg-indigo-50 flex items-center justify-center">
                        <FileBarChart
                          size={18}
                          className="text-indigo-600"
                        />
                      </div>

                      <div>
                        <p className="font-semibold text-gray-900">
                          {reporte.nombre}
                        </p>

                        <p className="text-xs text-gray-500 mt-1">
                          ID #{reporte.id}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-5">
                    <span className="px-3 py-1 rounded-xl text-xs font-semibold bg-gray-100 text-gray-700">
                      {reporte.categoria}
                    </span>
                  </td>

                  <td className="px-6 py-5 text-sm text-gray-600">
                    {reporte.fecha}
                  </td>

                  <td className="px-6 py-5 text-sm font-medium text-gray-700">
                    {reporte.generadoPor}
                  </td>

                  <td className="px-6 py-5">
                    <span className="text-sm font-semibold text-indigo-600">
                      {reporte.formato}
                    </span>
                  </td>

                  <td className="px-6 py-5">

                    <span
                      className={`px-3 py-1 rounded-xl text-xs font-semibold ${
                        reporte.estado ===
                        "Generado"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      {reporte.estado}
                    </span>
                  </td>

                  <td className="px-6 py-5 text-sm font-semibold text-gray-700">
                    {reporte.descargas}
                  </td>

                  <td className="px-6 py-5">

                    <div className="flex items-center justify-end gap-2">

                      <button
                        onClick={() =>
                          handlePreview(
                            reporte.nombre
                          )
                        }
                        className="w-10 h-10 rounded-xl border border-gray-200 hover:bg-gray-50 flex items-center justify-center text-gray-600"
                      >
                        <Eye size={17} />
                      </button>

                      <button
                        onClick={() =>
                          handleDescargar(
                            reporte.nombre
                          )
                        }
                        className="w-10 h-10 rounded-xl border border-gray-200 hover:bg-gray-50 flex items-center justify-center text-indigo-600"
                      >
                        <Download size={17} />
                      </button>

                      <button
                        onClick={() =>
                          handlePrint(
                            reporte.nombre
                          )
                        }
                        className="w-10 h-10 rounded-xl border border-gray-200 hover:bg-gray-50 flex items-center justify-center text-gray-700"
                      >
                        <Printer size={17} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtrados.length === 0 && (
          <div className="py-20 text-center">

            <Activity
              size={48}
              className="mx-auto text-gray-300"
            />

            <h3 className="mt-4 text-lg font-semibold text-gray-700">
              No hay reportes
            </h3>

            <p className="text-sm text-gray-500 mt-1">
              Ajusta los filtros de búsqueda.
            </p>
          </div>
        )}
      </div>

      {/* FOOTER */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">

          <div className="flex items-center gap-3">

            <div className="w-11 h-11 rounded-2xl bg-cyan-50 flex items-center justify-center">
              <ShoppingCart className="text-cyan-600" />
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Ventas Totales
              </p>

              <h3 className="text-xl font-bold text-gray-900">
                1.284
              </h3>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">

          <div className="flex items-center gap-3">

            <div className="w-11 h-11 rounded-2xl bg-emerald-50 flex items-center justify-center">
              <TrendingUp className="text-emerald-600" />
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Rendimiento
              </p>

              <h3 className="text-xl font-bold text-gray-900">
                94%
              </h3>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">

          <div className="flex items-center gap-3">

            <div className="w-11 h-11 rounded-2xl bg-indigo-50 flex items-center justify-center">
              <Activity className="text-indigo-600" />
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Actividad
              </p>

              <h3 className="text-xl font-bold text-gray-900">
                Alta
              </h3>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}