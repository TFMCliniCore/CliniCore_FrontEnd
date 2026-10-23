"use client";
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { pacientesApi, telemedicinaApi, type Videoconsulta } from "@/lib/api";
import {
  Activity,
  CalendarDays,
  Camera,
  CheckCircle2,
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
type EstadoUI =
  | "PENDIENTE"
  | "PROGRAMADA"
  | "EN_CURSO"
  | "FINALIZADA"
  | "CANCELADA";
interface Teleconsulta {
  id: string;
  motivo: string;
  paciente: string;
  propietario: string;
  veterinario: string;
  fecha: string;
  hora: string;
  estado: EstadoUI;
  enlaceMeet: string | null;
  duracion: string;
  sesionId?: string;
}
function adaptarVideoconsulta(
  consulta: Videoconsulta,
): Teleconsulta {
  const fecha = new Date(consulta.fecha);
  const estados: Record<string, EstadoUI> = {
    PENDIENTE: "PROGRAMADA",
    PROGRAMADA: "PROGRAMADA",
    EN_CURSO: "EN_CURSO",
    COMPLETADA: "FINALIZADA",
    FINALIZADA: "FINALIZADA",
    CANCELADA: "CANCELADA",
  };
  return {
    id: consulta.id,
    motivo: consulta.motivo,
    paciente: consulta.paciente?.nombre ?? "Paciente sin nombre",
    propietario:
      consulta.paciente?.cliente?.nombres ?? "Propietario no disponible",
    veterinario: consulta.usuario?.nombres ?? "Veterinario asignado",
    fecha: Number.isNaN(fecha.getTime())
      ? "Fecha no disponible"
      : fecha.toLocaleDateString("es-CO"),
    hora: Number.isNaN(fecha.getTime())
      ? "--:--"
      : fecha.toLocaleTimeString("es-CO", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }),
    estado: estados[consulta.estado] ?? "PROGRAMADA",
    enlaceMeet: consulta.enlaceMeet,
    duracion: `${consulta.duracionMinutos ?? 0} min`,
  };
}
export default function TelemedicinaPage() {
  const [consultas, setConsultas] = useState<Teleconsulta[]>([]);
  const [cargando, setCargando] = useState(true);
  const [procesandoId, setProcesandoId] = useState<string | null>(null);
  const [errorApi, setErrorApi] = useState("");
  const [mensajeApi, setMensajeApi] = useState("");
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [pacientes, setPacientes] = useState<Array<{ id: number | string; nombre: string }>>([]);
  const [guardandoConsulta, setGuardandoConsulta] = useState(false);
  const [formConsulta, setFormConsulta] = useState({
    pacienteId: "",
    motivo: "",
    fecha: new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16),
  });
  const videoRef = useRef<HTMLVideoElement>(null);
  const [streamLocal, setStreamLocal] = useState<MediaStream | null>(null);
  const [estadoDispositivos, setEstadoDispositivos] = useState(
    "Cámara y micrófono sin activar",
  );
  const [errorDispositivos, setErrorDispositivos] = useState("");
  // Solicita permisos al navegador al pulsar "Iniciar videoconsulta".
  const activarDispositivos = async (): Promise<boolean> => {
    setErrorDispositivos("");
    if (!navigator.mediaDevices?.getUserMedia) {
      setEstadoDispositivos(
        "Este navegador no permite acceder a la cámara. Utiliza localhost o HTTPS.",
      );
      setErrorDispositivos(
        "El navegador no permite acceder a la cámara. Comprueba que utilizas localhost o HTTPS.",
      );
      return false;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setStreamLocal((anterior) => {
        anterior?.getTracks().forEach((track) => track.stop());
        return stream;
      });
      stream.getVideoTracks().forEach((track) => (track.enabled = true));
      stream.getAudioTracks().forEach((track) => (track.enabled = true));
      setCamaraActiva(stream.getVideoTracks().length > 0);
      setMicrofonoActivo(stream.getAudioTracks().length > 0);
      setEstadoDispositivos("Cámara y micrófono autorizados");
      return true;
    } catch (error) {
      const mensaje =
        error instanceof DOMException && error.name === "NotAllowedError"
          ? "Se denegó el acceso a la cámara o al micrófono. Revisa los permisos del navegador."
          : error instanceof DOMException && error.name === "NotFoundError"
            ? "No se encontró una cámara o un micrófono disponible."
            : "No se pudo acceder a los dispositivos. Comprueba los permisos y que no estén siendo usados por otra aplicación.";
      setCamaraActiva(false);
      setMicrofonoActivo(false);
      setEstadoDispositivos("Dispositivos sin acceso");
      setErrorDispositivos(mensaje);
      return false;
    }
  };
  const detenerDispositivos = () => {
    streamLocal?.getTracks().forEach((track) => track.stop());
    setStreamLocal(null);
    setCamaraActiva(false);
    setMicrofonoActivo(false);
    setEstadoDispositivos("Cámara y micrófono sin activar");
  };
  const alternarCamara = () => {
    const nuevoEstado = !camaraActiva;
    streamLocal?.getVideoTracks().forEach((track) => {
      track.enabled = nuevoEstado;
    });
    setCamaraActiva(nuevoEstado);
  };
  const alternarMicrofono = () => {
    const nuevoEstado = !microfonoActivo;
    streamLocal?.getAudioTracks().forEach((track) => {
      track.enabled = nuevoEstado;
    });
    setMicrofonoActivo(nuevoEstado);
  };
  useEffect(() => {
    if (videoRef.current && streamLocal) {
      videoRef.current.srcObject = streamLocal;
    }
  }, [streamLocal]);
  useEffect(() => {
    return () => {
      streamLocal?.getTracks().forEach((track) => track.stop());
    };
  }, [streamLocal]);
  const cargarConsultas = async () => {
    setCargando(true);
    setErrorApi("");
    try {
      const [datos, sesiones] = await Promise.all([
        telemedicinaApi.listar(),
        telemedicinaApi.listarSesiones(),
      ]);
      setConsultas((actuales) =>
        datos.map((dato) => ({
          ...adaptarVideoconsulta(dato),
          sesionId:
            sesiones.find(
              (sesion) =>
                sesion.videoconsultaId === dato.id &&
                sesion.estado === "ACTIVA" &&
                !sesion.eliminado,
            )?.id ?? actuales.find((item) => item.id === dato.id)?.sesionId,
        })),
      );
    } catch (error) {
      setErrorApi(
        error instanceof Error
          ? error.message
          : "No se pudieron cargar las videoconsultas.",
      );
    } finally {
      setCargando(false);
    }
  };
  useEffect(() => {
    void cargarConsultas();
  }, []);
  const abrirFormulario = async () => {
    setErrorApi("");
    try {
      const lista = await pacientesApi.listar() as Array<{
        id: number | string;
        nombre?: string;
      }>;
      setPacientes(
        lista.map((paciente) => ({
          id: paciente.id,
          nombre: paciente.nombre ?? `Paciente ${paciente.id}`,
        })),
      );
      setMostrarFormulario(true);
    } catch (error) {
      setErrorApi(error instanceof Error ? error.message : "No se pudieron cargar los pacientes.");
    }
  };
  const crearConsulta = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setGuardandoConsulta(true);
    setErrorApi("");
    try {
      await telemedicinaApi.crear({
        pacienteId: formConsulta.pacienteId,
        fecha: new Date(formConsulta.fecha).toISOString(),
        motivo: formConsulta.motivo.trim(),
        duracionMinutos: 30,
      });
      setMostrarFormulario(false);
      setFormConsulta({
        pacienteId: "",
        motivo: "",
        fecha: new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
          .toISOString()
          .slice(0, 16),
      });
      setMensajeApi("La videoconsulta se creó correctamente.");
      await cargarConsultas();
    } catch (error) {
      setErrorApi(error instanceof Error ? error.message : "No se pudo crear la videoconsulta.");
    } finally {
      setGuardandoConsulta(false);
    }
  };
  const [busqueda, setBusqueda] = useState("");
  const [camaraActiva, setCamaraActiva] =
    useState(false);
  const [microfonoActivo, setMicrofonoActivo] =
    useState(false);
  const consultaActiva = consultas.find((item) => item.estado === "EN_CURSO") ?? null;
  const llamadaActiva = consultaActiva !== null;
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
  const iniciarConsulta = async (id: string) => {
    const ventanaMeet = window.open("about:blank", "_blank");
    setProcesandoId(id);
    setErrorApi("");
    setMensajeApi("");
    try {
      const dispositivosListos = await activarDispositivos();
      const resultado = await telemedicinaApi.iniciarSesion(id);
      const enlaceMeet = resultado.enlaceMeet;
      if (!enlaceMeet) {
        ventanaMeet?.close();
        throw new Error("El backend no devolvió un enlace de Google Meet.");
      }
      if (ventanaMeet) ventanaMeet.location.href = enlaceMeet;
      else window.location.assign(enlaceMeet);
      if (!dispositivosListos) {
        setMensajeApi(
          "Sesión iniciada en el backend, pero la cámara o el micrófono no tienen permiso. Revisa el mensaje de dispositivos.",
        );
      }
      setConsultas((prev) =>
        prev.map((item) =>
          item.id === id
            ? {
              ...item,
              estado: "EN_CURSO",
              enlaceMeet,
              sesionId: resultado.sesion.id,
            }
            : item,
        ),
      );
      if (dispositivosListos) {
        setMensajeApi(
          "Sesión iniciada y Google Meet abierto. La vista previa local solo comprueba tus dispositivos.",
        );
      }
      await cargarConsultas();
    } catch (error) {
      ventanaMeet?.close();
      if (streamLocal) {
        detenerDispositivos();
      }
      setErrorApi(
        error instanceof Error
          ? error.message
          : "No se pudo iniciar la consulta.",
      );
    } finally {
      setProcesandoId(null);
    }
  };
  const finalizarConsulta = async (id: string) => {
    const consulta = consultas.find((item) => item.id === id);
    if (!consulta) return;
    setProcesandoId(id);
    setErrorApi("");
    setMensajeApi("");
    try {
      if (consulta.sesionId) {
        await telemedicinaApi.finalizarSesion(consulta.sesionId);
      } else {
        await telemedicinaApi.actualizar(id, {
          estado: "COMPLETADA",
        });
      }
      setMensajeApi("Se ha solicitado finalizar la consulta.");
      detenerDispositivos();
      await cargarConsultas();
    } catch (error) {
      setErrorApi(
        error instanceof Error
          ? error.message
          : "No se pudo finalizar la consulta.",
      );
    } finally {
      setProcesandoId(null);
    }
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
          <button onClick={() => void abrirFormulario()} className="h-12 px-5 rounded-2xl bg-violet-600 hover:bg-violet-700 text-white font-semibold flex items-center gap-2 transition-colors">
            <Video size={18} />
            Nueva Consulta
          </button>
        </div>
      </div>
      {mostrarFormulario && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
          <form onSubmit={crearConsulta} className="w-full max-w-lg space-y-5 rounded-3xl bg-white p-6 shadow-2xl">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Nueva videoconsulta</h2>
              <p className="mt-1 text-sm text-gray-500">Selecciona el paciente y programa la consulta.</p>
            </div>
            <label className="block space-y-2 text-sm font-medium text-gray-700">
              Paciente
              <select
                required
                value={formConsulta.pacienteId}
                onChange={(event) => setFormConsulta((actual) => ({ ...actual, pacienteId: event.target.value }))}
                className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3"
              >
                <option value="">Selecciona un paciente</option>
                {pacientes.map((paciente) => (
                  <option key={paciente.id} value={String(paciente.id)}>{paciente.nombre}</option>
                ))}
              </select>
              {pacientes.length === 0 && (
                <span className="block text-xs font-normal text-amber-700">No hay pacientes disponibles para programar.</span>
              )}
            </label>
            <label className="block space-y-2 text-sm font-medium text-gray-700">
              Motivo
              <input
                required
                maxLength={500}
                value={formConsulta.motivo}
                onChange={(event) => setFormConsulta((actual) => ({ ...actual, motivo: event.target.value }))}
                placeholder="Describe el motivo de la consulta"
                className="h-11 w-full rounded-xl border border-gray-200 px-3"
              />
            </label>
            <label className="block space-y-2 text-sm font-medium text-gray-700">
              Fecha y hora
              <input
                required
                type="datetime-local"
                value={formConsulta.fecha}
                onChange={(event) => setFormConsulta((actual) => ({ ...actual, fecha: event.target.value }))}
                className="h-11 w-full rounded-xl border border-gray-200 px-3"
              />
            </label>
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setMostrarFormulario(false)} className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700">Cancelar</button>
              <button type="submit" disabled={guardandoConsulta || pacientes.length === 0} className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
                {guardandoConsulta ? "Guardando..." : "Crear consulta"}
              </button>
            </div>
          </form>
        </div>
      )}
      {errorApi && (
        <div
          role="alert"
          className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          {errorApi}
          <button
            onClick={() => void cargarConsultas()}
            className="ml-3 font-semibold underline"
          >
            Reintentar
          </button>
        </div>
      )}
      {mensajeApi && (
        <div
          role="status"
          className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700"
        >
          {mensajeApi}
        </div>
      )}
      {cargando && (
        <p className="rounded-2xl bg-white p-4 text-sm text-gray-500">
          Cargando videoconsultas...
        </p>
      )}
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
                {consultaActiva ? "Consulta Activa" : "Sin consulta activa"}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {consultaActiva
                  ? `${consultaActiva.paciente} · ${consultaActiva.veterinario}`
                  : "Inicia una videoconsulta desde el historial."}
              </p>
            </div>
            <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-semibold ${
                llamadaActiva
                  ? "bg-amber-50 border-amber-100 text-amber-700"
                  : "bg-gray-50 border-gray-200 text-gray-600"
              }`}>
                {llamadaActiva ? <Wifi size={16} /> : <WifiOff size={16} />}
                {llamadaActiva ? "Sesión iniciada" : "Sin sesión activa"}
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
                  {consultaActiva?.paciente ?? "Sin consulta seleccionada"}
                </h3>
                <p className="text-gray-300 text-sm mt-1">
                  {consultaActiva
                    ? `${consultaActiva.motivo} · ${consultaActiva.veterinario}`
                    : "Selecciona una consulta programada para comenzar."}
                </p>
              </div>
            </div>
            {/* VISTA PREVIA LOCAL */}
            <div className="absolute bottom-5 right-5 w-52 h-36 rounded-2xl border border-white/10 overflow-hidden bg-slate-700 shadow-2xl">
              {streamLocal ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  aria-label="Vista previa de la cámara local"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full flex flex-col items-center justify-center">
                  <Camera size={28} className="text-white" />
                  <span className="text-white text-sm mt-3 font-medium">
                    Cámara sin activar
                  </span>
                </div>
              )}
              {streamLocal && !microfonoActivo && (
                <span className="absolute left-2 top-2 rounded-md bg-red-600 px-2 py-1 text-xs text-white">
                  Micrófono silenciado
                </span>
              )}
            </div>
          </div>
          {/* CONTROLS */}
          <div className="p-6 border-t border-gray-100 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={alternarMicrofono}
              disabled={!streamLocal}
              title={streamLocal ? (microfonoActivo ? "Silenciar micrófono" : "Activar micrófono") : "Inicia una consulta para activar el micrófono"}
              className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${microfonoActivo
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
              onClick={alternarCamara}
              disabled={!streamLocal}
              title={streamLocal ? (camaraActiva ? "Apagar cámara" : "Encender cámara") : "Inicia una consulta para activar la cámara"}
              className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${camaraActiva
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
              onClick={() => {
                if (consultaActiva) {
                  void finalizarConsulta(consultaActiva.id);
                } else {
                  setErrorApi(
                    "Para iniciar una llamada, pulsa el botón de reproducción de una videoconsulta programada.",
                  );
                }
              }}
              className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-colors ${llamadaActiva
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
                title="Sesión backend"
                active={llamadaActiva}
              />
              <div className="rounded-xl bg-gray-50 p-3 text-sm text-gray-700">
                <p className="font-semibold">Dispositivos locales</p>
                <p className="mt-1">{estadoDispositivos}</p>
                {errorDispositivos && (
                  <p role="alert" className="mt-2 text-red-600">
                    {errorDispositivos}
                  </p>
                )}
              </div>
              <StatusItem
                title="Audio"
                active={microfonoActivo}
              />
              <StatusItem
                title="Video"
                active={camaraActiva}
              />
              <StatusItem
                title="Enlace de Google Meet"
                active={Boolean(consultas.find((item) => item.estado === "EN_CURSO" && item.enlaceMeet))}
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
                value={consultaActiva?.paciente ?? "—"}
              />
              <InfoRow
                label="Propietario"
                value={consultaActiva?.propietario ?? "—"}
              />
              <InfoRow
                label="Veterinario"
                value={consultaActiva?.veterinario ?? "—"}
              />
              <InfoRow
                label="Duración"
                value={consultaActiva?.duracion ?? "—"}
              />
              <InfoRow
                label="Estado"
                value={consultaActiva?.estado ?? "Sin sesión"}
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
                <th className="px-6 py-4 font-semibold">Google Meet</th>
                <th className="px-6 py-4 font-semibold">
                  Duración
                </th>
                <th className="px-6 py-4 font-semibold text-right">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {!cargando && filtradas.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-10 text-center text-gray-500">
                    No se encontraron videoconsultas.
                  </td>
                </tr>
              )}
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
                    {item.enlaceMeet ? (
                      <a
                        href={item.enlaceMeet}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-semibold"
                      >
                        <Video size={14} />
                        Abrir Meet
                      </a>
                    ) : (
                      <span className="text-xs text-gray-500">Se crea al iniciar</span>
                    )}
                  </td>
                  <td className="px-6 py-5 text-sm text-gray-700">
                    {item.duracion}
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => void iniciarConsulta(item.id)}
                        disabled={procesandoId === item.id || item.estado === "CANCELADA" || item.estado === "FINALIZADA"}
                        title="Iniciar videoconsulta"
                        aria-label={`Iniciar consulta de ${item.paciente}`}
                        className="w-10 h-10 rounded-xl border border-emerald-200 text-emerald-700 flex items-center justify-center hover:bg-emerald-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Play size={16} />
                      </button>
                      <button
                        onClick={() => void finalizarConsulta(item.id)}
                        disabled={procesandoId === item.id || item.estado !== "EN_CURSO"}
                        title="Finalizar videoconsulta"
                        aria-label={`Finalizar consulta de ${item.paciente}`}
                        className="w-10 h-10 rounded-xl border border-red-200 text-red-700 flex items-center justify-center hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
  const styles: Record<EstadoUI, string> = {
    PENDIENTE:
      "bg-amber-50 text-amber-700 border-amber-100",
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
        className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-semibold ${active
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
