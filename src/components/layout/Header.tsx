"use client";

import {
  Search,
  Bell,
  User,
  ChevronDown,
  Settings,
  LogOut,
} from "lucide-react";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import { resolveImageUrl } from "@/lib/api";

export default function Header() {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const router = useRouter();
  const [usuario, setUsuario] = useState<{
    nombres: string;
    email: string;
    cargo: string;
  } | null>(null);

  useEffect(() => {
    const loadUser = () => {
      const raw = localStorage.getItem("user");
      if (raw) setUsuario(JSON.parse(raw));
    };

    loadUser(); // carga inicial
    window.addEventListener("user-updated", loadUser); // escucha cambios
    return () => window.removeEventListener("user-updated", loadUser);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    document.cookie = 'token=; path=/; max-age=0';
    router.push("/login");
  };

  return (
    <header className="fixed top-0 right-0 left-0 lg:left-72 h-16 bg-white border-b border-gray-200 z-20 shadow-sm">
      <div className="h-full px-4 lg:px-8 flex items-center justify-between">
        {/* Search Bar */}
        <div className="flex-1 max-w-2xl">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3 ml-4">
          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors duration-200"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100">
                  <h3 className="font-semibold text-gray-900">
                    Notificaciones
                  </h3>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  <div className="px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors">
                    <p className="text-sm font-medium text-gray-900">
                      Nueva cita agendada
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Max tiene cita a las 3:00 PM
                    </p>
                  </div>
                  <div className="px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors">
                    <p className="text-sm font-medium text-gray-900">
                      Inventario bajo
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Revisa los productos con stock bajo
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-xl transition-colors duration-200"
            >
              <div
                className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center"
                style={{
                  background:
                    "linear-gradient(135deg, #14b8a6 0%, #06b6d4 100%)",
                }}
              >
                {usuario?.foto ? (
                  <img
                    src={resolveImageUrl(usuario.foto) ?? ""}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-5 h-5 text-white" />
                )}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-semibold text-gray-900">
                  {usuario?.nombres ?? "Usuario"}
                </p>
                <p className="text-xs text-gray-500">
                  {usuario?.cargo ?? "Cargo"}
                </p>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-500" />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-semibold text-gray-900">
                    {usuario?.nombres ?? "Usuario"}
                  </p>
                  <p className="text-xs text-gray-500">
                    {usuario?.email ?? "Email"}
                  </p>
                </div>
                <div className="py-2">
                  <Link
                    href="/perfil"
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
                  >
                    <User className="w-4 h-4" />
                    Mi Perfil
                  </Link>
                  <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    Configuración
                  </button>
                </div>
                <div className="border-t border-gray-100 py-2">
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Cerrar Sesión
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
