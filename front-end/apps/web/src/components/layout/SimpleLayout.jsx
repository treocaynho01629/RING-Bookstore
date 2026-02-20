import { Outlet } from "react-router";
import SimpleNavbar from "../navbar/SimpleNavbar";

export default function SimpleLayout() {
  return (
    <>
      <SimpleNavbar />
      <div>
        <Outlet />
      </div>
    </>
  );
}
