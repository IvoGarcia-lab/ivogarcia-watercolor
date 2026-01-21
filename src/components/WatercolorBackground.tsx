'use client';

import { useEffect, useRef, useMemo } from 'react';

export default function WatercolorBackground() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Memoize colors array to prevent recreation on each render
    const colors = useMemo(() => [
        { r: 59, g: 130, b: 246, a: 0.15 },   // Blue
        { r: 96, g: 165, b: 250, a: 0.12 },   // Light blue
        { r: 249, g: 115, b: 22, a: 0.08 },   // Orange accent
        { r: 167, g: 139, b: 250, a: 0.10 },  // Purple
    ], []);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationId: number;
        let time = 0;

        // Ink blob class
        class InkBlob {
            x: number;
            y: number;
            radius: number;
            color: typeof colors[0];
            speed: number;
            angle: number;
            noiseOffset: number;

            constructor(canvasWidth: number, canvasHeight: number) {
                this.x = Math.random() * canvasWidth;
                this.y = Math.random() * canvasHeight;
                this.radius = 100 + Math.random() * 200;
                this.color = colors[Math.floor(Math.random() * colors.length)];
                this.speed = 0.0002 + Math.random() * 0.0003;
                this.angle = Math.random() * Math.PI * 2;
                this.noiseOffset = Math.random() * 1000;
            }

            update(t: number, canvasWidth: number, canvasHeight: number) {
                // Gentle flowing motion
                this.x += Math.sin(t * this.speed + this.noiseOffset) * 0.3;
                this.y += Math.cos(t * this.speed * 0.7 + this.noiseOffset) * 0.2;

                // Wrap around edges
                if (this.x < -this.radius) this.x = canvasWidth + this.radius;
                if (this.x > canvasWidth + this.radius) this.x = -this.radius;
                if (this.y < -this.radius) this.y = canvasHeight + this.radius;
                if (this.y > canvasHeight + this.radius) this.y = -this.radius;
            }

            draw(context: CanvasRenderingContext2D) {
                const gradient = context.createRadialGradient(
                    this.x, this.y, 0,
                    this.x, this.y, this.radius
                );

                gradient.addColorStop(0, `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${this.color.a})`);
                gradient.addColorStop(0.5, `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${this.color.a * 0.5})`);
                gradient.addColorStop(1, `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, 0)`);

                context.fillStyle = gradient;
                context.beginPath();
                context.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                context.fill();
            }
        }

        // Resize handler
        const handleResize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        handleResize();
        window.addEventListener('resize', handleResize);

        // Create blobs
        const blobs: InkBlob[] = [];
        for (let i = 0; i < 6; i++) {
            blobs.push(new InkBlob(canvas.width, canvas.height));
        }

        // Check for reduced motion preference
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        // Animation loop
        const animate = () => {
            if (!ctx || !canvas) return;

            // Clear with slight fade for trail effect
            ctx.fillStyle = 'rgba(248, 250, 252, 0.03)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            if (!prefersReducedMotion) {
                time += 16; // ~60fps timing

                blobs.forEach(blob => {
                    blob.update(time, canvas.width, canvas.height);
                    blob.draw(ctx);
                });
            } else {
                // Static rendering for reduced motion
                blobs.forEach(blob => blob.draw(ctx));
            }

            animationId = requestAnimationFrame(animate);
        };

        // Initial clear
        ctx.fillStyle = '#F8FAFC';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        animate();

        return () => {
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(animationId);
        };
    }, [colors]);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 -z-10 pointer-events-none opacity-60"
            style={{ mixBlendMode: 'multiply' }}
            aria-hidden="true"
        />
    );
}
