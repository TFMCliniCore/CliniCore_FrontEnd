"use client";

import { useMemo, useState } from "react";

import {
  BadgeDollarSign,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  CreditCard,
  Download,
  Eye,
  FileSpreadsheet,
  Filter,
  MoreVertical,
  Plus,
  Receipt,
  Search,
  Send,
  Wallet,
  XCircle,
} from "lucide-react";

interface Factura {
  id: number;
  numero: string;
  cliente: string;
  mascota: string;
  fecha: string;
  metodoPago: string;
  subtotal: number;
  impuestos: number;
  total: number;
  estado: "PAGADA" | "PENDIENTE" | "ANULADA";
}

const facturasMock: Factura[] = [
  {
    id: 1,
    numero: "FAC-2026-001",
    cliente: "Laura Gómez",
    mascota: "Max",
    fecha: "2026-05-13",
    metodoPago: "Tarjeta",
    subtotal: 120000,
    impuestos: 22800,
    total: 142800,
    estado: "PAGADA",
  },
  {
    id: 2,
    numero: "FAC-2026-002",
    cliente: "Camilo Torres",
    mascota: "Milo",
    fecha: "2026-05-13",
    metodoPago: "Efectivo",
    subtotal: 85000,
    impuestos: 16150,
    total: 101150,
    estado: "PENDIENTE",
  },
  {
    id: 3,
    numero: "FAC-2026-003",
    cliente: "Andrea Ruiz",
    mascota: "Luna",
    fecha: "2026-05-12",
    metodoPago: "Transferencia",
    subtotal: 220000,
    impuestos: 41800,
    total: 261800,
    estado: "ANULADA",
  },
  {
    id: 4,
    numero: "FAC-2026-004",
    cliente: "Daniel Mora",
    mascota: "Rocky",
    fecha: "2026-05-12",
    metodoPago: "Nequi",
    subtotal: 56000,
    impuestos: 10640,
    total: 66640,
    estado: "PAGADA",
  },
];

export default function FacturacionPage() {
  const [search, setSearch] = useState("");
  const [selectedFactura, setSelectedFactura] =
    useState<Factura | null>(null);

  const [facturas, setFacturas] =
    useState<Factura[]>(facturasMock);

  const [loadingExport, setLoadingExport] =
    useState(false);

  const [loadingSend, setLoadingSend] =
    useState<number | null>(null);

  const filteredFacturas = useMemo(() => {
    return facturas.filter((factura) =>
      `
      ${factura.numero}
      ${factura.cliente}
      ${factura.mascota}
      ${factura.estado}
      `
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [search, facturas]);

  const totalFacturado = facturas.reduce(
    (acc, item) => acc + item.total,
    0
  );

  const totalPendiente = facturas
    .filter((f) => f.estado === "PENDIENTE")
    .reduce((acc, item) => acc + item.total, 0);

  const totalPagado = facturas
    .filter((f) => f.estado === "PAGADA")
    .reduce((acc, item) => acc + item.total, 0);

  const handleAnularFactura = (
    facturaId: number
  ) => {
    setFacturas((prev) =>
      prev.map((factura) =>
        factura.id === facturaId
          ? {
              ...factura,
              estado: "ANULADA",
            }
          : factura
      )
    );
  };

  const handleExportar = async () => {
    setLoadingExport(true);

    await new Promise((resolve) =>
      setTimeout(resolve, 1500)
    );

    alert("Reporte exportado correctamente");

    setLoadingExport(false);
  };

  const handleEnviarFactura = async (
    facturaId: number
  ) => {
    setLoadingSend(facturaId);

    await new Promise((resolve) =>
      setTimeout(resolve, 1200)
    );

    alert(
      `Factura #${facturaId} enviada al cliente`
    );

    setLoadingSend(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">

      {/* HERO */}
      <div className="relative overflow-hidden rounded-[32px] border border-white/30 bg-gradient-to-br from-cyan-700 via-sky-700 to-indigo-800 p-8 shadow-2xl shadow-sky-900/20">

        <div className="absolute -top-10 -right-10 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

        <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-6">

          <div className="space-y-4">

            <div className="inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur-xl">
              <Receipt size={16} />
              Facturación Electrónica
            </div>

            <div>
              <h1 className="text-4xl font-black tracking-tight text-white">
                Gestión de Facturación
              </h1>

              <p className="mt-2 text-sm text-sky-100">
                Control de ingresos, comprobantes y
                facturas electrónicas
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">

            <button
              onClick={handleExportar}
              disabled={loadingExport}
              className="h-12 rounded-2xl bg-white px-5 font-bold text-sky-700 transition-all hover:scale-[1.02] disabled:opacity-50 flex items-center gap-2"
            >
              {loadingExport ? (
                <>
                  <Clock3
                    size={18}
                    className="animate-spin"
                  />
                  Exportando...
                </>
              ) : (
                <>
                  <Download size={18} />
                  Exportar
                </>
              )}
            </button>

            <button className="h-12 rounded-2xl border border-white/20 bg-white/10 px-5 font-semibold text-white backdrop-blur-xl transition-all hover:bg-white/20 flex items-center gap-2">
              <Plus size={18} />
              Nueva Factura
            </button>
          </div>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">

        <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm font-medium text-gray-500">
                Facturación Total
              </p>

              <h3 className="mt-2 text-3xl font-black text-gray-900">
                $
                {totalFacturado.toLocaleString()}
              </h3>
            </div>

            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-100 text-cyan-700">
              <BadgeDollarSign size={28} />
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm font-medium text-gray-500">
                Facturas Pagadas
              </p>

              <h3 className="mt-2 text-3xl font-black text-emerald-600">
                $
                {totalPagado.toLocaleString()}
              </h3>
            </div>

            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
              <CheckCircle2 size={28} />
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm font-medium text-gray-500">
                Pendientes
              </p>

              <h3 className="mt-2 text-3xl font-black text-amber-500">
                $
                {totalPendiente.toLocaleString()}
              </h3>
            </div>

            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
              <Clock3 size={28} />
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm font-medium text-gray-500">
                Facturas
              </p>

              <h3 className="mt-2 text-3xl font-black text-gray-900">
                {facturas.length}
              </h3>
            </div>

            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-700">
              <FileSpreadsheet size={28} />
            </div>
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="overflow-hidden rounded-[32px] border border-gray-100 bg-white shadow-sm">

        {/* TOP */}
        <div className="flex flex-col gap-4 border-b border-gray-100 p-6 xl:flex-row xl:items-center xl:justify-between">

          <div>
            <h2 className="text-lg font-bold text-gray-900">
              Facturas Registradas
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Administración financiera y control
              tributario
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
                placeholder="Buscar factura..."
                className="h-11 w-[280px] rounded-2xl border border-gray-200 bg-gray-50 pl-11 pr-4 text-sm outline-none focus:ring-2 focus:ring-sky-500/20"
              />
            </div>

            <button className="flex h-11 items-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 text-sm font-semibold hover:bg-gray-50">
              <Filter size={16} />
              Filtros
            </button>
          </div>
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto">

          <table className="min-w-full">

            <thead className="border-b border-gray-100 bg-gray-50">

              <tr className="text-left">

                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">
                  Factura
                </th>

                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">
                  Cliente
                </th>

                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">
                  Método
                </th>

                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">
                  Fecha
                </th>

                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">
                  Estado
                </th>

                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">
                  Total
                </th>

                <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-gray-500">
                  Acciones
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">

              {filteredFacturas.map(
                (factura) => (
                  <tr
                    key={factura.id}
                    className="transition-colors hover:bg-gray-50"
                  >

                    <td className="px-6 py-5">

                      <div className="flex items-center gap-4">

                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-100 text-sky-700">
                          <Receipt size={22} />
                        </div>

                        <div>

                          <h3 className="font-bold text-gray-900">
                            {factura.numero}
                          </h3>

                          <p className="mt-1 text-sm text-gray-500">
                            IVA: $
                            {factura.impuestos.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-5">

                      <div>
                        <p className="font-semibold text-gray-800">
                          {factura.cliente}
                        </p>

                        <p className="mt-1 text-sm text-gray-500">
                          Mascota:{" "}
                          {factura.mascota}
                        </p>
                      </div>
                    </td>

                    <td className="px-6 py-5">

                      <div className="flex items-center gap-2 text-sm font-medium text-gray-700">

                        <CreditCard size={16} />

                        {factura.metodoPago}
                      </div>
                    </td>

                    <td className="px-6 py-5">

                      <div className="flex items-center gap-2 text-sm text-gray-600">

                        <CalendarDays size={16} />

                        {factura.fecha}
                      </div>
                    </td>

                    <td className="px-6 py-5">

                      {factura.estado ===
                        "PAGADA" && (
                        <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
                          <CheckCircle2 size={14} />
                          PAGADA
                        </span>
                      )}

                      {factura.estado ===
                        "PENDIENTE" && (
                        <span className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">
                          <Clock3 size={14} />
                          PENDIENTE
                        </span>
                      )}

                      {factura.estado ===
                        "ANULADA" && (
                        <span className="inline-flex items-center gap-2 rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-600">
                          <XCircle size={14} />
                          ANULADA
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-5">

                      <div>
                        <p className="text-sm font-black text-gray-900">
                          $
                          {factura.total.toLocaleString()}
                        </p>

                        <p className="mt-1 text-xs text-gray-500">
                          Subtotal $
                          {factura.subtotal.toLocaleString()}
                        </p>
                      </div>
                    </td>

                    <td className="px-6 py-5">

                      <div className="flex items-center justify-end gap-2">

                        <button
                          onClick={() =>
                            setSelectedFactura(
                              factura
                            )
                          }
                          className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 text-gray-500 transition-colors hover:bg-sky-50 hover:text-sky-700"
                        >
                          <Eye size={18} />
                        </button>

                        <button
                          onClick={() =>
                            handleEnviarFactura(
                              factura.id
                            )
                          }
                          disabled={
                            loadingSend ===
                            factura.id
                          }
                          className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 text-gray-500 transition-colors hover:bg-emerald-50 hover:text-emerald-700 disabled:opacity-50"
                        >
                          {loadingSend ===
                          factura.id ? (
                            <Clock3
                              size={16}
                              className="animate-spin"
                            />
                          ) : (
                            <Send size={18} />
                          )}
                        </button>

                        <button
                          onClick={() =>
                            handleAnularFactura(
                              factura.id
                            )
                          }
                          className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 text-gray-500 transition-colors hover:bg-red-50 hover:text-red-600"
                        >
                          <MoreVertical size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>

        {/* FOOTER */}
        <div className="flex flex-col gap-4 border-t border-gray-100 p-6 md:flex-row md:items-center md:justify-between">

          <p className="text-sm text-gray-500">
            Mostrando{" "}
            <span className="font-bold text-gray-700">
              {filteredFacturas.length}
            </span>{" "}
            facturas
          </p>

          <div className="flex items-center gap-2">

            <button className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50">
              <ChevronLeft size={18} />
            </button>

            <button className="h-10 rounded-xl bg-sky-600 px-4 text-sm font-bold text-white">
              1
            </button>

            <button className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* MODAL */}
      {selectedFactura && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">

          <div className="w-full max-w-2xl rounded-[32px] bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-300">

            {/* HEADER */}
            <div className="flex items-center justify-between border-b border-gray-100 p-6">

              <div>
                <h2 className="text-xl font-black text-gray-900">
                  {selectedFactura.numero}
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Vista rápida de factura
                </p>
              </div>

              <button
                onClick={() =>
                  setSelectedFactura(null)
                }
                className="flex h-11 w-11 items-center justify-center rounded-2xl border border-gray-200 text-gray-500 hover:bg-gray-50"
              >
                <XCircle size={20} />
              </button>
            </div>

            {/* BODY */}
            <div className="space-y-6 p-6">

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5">

                  <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
                    Cliente
                  </p>

                  <h3 className="mt-2 text-lg font-black text-gray-900">
                    {selectedFactura.cliente}
                  </h3>

                  <p className="mt-1 text-sm text-gray-500">
                    Mascota:{" "}
                    {selectedFactura.mascota}
                  </p>
                </div>

                <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5">

                  <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
                    Método de Pago
                  </p>

                  <h3 className="mt-2 text-lg font-black text-gray-900">
                    {
                      selectedFactura.metodoPago
                    }
                  </h3>

                  <p className="mt-1 text-sm text-gray-500">
                    Fecha:{" "}
                    {selectedFactura.fecha}
                  </p>
                </div>
              </div>

              <div className="rounded-3xl border border-gray-100 p-6">

                <div className="space-y-4">

                  <div className="flex items-center justify-between">

                    <span className="text-gray-500">
                      Subtotal
                    </span>

                    <span className="font-bold text-gray-900">
                      $
                      {selectedFactura.subtotal.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">

                    <span className="text-gray-500">
                      IVA
                    </span>

                    <span className="font-bold text-gray-900">
                      $
                      {selectedFactura.impuestos.toLocaleString()}
                    </span>
                  </div>

                  <div className="border-t border-dashed border-gray-200 pt-4">

                    <div className="flex items-center justify-between">

                      <span className="text-lg font-bold text-gray-900">
                        Total
                      </span>

                      <span className="text-2xl font-black text-sky-700">
                        $
                        {selectedFactura.total.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">

                <button
                  onClick={() =>
                    handleEnviarFactura(
                      selectedFactura.id
                    )
                  }
                  className="flex h-12 items-center gap-2 rounded-2xl bg-sky-600 px-5 font-bold text-white hover:bg-sky-700"
                >
                  <Send size={18} />
                  Enviar Factura
                </button>

                <button className="flex h-12 items-center gap-2 rounded-2xl border border-gray-200 bg-white px-5 font-bold text-gray-700 hover:bg-gray-50">
                  <Wallet size={18} />
                  Registrar Pago
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}