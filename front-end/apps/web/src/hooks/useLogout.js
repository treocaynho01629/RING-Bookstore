import { useSignOutMutation } from "@ring/redux/authApiSlice";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";

const useLogout = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [logout] = useSignOutMutation();

  const signOut = async (message) => {
    try {
      await logout().unwrap();

      navigate("/");
      const { enqueueSnackbar } = await import("notistack");
      enqueueSnackbar(message || t("signout.success"), { variant: "error" });
    } catch (err) {
      console.error(err);
    }
  };

  return signOut;
};

export default useLogout;
