"use client";

import { useMemo, useState } from "react";

import {
  Pill,
  Search,
  Plus,
  Package2,
  TriangleAlert,
  BadgeDollarSign,
  CalendarClock,
  ShieldCheck,
  Boxes,
  ChevronRight,
  ClipboardPlus,
  Filter,
  Eye,
  Edit,
  Trash2,
  ArrowUpDown,
} from "lucide-react";

/* =========================================================
   TYPES
========================================================= */

interface Medicamento {
  id: number;
  nombre: string;
  categoria: string;
  laboratorio: string;
  stock: number;
  minimo: number;
  vencimiento: string;
  precio: number;
  estado: "DISPONIBLE" | "BAJO STOCK" | "VENCIDO";
}

/* =========================================================
   MOCK DATA
========================================================= */

const medicamentosMock: Medicamento[] = [
  {
    id: 1001,
    nombre: "Amoxicilina 500mg",
    categoria: "Antibiótico",
    laboratorio: "VetLab",
    stock: 42,
    minimo: 10,
    vencimiento: "2027-03-12",
    precio: 45000,
    estado: "DISPONIBLE",
  },
  {
    id: 1002,
    nombre: "Meloxicam",
    categoria: "Antiinflamatorio",
    laboratorio: "Zoetis",
    stock: 7,
    minimo: 10,
    vencimiento: "2026-09-18",
    precio: 39000,
    estado: "BAJO STOCK",
  },
  {
    id: 1003,
    nombre: "Doxiciclina",
    categoria: "Antibiótico",
    laboratorio: "PetCare",
    stock: 0,
    minimo: 8,
    vencimiento: "2025-12-01",
    precio: 52000,
    estado: "VENCIDO",
  },
  {
    id: 1004,
    nombre: "Prednisolona",
    categoria: "Corticoide",
    laboratorio: "Bayer",
    stock: 22,
    minimo: 5,
    vencimiento: "2027-01-14",
    precio: 48000,
    estado: "DISPONIBLE",
  },
];

/* =========================================================
   PAGE
========================================================= */

export default function FarmaciaPage() {
  const [search, setSearch] = useState("");

  const medicamentos = useMemo(() => {
    return medicamentosMock.filter((med) =>
      med.nombre
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [search]);

  const totalStock = useMemo(
    () =>
      medicamentosMock.reduce(
        (acc, item) => acc + item.stock,
        0
      ),
    []
  );

  const bajoStock = medicamentosMock.filter(
    (m) => m.estado === "BAJO STOCK"
  ).length;

  const vencidos = medicamentosMock.filter(
    (m) => m.estado === "VENCIDO"
  ).length;

  return (
    <div className="space-y-6 pb-10 animate-in fade-in duration-500">

      {/* =========================================================
          HEADER
      ========================================================= */}

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">

        <div className="bg-gradient-to-r from-cyan-600 via-teal-600 to-slate-900 px-8 py-8">

          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">

            <div>

              <div className="flex items-center gap-3">

                <div className="w-16 h-16 rounded-3xl bg-white/10 border border-white/10 backdrop-blur-xl flex items-center justify-center text-white">

                  <Pill size={30} />
                </div>

                <div>

                  <h1 className="text-3xl font-bold text-white">
                    Farmacia
                  </h1>

                  <p className="text-cyan-100 mt-1">
                    Gestión farmacéutica veterinaria
                  </p>
                </div>
              </div>
            </div>

            {/* ACTIONS */}
            <div className="flex flex-wrap gap-3">

              <button className="h-11 px-5 rounded-xl bg-white text-gray-800 text-sm font-semibold flex items-center gap-2 hover:bg-gray-100 transition-colors">
                <Plus size={18} />
                Nuevo Medicamento
              </button>

              <button className="h-11 px-5 rounded-xl bg-white/10 border border-white/10 text-white text-sm font-semibold flex items-center gap-2 hover:bg-white/20 transition-colors">
                <ClipboardPlus size={18} />
                Registrar Entrada
              </button>
            </div>
          </div>
        </div>

        {/* SEARCH */}
        <div className="p-6 border-t border-white/10 bg-white">

          <div className="flex flex-col xl:flex-row gap-4">

            {/* SEARCH */}
            <div className="relative flex-1">

              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="text"
                placeholder="Buscar medicamento..."
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                className="w-full h-12 rounded-2xl border border-gray-200 bg-gray-50 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
              />
            </div>

            {/* FILTER */}
            <button className="h-12 px-5 rounded-2xl border border-gray-200 bg-white text-sm font-semibold text-gray-700 flex items-center gap-2 hover:bg-gray-50 transition-colors">

              <Filter size={18} />
              Filtros
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================
          STATS
      ========================================================= */}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">

        {/* TOTAL */}
        <div className="bg-white rounded-3xl border border-gray-100 p-5 shadow-sm">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-sm text-gray-500">
                Inventario Total
              </p>

              <h3 className="text-3xl font-bold text-gray-900 mt-2">
                {totalStock}
              </h3>
            </div>

            <div className="w-14 h-14 rounded-2xl bg-cyan-50 text-cyan-600 flex items-center justify-center">

              <Boxes size={26} />
            </div>
          </div>
        </div>

        {/* BAJO STOCK */}
        <div className="bg-white rounded-3xl border border-gray-100 p-5 shadow-sm">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-sm text-gray-500">
                Bajo Stock
              </p>

              <h3 className="text-3xl font-bold text-gray-900 mt-2">
                {bajoStock}
              </h3>
            </div>

            <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">

              <TriangleAlert size={26} />
            </div>
          </div>
        </div>

        {/* VENCIDOS */}
        <div className="bg-white rounded-3xl border border-gray-100 p-5 shadow-sm">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-sm text-gray-500">
                Vencidos
              </p>

              <h3 className="text-3xl font-bold text-gray-900 mt-2">
                {vencidos}
              </h3>
            </div>

            <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center">

              <CalendarClock size={26} />
            </div>
          </div>
        </div>

        {/* VALOR */}
        <div className="bg-white rounded-3xl border border-gray-100 p-5 shadow-sm">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-sm text-gray-500">
                Valor Inventario
              </p>

              <h3 className="text-3xl font-bold text-gray-900 mt-2">
                $12M
              </h3>
            </div>

            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">

              <BadgeDollarSign size={26} />
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================
          TABLE
      ========================================================= */}

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">

        {/* TOP */}
        <div className="px-6 py-5 border-b border-gray-100 flex flex-col xl:flex-row xl:items-center justify-between gap-4">

          <div>

            <h2 className="text-lg font-bold text-gray-900">
              Medicamentos
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Control farmacológico y stock.
            </p>
          </div>

          <button className="h-11 px-5 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-700 flex items-center gap-2 hover:bg-gray-50 transition-colors">

            <ArrowUpDown size={16} />
            Ordenar
          </button>
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto">

          <table className="w-full min-w-[1200px]">

            <thead>

              <tr className="border-b border-gray-100 bg-gray-50/80">

                <th className="px-6 py-4 text-left text-xs uppercase tracking-wider text-gray-500 font-bold">
                  ID
                </th>

                <th className="px-6 py-4 text-left text-xs uppercase tracking-wider text-gray-500 font-bold">
                  Medicamento
                </th>

                <th className="px-6 py-4 text-left text-xs uppercase tracking-wider text-gray-500 font-bold">
                  Categoría
                </th>

                <th className="px-6 py-4 text-left text-xs uppercase tracking-wider text-gray-500 font-bold">
                  Laboratorio
                </th>

                <th className="px-6 py-4 text-left text-xs uppercase tracking-wider text-gray-500 font-bold">
                  Stock
                </th>

                <th className="px-6 py-4 text-left text-xs uppercase tracking-wider text-gray-500 font-bold">
                  Vencimiento
                </th>

                <th className="px-6 py-4 text-left text-xs uppercase tracking-wider text-gray-500 font-bold">
                  Precio
                </th>

                <th className="px-6 py-4 text-left text-xs uppercase tracking-wider text-gray-500 font-bold">
                  Estado
                </th>

                <th className="px-6 py-4 text-right text-xs uppercase tracking-wider text-gray-500 font-bold">
                  Acciones
                </th>
              </tr>
            </thead>

            <tbody>

              {medicamentos.map((medicamento) => (

                <tr
                  key={medicamento.id}
                  className="border-b border-gray-100 hover:bg-gray-50 transition-colors group"
                >

                  {/* ID */}
                  <td className="px-6 py-5">

                    <span className="text-sm font-bold text-gray-500">
                      #{medicamento.id}
                    </span>
                  </td>

                  {/* NAME */}
                  <td className="px-6 py-5">

                    <div className="flex items-center gap-4">

                      <div className="w-14 h-14 rounded-2xl bg-cyan-50 text-cyan-600 flex items-center justify-center shrink-0">

                        <Pill size={24} />
                      </div>

                      <div>

                        <h3 className="font-semibold text-gray-900">
                          {medicamento.nombre}
                        </h3>

                        <p className="text-sm text-gray-500 mt-1">
                          Código interno farmacéutico
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* CATEGORY */}
                  <td className="px-6 py-5">

                    <span className="px-3 py-1 rounded-full bg-cyan-50 border border-cyan-100 text-cyan-700 text-xs font-semibold">

                      {medicamento.categoria}
                    </span>
                  </td>

                  {/* LAB */}
                  <td className="px-6 py-5">

                    <div className="text-sm font-medium text-gray-700">
                      {medicamento.laboratorio}
                    </div>
                  </td>

                  {/* STOCK */}
                  <td className="px-6 py-5">

                    <div className="space-y-2">

                      <div className="flex items-center justify-between text-xs text-gray-500">

                        <span>
                          {medicamento.stock} und
                        </span>

                        <span>
                          Min: {medicamento.minimo}
                        </span>
                      </div>

                      <div className="w-full h-2 rounded-full bg-gray-100 overflow-hidden">

                        <div
                          className={`h-full rounded-full ${
                            medicamento.stock <=
                            medicamento.minimo
                              ? "bg-amber-500"
                              : "bg-emerald-500"
                          }`}
                          style={{
                            width: `${Math.min(
                              (medicamento.stock /
                                50) *
                                100,
                              100
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  </td>

                  {/* DATE */}
                  <td className="px-6 py-5">

                    <div className="flex items-center gap-2 text-sm text-gray-700">

                      <CalendarClock size={15} />
                      {medicamento.vencimiento}
                    </div>
                  </td>

                  {/* PRICE */}
                  <td className="px-6 py-5">

                    <div className="font-semibold text-gray-900">
                      $
                      {medicamento.precio.toLocaleString()}
                    </div>
                  </td>

                  {/* STATUS */}
                  <td className="px-6 py-5">

                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                        medicamento.estado ===
                        "DISPONIBLE"
                          ? "bg-emerald-50 border-emerald-100 text-emerald-700"
                          : medicamento.estado ===
                            "BAJO STOCK"
                          ? "bg-amber-50 border-amber-100 text-amber-700"
                          : "bg-red-50 border-red-100 text-red-700"
                      }`}
                    >
                      {medicamento.estado}
                    </span>
                  </td>

                  {/* ACTIONS */}
                  <td className="px-6 py-5">

                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">

                      <button className="w-10 h-10 rounded-xl border border-gray-200 bg-white text-gray-500 hover:text-cyan-600 hover:border-cyan-200 transition-colors flex items-center justify-center">

                        <Eye size={17} />
                      </button>

                      <button className="w-10 h-10 rounded-xl border border-gray-200 bg-white text-gray-500 hover:text-teal-600 hover:border-teal-200 transition-colors flex items-center justify-center">

                        <Edit size={17} />
                      </button>

                      <button className="w-10 h-10 rounded-xl border border-gray-200 bg-white text-gray-500 hover:text-red-600 hover:border-red-200 transition-colors flex items-center justify-center">

                        <Trash2 size={17} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* FOOTER */}
        <div className="px-6 py-5 border-t border-gray-100 bg-gray-50/50 flex flex-col xl:flex-row xl:items-center justify-between gap-4">

          <div className="text-sm text-gray-500">

            Mostrando{" "}
            <span className="font-semibold text-gray-700">
              {medicamentos.length}
            </span>{" "}
            medicamentos registrados.
          </div>

          <div className="flex items-center gap-2">

            <button className="h-10 px-4 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors">
              Anterior
            </button>

            <button className="h-10 px-4 rounded-xl bg-cyan-600 text-white text-sm font-semibold">
              1
            </button>

            <button className="h-10 px-4 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors">
              2
            </button>

            <button className="h-10 px-4 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors">
              Siguiente
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================
          ALERT
      ========================================================= */}

      <div className="rounded-3xl bg-gradient-to-r from-amber-500 to-orange-500 p-6 text-white shadow-xl shadow-amber-500/20">

        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-5">

          <div className="flex items-start gap-4">

            <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center shrink-0">

              <ShieldCheck size={28} />
            </div>

            <div>

              <h3 className="text-xl font-bold">
                Alertas Farmacéuticas
              </h3>

              <p className="text-amber-50 mt-2 text-sm leading-relaxed">
                Existen medicamentos próximos
                a vencer y productos con stock
                crítico que requieren reposición
                inmediata.
              </p>
            </div>
          </div>

          <button className="h-12 px-6 rounded-2xl bg-white text-amber-700 font-semibold hover:bg-amber-50 transition-colors flex items-center gap-2 whitespace-nowrap">

            Revisar Alertas
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}