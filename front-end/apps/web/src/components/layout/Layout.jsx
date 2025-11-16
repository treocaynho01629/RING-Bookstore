import { Outlet } from "react-router";
import LoadingProgress from "./LoadingProgress";
import TitleLayout from "./TitleLayout";
// import LanguageSync from "./LanguageSync"; // TODO: Do something with this

const Layout = () => {
  return (
    <main className="App">
      {/* <LanguageSync /> */}
      <TitleLayout />
      <LoadingProgress />
      <Outlet />
    </main>
  );
};

export default Layout;
