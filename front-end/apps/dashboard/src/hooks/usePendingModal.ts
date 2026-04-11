"use client";

import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@ring/redux";
import { hidePending, selectPendingMessage, selectPendingOpen, showPending } from "@/features/app/appReducer";

type AsyncLike<T> = Promise<T> | (() => Promise<T>);

export default function usePendingModal() {
  const dispatch = useAppDispatch();
  const open = useAppSelector(selectPendingOpen);
  const message = useAppSelector(selectPendingMessage);

  const show = useCallback(
    (nextMessage?: string) => {
      dispatch(showPending(nextMessage));
    },
    [dispatch]
  );

  const hide = useCallback(() => {
    dispatch(hidePending());
  }, [dispatch]);

  const withPending = useCallback(
    async <T>(task: AsyncLike<T>, nextMessage?: string): Promise<T> => {
      dispatch(showPending(nextMessage));
      try {
        if (typeof task === "function") {
          return await task();
        }
        return await task;
      } finally {
        dispatch(hidePending());
      }
    },
    [dispatch]
  );

  return {
    open,
    message,
    showPending: show,
    hidePending: hide,
    withPending,
  };
}
