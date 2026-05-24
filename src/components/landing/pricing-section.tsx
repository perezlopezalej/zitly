"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";

const plans = [
  {
    name: "Gratuito",
    description: "Para autónomos que empiezan",
    price: { monthly: 0, annual: 0 },
    features: [
      "1 profesional",
      "50 reservas/mes",
      "Calendario online",
      "Recordatorios por email",
      "Soporte por email",
    ],
    cta: "Empieza gratis",
    href: "/auth/register",
    popular: false,
  },
  {
    name: "Profesional",
    description: "Para negocios en crecimiento",
    price: { monthly: 19, annual: 15 },
    features: [
      "Hasta 3 profesionales",
      "Reservas ilimitadas",
      "Recordatorios por email",
      "Integración calendario",
      "Estadísticas avanzadas",
      "Sin marca Zitly",
    ],
    cta: "Probar 14 días gratis",
    href: "/auth/register",
    popular: true,
  },
  {
    name: "Equipos",
    description: "Para centros y clínicas",
    price: { monthly: 39, annual: 32 },
    features: [
      "Todo en Profesional",
      "Profesionales ilimitados",
      "Multi-ubicacion",
      "Gestion de turnos",
      "Soporte prioritario",
      "Onboarding dedicado",
    ],
    cta: "Registrarse",
    href: "/auth/register",
    popular: false,
  },
];

export function PricingSection() {
  const [isAnnual, setIsAnnual] = useState(true);

  return (
    <section id="pricing" className="relative py-32 lg:py-40 border-t border-foreground/10">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {/* Header */}
        <div className="max-w-3xl mb-20">
          <span className="font-mono text-xs tracking-widest text-muted-foreground uppercase block mb-6">
            Precios
          </span>
          <h2 className="font-display text-5xl md:text-6xl lg:text-7xl tracking-tight mb-6">
            Precios simples,
            <br />
            <span className="text-stroke">sin sorpresas</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl">
            Empieza gratis y crece a tu ritmo. Sin costes ocultos, sin compromisos.
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="flex items-center gap-4 mb-16">
          <span className={`text-sm transition-colors ${!isAnnual ? "text-foreground" : "text-muted-foreground"}`}>
            Mensual
          </span>
          <button
            onClick={() => setIsAnnual(!isAnnual)}
            role="switch"
            aria-checked={isAnnual}
            aria-label="Cambiar a facturación anual"
            className="relative w-14 h-7 bg-foreground/10 rounded-full p-1 transition-colors hover:bg-foreground/20"
          >
            <div
              className={`w-5 h-5 bg-primary rounded-full transition-transform duration-300 ${
                isAnnual ? "translate-x-7" : "translate-x-0"
              }`}
            />
          </button>
          <span className={`text-sm transition-colors ${isAnnual ? "text-foreground" : "text-muted-foreground"}`}>
            Anual
          </span>
          {isAnnual && (
            <span className="ml-2 px-2 py-1 bg-primary text-primary-foreground text-xs font-mono">
              Ahorra 20%
            </span>
          )}
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-px bg-foreground/10">
          {plans.map((plan, idx) => (
            <div
              key={plan.name}
              className={`relative p-8 lg:p-12 bg-background ${
                plan.popular ? "md:-my-4 md:py-12 lg:py-16 border-2 border-foreground" : ""
              }`}
            >
              {plan.popular && (
                <span className="absolute -top-3 left-8 px-3 py-1 bg-primary text-primary-foreground text-xs font-mono uppercase tracking-widest">
                  Más Popular
                </span>
              )}

              {/* Plan Header */}
              <div className="mb-8">
                <span className="font-mono text-xs text-muted-foreground">
                  {String(idx + 1).padStart(2, "0")}
                </span>
                <h3 className="font-display text-3xl mt-2">{plan.name}</h3>
                <p className="text-sm text-muted-foreground mt-2">{plan.description}</p>
              </div>

              {/* Price */}
              <div className="mb-8 pb-8 border-b border-foreground/10">
                <div className="flex items-baseline gap-2">
                  <span className="font-display text-5xl lg:text-6xl">
                    {isAnnual ? plan.price.annual : plan.price.monthly}€
                  </span>
                  <span className="text-muted-foreground">/mes</span>
                </div>
              </div>

              {/* Features */}
              <ul className="space-y-4 mb-10">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <span className="text-sm text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Link
                href={plan.href}
                className={`w-full py-4 flex items-center justify-center gap-2 text-sm font-medium transition-all group ${
                  plan.popular
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "border border-foreground/20 text-foreground hover:border-foreground hover:bg-foreground/5"
                }`}
              >
                {plan.cta}
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          ))}
        </div>

        {/* Bottom Note */}
        <p className="mt-12 text-center text-sm text-muted-foreground">
          Todos los planes incluyen SSL y copias de seguridad.{" "}
          <Link href="/auth/register" className="underline underline-offset-4 hover:text-foreground transition-colors">
            Empieza gratis hoy
          </Link>
        </p>
      </div>
    </section>
  );
}
