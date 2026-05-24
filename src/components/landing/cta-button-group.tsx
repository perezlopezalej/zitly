"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function CtaButtonGroup({ className }: { className?: string }) {
  return (
    <div className={`flex flex-col sm:flex-row items-start gap-4${className ? ` ${className}` : ""}`}>
      <Link
        href="/auth/register"
        className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 h-14 text-base rounded-full inline-flex items-center justify-center gap-2 font-medium group transition-colors"
      >
        Empieza gratis
        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
      </Link>
      <Link
        href="/auth/login"
        className="h-14 px-8 text-base rounded-full border border-foreground/20 hover:bg-foreground/5 inline-flex items-center justify-center transition-colors"
      >
        Iniciar sesión
      </Link>
    </div>
  );
}
