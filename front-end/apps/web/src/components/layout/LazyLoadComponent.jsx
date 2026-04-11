import { Suspense, useRef } from "react";
import { Box } from "@mui/material";
import useOnView from "@ring/shared/useOnView";

const LazyLoadComponent = ({
  children,
  threshold = 0,
  root = null,
  rootMargin = "0px",
  placeholder = null,
  ...otherProps
}) => {
  const ref = useRef();
  const entered = useOnView(ref, { threshold, root, rootMargin });

  return (
    <Box ref={ref}>
      {entered ? <Suspense fallback={placeholder}>{children}</Suspense> : <Box {...otherProps}></Box>}
    </Box>
  );
};

export default LazyLoadComponent;
