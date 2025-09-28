import { useLocation, Navigate, Outlet } from "react-router";
import useAuth from "../../hooks/useAuth";

const RequireAuth = ({ allowedRoles }) => {
  const location = useLocation();
  const { token, roles } = useAuth();

  return (
    <>
      {roles?.find((role) => allowedRoles?.includes(role)) ? ( //Auth with ROLES
        <Outlet />
      ) : token ? (
        <Navigate to="/unauthorized" state={{ from: location }} replace /> //To error page
      ) : (
        <Navigate
          to="/auth/login"
          state={{
            from: location,
            errorMsg: "Vui lòng đăng nhập để tiếp tục.",
          }}
          replace
        />
      )}
    </>
  );
};

export default RequireAuth;
