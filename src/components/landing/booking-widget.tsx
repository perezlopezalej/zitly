"use client";

import { useEffect, useRef, useState } from "react";
import { AUTOADVANCE_MS, NOTIF_INITIAL_MS, NOTIF_VISIBLE_MS } from "./constants";

const BOOKINGS = [
  { id: 1, time: "09:30", name: "Carmen López",   service: "Corte + Color",     status: "confirmed" },
  { id: 2, time: "11:00", name: "María García",   service: "Corte de pelo",     status: "confirmed" },
  { id: 3, time: "12:15", name: "Ana Martínez",   service: "Peinado especial",  status: "pending"   },
  { id: 4, time: "15:30", name: "Laura Sánchez",  service: "Tinte completo",    status: "confirmed" },
  { id: 5, time: "17:00", name: "Paula Ruiz",     service: "Mechas balayage",   status: "confirmed" },
];

const NOTIFICATIONS = [
  { name: "Isabel Fernández", service: "Corte + Color",   when: "mañana · 10:00" },
  { name: "Sofía Torres",     service: "Tinte completo",  when: "hoy · 19:30"    },
  { name: "Elena Romero",     service: "Peinado",         when: "viernes · 11:00"},
  { name: "Rosa Moreno",      service: "Mechas balayage", when: "sáb · 09:00"    },
];

export function BookingWidget() {
  const ref = useRef<HTMLDivElement>(null);
  const [visibleCount, setVisibleCount] = useState(0);
  const [notifIdx, setNotifIdx] = useState(0);
  const [notifVisible, setNotifVisible] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [dateLabel, setDateLabel] = useState('');

  useEffect(() => {
    const frame = requestAnimationFrame(() =>
      setDateLabel(
        new Date().toLocaleDateString('es-ES', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
        })
      )
    );
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const timers = BOOKINGS.map((_, i) =>
      setTimeout(() => setVisibleCount(i + 1), 500 + i * 350)
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    let hideTimer: ReturnType<typeof setTimeout>;
    const show = () => {
      setNotifIdx((p) => (p + 1) % NOTIFICATIONS.length);
      setNotifVisible(true);
      hideTimer = setTimeout(() => setNotifVisible(false), NOTIF_VISIBLE_MS);
    };
    const t0 = setTimeout(show, NOTIF_INITIAL_MS);
    const iv = setInterval(show, AUTOADVANCE_MS);
    return () => { clearTimeout(t0); clearInterval(iv); clearTimeout(hideTimer); };
  }, []);

  useEffect(() => {
    const section = ref.current?.closest("section");
    if (!section) return;
    const onMove = (e: MouseEvent) => {
      const r = section.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width - 0.5) * 2;
      const y = ((e.clientY - r.top) / r.height - 0.5) * 2;
      setTilt({ x: y * -6, y: x * 6 });
    };
    const onLeave = () => setTilt({ x: 0, y: 0 });
    section.addEventListener("mousemove", onMove);
    section.addEventListener("mouseleave", onLeave);
    return () => {
      section.removeEventListener("mousemove", onMove);
      section.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  const notif = NOTIFICATIONS[notifIdx];

  return (
    <div
      ref={ref}
      className="relative w-full h-full flex items-center justify-center"
      style={{ perspective: "1200px" }}
    >
      <div
        className="relative"
        style={{
          transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
          transition: "transform 0.15s ease-out",
          transformStyle: "preserve-3d",
        }}
      >
        {/* Dashboard window */}
        <div
          className="w-[340px] bg-background rounded-2xl overflow-hidden border border-border"
          style={{
            boxShadow: "0 32px 80px -12px color-mix(in oklch, var(--color-foreground) 22%, transparent), 0 0 0 1px color-mix(in oklch, var(--color-border) 50%, transparent)",
            transformStyle: "preserve-3d",
          }}
        >
          {/* Header */}
          <div className="bg-card border-b border-border h-11 px-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-primary">Zitly</span>
              <span className="text-border">|</span>
              <span className="text-xs font-medium text-muted-foreground truncate max-w-[120px]">
                Tu Peluquería
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[9px] text-muted-foreground">En línea</span>
            </div>
          </div>

          {/* Content */}
          <div className="p-4">
            <div className="mb-3">
              <p className="text-xs font-semibold text-foreground">Resumen de hoy</p>
              <p className="text-[10px] text-muted-foreground capitalize">{dateLabel}</p>
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              {[
                { label: "Hoy",         value: "7",  accent: true  },
                { label: "Pendientes",  value: "2",  accent: false },
                { label: "Este mes",    value: "43", accent: false },
              ].map((s) => (
                <div
                  key={s.label}
                  className="bg-card rounded-lg border border-border p-2.5"
                >
                  <p className="text-[8.5px] font-medium text-muted-foreground uppercase tracking-wider mb-1 leading-tight">
                    {s.label}
                  </p>
                  <p
                    className={`text-[22px] font-bold tabular-nums leading-none ${
                      s.accent ? "text-primary" : "text-foreground"
                    }`}
                  >
                    {s.value}
                  </p>
                </div>
              ))}
            </div>

            {/* Booking list */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-widest">
                  Próximas citas
                </p>
                <span className="text-[9px] text-primary">Ver todas →</span>
              </div>

              <div className="space-y-1.5">
                {BOOKINGS.map((b, i) => (
                  <div
                    key={b.id}
                    className="bg-card rounded-lg border border-border px-3 py-2 flex items-center gap-2.5"
                    style={{
                      opacity: i < visibleCount ? 1 : 0,
                      transform:
                        i < visibleCount
                          ? "translateY(0) scale(1)"
                          : "translateY(6px) scale(0.98)",
                      transition: "opacity 0.4s ease, transform 0.4s ease",
                    }}
                  >
                    <span className="text-[11px] font-bold text-primary tabular-nums shrink-0 w-9">
                      {b.time}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-semibold text-foreground truncate leading-tight">
                        {b.name}
                      </p>
                      <p className="text-[9.5px] text-muted-foreground truncate leading-tight">
                        {b.service}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 text-[8.5px] font-semibold px-1.5 py-0.5 rounded-full ${
                        b.status === "confirmed"
                          ? "bg-primary/10 text-primary"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {b.status === "confirmed" ? "Conf." : "Pend."}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Floating notification toast */}
        <div
          className="absolute -right-6 top-16 w-52 bg-card rounded-xl border border-border px-3.5 py-3"
          style={{
            boxShadow: "0 8px 32px -4px color-mix(in oklch, var(--color-foreground) 15%, transparent)",
            opacity: notifVisible ? 1 : 0,
            transform: notifVisible
              ? "translateX(0) translateZ(24px)"
              : "translateX(12px) translateZ(24px)",
            transition: "opacity 0.35s ease, transform 0.35s ease",
            transformStyle: "preserve-3d",
          }}
        >
          <div className="flex items-start gap-2.5">
            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
              <div className="w-2 h-2 rounded-full bg-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-[9px] font-bold text-primary uppercase tracking-wider mb-0.5">
                Nueva reserva
              </p>
              <p className="text-[11px] font-semibold text-foreground truncate">{notif.name}</p>
              <p className="text-[9.5px] text-muted-foreground truncate">{notif.service}</p>
              <p className="text-[9px] text-muted-foreground mt-0.5">{notif.when}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
