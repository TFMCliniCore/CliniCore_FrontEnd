'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Eye, EyeOff, Mail, Lock, AlertCircle,
  CheckCircle2, ArrowRight, Stethoscope,
} from 'lucide-react';

const FEATURES = [
  'Control multisucursal en tiempo real',
  'POS, caja y facturación integrados',
  'Agenda y telemedicina veterinaria',
  'Auditoría y respaldo automático',
];

const MODULES = [
  'Dashboard', 'Agenda', 'Mascotas', 'Clientes',
  'Farmacia', 'POS', 'Inventario', 'Reportes',
];

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [showPw, setShowPw]       = useState(false);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');
  const [success, setSuccess]     = useState(false);

  // Validation
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const pwValid    = password.length >= 6;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailValid || !pwValid) return;

    setLoading(true);
    setError('');

    try {
    const res = await fetch('http://localhost:3002/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    console.log("CONTENIDO REAL DEL BACKEND:", data); 

    // ✅ CORRECCIÓN: Cambiar data.token por data.access_token
    if (res.ok && data.access_token) {
      // Guardamos el access_token en el localStorage con la llave 'token'
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      setSuccess(true);
      // Redirigir al dashboard
      setTimeout(() => router.push('/'), 1000);
    } else {
      // Si el backend no envió access_token, mostramos el error
      throw new Error(data.message || 'El backend no envió un token.');
    }
  } catch (err: any) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};

  const handleForgotPassword = async () => {
  if (!emailValid) {
    setError('Por favor, ingresa un correo válido primero.');
    return;
  }
  
  setLoading(true);
  setError('');

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3002/api/v1'}/auth/forgot-password`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }), // Envía el correo que ya está en el input[cite: 16]
      },
    );

    if (!res.ok) throw new Error('No se pudo enviar el correo de recuperación.');
    
    // Mostramos el éxito usando el mismo campo de error para no alterar la vista
    setError('Si el correo existe, se ha enviado un enlace de recuperación.');
  } catch (err: any) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen flex">

      {/* ── Left panel: branding ── */}
      <aside className="hidden lg:flex w-[420px] xl:w-[480px] flex-shrink-0 flex-col justify-between p-10
        bg-gradient-to-b from-[#0e314d] via-[#0a6b55] to-[#105174]
        relative overflow-hidden">

        {/* Decorative bubbles */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-20 -right-20 w-72 h-72 bg-cyan-400/10 rounded-full blur-[80px]" />
          <div className="absolute bottom-0 -left-10 w-80 h-80 bg-emerald-500/15 rounded-full blur-[90px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-teal-600/5 rounded-full blur-[120px]" />
        </div>

        {/* Dot grid */}
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '28px 28px' }}
        />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-11 h-11 bg-white/15 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/20 shadow-lg">
            <Stethoscope className="text-cyan-300" size={22} />
          </div>
          <div>
            <span className="text-xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-100 to-white/70 uppercase">
              Clinicore
            </span>
            <p className="text-[10px] text-cyan-400 font-bold tracking-[0.35em] uppercase -mt-0.5">
              Sistema Veterinario
            </p>
          </div>
        </div>

        {/* Hero text */}
        <div className="relative z-10">
          <h1 className="text-4xl font-black text-white leading-tight mb-4">
            Gestión clínica<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-emerald-300">
              inteligente
            </span>{' '}
            para<br />
            tu veterinaria
          </h1>
          <p className="text-slate-300 text-sm leading-relaxed max-w-xs mb-8">
            Administra sucursales, inventario, pacientes y telemedicina
            desde una sola plataforma segura.
          </p>

          <div className="space-y-3 mb-8">
            {FEATURES.map((f) => (
              <div key={f} className="flex items-center gap-3 text-slate-300 text-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 flex-shrink-0" />
                {f}
              </div>
            ))}
          </div>

          {/* Module tags */}
          <div className="flex flex-wrap gap-2">
            {MODULES.map((m) => (
              <span key={m}
                className="px-3 py-1 rounded-full border border-white/10 text-white/40 text-xs bg-white/5">
                {m}
              </span>
            ))}
          </div>
        </div>

        {/* Footer */}
        <p className="relative z-10 text-white/25 text-xs">© 2026 Clinicore · Todos los derechos reservados</p>
      </aside>

      {/* ── Right panel: form ── */}
      <main className="flex-1 bg-gray-50 flex items-center justify-center p-6">
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #0e314d, #10a8a8)' }}>
              <Stethoscope className="text-white" size={20} />
            </div>
            <span className="text-lg font-black tracking-widest uppercase text-gray-800">Clinicore</span>
          </div>

          {/* Card */}
          <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/60 border border-gray-100 p-8 md:p-10">

            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-1">Iniciar sesión</h2>
              <p className="text-gray-500 text-sm">Accede a tu cuenta de Clinicore</p>
            </div>

            {/* Error alert */}
            {error && (
              <div className="flex items-start gap-3 p-4 mb-6 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm">
                <AlertCircle size={17} className="flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Success */}
            {success && (
              <div className="flex items-center gap-3 p-4 mb-6 bg-green-50 border border-green-200 rounded-2xl text-green-700 text-sm">
                <CheckCircle2 size={17} className="flex-shrink-0" />
                <span>¡Sesión iniciada! Redirigiendo…</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5" noValidate>

              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Correo electrónico
                </label>
                <div className="relative">
                  <Mail size={16}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(''); }}
                    placeholder="usuario@clinica.com"
                    autoComplete="email"
                    className={`w-full pl-11 pr-4 py-3.5 rounded-2xl border text-sm transition-all outline-none
                      bg-gray-50 focus:bg-white
                      ${email && !emailValid
                        ? 'border-red-300 focus:ring-2 focus:ring-red-200'
                        : 'border-gray-200 focus:border-teal-400 focus:ring-2 focus:ring-teal-100'}`}
                  />
                </div>
                {email && !emailValid && (
                  <p className="text-red-500 text-xs mt-1.5 ml-1">Ingresa un correo válido</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Contraseña
                </label>
                <div className="relative">
                  <Lock size={16}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(''); }}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className="w-full pl-11 pr-12 py-3.5 rounded-2xl border border-gray-200 text-sm
                      bg-gray-50 focus:bg-white focus:border-teal-400 focus:ring-2 focus:ring-teal-100
                      outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>

              {/* Remember + forgot */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2.5 cursor-pointer group">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded accent-teal-600 cursor-pointer"
                  />
                  <span className="text-sm text-gray-500 group-hover:text-gray-700 transition-colors">
                    Recordar sesión
                  </span>
                </label>
                <button 
                  type="button"
                  onClick={handleForgotPassword} // 🔥 Conexión de la lógica
                  className="text-sm text-teal-600 hover:text-teal-700 font-semibold transition-colors"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading || !emailValid || !pwValid || success}
                className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-2xl
                  font-bold text-sm text-white transition-all duration-200
                  disabled:opacity-50 disabled:cursor-not-allowed
                  hover:opacity-90 active:scale-[0.99]"
                style={{ background: 'linear-gradient(135deg, #0e314d 0%, #008585 50%, #105174 100%)' }}
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Ingresando…
                  </>
                ) : success ? (
                  <>
                    <CheckCircle2 size={17} />
                    ¡Bienvenido!
                  </>
                ) : (
                  <>
                    Ingresar al sistema
                    <ArrowRight size={17} />
                  </>
                )}
              </button>

            </form>

            {/* Divider + SSO */}
            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px bg-gray-100" />
              <span className="text-xs text-gray-400 font-medium">o continúa con</span>
              <div className="flex-1 h-px bg-gray-100" />
            </div>

            <button
              type="button"
              className="w-full flex items-center justify-center gap-3 py-3.5 rounded-2xl
                border border-gray-200 text-sm font-medium text-gray-700
                hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
            >
              {/* Google G */}
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continuar con Google SSO
            </button>

          </div>

          <p className="text-center text-xs text-gray-400 mt-6">
            Clinicore © 2026 · Sistema Veterinario Profesional
          </p>
        </div>
      </main>
    </div>
  );
}
