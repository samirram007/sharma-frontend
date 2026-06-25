import { useEffect, useRef } from "react";

type FocusTrapProps = {
    children: React.ReactNode;
};

export const FocusTrap = ({ children }: FocusTrapProps) => {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key !== "Tab") return;

            const container = containerRef.current;
            if (!container) return;

            const focusableElements = Array.from(
                container.querySelectorAll<HTMLElement>(
                    'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])'
                )
            ).filter((el) => !el.hasAttribute("disabled"));

            if (focusableElements.length === 0) return;

            const firstEl = focusableElements[0];
            const lastEl = focusableElements[focusableElements.length - 1];

            if (e.shiftKey) {
                // Shift + Tab
                if (document.activeElement === firstEl) {
                    e.preventDefault();
                    lastEl.focus();
                }
            } else {
                // Tab
                if (document.activeElement === lastEl) {
                    e.preventDefault();
                    firstEl.focus();
                }
            }
        };

        const container = containerRef.current;
        container?.addEventListener("keydown", handleKeyDown);

        return () => container?.removeEventListener("keydown", handleKeyDown);
    }, []);

    return <div ref={containerRef}>{children}</div>;
};
