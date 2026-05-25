"use client";

import { useEffect, useState } from "react";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";
import { AUTOADVANCE_MS } from "./constants";

const steps = [
  {
    number: "I",
    title: "Crea tu perfil",
    description: "Configura tu negocio en 2 minutos. Añade tus servicios, horarios y precios.",
    code: `// Configura tu negocio
const negocio = {
  nombre: 'Tu Peluquería',
  servicios: ['Corte', 'Color', 'Peinado'],
  horario: '9:00 - 20:00'
}`,
  },
  {
    number: "II",
    title: "Comparte tu enlace",
    description: "Tus clientes acceden a tu calendario desde cualquier dispositivo, 24 horas al día.",
    code: `// Tu enlace personalizado
const booking = 'zitly.es/tu-negocio'

// Tus clientes reservan desde:
// - Tu web
// - Instagram
// - Google Maps`,
  },
  {
    number: "III",
    title: "Gestiona todo",
    description: "Recibe notificaciones, confirma citas y gestiona tu agenda online. Sin llamadas, sin papel.",
    code: `// Nueva reserva automática
reserva: {
  cliente: 'María García',
  servicio: 'Corte + Color',
  fecha: 'Mañana 10:00',
  estado: 'Confirmada'
}`,
  },
];

export function HowItWorksSection() {
  const [activeStep, setActiveStep] = useState(0);
  const [sectionRef, isVisible] = useIntersectionObserver(0.1);

  useEffect(() => {
    if (!isVisible) return;
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length);
    }, AUTOADVANCE_MS);
    return () => clearInterval(interval);
  }, [isVisible]);

  return (
    <section
      id="how-it-works"
      ref={sectionRef}
      className="relative py-24 lg:py-32 overflow-hidden border-y border-foreground/10 bg-accent"
    >
      {/* Diagonal lines pattern */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `repeating-linear-gradient(
              -45deg,
              transparent,
              transparent 40px,
              currentColor 40px,
              currentColor 41px
            )`,
          }}
        />
      </div>

      <div className="relative z-10 max-w-350 mx-auto px-6 lg:px-12">
        <div className="mb-16 lg:mb-24">
          <span className="inline-flex items-center gap-3 text-sm font-mono text-muted-foreground mb-6">
            <span className="w-8 h-px bg-foreground/30" />
            Cómo funciona
          </span>
          <h2
            className={`text-4xl lg:text-6xl font-display tracking-tight transition-all duration-700 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            Tres pasos.
            <br />
            <span className="text-muted-foreground">Cero complicaciones.</span>
          </h2>
        </div>

        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24">
          {/* Steps */}
          <div className="space-y-0">
            {steps.map((step, index) => (
              <button
                key={step.number}
                type="button"
                onClick={() => setActiveStep(index)}
                className={`w-full text-left py-8 border-b border-foreground/10 transition-all duration-500 group ${
                  activeStep === index ? "opacity-100" : "opacity-40 hover:opacity-70"
                }`}
              >
                <div className="flex items-start gap-6">
                  <span className="font-display text-3xl text-foreground/30">{step.number}</span>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-2xl lg:text-3xl font-display mb-3 group-hover:translate-x-2 transition-transform duration-300">
                      {step.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">{step.description}</p>
                    {activeStep === index && (
                      <div className="mt-4 h-px bg-foreground/20 overflow-hidden">
                        <div
                          className="h-full bg-foreground w-0"
                          style={{ animation: `progress ${AUTOADVANCE_MS / 1000}s linear forwards` }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Code display */}
          <div className="lg:sticky lg:top-32 self-start">
            <div className="border border-foreground/10 overflow-hidden">
              <div className="px-6 py-4 border-b border-foreground/10 flex items-center justify-between">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-foreground/20" />
                  <div className="w-3 h-3 rounded-full bg-foreground/20" />
                  <div className="w-3 h-3 rounded-full bg-foreground/20" />
                </div>
                <span className="text-xs font-mono text-muted-foreground">agenda.js</span>
              </div>

              <div className="p-8 font-mono text-sm min-h-70">
                <pre className="text-foreground/80 whitespace-pre-wrap break-words">
                  {steps[activeStep].code.split("\n").map((line, lineIndex) => (
                    <div
                      key={`${activeStep}-${lineIndex}`}
                      className="leading-loose code-line-reveal"
                      style={{ animationDelay: `${lineIndex * 80}ms` }}
                    >
                      <span className="text-foreground/20 select-none w-8 inline-block">{lineIndex + 1}</span>
                      <span>{line}</span>
                    </div>
                  ))}
                </pre>
              </div>

              <div className="px-6 py-4 border-t border-foreground/10 flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-xs font-mono text-muted-foreground">Listo</span>
              </div>
            </div>
          </div>
        </div>
      </div>

    </section>
  );
}
