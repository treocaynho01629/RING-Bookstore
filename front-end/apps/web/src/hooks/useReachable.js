import { useEffect, useState } from "react";
import { reachableMonitor } from "../utils/reachable";

export function useReachable() {
  const [connected, setConnected] = useState(reachableMonitor.connected);

  useEffect(() => {
    return reachableMonitor.subscribe(setConnected);
  }, []);

  return connected;
}
