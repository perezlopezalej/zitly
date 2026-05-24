import { useEffect, useRef, useState } from "react";
import type { RefObject } from "react";

export function useIntersectionObserver<T extends Element = HTMLElement>(
  threshold = 0.1
): [RefObject<T | null>, boolean] {
  const ref = useRef<T>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true); },
      { threshold }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold]);

  return [ref, isVisible];
}
