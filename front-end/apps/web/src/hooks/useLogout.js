import { useSignOutMutation } from "@ring/redux/authApiSlice";
import { useNavigate } from "react-router";

const useLogout = () => {
  const navigate = useNavigate();
  const [logout] = useSignOutMutation();

  const signOut = async (message) => {
    try {
      await logout().unwrap();

      navigate("/");
      const { enqueueSnackbar } = await import("notistack");
      enqueueSnackbar(message || "Đã đăng xuất!", { variant: "error" });
    } catch (err) {
      console.error(err);
    }
  };

  return signOut;
};

export default useLogout;
