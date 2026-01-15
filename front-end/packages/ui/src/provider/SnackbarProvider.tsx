import { SnackbarProvider as NotistackProvider } from "notistack";
import Snackbar from "../components/Snackbar";

interface SnackbarProviderProps {
  children: React.ReactNode;
}

export default function SnackbarProvider({ children }: SnackbarProviderProps) {
  return (
    <NotistackProvider
      maxSnack={3}
      autoHideDuration={1500}
      dense
      Components={{
        default: Snackbar,
        success: Snackbar,
        error: Snackbar,
        warning: Snackbar,
        info: Snackbar,
      }}
    >
      {children}
    </NotistackProvider>
  );
}
