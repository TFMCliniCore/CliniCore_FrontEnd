"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Camera,
  Save,
  ArrowLeft,
  Loader2,
  Eye,
  EyeOff,
} from "lucide-react";

import { usuariosApi, rolesApi, resolveImageUrl } from "@/lib/api";
import type { Rol } from "@/lib/api";

export default function PerfilPage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [usuario, setUsuario] = useState<any>(null);
  const [nombres, setNombres] = useState("");
  const [celular, setCelular] = useState("");
  const [roles, setRoles] = useState<Rol[]>([]);
  const [rolId, setRolId] = useState<number>(0);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [contrasena, setContrasena] = useState("");
  const [showPw, setShowPw] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem("user");
    if (!raw) {
      router.replace("/login");
      return;
    }
    const u = JSON.parse(raw);
    setUsuario(u);
    setNombres(u.nombres ?? "");
    setCelular(u.celular ?? "");
    setRolId(u.rolId ?? 0);
    rolesApi
      .listar() // ← carga roles
      .then(setRoles)
      .catch(() => {});
  }, [router]);

  const handleFoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !usuario) return;
    setUploading(true);
    setMsg(null);
    try {
      const updated = await usuariosApi.subirFoto(usuario.id, file);
      const newUser = { ...usuario, foto: updated.foto };
      localStorage.setItem("user", JSON.stringify(newUser));
      window.dispatchEvent(new Event("user-updated"));
      setUsuario(newUser);
      setMsg({ text: "Foto actualizada correctamente.", ok: true });
    } catch (err: any) {
      setMsg({ text: err.message, ok: false });
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!usuario) return;
    setSaving(true);
    setMsg(null);
    try {
      const rolSeleccionado = roles.find((r) => r.id === rolId);
      const payload: any = {
        nombres,
        celular,
        rolId,
        cargo: rolSeleccionado?.nombre ?? usuario.cargo,
      };
      if (contrasena.trim()) payload.contrasena = contrasena.trim();

      await usuariosApi.actualizar(usuario.id, payload);
      const newUser = {
        ...usuario,
        nombres,
        celular,
        rolId,
        cargo: payload.cargo,
        rol: rolSeleccionado,
      };
      localStorage.setItem("user", JSON.stringify(newUser));
      window.dispatchEvent(new Event("user-updated"));
      setUsuario(newUser);
      setMsg({ text: "Perfil actualizado correctamente.", ok: true });
    } catch (err: any) {
      setMsg({ text: err.message, ok: false });
    } finally {
      setSaving(false);
    }
  };

  if (!usuario) return null;

  const fotoUrl = resolveImageUrl(usuario.foto);

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft size={20} className="text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mi Perfil</h1>
          <p className="text-sm text-gray-500">
            Gestiona tu información personal
          </p>
        </div>
      </div>

      {/* Foto */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 flex flex-col items-center gap-4">
        <div className="relative">
          <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-teal-100 bg-gray-100 flex items-center justify-center">
            {fotoUrl ? (
              <img
                src={fotoUrl}
                alt="Foto de perfil"
                className="w-full h-full object-cover"
              />
            ) : (
              <User size={48} className="text-gray-400" />
            )}
          </div>
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="absolute bottom-0 right-0 w-9 h-9 rounded-full bg-teal-600 text-white flex items-center justify-center shadow-lg hover:bg-teal-700 transition-colors disabled:opacity-50"
          >
            {uploading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Camera size={16} />
            )}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleFoto}
          />
        </div>
        <div className="text-center">
          <p className="font-bold text-gray-900 text-lg">{usuario.nombres}</p>
          <p className="text-sm text-gray-500">{usuario.email}</p>
          <p className="text-xs text-teal-600 font-semibold mt-1">
            {usuario.rol?.nombre ?? usuario.roles}
          </p>
        </div>
        <p className="text-xs text-gray-400">JPG, PNG o WebP · Máx. 3 MB</p>
      </div>

      {/* Datos editables */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
        <h2 className="font-semibold text-gray-900 text-base">
          Información personal
        </h2>

        {msg && (
          <div
            className={`text-sm px-4 py-3 rounded-xl ${msg.ok ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}
          >
            {msg.text}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
              Nombre completo
            </label>
            <input
              value={nombres}
              onChange={(e) => setNombres(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-100 focus:border-teal-400 bg-gray-50 focus:bg-white transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
              Celular
            </label>
            <input
              value={celular}
              onChange={(e) => setCelular(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-100 focus:border-teal-400 bg-gray-50 focus:bg-white transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
              Cargo / Rol
            </label>
            <select
              value={rolId}
              onChange={(e) => setRolId(Number(e.target.value))}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-100 focus:border-teal-400 bg-gray-50 focus:bg-white transition-all"
            >
              <option value={0} disabled>
                Selecciona un rol…
              </option>
              {roles.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.nombre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
              Nueva contraseña{" "}
              <span className="text-gray-400 font-normal normal-case">
                (dejar vacío para no cambiar)
              </span>
            </label>
            <div className="relative">
              <input
                type={showPw ? "text" : "password"}
                value={contrasena}
                onChange={(e) => setContrasena(e.target.value)}
                placeholder="••••••••"
                autoComplete="new-password"
                className="w-full px-4 py-2.5 pr-11 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-100 focus:border-teal-400 bg-gray-50 focus:bg-white transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
              Correo electrónico
            </label>
            <input
              value={usuario.email}
              disabled
              className="w-full px-4 py-2.5 rounded-xl border border-gray-100 text-sm bg-gray-50 text-gray-400 cursor-not-allowed"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50 hover:opacity-90 transition-all"
            style={{ background: "linear-gradient(135deg, #0e314d, #0a8661)" }}
          >
            {saving ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Save size={16} />
            )}
            Guardar cambios
          </button>
        </div>
      </div>
    </div>
  );
}
