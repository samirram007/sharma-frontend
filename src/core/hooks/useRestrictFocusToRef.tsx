import { useEffect } from "react";

export function useRestrictFocusToRef(containerRef: React.RefObject<HTMLElement>) {
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        // All focusable elements on page
        const allFocusable = Array.from(
            document.querySelectorAll<HTMLElement>(
                `button, [href], input, select, textarea, ul,li,a
         [tabindex]:not([tabindex="-1"])`
            )
        );

        // Disable focus for elements NOT inside your ref
        allFocusable.forEach((el) => {
            if (!container.contains(el)) {
                const original = el.getAttribute("tabindex");
                if (original !== null) {
                    el.setAttribute("data-original-tabindex", original);
                }
                el.setAttribute("tabindex", "-1");
            }
        });

        return () => {
            // Restore original tabIndex
            allFocusable.forEach((el) => {
                const original = el.getAttribute("data-original-tabindex");
                if (original !== null) {
                    el.setAttribute("tabindex", original);
                    el.removeAttribute("data-original-tabindex");
                } else {
                    el.removeAttribute("tabindex");
                }
            });
        };
    }, [containerRef]);
}
