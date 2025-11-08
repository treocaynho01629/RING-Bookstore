import { Outlet } from "react-router";
import LoadingProgress from "./LoadingProgress";
// import LanguageSync from "./LanguageSync";

const Layout = () => {
  return (
    <main className="App">
      {/* <LanguageSync /> */}
      <LoadingProgress />
      <Outlet />
    </main>
  );
};

export default Layout;
