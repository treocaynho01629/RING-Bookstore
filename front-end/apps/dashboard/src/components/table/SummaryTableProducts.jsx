import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Paper,
  Skeleton,
  Toolbar,
  TableHead,
  CircularProgress,
} from "@mui/material";
import Link from "next/link";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { useGetBooksQuery } from "../../features/books/booksApiSlice";
import { ItemTitle, LinkButton, Title } from "../custom/Components";
import { currencyFormat } from "@ring/shared/utils/convert";

const headCells = [
  {
    id: "title",
    align: "left",
    width: "auto",
    disablePadding: false,
    label: "Sản phẩm",
  },
  {
    id: "info",
    align: "right",
    width: "110px",
    disablePadding: false,
    label: "Thông tin",
  },
];

export default function SummaryTableProducts({ shop, userId, isAdmin }) {
  //#region construct
  //Fetch books
  const { data, isLoading, isSuccess, isError, error } = useGetBooksQuery(
    {
      size: 5,
      sortBy: "createdDate",
      sortDir: "desc",
      amount: 0,
      shopId: shop !== null && shop !== undefined ? String(shop) : "",
      userId: isAdmin ? null : userId,
    },
    { skip: !userId }
  );
  //#endregion

  const colSpan = headCells.length + 1;
  let bookRows;

  if (isLoading) {
    bookRows = (
      <TableRow>
        <TableCell
          scope="row"
          padding="none"
          align="center"
          colSpan={colSpan}
          sx={{ position: "relative", height: 300 }}
        >
          <CircularProgress color="primary" />
        </TableCell>
      </TableRow>
    );
  } else if (isSuccess) {
    const { ids, entities } = data;

    bookRows = ids?.length ? (
      ids?.map((id, index) => {
        const book = entities[id];

        return (
          <TableRow hover tabIndex={-1} key={id}>
            <TableCell align="left">
              <Link
                href={`/product/${id}`}
                style={{ display: "flex", alignItems: "center", textDecoration: "none", color: "inherit" }}
              >
                <LazyLoadImage
                  src={book?.image?.srcSet[ImageSize?.TINY?.value]}
                  height={45}
                  width={45}
                  style={{ marginRight: "10px" }}
                  placeholder={<Skeleton width={45} height={45} animation={false} variant="rectangular" />}
                />
                <Box>
                  <ItemTitle>{book.title}</ItemTitle>
                  <Box display="flex">
                    <ItemTitle>{currencyFormat.format(book.price * (1 - book.discount))}</ItemTitle>
                    {book.discount > 0 && <ItemTitle className="secondary">&emsp;-{book.discount * 100}%</ItemTitle>}
                  </Box>
                </Box>
              </Link>
            </TableCell>
            <TableCell align="right">
              <ItemTitle className="secondary">Đã bán: {book.totalOrders}</ItemTitle>
              <ItemTitle className="secondary">Đánh giá: {book.rating.toFixed(1)}</ItemTitle>
            </TableCell>
          </TableRow>
        );
      })
    ) : (
      <TableRow>
        <TableCell scope="row" padding="none" align="center" colSpan={colSpan} sx={{ height: 300 }}>
          <Box>Không tìm thấy sản phẩm nào!</Box>
        </TableCell>
      </TableRow>
    );
  } else if (isError) {
    bookRows = (
      <TableRow>
        <TableCell scope="row" padding="none" align="center" colSpan={colSpan} sx={{ height: 300 }}>
          <Box>{error?.error || "Đã xảy ra lỗi"}</Box>
        </TableCell>
      </TableRow>
    );
  }

  return (
    <Paper sx={{ width: "100%", height: "100%" }} elevation={3}>
      <Toolbar
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Title>Sản phẩm mới nhất</Title>
        <Link href={"/product"} style={{ textDecoration: "none" }}>
          <LinkButton>Xem tất cả</LinkButton>
        </Link>
      </Toolbar>
      <TableContainer component={Paper}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow className="header" tabIndex={-1}>
              {headCells.map((headCell, index) => (
                <TableCell
                  key={`headcell-${headCell.id}-${index}`}
                  align={headCell.align}
                  padding={headCell.disablePadding ? "none" : "normal"}
                  sx={{ width: headCell.width, bgcolor: "action.hover" }}
                >
                  {headCell.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>{bookRows}</TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}
