'use client';

import { useEffect, useRef, useState } from 'react';
import { useTheme } from './ThemeProvider';

export default function WatercolorBackground() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const { theme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!mounted) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const gl = canvas.getContext('webgl');
        if (!gl) {
            console.warn('WebGL not supported');
            return;
        }

        // --- Shaders ---
        const vertexShaderSource = `
            attribute vec2 a_position;
            varying vec2 v_uv;
            void main() {
                v_uv = a_position * 0.5 + 0.5;
                gl_Position = vec4(a_position, 0.0, 1.0);
            }
        `;

        const fragmentShaderSource = `
            precision mediump float;
            uniform float u_time;
            uniform vec2 u_resolution;
            uniform vec2 u_mouse;
            uniform float u_dark_mode;
            
            varying vec2 v_uv;

            // Random and Noise functions for organic look
            float random(in vec2 _st) {
                return fract(sin(dot(_st.xy, vec2(12.9898,78.233))) * 43758.5453123);
            }

            // Gradient Noise
            float noise(in vec2 st) {
                vec2 i = floor(st);
                vec2 f = fract(st);

                // Four corners in 2D of a tile
                float a = random(i);
                float b = random(i + vec2(1.0, 0.0));
                float c = random(i + vec2(0.0, 1.0));
                float d = random(i + vec2(1.0, 1.0));

                vec2 u = f * f * (3.0 - 2.0 * f);

                return mix(a, b, u.x) +
                        (c - a)* u.y * (1.0 - u.x) +
                        (d - b) * u.x * u.y;
            }

            // Fractional Brownian Motion (fBm)
            float fbm(in vec2 st) {
                // Initial values
                float value = 0.0;
                float amplitude = 0.5;
                float frequency = 0.;
                
                // Detailed noise loop
                for (int i = 0; i < 6; i++) {
                    value += amplitude * noise(st);
                    st *= 2.0;
                    amplitude *= 0.5;
                }
                return value;
            }

            void main() {
                vec2 st = gl_FragCoord.xy / u_resolution.xy;
                
                // Aspect ratio correction (optional, but good for consistent circles)
                st.x *= u_resolution.x / u_resolution.y;

                // Slow, graceful time variable
                float t = u_time * 0.15;

                // Domain Warping for fluid effect
                vec2 q = vec2(0.);
                q.x = fbm( st + 0.1 * t);
                q.y = fbm( st + vec2(1.0));

                vec2 r = vec2(0.);
                r.x = fbm( st + 1.0 * q + vec2(1.7, 9.2) + 0.15 * t);
                r.y = fbm( st + 1.0 * q + vec2(8.3, 2.8) + 0.126 * t);

                float f = fbm(st + r);

                // Colors
                // We mix based on the noise value 'f'
                
                // Light Mode / Dark Mode logic in shader or via uniform colors
                // Here we define organic ink colors
                
                vec3 color1, color2, color3, bg;

                if (u_dark_mode > 0.5) {
                    // DARK MODE: Deep blues, teals, and gold accents
                    bg = vec3(0.06, 0.09, 0.16); // Base background #0F172A
                    color1 = vec3(0.08, 0.4, 0.45); // Teal ink
                    color2 = vec3(0.1, 0.2, 0.5); // Deep Blue
                    color3 = vec3(0.7, 0.5, 0.2); // Subtle Gold
                } else {
                    // LIGHT MODE: Soft blues, watercolor texture
                    bg = vec3(0.97, 0.98, 0.99); // Base background
                    color1 = vec3(0.4, 0.7, 0.9); // Light Blue ink
                    color2 = vec3(0.5, 0.8, 0.85); // Cyan ink
                    color3 = vec3(0.9, 0.7, 0.5); // Subtle warmth
                }

                // Mixing the colors based on warped noise
                vec3 color = mix(color1, color2, clamp((f*f)*4.0,0.0,1.0));
                
                // Add secondary accent
                color = mix(color, color3, clamp(length(q), 0.0, 1.0));

                // Add intensity bloom
                color = mix(color, vec3(0.9), clamp(length(r.x), 0.0, 1.0));

                // Soft mix with background so it's not too overwhelming
                // The 'ink' should be subtle
                vec3 finalColor = mix(bg, color, f * 1.2 + 0.1);
                
                // Vignette for focus
                // float vignette = 1.0 - smoothstep(0.5, 1.5, length(v_uv - 0.5));
                // finalColor *= vignette;

                gl_FragColor = vec4(finalColor, 1.0);
            }
        `;

        // --- Compile Shaders ---
        const compileShader = (source: string, type: number) => {
            const shader = gl.createShader(type);
            if (!shader) return null;
            gl.shaderSource(shader, source);
            gl.compileShader(shader);
            if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                console.error('Shader Compile Error:', gl.getShaderInfoLog(shader));
                gl.deleteShader(shader);
                return null;
            }
            return shader;
        };

        const vertexShader = compileShader(vertexShaderSource, gl.VERTEX_SHADER);
        const fragmentShader = compileShader(fragmentShaderSource, gl.FRAGMENT_SHADER);

        if (!vertexShader || !fragmentShader) return;

        const program = gl.createProgram();
        if (!program) return;

        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);

        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            console.error('Program Link Error:', gl.getProgramInfoLog(program));
            return;
        }

        gl.useProgram(program);

        // --- Attributes & Uniforms ---
        const positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        // Full screen quad (-1 to 1)
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
            -1, -1,
            1, -1,
            -1, 1,
            -1, 1,
            1, -1,
            1, 1,
        ]), gl.STATIC_DRAW);

        const positionLocation = gl.getAttribLocation(program, 'a_position');
        gl.enableVertexAttribArray(positionLocation);
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

        const timeLocation = gl.getUniformLocation(program, 'u_time');
        const resolutionLocation = gl.getUniformLocation(program, 'u_resolution');
        const darkModeLocation = gl.getUniformLocation(program, 'u_dark_mode');

        // --- Resize Handler ---
        const resize = () => {
            if (!canvas || !containerRef.current) return;
            const width = containerRef.current.clientWidth;
            const height = containerRef.current.clientHeight;

            // Set canvas size to display size
            canvas.width = width;
            canvas.height = height;

            // Set viewport to match
            gl.viewport(0, 0, width, height);

            if (resolutionLocation) {
                gl.uniform2f(resolutionLocation, width, height);
            }
        };

        window.addEventListener('resize', resize);
        resize();

        // --- Animation Loop ---
        let startTime = performance.now();
        let animationFrameId: number;

        const render = () => {
            const currentTime = (performance.now() - startTime) / 1000;

            if (timeLocation) gl.uniform1f(timeLocation, currentTime);
            if (darkModeLocation) gl.uniform1f(darkModeLocation, theme === 'dark' ? 1.0 : 0.0);

            gl.drawArrays(gl.TRIANGLES, 0, 6);
            animationFrameId = requestAnimationFrame(render);
        };

        render();

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(animationFrameId);
            gl.deleteProgram(program);
        };
    }, [theme, mounted]);

    return (
        <div ref={containerRef} className="fixed inset-0 -z-50 pointer-events-none w-full h-full">
            {/* Overlay for grain/texture (optional CSS embellishment) */}
            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 400 400\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.95\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }} />

            <canvas ref={canvasRef} className="w-full h-full block" />
        </div>
    );
}
