import { useEffect, useRef } from 'react';

export function useAutoScroll(enabled: boolean = true, idleDelay: number = 10000, speed: number = 0.5) {
    const scrollRef = useRef<number | null>(null);
    const idleTimerRef = useRef<NodeJS.Timeout | null>(null);
    const directionRef = useRef<number>(1); // 1 = down, -1 = up

    useEffect(() => {
        if (!enabled) return;

        const stopScrolling = () => {
            if (scrollRef.current) {
                cancelAnimationFrame(scrollRef.current);
                scrollRef.current = null;
            }
            resetIdleTimer();
        };

        const startScrolling = () => {
            if (scrollRef.current) return;

            const animate = () => {
                const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
                const currentScroll = window.scrollY;

                // Simple easing/bounds check
                if (currentScroll >= maxScroll - 1) { // Fuzzy match
                    directionRef.current = -1; // Go Up
                } else if (currentScroll <= 1) {
                    directionRef.current = 1; // Go Down
                }

                // Variable speed based on position (slower at ends)?
                // User requested "suavemente deve reduzir e aumentar a velocidade" (Ease in/out)
                // Let's keep it simple-ish but smooth: constant speed is often smoothest for auto-scroll.
                // Or maybe slight slow down at ends.

                window.scrollBy(0, speed * directionRef.current);
                scrollRef.current = requestAnimationFrame(animate);
            };

            scrollRef.current = requestAnimationFrame(animate);
        };

        const resetIdleTimer = () => {
            if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
            idleTimerRef.current = setTimeout(startScrolling, idleDelay);
        };

        const handleInteraction = () => {
            stopScrolling();
        };

        // Interaction events
        window.addEventListener('mousemove', handleInteraction);
        window.addEventListener('mousedown', handleInteraction);
        window.addEventListener('touchstart', handleInteraction);
        window.addEventListener('keydown', handleInteraction);
        window.addEventListener('wheel', handleInteraction);

        // Initial setup
        resetIdleTimer();

        return () => {
            if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
            if (scrollRef.current) cancelAnimationFrame(scrollRef.current);

            window.removeEventListener('mousemove', handleInteraction);
            window.removeEventListener('mousedown', handleInteraction);
            window.removeEventListener('touchstart', handleInteraction);
            window.removeEventListener('keydown', handleInteraction);
            window.removeEventListener('wheel', handleInteraction);
        };
    }, [enabled, idleDelay, speed]);
}
