import { debounce } from "lodash-es";
import { useCallback, useEffect } from "react";

const useOffset = (overlapRef) => {
  // Offset scroll to top button on overlapping
  const changeOffset = () => {
    let scrollEl = document.getElementById("scroll-to-top");

    if (overlapRef.current) {
      let scrollRect = scrollEl.getBoundingClientRect();
      const elRect = overlapRef.current.getBoundingClientRect();

      const overlapY = scrollRect.bottom >= elRect.top;
      const overlapX = scrollRect.left <= elRect.right;
      const passY = scrollRect.bottom >= elRect.bottom + elRect.height / 2;
      const overY = scrollEl.style.getPropertyValue("--offset") != elRect.height;

      if (!passY && overlapY && overlapX) {
        scrollEl.style.setProperty("--offset", elRect.height);
      } else if (!overlapX || passY || overY) {
        scrollEl.style.setProperty("--offset", "0");
      }
    } else {
      scrollEl.style.setProperty("--offset", "0");
    }
  };

  const scrollListener = useCallback(debounce(changeOffset, 100), []);

  useEffect(() => {
    let scrollEl = document.getElementById("scroll-to-top");

    // Check initially
    scrollListener();

    window.removeEventListener("scroll", scrollListener);
    window.removeEventListener("resize", scrollListener);

    window.addEventListener("scroll", scrollListener);
    window.addEventListener("resize", scrollListener);

    //Clean events
    return () => {
      window.removeEventListener("scroll", scrollListener);
      window.removeEventListener("resize", scrollListener);
      scrollEl.style.setProperty("--offset", "0");
    };
  }, []);
};

export default useOffset;
