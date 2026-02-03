import { useReachable } from "../../hooks/useReachable";
import Maintainance from "../../pages/Maintainance";

export default function MaintainanceCheck() {
  const connected = useReachable();

  if (connected) return null;

  return <Maintainance />;
}
