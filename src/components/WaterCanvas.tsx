import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  hue: number;
  saturation: number;
}

export default function WaterCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animFrameRef = useRef<number>(0);
  const mouseRef = useRef({ x: -9999, y: -9999, active: false });
  const ambientTimerRef = useRef(0);
  const pausedRef = useRef(false);

  useEffect(() => {
    pausedRef.current =
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      document.documentElement.dataset.reducedMotion === "true";

    const canvas = canvasRef.current;
    if (!canvas) return;
    // Cast after null-check so TypeScript tracks non-null through closures
    const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio, 2);

    const resize = () => {
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    function spawnParticle(x: number, y: number, ambient = false) {
      const hue = ambient
        ? 168 + Math.random() * 100 // teal (168) → purple (268)
        : 190 + Math.random() * 130; // interactive: wider teal-to-violet
      particlesRef.current.push({
        x: x + (Math.random() - 0.5) * (ambient ? 60 : 12),
        y: y + (Math.random() - 0.5) * (ambient ? 50 : 12),
        vx: (Math.random() - 0.5) * (ambient ? 0.35 : 1.8),
        vy: -(Math.random() * (ambient ? 0.4 : 1.4) + 0.15),
        life: 0,
        maxLife: ambient ? 110 + Math.random() * 90 : 55 + Math.random() * 70,
        size: ambient ? Math.random() * 3 + 1.5 : Math.random() * 6 + 2.5,
        hue,
        saturation: ambient ? 55 + Math.random() * 20 : 65 + Math.random() * 20,
      });
    }

    function tick() {
      if (pausedRef.current) {
        ctx.clearRect(0, 0, canvas!.offsetWidth, canvas!.offsetHeight);
        particlesRef.current = [];
        animFrameRef.current = requestAnimationFrame(tick);
        return;
      }
      const w = (canvas as HTMLCanvasElement).offsetWidth;
      const h = (canvas as HTMLCanvasElement).offsetHeight;
      (ctx as CanvasRenderingContext2D).clearRect(0, 0, w, h);

      ambientTimerRef.current++;
      if (
        ambientTimerRef.current % 7 === 0 &&
        particlesRef.current.length < 90
      ) {
        const x = Math.random() * w;
        const y = h * 0.4 + Math.random() * h * 0.6;
        spawnParticle(x, y, true);
      }

      // Spawn particles while mouse is active (pointer held or fresh move)
      if (mouseRef.current.active) {
        for (let i = 0; i < 4; i++) {
          spawnParticle(mouseRef.current.x, mouseRef.current.y, false);
        }
      }

      particlesRef.current = particlesRef.current.filter(
        (p) => p.life < p.maxLife,
      );

      for (const p of particlesRef.current) {
        p.life++;
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.985;
        p.vy *= 0.985;

        const progress = p.life / p.maxLife;
        const alpha = Math.sin(progress * Math.PI) * 0.45;
        const radius = p.size * (1 - progress * 0.4);

        const grad = ctx.createRadialGradient(
          p.x,
          p.y,
          0,
          p.x,
          p.y,
          radius * 2.5,
        );
        grad.addColorStop(0, `hsla(${p.hue}, ${p.saturation}%, 72%, ${alpha})`);
        grad.addColorStop(1, `hsla(${p.hue}, ${p.saturation - 10}%, 58%, 0)`);

        ctx.beginPath();
        ctx.arc(p.x, p.y, radius * 2.5, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
      }

      animFrameRef.current = requestAnimationFrame(tick);
    }

    tick();

    const isOverChrome = (e: MouseEvent) =>
      !!(
        e.target instanceof Element &&
        (e.target.closest("nav") || e.target.closest("footer"))
      );

    const onMouseMove = (e: MouseEvent) => {
      if (isOverChrome(e)) {
        mouseRef.current.active = false;
        return;
      }
      mouseRef.current = {
        x: e.clientX,
        y: e.clientY,
        active: true,
      };
      // Deactivate after a short idle to avoid endless spawn
      clearTimeout((onMouseMove as { _t?: ReturnType<typeof setTimeout> })._t);
      (onMouseMove as { _t?: ReturnType<typeof setTimeout> })._t = setTimeout(
        () => {
          mouseRef.current.active = false;
        },
        120,
      );
    };

    const onTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      if (!touch) return;
      mouseRef.current = {
        x: touch.clientX,
        y: touch.clientY,
        active: true,
      };
      setTimeout(() => {
        mouseRef.current.active = false;
      }, 120);
    };

    const handleMotionChange = (e: Event) => {
      pausedRef.current = (
        e as CustomEvent<{ reduced: boolean }>
      ).detail.reduced;
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("siren-motion-change", handleMotionChange);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      ro.disconnect();
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("siren-motion-change", handleMotionChange);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
        display: "block",
        pointerEvents: "none",
        zIndex: 0,
      }}
      aria-hidden="true"
    />
  );
}
