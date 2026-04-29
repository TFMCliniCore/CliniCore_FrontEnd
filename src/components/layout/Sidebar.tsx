"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Package, Bone, Store, Users, Dog,
  ShoppingCart, BarChart3, FileText, ChevronRight, Menu, X,
  PlusCircle, List, FileDown, Edit3, CalendarDays, Calendar, Clock
} from "lucide-react";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/" },
  { icon: Package, label: "Inventario", href: "/inventario" },
  {
    icon: Bone, label: "Productos", href: "/productos", submenu: true,
    subItems: [
      { label: "Lista de Productos", href: "/productos/listar",  icon: List      },
      { label: "Crear Producto",     href: "/productos/nuevo",   icon: PlusCircle },
      { label: "Generar Reporte",    href: "/productos/reporte", icon: FileDown   },
      { label: "Editar Producto",    href: "/productos/editar",  icon: Edit3      },
    ]
  },
  {
    icon: CalendarDays, label: "Agenda", href: "/agenda", submenu: true,
    subItems: [
      { label: "Ver Agenda",   href: "/agenda",             icon: Calendar  },
      { label: "Nueva Cita",   href: "/agenda/nueva-cita",  icon: PlusCircle },
      { label: "Sala Espera",  href: "/agenda/sala-espera", icon: Clock     },
    ]
  },
  { icon: Store,        label: "POS",       href: "/pos",      submenu: true },
  { icon: Users,        label: "Clientes",  href: "/clientes", submenu: true },
  { icon: Dog,          label: "Mascotas",  href: "/mascotas", submenu: true },
  { icon: ShoppingCart, label: "Ventas",    href: "/ventas",   submenu: true },
  { icon: BarChart3,    label: "Reportes",  href: "/reportes", submenu: true },
  { icon: FileText,     label: "Logs",      href: "/logs" },
];

export default function Sidebar() {
  const [isOpen, setIsOpen]           = useState(false);
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const pathname = usePathname();

  useEffect(() => { setIsOpen(false); }, [pathname]);

  // Auto-expandir el submenú activo al cargar
  useEffect(() => {
    const active = navItems.find(item =>
      item.subItems?.some(sub => pathname.startsWith(sub.href))
    );
    if (active) setExpandedItem(active.label);
  }, [pathname]);

  const toggleSubmenu = (label: string) =>
    setExpandedItem(prev => prev === label ? null : label);

  const Bubbles = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute top-[-10%] right-[-10%] w-72 h-72 bg-cyan-500/10 rounded-full blur-[100px]" />
      <div className="absolute bottom-[-5%] left-[-5%] w-80 h-80 bg-emerald-500/20 rounded-full blur-[90px]" />
    </div>
  );

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 left-4 z-[60] p-2.5 bg-[#0e314d] text-white rounded-xl shadow-2xl border border-white/20 backdrop-blur-lg"
      >
        {isOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 transform transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]
        md:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"}
        flex flex-col h-screen text-white overflow-hidden
        bg-[#0b1a28] bg-gradient-to-b from-[#0e314d] via-[#0a8661] to-[#105174]
        border-r border-white/10 shadow-[10px_0_30px_-15px_rgba(0,0,0,0.5)]
      `}>
        <Bubbles />

        {/* LOGO */}
        <div className="pt-10 pb-8 flex flex-col items-center relative z-10 px-4">
          <div className="relative h-28 w-28 bg-white/10 rounded-3xl backdrop-blur-xl flex items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.4)]">
            <Image src="/images/logo-clinicore.png" alt="Logo" width={140} height={140} className="object-contain scale-150" />
          </div>
          <h1 className="mt-6 text-2xl font-black tracking-[0.3em] uppercase bg-clip-text text-transparent bg-gradient-to-r from-white via-cyan-100 to-white/70">
            Clinicore
          </h1>
          <p className="text-[11px] text-cyan-400 font-bold tracking-[0.4em] mt-1 uppercase">Sistema Veterinario</p>
          <div className="h-[1px] w-24 bg-gradient-to-r from-transparent via-white/20 to-transparent mt-4" />
        </div>

        {/* NAV */}
        <nav className="flex-1 px-4 mt-2 space-y-1 relative z-10 overflow-y-auto no-scrollbar">
          {navItems.map((item, index) => {
            const isItemActive = pathname === item.href || item.subItems?.some(sub => pathname.startsWith(sub.href));
            const isExpanded   = expandedItem === item.label;

            return (
              <div key={index} className="space-y-1">
                <div onClick={() => item.submenu ? toggleSubmenu(item.label) : null}>
                  <Link
                    href={item.submenu ? "#" : item.href}
                    onClick={e => { if (item.submenu) e.preventDefault(); }}
                    className={`
                      group flex items-center justify-between px-5 py-3.5 rounded-2xl transition-all duration-300 relative overflow-hidden
                      ${isItemActive
                        ? "bg-white/20 backdrop-blur-md shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)] border border-white/15"
                        : "hover:bg-white/10 text-slate-300 hover:text-white"}
                    `}
                  >
                    <div className="flex items-center space-x-4 relative z-10">
                      <item.icon size={21} className={isItemActive ? "text-cyan-300" : "opacity-50"} />
                      <span className={`text-[15px] ${isItemActive ? "font-bold" : "font-medium"}`}>{item.label}</span>
                    </div>
                    {item.submenu && (
                      <ChevronRight size={15} className={`transition-transform duration-300 ${isExpanded ? "rotate-90" : "opacity-40"}`} />
                    )}
                  </Link>
                </div>

                {item.submenu && item.subItems && (
                  <div className={`overflow-hidden transition-all duration-300 ease-in-out pl-6 ${isExpanded ? "max-h-60 opacity-100 mt-1 mb-2" : "max-h-0 opacity-0"}`}>
                    <div className="border-l-2 border-white/10 space-y-1 ml-4">
                      {item.subItems.map((sub, si) => {
                        const isSubActive = pathname === sub.href || pathname.startsWith(sub.href + '/');
                        return (
                          <Link key={si} href={sub.href}
                            className={`flex items-center space-x-3 px-6 py-2 rounded-xl text-sm transition-all
                              ${isSubActive ? "text-cyan-300 font-bold bg-cyan-400/10" : "text-slate-400 hover:text-white hover:bg-white/5"}`}
                          >
                            {sub.icon && <sub.icon size={14} className={isSubActive ? "text-cyan-300" : "opacity-40"} />}
                            <span>{sub.label}</span>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* FOOTER */}
        <div className="p-8 relative z-10 border-t border-white/5 bg-black/10">
          <p className="text-[10px] text-white/30 uppercase text-center">Clinicore ©, 2026</p>
        </div>
      </aside>
    </>
  );
}
