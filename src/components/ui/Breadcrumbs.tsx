"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";

export default function Breadcrumbs() {
  const pathname = usePathname();
  
  // Convertimos la ruta /productos/crear en ['productos', 'crear']
  const pathSegments = pathname.split("/").filter((item) => item !== "");

  // Mapa para traducir términos técnicos a nombres amigables
  const routeLabels: Record<string, string> = {
    productos: "Inventario",
    crear: "Crear Nuevo Producto",
    edit: "Editar",
    categorias: "Categorías"
  };

  return (
    <nav className="flex items-center space-x-2 text-sm text-slate-400 mb-4 px-1">
      <Link 
        href="/" 
        className="hover:text-cyan-600 transition-colors flex items-center"
      >
        <Home size={16} />
      </Link>

      {pathSegments.map((segment, index) => {
        const href = `/${pathSegments.slice(0, index + 1).join("/")}`;
        const isLast = index === pathSegments.length - 1;
        const label = routeLabels[segment] || segment;

        return (
          <React.Fragment key={segment}>
            <ChevronRight size={14} className="text-slate-300" />
            {isLast ? (
              <span className="font-semibold text-slate-700 capitalize">
                {label}
              </span>
            ) : (
              <Link
                href={href}
                className="hover:text-cyan-600 transition-colors capitalize"
              >
                {label}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}