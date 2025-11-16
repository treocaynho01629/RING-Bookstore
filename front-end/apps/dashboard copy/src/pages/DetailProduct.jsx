import { useState } from "react";
import { TextareaAutosize, Box, Card, IconButton, Typography, Stack, Grid } from "@mui/material";
import { NavLink, useParams } from "react-router";
import { useGetBookQuery } from "../features/books/booksApiSlice";
import { Launch, Edit as EditIcon } from "@mui/icons-material";
import { ButtonContainer, HeaderContainer, InfoTable } from "../components/custom/Components";
import { useTitle, getBookType, getBookLanguage, currencyFormat, getImageSize } from "@ring/shared";
import ProductImages from "@ring/ui/ProductImages";
import SummaryTableOrders from "../components/table/SummaryTableOrders";
import CustomBreadcrumbs from "../components/custom/CustomBreadcrumbs";

const BookType = getBookType();
const BookLanguage = getBookLanguage();
const ImageSize = getImageSize();
const maxStocks = 199;

const DetailProduct = () => {
  const { id } = useParams();
  const [open, setOpen] = useState(false);
  const { data, isLoading, isSuccess, isError, error } = useGetBookQuery(id, {
    skip: !id,
  });

  const handleOpenEdit = () => {
    setOpen(true);
  };

  //Set title
  //useTitle(`${data?.title ?? "Sản phẩm"}`);

  //Images
  let initialImages = data?.previews ? [].concat(data?.image, data?.previews) : [].concat(data?.image);
  let images = initialImages.map((image, index) => {
    const srcSet = image?.srcSet;

    if (srcSet) {
      return {
        src: image?.url,
        alt: `${book?.title} preview image #${index + 1}`,
        width: 600,
        height: 600,
        srcSet: Object.values(ImageSize)
          .map((size, index) => ({
            src: srcSet[size?.value],
            width: size.width,
            height: size.width,
          }))
          .concat({ src: image?.url, width: 600, height: 600 }),
        sizes: "(min-width: 450px) 450px, 100vw",
      };
    }
  });

  const stockProgress = Math.min((data?.amount / maxStocks) * 100, 100);
  const stockColor = stockProgress == 0 ? "error" : stockProgress < 20 ? "warning" : "primary";
  const stockLabel = stockProgress == 0 ? "Hết hàng" : stockProgress < 20 ? "Gần hết hàng" : "Còn hàng";

  return (
    <>
      <HeaderContainer>
        <div>
          <h2>Chi tiết sản phẩm</h2>
          <CustomBreadcrumbs separator="." maxItems={4} aria-label="breadcrumb">
            <NavLink to={"/product"} end>
              Quản lý sản phẩm
            </NavLink>
            <NavLink to={`/product/${id}`}>{data?.title}</NavLink>
          </CustomBreadcrumbs>
        </div>
        <ButtonContainer>
          <NavLink to={`/product/${data?.slug}`}>
            <IconButton>
              <Launch fontSize="small" />
            </IconButton>
          </NavLink>
          <IconButton onClick={handleOpenEdit}>
            <EditIcon fontSize="small" />
          </IconButton>
        </ButtonContainer>
      </HeaderContainer>
      <Grid container size="grow" spacing={{ xs: 0, md: 1, lg: 2 }} position="relative">
        <Grid size={{ xs: 12, md: 6 }} position="relative">
          {isLoading ? <ProductImages /> : <ProductImages images={images} />}
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Stack spacing={1} px={{ xs: 1, md: 0 }}>
            <Box display="flex" justifyContent="space-between">
              <Typography variant="button" color={stockColor} sx={{ textTransform: "uppercase" }}>
                {stockLabel}
              </Typography>
              <Typography variant="subtitle2" color="text.secondary">
                Còn {data?.amount} sản phẩm
              </Typography>
            </Box>
            <Typography variant="h6">{data?.title}</Typography>
            <Stack spacing={1} direction="row" display="flex" alignItems="center">
              <Typography variant="h6" color="primary">
                {currencyFormat.format(data?.price * (1 - data?.discount))}
              </Typography>
              {data?.discount > 0 && (
                <>
                  <Typography variant="body1" sx={{ textDecoration: "line-through" }} color="text.secondary">
                    {currencyFormat.format(data?.price)}
                  </Typography>
                  <Typography variant="subtitle2">-{data?.discount * 100}%</Typography>
                </>
              )}
            </Stack>
            <InfoTable>
              <tbody>
                <tr>
                  <td>
                    <Typography variant="subtitle1">Danh mục:</Typography>
                  </td>
                  <td>
                    <Typography variant="subtitle1" color="text.secondary">
                      {data?.category?.name}
                    </Typography>
                  </td>
                </tr>
                <tr>
                  <td>
                    <Typography variant="subtitle1">Nhà xuất bản:</Typography>
                  </td>
                  <td>
                    <Typography variant="subtitle1" color="text.secondary">
                      {data?.publisher?.name}
                    </Typography>
                  </td>
                </tr>
                <tr>
                  <td>
                    <Typography variant="subtitle1">Tác giả:</Typography>
                  </td>
                  <td>
                    <Typography variant="subtitle1" color="text.secondary">
                      {data?.author}
                    </Typography>
                  </td>
                </tr>
                <tr>
                  <td>
                    <Typography variant="subtitle1">Hình thức:</Typography>
                  </td>
                  <td>
                    <Typography variant="subtitle1" color="text.secondary">
                      {BookType[data?.type]?.label}
                    </Typography>
                  </td>
                </tr>
                <tr>
                  <td>
                    <Typography variant="subtitle1">Cửa hàng:</Typography>
                  </td>
                  <td>
                    <Typography variant="subtitle1" color="text.secondary">
                      <NavLink>{data?.shopName}</NavLink>
                    </Typography>
                  </td>
                </tr>
              </tbody>
            </InfoTable>
          </Stack>
        </Grid>
      </Grid>
      <Card elevation={3} sx={{ padding: "10px 30px", mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} lg={6}>
            <Typography my={2} variant="h5" sx={{ fontWeight: "bold" }}>
              Thông tin chi tiết:{" "}
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={4}>
                <Typography variant="subtitle1" color="text.primary" sx={{ fontWeight: "bold" }}>
                  Mã hàng:
                </Typography>
                <Typography variant="subtitle1" color="text.primary" sx={{ fontWeight: "bold" }}>
                  Trọng lượng (gr):
                </Typography>
                <Typography variant="subtitle1" color="text.primary" sx={{ fontWeight: "bold" }}>
                  Kích thước:
                </Typography>
                <Typography variant="subtitle1" color="text.primary" sx={{ fontWeight: "bold" }}>
                  Số trang:
                </Typography>
              </Grid>
              <Grid item xs={8}>
                <Typography variant="subtitle1" color="text.secondary">
                  {data?.id ? data?.id : "N/A"}
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                  {data?.weight ? data?.weight : "N/A"}
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                  {data?.size ? data?.size : "N/A"}
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                  {data?.page ? data?.page : "N/A"}
                </Typography>
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12} lg={6}>
            <Typography my={2} variant="h5" sx={{ fontWeight: "bold" }}>
              Mô tả
            </Typography>
            <TextareaAutosize
              value={data?.description}
              readOnly
              disabled
              style={{
                backgroundColor: "white",
                resize: "none",
                width: "95%",
                border: "none",
              }}
            />
          </Grid>
        </Grid>
      </Card>
      <Grid container spacing={2}>
        <Grid size={{ sm: 12, md: 6 }}>
          <SummaryTableOrders bookId={id} />
        </Grid>
        <Grid size={{ sm: 12, md: 6 }}>
          <SummaryTableOrders bookId={id} />
        </Grid>
      </Grid>
    </>
  );
};

export default DetailProduct;
