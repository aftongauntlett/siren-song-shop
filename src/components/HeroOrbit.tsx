import { useEffect, useRef } from "react";

interface Ring {
  dotCount: number;
  orbitRadius: number;
  angularVel: number; // signed radians/frame
  hue: number;
  dotSize: number;
}

interface Dot {
  angle: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
}

const TAU = Math.PI * 2;

// Teal (172) → violet (258), alternating CW/CCW, inner rings faster
const RINGS: Ring[] = [
  { dotCount: 8, orbitRadius: 68, angularVel: 0.013, hue: 172, dotSize: 5 },
  { dotCount: 12, orbitRadius: 120, angularVel: -0.009, hue: 200, dotSize: 4 },
  { dotCount: 16, orbitRadius: 176, angularVel: 0.007, hue: 228, dotSize: 3.2 },
  {
    dotCount: 22,
    orbitRadius: 232,
    angularVel: -0.005,
    hue: 258,
    dotSize: 2.6,
  },
];

// Pre-compute per-ring slice offsets into the flat dots array
const RING_OFFSETS = (() => {
  const o: number[] = [0];
  for (const r of RINGS) {
    o.push((o[o.length - 1] ?? 0) + r.dotCount);
  }
  return o;
})();

export default function HeroOrbit() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<number>(0);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const dotsRef = useRef<Dot[]>([]);
  const cxRef = useRef(0);
  const cyRef = useRef(0);
  const scaleRef = useRef(1);
  const tickRef = useRef(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    // Cast after null-check so TypeScript tracks non-null through closures
    const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio, 2);

    const buildDots = (): void => {
      const cx = cxRef.current;
      const cy = cyRef.current;
      const scale = scaleRef.current;
      dotsRef.current = [];
      for (const ring of RINGS) {
        const r = ring.orbitRadius * scale;
        for (let i = 0; i < ring.dotCount; i++) {
          const angle = (i / ring.dotCount) * TAU;
          dotsRef.current.push({
            angle,
            x: cx + r * Math.cos(angle),
            y: cy + r * Math.sin(angle),
            vx: 0,
            vy: 0,
          });
        }
      }
    };

    const resize = (): void => {
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cxRef.current = w / 2;
      cyRef.current = h / 2;
      // Scale so the outermost ring always fits — design target: 480px viewport
      scaleRef.current = Math.min(w, h) / 560;
      buildDots();
    };

    resize();

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const SPRING = 0.07;
    const DAMP = 0.82;

    const tick = (): void => {
      tickRef.current++;
      const t = tickRef.current;
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      const cx = cxRef.current;
      const cy = cyRef.current;
      const scale = scaleRef.current;

      // Subtle breathing pulse applied to all orbit radii
      const breathe = 1 + Math.sin(t * 0.016) * 0.04;

      // Scale repulsion radius with canvas size
      const repulseR = 90 * Math.min(scale, 1.2);
      const repulseR2 = repulseR * repulseR;
      const { x: mx, y: my } = mouseRef.current;
      const dots = dotsRef.current;

      ctx.clearRect(0, 0, w, h);

      // Center hub — pulses gently
      ctx.shadowBlur = 20;
      ctx.shadowColor = "hsla(210, 80%, 68%, 0.9)";
      ctx.fillStyle = `hsla(210, 72%, 74%, ${0.55 + Math.sin(t * 0.04) * 0.25})`;
      ctx.beginPath();
      ctx.arc(cx, cy, 4 * Math.min(scale, 1.2), 0, TAU);
      ctx.fill();

      // One pass per ring: physics update + batched path fill
      for (let ri = 0; ri < RINGS.length; ri++) {
        const ring = RINGS[ri];
        if (!ring) continue;

        const start = RING_OFFSETS[ri] ?? 0;
        const end = RING_OFFSETS[ri + 1] ?? dots.length;
        const r = ring.orbitRadius * scale * breathe;
        const ds = ring.dotSize * Math.min(scale, 1.2);
        const ringAlpha = 0.78 + Math.sin(t * 0.022 + ri * 1.2) * 0.14;

        ctx.shadowBlur = 12;
        ctx.shadowColor = `hsla(${ring.hue}, 80%, 65%, 0.65)`;
        ctx.fillStyle = `hsla(${ring.hue}, 78%, 70%, ${ringAlpha})`;
        ctx.beginPath();

        for (let i = start; i < end; i++) {
          const dot = dots[i];
          if (!dot) continue;

          // Advance orbit
          dot.angle += ring.angularVel;
          const homeX = cx + r * Math.cos(dot.angle);
          const homeY = cy + r * Math.sin(dot.angle);

          // Spring toward orbit home
          dot.vx += (homeX - dot.x) * SPRING;
          dot.vy += (homeY - dot.y) * SPRING;

          // Mouse repulsion
          const ddx = dot.x - mx;
          const ddy = dot.y - my;
          const d2 = ddx * ddx + ddy * ddy;
          if (d2 < repulseR2 && d2 > 0.1) {
            const d = Math.sqrt(d2);
            dot.vx += (ddx / d) * (3800 / d2);
            dot.vy += (ddy / d) * (3800 / d2);
          }

          dot.vx *= DAMP;
          dot.vy *= DAMP;
          dot.x += dot.vx;
          dot.y += dot.vy;

          // Add dot to batch path
          ctx.moveTo(dot.x + ds, dot.y);
          ctx.arc(dot.x, dot.y, ds, 0, TAU);
        }

        ctx.fill();
      }

      ctx.shadowBlur = 0;
      frameRef.current = requestAnimationFrame(tick);
    };

    tick();

    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    };
    const onMouseLeave = () => {
      mouseRef.current = { x: -9999, y: -9999 };
    };

    canvas.addEventListener("mousemove", onMouseMove);
    canvas.addEventListener("mouseleave", onMouseLeave);

    return () => {
      cancelAnimationFrame(frameRef.current);
      ro.disconnect();
      canvas.removeEventListener("mousemove", onMouseMove);
      canvas.removeEventListener("mouseleave", onMouseLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ display: "block", width: "100%", height: "100%" }}
      aria-hidden="true"
    />
  );
}
