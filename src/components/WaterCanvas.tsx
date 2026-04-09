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
  const hiddenRef = useRef(false);

  useEffect(() => {
    pausedRef.current =
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      document.documentElement.dataset.reducedMotion === "true";

    const canvas = canvasRef.current;
    if (!canvas) return;
    const canvasEl = canvas;

    // Cast after null-check so TypeScript tracks non-null through closures
    const ctx = canvasEl.getContext("2d") as CanvasRenderingContext2D;
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio, 2);
    const navigatorWithMemory = navigator as Navigator & {
      deviceMemory?: number;
    };
    const lowPowerDevice =
      navigator.hardwareConcurrency <= 4 ||
      (typeof navigatorWithMemory.deviceMemory === "number" &&
        navigatorWithMemory.deviceMemory <= 4);
    const ambientCadence = lowPowerDevice ? 10 : 7;
    const interactiveBurst = lowPowerDevice ? 2 : 4;
    const maxParticles = lowPowerDevice ? 64 : 96;
    const frameIntervalMs = lowPowerDevice ? 1000 / 36 : 1000 / 48;
    let lastPaint = 0;

    const resize = () => {
      const w = canvasEl.offsetWidth;
      const h = canvasEl.offsetHeight;
      canvasEl.width = w * dpr;
      canvasEl.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const ro = new ResizeObserver(resize);
    ro.observe(canvasEl);

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

    function tick(now: number) {
      animFrameRef.current = requestAnimationFrame(tick);

      if (pausedRef.current || hiddenRef.current) {
        if (particlesRef.current.length > 0) {
          ctx.clearRect(0, 0, canvasEl.offsetWidth, canvasEl.offsetHeight);
          particlesRef.current = [];
        }
        return;
      }

      if (now - lastPaint < frameIntervalMs) {
        return;
      }
      lastPaint = now;

      const w = canvasEl.offsetWidth;
      const h = canvasEl.offsetHeight;
      ctx.clearRect(0, 0, w, h);

      ambientTimerRef.current++;
      if (
        ambientTimerRef.current % ambientCadence === 0 &&
        particlesRef.current.length < maxParticles
      ) {
        const x = Math.random() * w;
        const y = h * 0.4 + Math.random() * h * 0.6;
        spawnParticle(x, y, true);
      }

      // Spawn particles while mouse is active (pointer held or fresh move)
      if (mouseRef.current.active) {
        for (let i = 0; i < interactiveBurst; i++) {
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
    }

    if (!pausedRef.current) {
      animFrameRef.current = requestAnimationFrame(tick);
    }

    // Restart loop if it was stopped (e.g. after motion preference change)
    const themeObserver = new MutationObserver(() => {
      if (!pausedRef.current && animFrameRef.current === 0) {
        resize();
        animFrameRef.current = requestAnimationFrame(tick);
      }
    });
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

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

    const handleVisibility = () => {
      hiddenRef.current = document.visibilityState !== "visible";
    };
    handleVisibility();

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("siren-motion-change", handleMotionChange);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      themeObserver.disconnect();
      ro.disconnect();
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("siren-motion-change", handleMotionChange);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  return <canvas ref={canvasRef} className="water-canvas" aria-hidden="true" />;
}
