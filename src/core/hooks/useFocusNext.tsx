import { useCallback } from "react";

export function useFocusNext() {
    return useCallback((next?: string | number) => {
        requestAnimationFrame(() => {

            // 👉 1. If "next" is STRING (element ID)
            if (typeof next === "string" && next.trim() !== "") {
                document.getElementById(next)?.focus();
                return;
            }

            // 👉 2. If "next" is NUMBER (tabIndex)
            if (typeof next === "number") {
                const nextElement = document.querySelector(
                    `[tabindex="${next}"]`
                ) as HTMLElement | null;

                nextElement?.focus();
                return;
            }

            // 👉 3. If NO PARAM: behave like TAB KEY
            const active = document.activeElement as HTMLElement | null;
            if (!active) return;

            // Find all focusable elements in natural DOM order
            const focusables = Array.from(
                document.querySelectorAll<HTMLElement>(
                    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
                )
            ).filter(el => !el.hasAttribute("disabled"));

            const index = focusables.indexOf(active);

            if (index >= 0 && index < focusables.length - 1) {
                focusables[index + 1].focus(); // 👈 go to next focusable element
            }
        });
    }, []);
}
