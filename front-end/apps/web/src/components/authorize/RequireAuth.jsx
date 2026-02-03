import { useLocation, Navigate, Outlet } from "react-router";
import { useTranslation } from "react-i18next";
import useAuth from "../../hooks/useAuth";

const RequireAuth = ({ allowedRoles }) => {
  const location = useLocation();
  const { t } = useTranslation();
  const { token, roles } = useAuth();

  return (
    <>
      {roles?.find((role) => allowedRoles?.includes(role)) ? ( // Auth with ROLES
        <Outlet />
      ) : token ? (
        <Navigate to="/unauthorized" state={{ from: location }} replace /> // To error page
      ) : (
        <Navigate
          to="/auth/login"
          state={{
            from: location,
            errorMsg: t("login.required"),
          }}
          replace
        />
      )}
    </>
  );
};

export default RequireAuth;
