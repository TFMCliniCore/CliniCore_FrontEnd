// components/ui/BackgroundPattern.tsx
import React from 'react';
import Image from 'next/image';

interface BackgroundPatternProps {
  imageSrc?: string; // Ruta a la imagen del patrón (por defecto usa uno interno)
  opacity?: string; // Opacidad de la imagen (ej: 'opacity-5' para 5%)
  className?: string; // Clases adicionales para el div contenedor
}

export default function BackgroundPattern({ 
  imageSrc = '/images/clinicore-pattern.png', // Ajusta esta ruta si tu imagen de patrón está en otro lugar
  opacity = 'opacity-10', 
  className = '' 
}: BackgroundPatternProps) {
  return (
    <div className={`absolute inset-0 z-0 overflow-hidden ${className}`}>
      <Image
        src={imageSrc}
        alt="Clinicore Background Pattern"
        layout="fill"
        objectFit="cover" // o "contain" dependiendo del patrón
        className={`pointer-events-none ${opacity}`}
        priority
      />
      {/* Opcional: añade burbujas o destellos si el patrón es muy sutil */}
       <div className="absolute top-[5%] left-[10%] w-32 h-32 bg-cyan-200/5 rounded-full blur-[80px]" />
       <div className="absolute bottom-[15%] right-[5%] w-48 h-48 bg-emerald-200/5 rounded-full blur-[90px]" />
    </div>
  );
}