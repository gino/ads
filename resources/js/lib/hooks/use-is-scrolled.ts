import { useEffect, useState } from "react";

export function useIsScrolled<T extends HTMLElement>(
    ref: React.RefObject<T>,
    threshold: number = 0
): boolean {
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const element = ref.current;

        if (!element) return;

        const handleScroll = () => {
            // Check if the element is scrolled horizontally
            setIsScrolled(element.scrollLeft > threshold);
        };

        // Check initial scroll position
        handleScroll();

        // Add scroll event listener
        element.addEventListener("scroll", handleScroll, { passive: true });

        // Cleanup function
        return () => {
            element.removeEventListener("scroll", handleScroll);
        };
    }, [ref]);

    return isScrolled;
}
