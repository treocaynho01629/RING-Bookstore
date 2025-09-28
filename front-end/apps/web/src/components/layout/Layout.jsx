import { Outlet } from "react-router";
import LoadingProgress from "./LoadingProgress";

const Layout = () => {
  return (
    <main className="App">
      <LoadingProgress />
      <Outlet />
    </main>
  );
};

export default Layout;
