import { useEffect, useRef, useState } from "react";

const useOnView = (ref, options) => {
  const [entered, setEntered] = useState(false);
  const observer = useRef(
    new IntersectionObserver(
      ([entry]) => setEntered(entry.isIntersecting),
      options
    )
  );

  useEffect(() => {
    const element = ref.current;
    const ob = observer.current;

    // Stop observing if entered
    if (entered) {
      ob.disconnect();
      return;
    }

    if (element && !entered) ob.observe(element);

    return () => ob.disconnect();
  }, [ref, entered]);

  return entered;
};

export default useOnView;
