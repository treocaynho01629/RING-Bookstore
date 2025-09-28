import { useState, useEffect, lazy, Suspense } from "react";
import { Navigate, Outlet, useLocation } from "react-router";
import {
  useRefreshMutation,
  useSignOutMutation,
} from "@ring/redux/authApiSlice";
import Button from "@mui/material/Button";
import useAuth from "../../hooks/useAuth";
import useLogout from "../../hooks/useLogout";

const PendingModal = lazy(() => import("@ring/ui/PendingModal"));

const PersistLogin = () => {
  const { token, exp, persist } = useAuth();
  const [pending, setPending] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  const [refresh, { isLoading, isSuccess, isError }] = useRefreshMutation();
  const [logout] = useSignOutMutation();
  const location = useLocation();
  const signOut = useLogout();

  useEffect(() => {
    let isMounted = true; // Run only once

    const verifyRefreshToken = async () => {
      try {
        // Refresh token
        await refresh().unwrap();
      } catch (error) {
        // Error messages
        if (error?.status === 500) {
          setErrorMsg("Đã xảy ra lỗi xác thực, vui lòng đăng nhập lại!");
        } else if (error?.status === 400 || error?.status === 403) {
          setErrorMsg("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại!");
        }

        // Log user out if fail to refresh
        await logout().unwrap();
      } finally {
        isMounted && setPending(false);
      }
    };

    // Refresh on time buffer
    // Prevent refresh from multiple endpoints if token expired
    const currentTime = Math.floor(Date.now());
    const checkBuffer = 30 * 1000; // 30 seconds
    const expireSoon = exp && currentTime > exp - checkBuffer;

    // Refresh token if persist and token is expired
    if (persist && (!token || expireSoon)) {
      verifyRefreshToken();
    } else {
      setPending(false);
    }
    return () => (isMounted = false);
  }, []);

  return (
    <>
      {isError && errorMsg && !pending ? ( //To login page if error
        <Navigate
          to="/auth/login"
          state={{ from: location, errorMsg }}
          replace
        />
      ) : !persist || token ? (
        <Outlet />
      ) : isLoading || pending ? (
        <Suspense fallback={null}>
          <PendingModal open={true} message="Đang xác thực đăng nhập ...">
            <Button variant="contained" color="error" onClick={() => signOut()}>
              Đăng xuất?
            </Button>
          </PendingModal>
        </Suspense>
      ) : isSuccess ? (
        <Outlet />
      ) : (
        <Navigate
          to="/auth/login"
          state={{ from: location, errorMsg }}
          replace
        />
      )}
    </>
  );
};

export default PersistLogin;
