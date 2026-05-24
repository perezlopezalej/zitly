"use client";

import { useEffect, useState } from "react";
import { BookingWidget } from "./booking-widget";
import { CtaButtonGroup } from "./cta-button-group";

const words = ["reservar", "gestionar", "crecer", "facturar"];

export function HeroSection() {
  const [isVisible, setIsVisible] = useState(false);
  const [wordIndex, setWordIndex] = useState(0);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setIsVisible(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % words.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-screen flex flex-col justify-center overflow-hidden">
      {/* Subtle grid lines */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
        {[...Array(8)].map((_, i) => (
          <div
            key={`h-${i}`}
            className="absolute h-px bg-foreground/10"
            style={{ top: `${12.5 * (i + 1)}%`, left: 0, right: 0 }}
          />
        ))}
        {[...Array(12)].map((_, i) => (
          <div
            key={`v-${i}`}
            className="absolute w-px bg-foreground/10"
            style={{ left: `${8.33 * (i + 1)}%`, top: 0, bottom: 0 }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-12 py-32 lg:py-40 w-full">
        {/* Two-column layout */}
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-12 items-center">
          {/* Left: content */}
          <div>
            {/* Eyebrow */}
            <div
              className={`mb-8 transition-all duration-700 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
            >
              <span className="inline-flex items-center gap-3 text-sm font-mono text-muted-foreground">
                <span className="w-8 h-px bg-foreground/30" />
                Tu agenda, siempre disponible
              </span>
            </div>

            {/* Main headline */}
            <div className="mb-10">
              <h1
                className={`text-[clamp(2.5rem,6vw,6rem)] font-display leading-[0.9] tracking-tight transition-all duration-1000 ${
                  isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                }`}
              >
                <span className="block">La forma más</span>
                <span className="block">sencilla de</span>
                <span className="block">
                  <span className="relative inline-block">
                    <span key={wordIndex} className="inline-flex">
                      {words[wordIndex].split("").map((char, i) => (
                        <span
                          key={`${wordIndex}-${i}`}
                          className="inline-block animate-char-in"
                          style={{ animationDelay: `${i * 50}ms` }}
                        >
                          {char}
                        </span>
                      ))}
                    </span>
                    <span className="absolute -bottom-2 left-0 right-0 h-3 bg-primary/20" />
                  </span>
                </span>
              </h1>
            </div>

            {/* Description */}
            <p
              className={`text-lg lg:text-xl text-muted-foreground leading-relaxed mb-10 max-w-lg transition-all duration-700 delay-200 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
            >
              Sistema de reservas online para peluquerías, clínicas, fisioterapeutas
              y más. Tus clientes reservan 24/7, tú te olvidas del teléfono.
            </p>

            {/* CTAs */}
            <CtaButtonGroup
              className={`mb-10 transition-all duration-700 delay-300 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
            />

            <p
              className={`text-sm text-muted-foreground font-mono transition-all duration-700 delay-400 ${
                isVisible ? "opacity-100" : "opacity-0"
              }`}
            >
              Configuración en 2 min · Sin tarjeta de crédito
            </p>
          </div>

          {/* Right: widget */}
          <div
            className={`flex items-center justify-center transition-all duration-1000 delay-200 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            <div className="w-full max-w-[480px] h-[560px]">
              <BookingWidget />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
