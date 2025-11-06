import { useEffect, useRef } from "react";

export default function LightParticles() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];
    const count = 60;

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 2 + 1,
        speed: Math.random() * 0.5 + 0.2,
        opacity: Math.random() * 0.5 + 0.3,
        hue: 0,
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.y -= p.speed;
        p.hue += 1;
        if (p.y < 0) p.y = canvas.height;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue % 360}, 100%, 70%, ${p.opacity})`;
        ctx.shadowBlur = 20;
        ctx.shadowColor = `hsl(${p.hue % 360}, 100%, 70%)`;
        ctx.fill();
      });
      requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none opacity-60"
      style={{ zIndex: 0 }}
    />
  );
}