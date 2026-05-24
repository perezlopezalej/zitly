"use client";

import { useState } from "react";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";
import { Network3D } from "./network-3d";
import { CtaButtonGroup } from "./cta-button-group";

export function CtaSection() {
  const [sectionRef, isVisible] = useIntersectionObserver(0.2);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  };

  return (
    <section ref={sectionRef} className="relative py-24 lg:py-32 overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        <div
          className={`relative border border-foreground overflow-hidden transition-all duration-1000 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
          onMouseMove={handleMouseMove}
        >
          {/* Spotlight effect */}
          <div
            className="absolute inset-0 opacity-10 pointer-events-none transition-opacity duration-300"
            style={{
              background: `radial-gradient(600px circle at ${mousePosition.x}% ${mousePosition.y}%, color-mix(in oklch, var(--color-foreground) 15%, transparent), transparent 40%)`,
            }}
          />

          <div className="relative z-10 px-8 lg:px-16 py-16 lg:py-24">
            <div className="flex flex-col lg:flex-row items-center gap-12">
              {/* Left content */}
              <div className="flex-1">
                <h2 className="text-4xl lg:text-7xl font-display tracking-tight mb-8 leading-[0.95]">
                  ¿Listo para dejar
                  <br />
                  de perder clientes?
                </h2>

                <p className="text-xl text-muted-foreground mb-12 leading-relaxed max-w-xl">
                  Únete a miles de negocios que ya gestionan sus reservas con Zitly.
                  Empieza gratis, sin tarjeta de crédito.
                </p>

                <CtaButtonGroup />

                <p className="text-sm text-muted-foreground mt-8 font-mono">
                  Configuración en 2 minutos · Sin tarjeta de crédito
                </p>
              </div>

              {/* Right animation */}
              <div className="hidden lg:flex items-center justify-center w-125 h-125 shrink-0">
                <Network3D />
              </div>
            </div>
          </div>

          {/* Decorative corners */}
          <div className="absolute top-0 right-0 w-32 h-32 border-b border-l border-foreground/10" />
          <div className="absolute bottom-0 left-0 w-32 h-32 border-t border-r border-foreground/10" />
        </div>
      </div>
    </section>
  );
}
