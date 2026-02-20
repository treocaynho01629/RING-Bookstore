import { Outlet } from "react-router";
import LoadingProgress from "./LoadingProgress";
import TitleLayout from "./TitleLayout";

const Layout = () => {
  return (
    <main className="App">
      <TitleLayout />
      <LoadingProgress />
      <Outlet />
    </main>
  );
};

export default Layout;
