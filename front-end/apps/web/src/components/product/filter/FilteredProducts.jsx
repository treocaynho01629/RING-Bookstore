import { memo } from "react";
import { trackWindowScroll } from "react-lazy-load-image-component";
import { useTranslation } from "react-i18next";
import { capitalize } from "lodash-es";
import Progress from "@ring/ui/Progress";
import Product from "../Product";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";

const FilteredProducts = memo(({ data, error, loading, scrollPosition }) => {
  const { t } = useTranslation();

  let productsContent;

  if (data) {
    const { ids, entities } = data;

    productsContent = ids?.length ? (
      ids?.map((id, index) => {
        const book = entities[id];

        return (
          <Grid key={`${id}-${index}`} size={{ xs: 6, sm: 4, lg: 3 }}>
            <Product {...{ book, scrollPosition }} />
          </Grid>
        );
      })
    ) : (
      <Box sx={{ marginTop: 2, width: "100%", textAlign: "center" }}>
        {capitalize(t("message.none", { item: t("product.label") }))}
      </Box>
    );
  } else if (error) {
    productsContent = (
      <Box sx={{ marginTop: 2, width: "100%", textAlign: "center" }}>{error?.error ?? t("error.general")}</Box>
    );
  }

  return (
    <Box
      sx={{
        padding: 0,
        width: "100%",
        position: "relative",
        minHeight: "90dvh",
      }}
    >
      {loading && <Progress color={error ? "error" : "primary"} />}
      <Grid container spacing={0.5} size="grow">
        {productsContent}
      </Grid>
    </Box>
  );
});

export default trackWindowScroll(FilteredProducts);
