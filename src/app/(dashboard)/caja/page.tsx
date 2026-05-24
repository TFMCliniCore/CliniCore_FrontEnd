"use client";

import { useMemo, useState } from "react";

import {
  Banknote,
  Search,
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  CreditCard,
  Landmark,
  Receipt,
  Filter,
  Download,
  Eye,
  Plus,
  CalendarDays,
  CircleDollarSign,
  ShieldCheck,
} from "lucide-react";

interface MovimientoCaja {
  id: number;
  tipo: "INGRESO" | "EGRESO";
  concepto: string;
  metodoPago: string;
  usuario: string;
  fecha: string;
  valor: number;
  estado: "CONFIRMADO" | "PENDIENTE";
}

const movimientosMock: MovimientoCaja[] = [
  {
    id: 1001,
    tipo: "INGRESO",
    concepto: "Pago consulta general",
    metodoPago: "Tarjeta",
    usuario: "Laura Gómez",
    fecha: "2026-05-13 08:40",
    valor: 85000,
    estado: "CONFIRMADO",
  },
  {
    id: 1002,
    tipo: "EGRESO",
    concepto: "Compra insumos quirúrgicos",
    metodoPago: "Transferencia",
    usuario: "Carlos Ruiz",
    fecha: "2026-05-13 09:10",
    valor: 210000,
    estado: "CONFIRMADO",
  },
  {
    id: 1003,
    tipo: "INGRESO",
    concepto: "Vacunación felina",
    metodoPago: "Efectivo",
    usuario: "Andrea Mora",
    fecha: "2026-05-13 10:25",
    valor: 120000,
    estado: "PENDIENTE",
  },
  {
    id: 1004,
    tipo: "INGRESO",
    concepto: "Venta farmacia",
    metodoPago: "Nequi",
    usuario: "Felipe Castro",
    fecha: "2026-05-13 11:02",
    valor: 43000,
    estado: "CONFIRMADO",
  },
];

export default function CajaPage() {
  const [search, setSearch] = useState("");

  const movimientos = useMemo(() => {
    return movimientosMock.filter((mov) =>
      `${mov.concepto} ${mov.usuario} ${mov.metodoPago}`
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [search]);

  const totalIngresos = movimientosMock
    .filter((m) => m.tipo === "INGRESO")
    .reduce((acc, item) => acc + item.valor, 0);

  const totalEgresos = movimientosMock
    .filter((m) => m.tipo === "EGRESO")
    .reduce((acc, item) => acc + item.valor, 0);

  const balance = totalIngresos - totalEgresos;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">

      {/* HEADER */}
      <div className="rounded-3xl border border-white/60 bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 p-8 text-white shadow-2xl shadow-emerald-900/20 overflow-hidden relative">

        <div className="absolute right-0 top-0 w-72 h-72 bg-white/10 rounded-full blur-3xl" />

        <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-6">

          <div className="space-y-3">

            <div className="inline-flex items-center gap-2 bg-white/15 border border-white/10 px-4 py-2 rounded-2xl backdrop-blur-xl text-sm font-semibold">
              <Wallet size={16} />
              Caja y Tesorería
            </div>

            <div>
              <h1 className="text-4xl font-black tracking-tight">
                Caja General
              </h1>

              <p className="text-emerald-50/90 mt-2 text-sm">
                Gestión financiera operativa · CliniCore ERP
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">

            <button className="h-12 px-5 rounded-2xl bg-white text-emerald-700 font-bold flex items-center gap-2 hover:scale-[1.02] transition-all">
              <Plus size={18} />
              Nuevo Movimiento
            </button>

            <button className="h-12 px-5 rounded-2xl border border-white/20 bg-white/10 backdrop-blur-xl font-semibold flex items-center gap-2 hover:bg-white/20 transition-all">
              <Download size={18} />
              Exportar
            </button>
          </div>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">

        <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm text-gray-500 font-medium">
                Balance Actual
              </p>

              <h3 className="text-3xl font-black text-gray-900 mt-2">
                ${balance.toLocaleString()}
              </h3>
            </div>

            <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <CircleDollarSign size={28} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm text-gray-500 font-medium">
                Ingresos
              </p>

              <h3 className="text-3xl font-black text-emerald-600 mt-2">
                ${totalIngresos.toLocaleString()}
              </h3>
            </div>

            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ArrowUpRight size={28} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm text-gray-500 font-medium">
                Egresos
              </p>

              <h3 className="text-3xl font-black text-red-500 mt-2">
                ${totalEgresos.toLocaleString()}
              </h3>
            </div>

            <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center">
              <ArrowDownLeft size={28} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm text-gray-500 font-medium">
                Movimientos
              </p>

              <h3 className="text-3xl font-black text-gray-900 mt-2">
                {movimientosMock.length}
              </h3>
            </div>

            <div className="w-14 h-14 rounded-2xl bg-cyan-50 text-cyan-700 flex items-center justify-center">
              <Receipt size={28} />
            </div>
          </div>
        </div>
      </div>

      {/* TABLA */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">

        {/* TOP */}
        <div className="p-6 border-b border-gray-100 flex flex-col xl:flex-row xl:items-center justify-between gap-4">

          <div>
            <h2 className="text-lg font-bold text-gray-900">
              Movimientos de Caja
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Control de ingresos y egresos financieros
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">

            <div className="relative">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Buscar movimiento..."
                className="w-[280px] h-11 rounded-2xl border border-gray-200 bg-gray-50 pl-11 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            <button className="h-11 px-4 rounded-2xl border border-gray-200 bg-white flex items-center gap-2 text-sm font-semibold hover:bg-gray-50">
              <Filter size={16} />
              Filtros
            </button>
          </div>
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto">

          <table className="min-w-full">

            <thead className="bg-gray-50 border-b border-gray-100">

              <tr className="text-left">

                <th className="px-6 py-4 text-xs font-bold tracking-wider text-gray-500 uppercase">
                  Movimiento
                </th>

                <th className="px-6 py-4 text-xs font-bold tracking-wider text-gray-500 uppercase">
                  Tipo
                </th>

                <th className="px-6 py-4 text-xs font-bold tracking-wider text-gray-500 uppercase">
                  Método
                </th>

                <th className="px-6 py-4 text-xs font-bold tracking-wider text-gray-500 uppercase">
                  Usuario
                </th>

                <th className="px-6 py-4 text-xs font-bold tracking-wider text-gray-500 uppercase">
                  Fecha
                </th>

                <th className="px-6 py-4 text-xs font-bold tracking-wider text-gray-500 uppercase">
                  Valor
                </th>

                <th className="px-6 py-4 text-right text-xs font-bold tracking-wider text-gray-500 uppercase">
                  Acciones
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">

              {movimientos.map((movimiento) => (
                <tr
                  key={movimiento.id}
                  className="hover:bg-gray-50 transition-colors"
                >

                  <td className="px-6 py-5">

                    <div className="flex items-center gap-4">

                      <div
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                          movimiento.tipo === "INGRESO"
                            ? "bg-emerald-50 text-emerald-600"
                            : "bg-red-50 text-red-500"
                        }`}
                      >
                        {movimiento.tipo === "INGRESO" ? (
                          <ArrowUpRight size={22} />
                        ) : (
                          <ArrowDownLeft size={22} />
                        )}
                      </div>

                      <div>
                        <h3 className="font-bold text-gray-900">
                          #{movimiento.id}
                        </h3>

                        <p className="text-sm text-gray-500 mt-1">
                          {movimiento.concepto}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-5">

                    <span
                      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold ${
                        movimiento.tipo === "INGRESO"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-red-100 text-red-600"
                      }`}
                    >
                      {movimiento.tipo}
                    </span>
                  </td>

                  <td className="px-6 py-5">

                    <div className="flex items-center gap-2 text-sm font-medium text-gray-700">

                      {movimiento.metodoPago === "Tarjeta" && (
                        <CreditCard size={16} />
                      )}

                      {movimiento.metodoPago === "Transferencia" && (
                        <Landmark size={16} />
                      )}

                      {movimiento.metodoPago === "Efectivo" && (
                        <Banknote size={16} />
                      )}

                      {movimiento.metodoPago}

                    </div>
                  </td>

                  <td className="px-6 py-5">
                    <p className="text-sm font-semibold text-gray-800">
                      {movimiento.usuario}
                    </p>
                  </td>

                  <td className="px-6 py-5">

                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <CalendarDays size={16} />
                      {movimiento.fecha}
                    </div>
                  </td>

                  <td className="px-6 py-5">

                    <p
                      className={`text-sm font-black ${
                        movimiento.tipo === "INGRESO"
                          ? "text-emerald-600"
                          : "text-red-500"
                      }`}
                    >
                      ${movimiento.valor.toLocaleString()}
                    </p>
                  </td>

                  <td className="px-6 py-5">

                    <div className="flex items-center justify-end gap-2">

                      <button className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 transition-colors">
                        <Eye size={18} />
                      </button>

                      <button className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:text-cyan-600 hover:bg-cyan-50 transition-colors">
                        <ShieldCheck size={18} />
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