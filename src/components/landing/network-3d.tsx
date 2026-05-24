"use client";

import { useEffect, useRef } from "react";

const PRIMARY_RGB = "44,95,63";    // --color-primary
const NEUTRAL_RGB = "116,112,106"; // --color-foreground (muted)
const G = (a: number) => `rgba(${PRIMARY_RGB},${Math.max(0, Math.min(1, a)).toFixed(3)})`;
const M = (a: number) => `rgba(${NEUTRAL_RGB},${Math.max(0, Math.min(1, a)).toFixed(3)})`;

const CLIENTS = [
  { label: "María G.",  sub: "Corte"      },
  { label: "Carlos R.", sub: "Fisio"      },
  { label: "Ana P.",    sub: "Masaje"     },
  { label: "Luis M.",   sub: "Dental"     },
  { label: "Sara K.",   sub: "Yoga"       },
  { label: "Pedro F.",  sub: "Nutrición"  },
  { label: "Elena B.",  sub: "Pilates"    },
  { label: "Marta S.",  sub: "Depilación" },
  { label: "Javier T.", sub: "Peluquería" },
  { label: "Lucía V.",  sub: "Uñas"       },
  { label: "Diego C.",  sub: "Masaje"     },
  { label: "Rosa M.",   sub: "Estética"   },
  { label: "Pablo J.",  sub: "Corte"      },
  { label: "Nadia O.",  sub: "Fisio"      },
];


type V3 = { x: number; y: number; z: number };

function fibonacci(n: number): V3[] {
  const ga = Math.PI * (3 - Math.sqrt(5));
  return Array.from({ length: n }, (_, i) => {
    const y = 1 - (i / (n - 1)) * 2;
    const r = Math.sqrt(Math.max(0, 1 - y * y));
    const t = ga * i;
    return { x: Math.cos(t) * r, y, z: Math.sin(t) * r };
  });
}

function rotY(v: V3, a: number): V3 {
  const c = Math.cos(a), s = Math.sin(a);
  return { x: v.x * c + v.z * s, y: v.y, z: -v.x * s + v.z * c };
}
function rotX(v: V3, a: number): V3 {
  const c = Math.cos(a), s = Math.sin(a);
  return { x: v.x, y: v.y * c - v.z * s, z: v.y * s + v.z * c };
}

export function Network3D() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const phases = CLIENTS.map(() => Math.random() * Math.PI * 2);
    const speeds = CLIENTS.map(() => 0.7 + Math.random() * 0.9);

    const sphere = fibonacci(CLIENTS.length);

    const packets = Array.from({ length: 10 }, () => ({
      idx:   Math.floor(Math.random() * CLIENTS.length),
      t:     Math.random(),
      speed: 0.004 + Math.random() * 0.004,
    }));

    // Precompute lateral pairs once (static topology, rotated at render)
    const lateralPairs: [number, number][] = [];
    for (let i = 0; i < sphere.length; i++) {
      for (let j = i + 1; j < sphere.length; j++) {
        const a = sphere[i], b = sphere[j];
        const d2 = (a.x - b.x) ** 2 + (a.y - b.y) ** 2 + (a.z - b.z) ** 2;
        if (d2 < 0.7225) lateralPairs.push([i, j]);
      }
    }

    let angleY = 0;
    let tick   = 0;
    let rafId: number;
    let dpr    = window.devicePixelRatio || 1;

    const resize = () => {
      dpr = window.devicePixelRatio || 1;
      const { width, height } = canvas.getBoundingClientRect();
      canvas.width  = Math.round(width  * dpr);
      canvas.height = Math.round(height * dpr);
    };

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();

    type Proj = { sx: number; sy: number; pz: number; ps: number };

    const draw = () => {
      const W = canvas.width  / dpr;
      const H = canvas.height / dpr;

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, W, H);

      tick++;
      angleY += 0.004;
      const aX = 0.22 * Math.sin(tick * 0.0005);
      const t  = tick * 0.01;

      const cx     = W / 2;
      const cy     = H / 2;
      const ZDIST  = 2.5;
      const VSCALE = Math.min(W, H) * 0.34;
      const FOC    = ZDIST * VSCALE;
      const basePs = FOC / ZDIST; // perspective scale at z=0

      const project = (v: V3): Proj => {
        const p = rotX(rotY(v, angleY), aX);
        const d = p.z + ZDIST;
        return { sx: (p.x * FOC) / d + cx, sy: (p.y * FOC) / d + cy, pz: p.z, ps: FOC / d };
      };

      // z in [-1, 1] → alpha in [1, 0.28]
      const depthA = (z: number) => 1 - 0.72 * ((z + 1) / 2);

      const proj: Proj[] = sphere.map(project);

      // ── Center → node connections (batched: 1 draw call) ─────────────────
      ctx.beginPath();
      ctx.strokeStyle = G(0.18);
      ctx.lineWidth   = 0.7;
      for (let i = 0; i < proj.length; i++) {
        const p = proj[i];
        ctx.moveTo(cx, cy);
        ctx.lineTo(p.sx, p.sy);
      }
      ctx.stroke();

      // ── Lateral connections (batched: 1 draw call) ────────────────────────
      ctx.beginPath();
      ctx.strokeStyle = M(0.06);
      ctx.lineWidth   = 0.4;
      for (const [i, j] of lateralPairs) {
        const pa = proj[i], pb = proj[j];
        ctx.moveTo(pa.sx, pa.sy);
        ctx.lineTo(pb.sx, pb.sy);
      }
      ctx.stroke();

      // ── Packets ────────────────────────────────────────────────────────────
      for (const pkt of packets) {
        pkt.t += pkt.speed;
        if (pkt.t >= 1) {
          pkt.t   = 0;
          pkt.idx = Math.floor(Math.random() * CLIENTS.length);
        }
        const tgt = proj[pkt.idx];
        const px  = cx + (tgt.sx - cx) * pkt.t;
        const py  = cy + (tgt.sy - cy) * pkt.t;
        const pA  = depthA(tgt.pz * pkt.t) * 0.9;
        const pR  = Math.max(1, 2.5 * (tgt.ps / basePs) * pkt.t);
        ctx.beginPath();
        ctx.arc(px, py, pR, 0, Math.PI * 2);
        ctx.fillStyle = G(pA);
        ctx.fill();
      }

      // ── Client nodes (back → front) ────────────────────────────────────────
      const order = proj
        .map((p, i) => ({ i, pz: p.pz }))
        .sort((a, b) => b.pz - a.pz);

      for (const { i } of order) {
        const p    = proj[i];
        const a    = depthA(p.pz);
        const ps   = p.ps / basePs;
        const puls = 0.85 + 0.15 * Math.sin(t * speeds[i] + phases[i]);
        const r    = Math.max(2, Math.min(W, H) * 0.009 * ps * puls);

        // Circle ring
        ctx.beginPath();
        ctx.arc(p.sx, p.sy, r, 0, Math.PI * 2);
        ctx.fillStyle   = G(a * 0.11);
        ctx.fill();
        ctx.strokeStyle = G(a * 0.55);
        ctx.lineWidth   = 0.7;
        ctx.stroke();

        // Center dot
        ctx.beginPath();
        ctx.arc(p.sx, p.sy, r * 0.35, 0, Math.PI * 2);
        ctx.fillStyle = G(a * 0.75);
        ctx.fill();

        // Labels — smooth fade for nodes in front half
        const tA = a * Math.max(0, (0.4 - p.pz) / 0.4);
        if (tA > 0.04) {
          const fSize = Math.round(10 * ps);
          if (fSize >= 7) {
            ctx.font         = `${fSize}px system-ui,sans-serif`;
            ctx.textAlign    = "center";
            ctx.textBaseline = "top";
            ctx.fillStyle    = M(tA * 0.88);
            ctx.fillText(CLIENTS[i].label, p.sx, p.sy + r + 2);
            const subSize = Math.round(8.5 * ps);
            if (subSize >= 6) {
              ctx.font      = `${subSize}px system-ui,sans-serif`;
              ctx.fillStyle = M(tA * 0.5);
              ctx.fillText(CLIENTS[i].sub, p.sx, p.sy + r + 2 + fSize + 1);
            }
          }
        }
      }

      // ── Center node ────────────────────────────────────────────────────────
      const cR = Math.min(W, H) * 0.024;
      const r1 = cR * 1.55 + cR * 0.28 * Math.sin(t * 0.9);
      const r2 = cR * 2.3  + cR * 0.38 * Math.sin(t * 0.55 + 1.2);

      ctx.beginPath();
      ctx.arc(cx, cy, r2, 0, Math.PI * 2);
      ctx.strokeStyle = G(0.07);
      ctx.lineWidth   = 1;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(cx, cy, r1, 0, Math.PI * 2);
      ctx.strokeStyle = G(0.15);
      ctx.lineWidth   = 1;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(cx, cy, cR, 0, Math.PI * 2);
      ctx.fillStyle   = G(0.13);
      ctx.fill();
      ctx.strokeStyle = G(0.68);
      ctx.lineWidth   = 1.5;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(cx, cy, cR * 0.38, 0, Math.PI * 2);
      ctx.fillStyle = G(0.82);
      ctx.fill();

      const lblSize = Math.max(10, Math.round(cR * 0.88));
      ctx.font         = `bold ${lblSize}px system-ui,sans-serif`;
      ctx.textAlign    = "center";
      ctx.textBaseline = "top";
      ctx.fillStyle    = G(0.68);
      ctx.fillText("Tu negocio", cx, cy + cR + 4);

      ctx.restore();
      rafId = requestAnimationFrame(draw);
    };

    rafId = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
    };
  }, []);

  return <canvas ref={canvasRef} className="w-full h-full block" />;
}
