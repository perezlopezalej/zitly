"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

const navLinks = [
  { name: "Funciones", href: "#features" },
  { name: "Cómo funciona", href: "#how-it-works" },
  { name: "Sectores", href: "#sectors" },
  { name: "Precios", href: "#pricing" },
];

export function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        }
      },
      { threshold: 0.4 },
    );
    navLinks.forEach(({ href }) => {
      const el = document.getElementById(href.slice(1));
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <header
      className={`fixed z-50 transition-all duration-500 ${
        isScrolled
          ? "top-4 left-4 right-4"
          : "top-0 left-0 right-0"
      }`}
    >
      <nav
        className={`mx-auto transition-all duration-500 ${
          isScrolled || isMobileMenuOpen
            ? "bg-background/80 backdrop-blur-xl border border-foreground/10 rounded-2xl shadow-lg max-w-300"
            : "bg-transparent max-w-350"
        }`}
      >
        <div
          className={`flex items-center justify-between transition-all duration-500 px-6 lg:px-8 ${
            isScrolled ? "h-14" : "h-20"
          }`}
        >
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <span className={`font-display tracking-tight transition-all duration-500 ${isScrolled ? "text-xl" : "text-2xl"}`}>
              Zitly
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-12">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                aria-current={link.href === `#${activeSection}` ? 'true' : undefined}
                className="text-sm text-foreground/70 hover:text-foreground transition-colors duration-300 relative group"
              >
                {link.name}
                <span className="absolute -bottom-1 left-0 w-0 h-px bg-foreground transition-all duration-300 group-hover:w-full" />
              </a>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              href="/auth/login"
              className={`text-foreground/70 hover:text-foreground transition-all duration-500 ${isScrolled ? "text-xs" : "text-sm"}`}
            >
              Iniciar sesión
            </Link>
            <Link
              href="/auth/register"
              className={`bg-primary hover:bg-primary/90 text-primary-foreground rounded-full inline-flex items-center justify-center font-medium transition-all duration-500 ${isScrolled ? "px-4 h-8 text-xs" : "px-6 h-9 text-sm"}`}
            >
              Empieza gratis
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden w-12 h-12 flex items-center justify-center rounded-full hover:bg-foreground/5 transition-colors"
            aria-label="Abrir menú"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </nav>

      {/* Mobile Menu - Full Screen Overlay */}
      <div
        className={`md:hidden fixed inset-0 bg-background z-40 flex flex-col transition-all duration-300 ${
          isMobileMenuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 h-16 border-b border-foreground/10 shrink-0">
          <span className="font-display text-xl">Zitly</span>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="w-12 h-12 flex items-center justify-center rounded-full hover:bg-foreground/5 transition-colors"
            aria-label="Cerrar menú"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 flex flex-col px-6">
          {navLinks.map((link, i) => (
            <a
              key={link.name}
              href={link.href}
              aria-current={link.href === `#${activeSection}` ? 'true' : undefined}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex-1 flex items-center text-2xl font-display border-b border-foreground/8 transition-all duration-300 ${
                link.href === `#${activeSection}`
                  ? "text-primary"
                  : "text-foreground/75 hover:text-foreground"
              } ${
                isMobileMenuOpen
                  ? "opacity-100 translate-x-0"
                  : "opacity-0 -translate-x-3"
              }`}
              style={{ transitionDelay: isMobileMenuOpen ? `${i * 60}ms` : "0ms" }}
            >
              {link.name}
            </a>
          ))}
        </nav>

        {/* Bottom CTAs */}
        <div
          className="shrink-0 px-6 pt-4 pb-6 flex flex-col gap-3 border-t border-foreground/10"
          style={{ paddingBottom: "max(1.5rem, env(safe-area-inset-bottom))" }}
        >
          <Link
            href="/auth/register"
            onClick={() => setIsMobileMenuOpen(false)}
            className="w-full bg-primary text-primary-foreground rounded-full h-14 text-base font-medium inline-flex items-center justify-center hover:bg-primary/90 transition-colors"
          >
            Empieza gratis
          </Link>
          <Link
            href="/auth/login"
            onClick={() => setIsMobileMenuOpen(false)}
            className="w-full h-12 text-sm text-foreground/60 hover:text-foreground inline-flex items-center justify-center transition-colors"
          >
            Iniciar sesión
          </Link>
        </div>
      </div>
    </header>
  );
}
