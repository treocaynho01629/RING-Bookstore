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
  Avatar,
  Chip,
  CircularProgress,
} from "@mui/material";
import Link from "next/link";
import { ItemTitle, LinkButton, Title } from "../custom/Components";
import { useGetShopsQuery } from "../../features/shops/shopsApiSlice";
import {
  currencyFormat,
  dateFormatter,
  idFormatter,
  numFormat,
} from "@ring/shared";

const headCells = [
  {
    id: "shop",
    align: "left",
    width: "auto",
    disablePadding: false,
    label: "Cửa hàng",
  },
  {
    id: "owner",
    align: "left",
    width: "120px",
    disablePadding: false,
    label: "Sở hữu",
  },
  {
    id: "sales",
    align: "left",
    width: "120px",
    disablePadding: false,
    label: "Doanh thu",
  },
  {
    id: "rank",
    align: "right",
    width: "95px",
    disablePadding: false,
    label: "Xếp hạng",
  },
];

export default function SummaryTableShops() {
  // Fetch shops
  const { data, isLoading, isSuccess, isError, error } = useGetShopsQuery({
    size: 5,
    sortBy: "sales",
    sortDir: "desc",
  });

  const colSpan = headCells.length + 1;
  let shopRows;

  if (isLoading) {
    shopRows = (
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

    shopRows = ids?.length ? (
      ids?.map((id, index) => {
        const shop = entities[id];
        const date = new Date(shop?.joinedDate);

        return (
          <TableRow hover tabIndex={-1} key={id}>
            <TableCell align="left">
              <Link
                href={`/shop/${id}`}
                style={{ display: "flex", alignItems: "center", textDecoration: "none", color: "inherit" }}
              >
                <Avatar sx={{ marginRight: 1 }} src={shop?.image ?? null}>
                  {shop?.name?.charAt(0) ?? ""}
                </Avatar>
                <Box>
                  <ItemTitle>{shop.name}</ItemTitle>
                  <Box display="flex">
                    <ItemTitle className="secondary">
                      {dateFormatter(date)}
                    </ItemTitle>
                    <ItemTitle>
                      &emsp;Lượt theo dõi: {shop.totalFollowers}
                    </ItemTitle>
                  </Box>
                </Box>
              </Link>
            </TableCell>
            <TableCell align="left">
              <ItemTitle>{shop.username}</ItemTitle>
              <ItemTitle>{idFormatter(shop.ownerId)}</ItemTitle>
            </TableCell>
            <TableCell align="left">
              <ItemTitle>{currencyFormat.format(shop.sales)}</ItemTitle>
              <ItemTitle className="secondary">
                Doanh số: {numFormat.format(shop.totalSold)}
              </ItemTitle>
            </TableCell>
            <TableCell align="right">
              <Chip
                label={`Top ${index + 1}`}
                color={
                  index == 0
                    ? "success"
                    : index == 1
                      ? "primary"
                      : index == 2
                        ? "info"
                        : index == 3
                          ? "warning"
                          : "error"
                }
                variant="outlined"
                sx={{ fontWeight: "bold" }}
              />
            </TableCell>
          </TableRow>
        );
      })
    ) : (
      <TableRow>
        <TableCell
          scope="row"
          padding="none"
          align="center"
          colSpan={colSpan}
          sx={{ height: 300 }}
        >
          <Box>Không tìm thấy cửa hàng nào!</Box>
        </TableCell>
      </TableRow>
    );
  } else if (isError) {
    shopRows = (
      <TableRow>
        <TableCell
          scope="row"
          padding="none"
          align="center"
          colSpan={colSpan}
          sx={{ height: 300 }}
        >
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
        <Title>Cửa hàng đóng góp nhiều nhất</Title>
        <Link href={"/shop"} style={{ textDecoration: "none" }}>
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
          <TableBody>{shopRows}</TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}

