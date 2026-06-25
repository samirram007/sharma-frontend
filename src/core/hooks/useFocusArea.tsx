import { useEffect } from "react";

export function useFocusArea(ref: React.RefObject<HTMLElement>) {
    useEffect(() => {
        const container = ref.current;
        if (!container) return;

        const handler = (e: KeyboardEvent) => {
            if (e.key !== "Tab") return;

            const focusables = Array.from(
                container.querySelectorAll<HTMLElement>(
                    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
                )
            ).filter(el => !el.hasAttribute("disabled"));

            if (focusables.length === 0) return;

            const first = focusables[0];
            const last = focusables[focusables.length - 1];

            // SHIFT + TAB on first → go to last
            if (e.shiftKey && document.activeElement === first) {
                e.preventDefault();
                last.focus();
            }

            // TAB on last → go to first
            else if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault();
                first.focus();
            }
        };

        container.addEventListener("keydown", handler);
        return () => container.removeEventListener("keydown", handler);
    }, [ref]);
}
