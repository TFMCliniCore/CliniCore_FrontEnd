// src/app/(dashboard)/mascotas/listar/page.tsx

"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  PawPrint,
  Bone,
  Loader2,
  ChevronRight,
  Mail,
  Phone,
  MapPin,
  ShieldAlert,
  Save,
  X,
  FileText,
  RefreshCw,
  Filter,
} from "lucide-react";

import { pacientesApi } from "@/lib/api";

interface Paciente {
  id: number;
  nombre: string;
  especie: string;
  raza?: string;
  sexo?: string;
  edad?: string;
  peso?: string;
  castrado?: boolean;
  foto?: string;
  fechaNacimiento?: string;
  fechaIngreso?: string;
  estado?: string;
  alimentoPrincipal?: string;
  clienteId?: number;
  sedeId?: number;
  historiaClinicaId?: number;

  cliente?: {
    nombres?: string;
    documento?: string;
    email?: string;
    celular?: string;
  };

  sede?: {
    id?: number;
    nombre?: string;
  };
}

export default function ListarPacientesPage() {
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [especieFilter, setEspecieFilter] = useState("TODOS");
  const [estadoFilter, setEstadoFilter] = useState("TODOS");

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [pacienteEditando, setPacienteEditando] =
    useState<Paciente | null>(null);

  const [isUpdating, setIsUpdating] = useState(false);

  const cargarPacientes = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await pacientesApi.listar();

      setPacientes(Array.isArray(data) ? data : []);
    } catch (err: any) {
      if (
        err?.response?.status === 401 ||
        err?.response?.status === 403
      ) {
        setError("unauthorized");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarPacientes();
  }, []);

  const pacientesFiltrados = useMemo(() => {
    return pacientes.filter((paciente) => {
      const q = search.toLowerCase();

      const matchSearch =
        paciente.nombre?.toLowerCase().includes(q) ||
        paciente.cliente?.nombres?.toLowerCase().includes(q) ||
        paciente.cliente?.documento?.toLowerCase().includes(q);

      const matchEspecie =
        especieFilter === "TODOS" ||
        paciente.especie === especieFilter;

      const matchEstado =
        estadoFilter === "TODOS" ||
        paciente.estado === estadoFilter;

      return matchSearch && matchEspecie && matchEstado;
    });
  }, [pacientes, search, especieFilter, estadoFilter]);

  const handleEliminar = async (id: number) => {
    if (!confirm("¿Eliminar paciente?")) return;

    try {
      await pacientesApi.eliminar(id);

      setPacientes((prev) => prev.filter((p) => p.id !== id));
    } catch (err: any) {
      alert("Error eliminando paciente");
    }
  };

  const abrirEdicion = (paciente: Paciente) => {
    setPacienteEditando({ ...paciente });

    setIsEditModalOpen(true);
  };

  const handleActualizar = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (!pacienteEditando) return;

    setIsUpdating(true);

    try {
      await pacientesApi.actualizar(
        pacienteEditando.id,
        pacienteEditando
      );

      setPacientes((prev) =>
        prev.map((p) =>
          p.id === pacienteEditando.id
            ? pacienteEditando
            : p
        )
      );

      setIsEditModalOpen(false);
    } catch (error) {
      alert("Error actualizando");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6 pb-8 animate-in fade-in duration-500">

      {/* ALERTA */}
      {error === "unauthorized" && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <ShieldAlert
              className="text-red-500"
              size={22}
            />

            <div>
              <p className="font-bold text-red-700">
                Sin autorización
              </p>

              <p className="text-sm text-red-600">
                No tienes permisos para visualizar pacientes.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">

        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Pacientes
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Gestión clínica veterinaria ·{" "}
            {pacientes.length} registrados
          </p>
        </div>

        <div className="flex items-center gap-2">

          <button
            onClick={cargarPacientes}
            className="h-11 px-4 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <RefreshCw
              size={15}
              className={loading ? "animate-spin" : ""}
            />

            Actualizar
          </button>

          <Link
            href="/mascotas/nuevo"
            className="h-11 px-5 rounded-xl text-sm font-semibold text-white flex items-center gap-2 bg-gradient-to-r from-[#0e314d] to-[#0a8661] hover:opacity-90 transition-all"
          >
            <Plus size={16} />
            Nuevo Paciente
          </Link>
        </div>
      </div>

      {/* FILTROS */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 flex flex-col lg:flex-row gap-3">

        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            type="text"
            placeholder="Buscar paciente, propietario o documento..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            className="w-full h-11 rounded-xl border border-gray-200 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20"
          />
        </div>

        <select
          value={especieFilter}
          onChange={(e) =>
            setEspecieFilter(e.target.value)
          }
          className="h-11 rounded-xl border border-gray-200 px-4 text-sm"
        >
          <option value="TODOS">
            Todas las especies
          </option>

          <option value="Canino">Canino</option>

          <option value="Felino">Felino</option>

          <option value="Ave">Ave</option>
        </select>

        <select
          value={estadoFilter}
          onChange={(e) =>
            setEstadoFilter(e.target.value)
          }
          className="h-11 rounded-xl border border-gray-200 px-4 text-sm"
        >
          <option value="TODOS">
            Todos los estados
          </option>

          <option value="ACTIVO">
            Activo
          </option>

          <option value="INACTIVO">
            Inactivo
          </option>
        </select>
      </div>

      {/* TABLA */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1200px]">

            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>

                <th className="px-6 py-4 text-left text-[11px] uppercase tracking-wider text-gray-400 font-bold">
                  ID
                </th>

                <th className="px-6 py-4 text-left text-[11px] uppercase tracking-wider text-gray-400 font-bold">
                  Paciente
                </th>

                <th className="px-6 py-4 text-left text-[11px] uppercase tracking-wider text-gray-400 font-bold">
                  Propietario
                </th>

                <th className="px-6 py-4 text-left text-[11px] uppercase tracking-wider text-gray-400 font-bold">
                  Contacto
                </th>

                <th className="px-6 py-4 text-left text-[11px] uppercase tracking-wider text-gray-400 font-bold">
                  Sede
                </th>

                <th className="px-6 py-4 text-left text-[11px] uppercase tracking-wider text-gray-400 font-bold">
                  Estado
                </th>

                <th className="px-6 py-4 text-right text-[11px] uppercase tracking-wider text-gray-400 font-bold">
                  Acciones
                </th>

              </tr>
            </thead>

            <tbody className="divide-y divide-gray-50">

              {!loading &&
                pacientesFiltrados.map((paciente) => (
                  <tr
                    key={paciente.id}
                    className="hover:bg-gray-50 transition-colors group"
                  >

                    {/* ID */}
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-gray-400">
                        #{paciente.id}
                      </span>
                    </td>

                    {/* PACIENTE */}
                    <td className="px-6 py-4">

                      <div className="flex items-center gap-4">

                        <div className="h-14 w-14 rounded-2xl overflow-hidden bg-gray-100 border border-gray-200">

                          {paciente.foto ? (
                            <img
                              src={paciente.foto}
                              alt={paciente.nombre}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Bone
                                size={20}
                                className="text-gray-300"
                              />
                            </div>
                          )}

                        </div>

                        <div className="space-y-1">

                          <div className="font-semibold text-gray-900">
                            {paciente.nombre}
                          </div>

                          <div className="text-sm text-gray-500 flex items-center gap-2">
                            <PawPrint
                              size={13}
                              className="text-teal-500"
                            />

                            {paciente.especie}

                            {paciente.raza &&
                              ` • ${paciente.raza}`}
                          </div>

                          <div className="text-xs text-gray-400">
                            HC #
                            {paciente.historiaClinicaId ||
                              "N/A"}
                          </div>

                        </div>

                      </div>

                    </td>

                    {/* PROPIETARIO */}
                    <td className="px-6 py-4">

                      <div className="text-sm font-semibold text-gray-700">
                        {paciente.cliente?.nombres}
                      </div>

                      <div className="text-xs text-gray-400 mt-1">
                        DOC:{" "}
                        {paciente.cliente?.documento}
                      </div>

                    </td>

                    {/* CONTACTO */}
                    <td className="px-6 py-4">

                      <div className="space-y-1">

                        <div className="text-sm text-gray-600 flex items-center gap-2">
                          <Mail
                            size={14}
                            className="text-gray-400"
                          />

                          {paciente.cliente?.email}
                        </div>

                        <div className="text-sm text-gray-600 flex items-center gap-2">
                          <Phone
                            size={14}
                            className="text-gray-400"
                          />

                          {paciente.cliente?.celular}
                        </div>

                      </div>

                    </td>

                    {/* SEDE */}
                    <td className="px-6 py-4">

                      <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs bg-gray-100 text-gray-600 border border-gray-200">
                        <MapPin
                          size={12}
                          className="text-gray-400"
                        />

                        {paciente.sede?.nombre}
                      </span>

                    </td>

                    {/* ESTADO */}
                    <td className="px-6 py-4">

                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide ${
                          paciente.estado === "ACTIVO"
                            ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                            : "bg-red-50 text-red-600 border border-red-200"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            paciente.estado === "ACTIVO"
                              ? "bg-emerald-500"
                              : "bg-red-500"
                          }`}
                        />

                        {paciente.estado}
                      </span>

                    </td>

                    {/* ACCIONES */}
                    <td className="px-6 py-4">

                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">

                        <button
                          onClick={() =>
                            abrirEdicion(paciente)
                          }
                          className="w-10 h-10 rounded-xl border border-transparent flex items-center justify-center text-gray-400 hover:text-teal-600 hover:border-teal-200 hover:bg-teal-50 transition-all"
                        >
                          <Edit size={17} />
                        </button>

                        <button
                          onClick={() =>
                            handleEliminar(
                              paciente.id
                            )
                          }
                          className="w-10 h-10 rounded-xl border border-transparent flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 hover:border-red-200 transition-all"
                        >
                          <Trash2 size={17} />
                        </button>

                      </div>

                    </td>

                  </tr>
                ))}

            </tbody>
          </table>
        </div>

        {/* LOADING */}
        {loading && (
          <div className="p-20 text-center">

            <Loader2 className="animate-spin h-10 w-10 text-teal-600 mx-auto" />

            <p className="mt-4 text-gray-400 text-sm">
              Cargando pacientes...
            </p>

          </div>
        )}

        {/* EMPTY */}
        {!loading &&
          pacientesFiltrados.length === 0 && (
            <div className="p-20 text-center">

              <Filter
                size={42}
                className="mx-auto text-gray-300 mb-4"
              />

              <p className="text-gray-500 font-medium">
                No se encontraron resultados
              </p>

            </div>
          )}

      </div>

      {/* MODAL */}
      {isEditModalOpen &&
        pacienteEditando && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">

            <div className="bg-white w-full max-w-xl rounded-3xl border border-gray-100 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">

              {/* HEADER */}
              <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between">

                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Editar Paciente
                  </h2>

                  <p className="text-sm text-gray-500 mt-1">
                    Actualiza la información clínica
                  </p>
                </div>

                <button
                  onClick={() =>
                    setIsEditModalOpen(false)
                  }
                  className="w-10 h-10 rounded-xl hover:bg-gray-100 flex items-center justify-center text-gray-500 transition-colors"
                >
                  <X size={20} />
                </button>

              </div>

              {/* FORM */}
              <form
                onSubmit={handleActualizar}
                className="p-8 space-y-5 max-h-[75vh] overflow-y-auto"
              >

                <div className="space-y-2">

                  <label className="text-xs font-bold uppercase tracking-wider text-gray-400">
                    Nombre
                  </label>

                  <input
                    type="text"
                    value={pacienteEditando.nombre}
                    onChange={(e) =>
                      setPacienteEditando({
                        ...pacienteEditando,
                        nombre: e.target.value,
                      })
                    }
                    className="w-full h-12 rounded-xl border border-gray-200 bg-gray-50 px-4"
                  />

                </div>

                <div className="grid grid-cols-2 gap-4">

                  <div className="space-y-2">

                    <label className="text-xs font-bold uppercase tracking-wider text-gray-400">
                      Especie
                    </label>

                    <select
                      value={
                        pacienteEditando.especie
                      }
                      onChange={(e) =>
                        setPacienteEditando({
                          ...pacienteEditando,
                          especie:
                            e.target.value,
                        })
                      }
                      className="w-full h-12 rounded-xl border border-gray-200 bg-gray-50 px-4"
                    >
                      <option value="Canino">
                        Canino
                      </option>

                      <option value="Felino">
                        Felino
                      </option>

                    </select>

                  </div>

                  <div className="space-y-2">

                    <label className="text-xs font-bold uppercase tracking-wider text-gray-400">
                      Sexo
                    </label>

                    <select
                      value={pacienteEditando.sexo}
                      onChange={(e) =>
                        setPacienteEditando({
                          ...pacienteEditando,
                          sexo: e.target.value,
                        })
                      }
                      className="w-full h-12 rounded-xl border border-gray-200 bg-gray-50 px-4"
                    >
                      <option value="Macho">
                        Macho
                      </option>

                      <option value="Hembra">
                        Hembra
                      </option>

                    </select>

                  </div>

                </div>

                <div className="flex items-center gap-3 p-4 rounded-2xl bg-gray-50 border border-gray-100">

                  <input
                    type="checkbox"
                    checked={
                      pacienteEditando.castrado
                    }
                    onChange={(e) =>
                      setPacienteEditando({
                        ...pacienteEditando,
                        castrado:
                          e.target.checked,
                      })
                    }
                  />

                  <span className="text-sm font-medium text-gray-700">
                    Paciente castrado
                  </span>

                </div>

                <div className="flex gap-3 pt-4">

                  <button
                    type="button"
                    onClick={() =>
                      setIsEditModalOpen(false)
                    }
                    className="flex-1 h-12 rounded-xl border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>

                  <button
                    disabled={isUpdating}
                    type="submit"
                    className="flex-[2] h-12 rounded-xl bg-gradient-to-r from-[#0e314d] to-[#0a8661] text-white font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-all"
                  >
                    {isUpdating ? (
                      <Loader2 className="animate-spin" />
                    ) : (
                      <>
                        <Save size={17} />
                        Guardar Cambios
                      </>
                    )}
                  </button>

                </div>

              </form>

            </div>

          </div>
        )}

    </div>
  );
}