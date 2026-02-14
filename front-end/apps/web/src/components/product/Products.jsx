import { trackWindowScroll } from "react-lazy-load-image-component";
import { Box, Grid } from "@mui/material";
import Progress from "@ring/ui/Progress";
import Product from "./Product";

const Products = ({ data, isError, isLoading, isSuccess, scrollPosition }) => {
  let productsContent;

  if (isLoading || isError) {
    productsContent = [...Array(15)].map((item, index) => (
      <Grid key={index} size={{ xs: 6, sm: 4, md: 3, lg: 2.4 }}>
        <Product />
      </Grid>
    ));
  } else if (isSuccess) {
    const content = data?.pages?.flatMap((p) => p.content ?? []);
    const ids = content.map((b) => b.id);
    const entities = Object.fromEntries(content.map((b) => [b.id, b]));

    productsContent = ids?.length
      ? ids?.map((id, index) => {
          const book = entities[id];

          return (
            <Grid key={`product-${id}-${index}`} size={{ xs: 6, sm: 4, sm_md: 3, md_lg: 2.4 }}>
              <Product {...{ book, scrollPosition }} />
            </Grid>
          );
        })
      : [...Array(15)].map((item, index) => (
          <Grid key={index} size={{ xs: 6, sm: 4, sm_md: 3, md_lg: 2.4 }}>
            <Product />
          </Grid>
        ));
  }

  return (
    <Box
      sx={{
        width: "100%",
        position: "relative",
        padding: { xs: 0, sm_md: 0.5 },
      }}
    >
      {(isLoading || isError) && <Progress color={isError ? "error" : "primary"} />}
      <Grid container spacing={0.2} size="grow">
        {productsContent}
      </Grid>
    </Box>
  );
};

export default trackWindowScroll(Products);
