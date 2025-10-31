import { useTranslations } from "next-intl";
import Grid from "@mui/material/Grid";
import Test from "../../components/Test";

const Dashboard = () => {
  const t = useTranslations();

  return (
    <>
      <Grid container size="grow" spacing={2} pt={2}>
        <Grid size={{ xs: 12, sm: 7 }}>
          <p>{t("hello")}</p>
          <Test />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <p>{t("logout")}</p>
          <p>{t("login")}</p>
        </Grid>
        {/* <Grid size={{ xs: 12, sm: 6, md_lg: 3 }}>
          <p>STUFF</p>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md_lg: 3 }}>
          <p>STUFF</p>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md_lg: 3 }}>
          <p>STUFF</p>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md_lg: 3 }}>
          <p>STUFF</p>
        </Grid>
        <Grid size={{ xs: 12, md_lg: 4 }}>
          <p>STUFF</p>
        </Grid>
        <Grid size={{ xs: 12, md_lg: 8 }}>
          <p>STUFF</p>
        </Grid>
        <Grid size={{ xs: 12, md_lg: 7 }}>
          <p>STUFF</p>
        </Grid>
        <Grid size={{ xs: 12, md_lg: 5 }}>
          <p>STUFF</p>
        </Grid> */}
      </Grid>
    </>
  );
};

export default Dashboard;
