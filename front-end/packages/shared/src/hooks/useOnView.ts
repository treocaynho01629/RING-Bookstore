import { useEffect, useRef, useState } from "react";
import type { RefObject } from "react";

interface UseOnViewOptions extends IntersectionObserverInit {}

export default function useOnView<T extends Element>(
  ref: RefObject<T | null>,
  options?: UseOnViewOptions
): boolean {
  const [entered, setEntered] = useState(false);

  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(([entry]) => {
      setEntered(entry.isIntersecting);
    }, options);

    return () => {
      observerRef.current?.disconnect();
      observerRef.current = null;
    };
  }, [options]);

  useEffect(() => {
    const element = ref.current;
    const observer = observerRef.current;
    if (!element || !observer) return;

    if (entered) {
      observer.disconnect();
      return;
    }

    observer.observe(element);
    return () => observer.disconnect();
  }, [entered, ref]);

  return entered;
}
