"use client";

import { Suspense, useRef } from "react";
import type { ReactNode } from "react";
import { Box } from "@mui/material";
import type { SxProps, Theme } from "@mui/material/styles";
import useOnView from "@ring/shared/useOnView";

interface LazyLoadComponentProps {
  children: ReactNode;
  placeholder?: ReactNode;
  threshold?: number;
  root?: Element | null;
  rootMargin?: string;
  sx?: SxProps<Theme>;
}

export default function LazyLoadComponent({
  children,
  placeholder = null,
  threshold = 0,
  root = null,
  rootMargin = "0px",
  sx,
}: LazyLoadComponentProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const entered = useOnView(ref, { threshold, root, rootMargin });

  return (
    <Box ref={ref} sx={sx}>
      {entered ? <Suspense fallback={placeholder}>{children}</Suspense> : placeholder}
    </Box>
  );
}
