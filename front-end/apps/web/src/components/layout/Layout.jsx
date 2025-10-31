import { Outlet } from "react-router";
import LoadingProgress from "./LoadingProgress";
import LanguageSync from "./LanguageSync";

const Layout = () => {
  return (
    <main className="App">
      <LoadingProgress />
      <LanguageSync />
      <Outlet />
    </main>
  );
};

export default Layout;
