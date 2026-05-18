"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import {
  PawPrint,
  Bone,
  Save,
  ArrowLeft,
  User,
  Hash,
  Tag,
  Info,
  Scale,
  HeartPulse,
  Loader2,
  ImageIcon,
  CalendarDays,
  Building2,
} from "lucide-react";

import {
  pacientesApi,
  clientesApi,
} from "@/lib/api";

interface Cliente {
  id: number;
  nombres: string;
  documento: string;
}

export default function NuevoPacientePage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [clientes, setClientes] = useState<Cliente[]>([]);

  const [formData, setFormData] = useState({
    nombre: "",
    especie: "Canino",
    raza: "",
    sexo: "Macho",
    clienteId: "",
    edad: "",
    peso: "",
    castrado: false,
    foto: "",
    fechaIngreso: new Date().toISOString(),
    sedeId: "1",
    alimentoPrincipal: "No especificado",
  });

  useEffect(() => {
    clientesApi
      .listar()
      .then(setClientes)
      .catch((err) => {
        console.error(
          "Error cargando clientes",
          err
        );
      });
  }, []);

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    setLoading(true);

    try {
      const payload = {
        ...formData,
        clienteId: parseInt(
          formData.clienteId
        ),
        sedeId: parseInt(formData.sedeId),
      };

      await pacientesApi.crear(payload);

      router.push("/mascotas/listar");
    } catch (error) {
      console.error(error);

      alert(
        "Error registrando paciente"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-10 animate-in fade-in duration-500">

      {/* HEADER */}
      <div className="flex items-center justify-between gap-4 flex-wrap">

        <div className="flex items-center gap-4">

          <Link
            href="/mascotas/listar"
            className="w-11 h-11 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:text-teal-600 transition-colors"
          >
            <ArrowLeft size={20} />
          </Link>

          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Nuevo Paciente
            </h1>

            <p className="text-sm text-gray-500 mt-1">
              Registro clínico veterinario
            </p>
          </div>
        </div>

      </div>

      {/* FORM CARD */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">

        {/* TOP */}
        <div className="px-8 py-6 border-b border-gray-100 bg-gradient-to-r from-slate-50 to-white">

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">

            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Información del Paciente
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Completa los datos clínicos y administrativos.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs font-semibold text-teal-700 bg-teal-50 border border-teal-100 px-3 py-2 rounded-xl w-fit">
              <PawPrint size={14} />
              CliniCore Veterinary
            </div>
          </div>
        </div>

        {/* BODY */}
        <form
          onSubmit={handleSubmit}
          className="p-8 space-y-10"
        >

          {/* GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

            {/* NOMBRE */}
            <div className="space-y-2">

              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <Tag
                  size={16}
                  className="text-teal-600"
                />
                Nombre
              </label>

              <input
                required
                type="text"
                placeholder="Ej: Max"
                value={formData.nombre}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    nombre: e.target.value,
                  })
                }
                className="w-full h-12 rounded-xl border border-gray-200 bg-white px-4 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              />
            </div>

            {/* EDAD */}
            <div className="space-y-2">

              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <Hash
                  size={16}
                  className="text-teal-600"
                />
                Edad
              </label>

              <input
                required
                type="text"
                placeholder="Ej: 3 años"
                value={formData.edad}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    edad: e.target.value,
                  })
                }
                className="w-full h-12 rounded-xl border border-gray-200 bg-white px-4 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              />
            </div>

            {/* PESO */}
            <div className="space-y-2">

              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <Scale
                  size={16}
                  className="text-teal-600"
                />
                Peso
              </label>

              <input
                required
                type="text"
                placeholder="Ej: 12kg"
                value={formData.peso}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    peso: e.target.value,
                  })
                }
                className="w-full h-12 rounded-xl border border-gray-200 bg-white px-4 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              />
            </div>

            {/* SEXO */}
            <div className="space-y-2">

              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <Info
                  size={16}
                  className="text-teal-600"
                />
                Sexo
              </label>

              <select
                value={formData.sexo}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    sexo: e.target.value,
                  })
                }
                className="w-full h-12 rounded-xl border border-gray-200 bg-white px-4 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              >
                <option value="Macho">
                  Macho
                </option>

                <option value="Hembra">
                  Hembra
                </option>
              </select>
            </div>

            {/* ESPECIE */}
            <div className="space-y-2">

              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <PawPrint
                  size={16}
                  className="text-teal-600"
                />
                Especie
              </label>

              <select
                value={formData.especie}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    especie: e.target.value,
                  })
                }
                className="w-full h-12 rounded-xl border border-gray-200 bg-white px-4 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              >
                <option value="Canino">
                  Canino
                </option>

                <option value="Felino">
                  Felino
                </option>

                <option value="Ave">
                  Ave
                </option>

                <option value="Otro">
                  Otro
                </option>
              </select>
            </div>

            {/* RAZA */}
            <div className="space-y-2">

              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <Bone
                  size={16}
                  className="text-teal-600"
                />
                Raza
              </label>

              <input
                required
                type="text"
                placeholder="Ej: Golden Retriever"
                value={formData.raza}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    raza: e.target.value,
                  })
                }
                className="w-full h-12 rounded-xl border border-gray-200 bg-white px-4 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              />
            </div>

            {/* PROPIETARIO */}
            <div className="space-y-2 lg:col-span-2">

              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <User
                  size={16}
                  className="text-teal-600"
                />
                Propietario
              </label>

              <select
                required
                value={formData.clienteId}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    clienteId: e.target.value,
                  })
                }
                className="w-full h-12 rounded-xl border border-gray-200 bg-white px-4 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              >
                <option value="">
                  Selecciona un propietario...
                </option>

                {clientes.map((cliente) => (
                  <option
                    key={cliente.id}
                    value={cliente.id}
                  >
                    {cliente.nombres} ({cliente.documento})
                  </option>
                ))}
              </select>
            </div>

            {/* FOTO */}
            <div className="space-y-2 lg:col-span-2">

              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <ImageIcon
                  size={16}
                  className="text-teal-600"
                />
                URL de Foto
              </label>

              <input
                type="url"
                placeholder="https://ejemplo.com/foto.jpg"
                value={formData.foto}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    foto: e.target.value,
                  })
                }
                className="w-full h-12 rounded-xl border border-gray-200 bg-white px-4 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              />

              {formData.foto && (
                <div className="mt-4 flex items-center gap-4 rounded-2xl border border-gray-200 bg-gray-50 p-4">
                  <div className="w-20 h-20 rounded-2xl overflow-hidden border border-gray-200 bg-white shrink-0">
                    <img
                      src={formData.foto}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-gray-700">
                      Vista previa
                    </p>

                    <p className="text-xs text-gray-500 mt-1">
                      Verifica que la imagen cargue correctamente.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* FECHA INGRESO */}
            <div className="space-y-2">

              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <CalendarDays
                  size={16}
                  className="text-teal-600"
                />
                Fecha de ingreso
              </label>

              <input
                type="date"
                value={
                  formData.fechaIngreso
                    ?.split("T")[0]
                }
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    fechaIngreso:
                      e.target.value,
                  })
                }
                className="w-full h-12 rounded-xl border border-gray-200 bg-white px-4 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              />
            </div>

            {/* SEDE */}
            <div className="space-y-2">

              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <Building2
                  size={16}
                  className="text-teal-600"
                />
                Sede
              </label>

              <select
                value={formData.sedeId}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    sedeId: e.target.value,
                  })
                }
                className="w-full h-12 rounded-xl border border-gray-200 bg-white px-4 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              >
                <option value="1">
                  Sede Principal
                </option>

                <option value="2">
                  Sede Norte
                </option>

                <option value="3">
                  Sede Sur
                </option>
              </select>
            </div>

            {/* ALIMENTO */}
            <div className="space-y-2 lg:col-span-2">

              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <Bone
                  size={16}
                  className="text-teal-600"
                />
                Alimento principal
              </label>

              <input
                type="text"
                placeholder="Ej: ProPlan Adultos"
                value={formData.alimentoPrincipal}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    alimentoPrincipal:
                      e.target.value,
                  })
                }
                className="w-full h-12 rounded-xl border border-gray-200 bg-white px-4 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              />
            </div>

            {/* CASTRADO */}
            <div className="lg:col-span-2">

              <div className="flex items-center justify-between rounded-2xl border border-gray-200 bg-gray-50 px-5 py-4">

                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                    <HeartPulse size={20} />
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-gray-800">
                      Estado clínico
                    </p>

                    <p className="text-xs text-gray-500">
                      Indica si el paciente
                      está esterilizado o
                      castrado.
                    </p>
                  </div>
                </div>

                <label className="inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={formData.castrado}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        castrado:
                          e.target.checked,
                      })
                    }
                  />

                  <div className="relative w-14 h-7 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:bg-teal-600 transition-colors">
                    <div className="absolute top-1 left-1 bg-white w-5 h-5 rounded-full transition-transform peer-checked:translate-x-7" />
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* ACTIONS */}
          <div className="flex flex-col-reverse md:flex-row items-center justify-end gap-4 pt-2 border-t border-gray-100">

            <Link
              href="/mascotas/listar"
              className="w-full md:w-auto h-12 px-6 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors flex items-center justify-center text-sm font-medium"
            >
              Cancelar
            </Link>

            <button
              disabled={loading}
              type="submit"
              className="w-full md:w-auto min-w-[220px] h-12 px-8 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold transition-all flex items-center justify-center gap-2 shadow-lg shadow-teal-600/20 disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2
                    size={18}
                    className="animate-spin"
                  />
                  Guardando...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Registrar Paciente
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}