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

        // Mouse tracking
        const mouse = { x: 0.5, y: 0.5 };
        const targetMouse = { x: 0.5, y: 0.5 };

        const handleMouseMove = (e: MouseEvent) => {
            if (canvas) {
                targetMouse.x = e.clientX / canvas.width;
                targetMouse.y = 1.0 - (e.clientY / canvas.height); // Flip Y for WebGL
            }
        };
        window.addEventListener('mousemove', handleMouseMove);

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

            // Random and Noise functions
            float random(in vec2 _st) {
                return fract(sin(dot(_st.xy, vec2(12.9898,78.233))) * 43758.5453123);
            }

            // Gradient Noise
            float noise(in vec2 st) {
                vec2 i = floor(st);
                vec2 f = fract(st);

                float a = random(i);
                float b = random(i + vec2(1.0, 0.0));
                float c = random(i + vec2(0.0, 1.0));
                float d = random(i + vec2(1.0, 1.0));

                vec2 u = f * f * (3.0 - 2.0 * f);

                return mix(a, b, u.x) + (c - a)* u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
            }

            // Fractional Brownian Motion (fBm)
            float fbm(in vec2 st) {
                float value = 0.0;
                float amplitude = 0.5;
                for (int i = 0; i < 5; i++) {
                    value += amplitude * noise(st);
                    st *= 2.0;
                    amplitude *= 0.5;
                }
                return value;
            }

            void main() {
                vec2 st = gl_FragCoord.xy / u_resolution.xy;
                st.x *= u_resolution.x / u_resolution.y;

                float t = u_time * 0.1;

                // Mouse influence
                vec2 mouse_pos = u_mouse;
                mouse_pos.x *= u_resolution.x / u_resolution.y;
                float dist = distance(st, mouse_pos);
                
                // Interaction strength - swirl near mouse
                float interaction = smoothstep(0.4, 0.0, dist) * 2.5;
                
                // Domain Warping with Mouse Interaction
                vec2 q = vec2(0.);
                q.x = fbm( st + 0.1 * t + interaction * 0.15);
                q.y = fbm( st + vec2(1.0) - interaction * 0.15);

                vec2 r = vec2(0.);
                r.x = fbm( st + 1.0 * q + vec2(1.7, 9.2) + 0.15 * t);
                r.y = fbm( st + 1.0 * q + vec2(8.3, 2.8) + 0.126 * t);

                float f = fbm(st + r + (interaction * 0.3));

                // Colors
                vec3 finalColor;

                if (u_dark_mode > 0.5) {
                    // DARK MODE: Deep, rich, gold accents
                    vec3 bg = vec3(0.06, 0.09, 0.16); 
                    vec3 color1 = vec3(0.08, 0.4, 0.45); 
                    vec3 color2 = vec3(0.1, 0.2, 0.5); 
                    vec3 color3 = vec3(0.8, 0.6, 0.2); // Stronger Gold
                    
                    vec3 color = mix(color1, color2, clamp((f*f)*4.0,0.0,1.0));
                    color = mix(color, color3, clamp(length(q), 0.0, 1.0));
                    color = mix(color, vec3(1.0, 0.9, 0.8), clamp(length(r.x), 0.0, 1.0) * 0.5); // sparkles
                    
                    finalColor = mix(bg, color, f * 0.8 + 0.2 + (interaction * 0.1));

                } else {
                    // LIGHT MODE: Significantly boosted for visibility
                    vec3 bg = vec3(0.97, 0.98, 0.99); 
                    
                    // Much stronger text colors for the ink
                    vec3 color1 = vec3(0.1, 0.5, 0.9); // Strong Blue
                    vec3 color2 = vec3(0.0, 0.8, 0.8); // Cyan
                    vec3 color3 = vec3(1.0, 0.6, 0.2); // Orange/Gold
                    
                    vec3 color = mix(color1, color2, clamp((f*f)*3.0, 0.0, 1.0));
                    color = mix(color, color3, clamp(length(q), 0.0, 1.0));
                    
                    // High mix factor so it's not washed out
                    finalColor = mix(bg, color, f * 0.7 + 0.15 + (interaction * 0.1));
                }
                
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
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
            -1, -1, 1, -1, -1, 1,
            -1, 1, 1, -1, 1, 1,
        ]), gl.STATIC_DRAW);

        const positionLocation = gl.getAttribLocation(program, 'a_position');
        gl.enableVertexAttribArray(positionLocation);
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

        const timeLocation = gl.getUniformLocation(program, 'u_time');
        const resolutionLocation = gl.getUniformLocation(program, 'u_resolution');
        const mouseLocation = gl.getUniformLocation(program, 'u_mouse');
        const darkModeLocation = gl.getUniformLocation(program, 'u_dark_mode');

        // --- Resize Handler ---
        const resize = () => {
            if (!canvas || !containerRef.current) return;
            const width = containerRef.current.clientWidth;
            const height = containerRef.current.clientHeight;
            canvas.width = width;
            canvas.height = height;
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

            // Smooth mouse interpolation
            mouse.x += (targetMouse.x - mouse.x) * 0.05;
            mouse.y += (targetMouse.y - mouse.y) * 0.05;

            if (timeLocation) gl.uniform1f(timeLocation, currentTime);
            if (mouseLocation) gl.uniform2f(mouseLocation, mouse.x, mouse.y);
            if (darkModeLocation) gl.uniform1f(darkModeLocation, theme === 'dark' ? 1.0 : 0.0);

            gl.drawArrays(gl.TRIANGLES, 0, 6);
            animationFrameId = requestAnimationFrame(render);
        };

        render();

        return () => {
            window.removeEventListener('resize', resize);
            window.removeEventListener('mousemove', handleMouseMove);
            cancelAnimationFrame(animationFrameId);
            gl.deleteProgram(program);
        };
    }, [theme, mounted]);

    return (
        <div ref={containerRef} className="fixed inset-0 -z-50 pointer-events-none w-full h-full">
            <canvas ref={canvasRef} className="w-full h-full block" />
        </div>
    );
}
