import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  size: number;
  opacity: number;
  speed: number;
  rotation: number;
  rotationSpeed: number;
  type: 0 | 1 | 2 | 3;
  offsetX: number;
  offsetY: number;
}

export default function CanvasBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -999, y: -999 });
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const initParticles = () => {
      particlesRef.current = Array.from({ length: 18 }, (_, i) => ({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        size: 20 + Math.random() * 35,
        opacity: 0.04 + Math.random() * 0.12,
        speed: 0.1 + Math.random() * 0.3,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.004,
        type: (i % 4) as 0 | 1 | 2 | 3,
        offsetX: 0,
        offsetY: 0,
      }));
    };
    initParticles();

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('mousemove', handleMouseMove);

    const drawRadar = (ctx: CanvasRenderingContext2D, size: number, opacity: number) => {
      const stroke = `rgba(143,160,221,${opacity})`;
      ctx.strokeStyle = stroke;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(0, 0, size * 0.5, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(0, 0, size * 0.28, 0, Math.PI * 2);
      ctx.setLineDash([3, 4]);
      ctx.stroke();
      ctx.setLineDash([]);
    };

    const drawLineChart = (ctx: CanvasRenderingContext2D, size: number, opacity: number) => {
      const s = size * 0.5;
      ctx.strokeStyle = `rgba(143,160,221,${opacity})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(-s, s * 0.3);
      ctx.lineTo(-s * 0.5, -s * 0.1);
      ctx.lineTo(0, -s * 0.6);
      ctx.lineTo(s * 0.5, -s * 0.2);
      ctx.lineTo(s, s * 0.4);
      ctx.stroke();
      ctx.fillStyle = `rgba(0,240,255,${opacity * 1.5})`;
      ctx.beginPath();
      ctx.arc(0, -s * 0.6, 3, 0, Math.PI * 2);
      ctx.fill();
    };

    const drawDonut = (ctx: CanvasRenderingContext2D, size: number, opacity: number) => {
      ctx.strokeStyle = `rgba(143,160,221,${opacity})`;
      ctx.lineWidth = size * 0.13;
      ctx.beginPath();
      ctx.arc(0, 0, size * 0.38, -Math.PI * 0.5, Math.PI * 0.8);
      ctx.stroke();
      ctx.lineWidth = 1;
    };

    const drawTriangleNodes = (ctx: CanvasRenderingContext2D, size: number, opacity: number) => {
      const s = size * 0.5;
      ctx.strokeStyle = `rgba(143,160,221,${opacity})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, -s);
      ctx.lineTo(s * 0.866, s * 0.5);
      ctx.lineTo(-s * 0.866, s * 0.5);
      ctx.closePath();
      ctx.stroke();
      ctx.fillStyle = `rgba(112,0,255,${opacity * 1.5})`;
      ctx.beginPath();
      ctx.arc(0, -s, 3, 0, Math.PI * 2);
      ctx.fill();
    };

    const drawers = [drawRadar, drawLineChart, drawDonut, drawTriangleNodes];

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const mouse = mouseRef.current;

      particlesRef.current.forEach(p => {
        const actualX = p.x + p.offsetX;
        const actualY = p.y + p.offsetY;
        const dx = actualX - mouse.x;
        const dy = actualY - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const repelRadius = 180;

        if (dist < repelRadius && dist > 0) {
          const force = (repelRadius - dist) / repelRadius;
          p.offsetX += (dx / dist) * force * 3;
          p.offsetY += (dy / dist) * force * 3;
        }

        p.offsetX *= 0.94;
        p.offsetY *= 0.94;

        p.y -= p.speed;
        p.rotation += p.rotationSpeed;

        if (p.y + p.offsetY < -p.size * 2) {
          p.y = canvas.height + p.size;
          p.x = Math.random() * canvas.width;
          p.offsetX = 0;
          p.offsetY = 0;
        }

        ctx.save();
        ctx.translate(actualX, actualY);
        ctx.rotate(p.rotation);
        drawers[p.type](ctx, p.size, p.opacity);
        ctx.restore();
      });

      rafRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  );
}
