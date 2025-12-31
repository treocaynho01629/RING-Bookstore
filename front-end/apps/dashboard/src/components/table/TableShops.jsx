import { useState, useEffect, useCallback, useRef } from "react";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Paper,
  Checkbox,
  IconButton,
  FormControlLabel,
  Switch,
  Skeleton,
  TextField,
  MenuItem,
  Menu,
  ListItemIcon,
  ListItemText,
  Stack,
  Toolbar,
  Button,
  Avatar,
} from "@mui/material";
import {
  Search,
  MoreHoriz,
  Edit,
  Delete,
  Visibility,
  FilterAltOff,
  Add,
} from "@mui/icons-material";
import { Link } from "react-router";
import { ItemTitle, FooterContainer, FooterLabel } from "../custom/Components";
import {
  currencyFormat,
  dateFormatter,
  idFormatter,
  numFormat,
} from "@ring/shared";
import {
  useDeleteAllShopsMutation,
  useDeleteShopMutation,
  useDeleteShopsInverseMutation,
  useDeleteShopsMutation,
  useGetShopsQuery,
} from "../../features/shops/shopsApiSlice";
import { Progress } from "@ring/ui";
import { useDeepEffect } from "@ring/shared";
import useAuth from "@ring/auth/useAuth";
import CustomTableHead from "./CustomTableHead";
import CustomTablePagination from "./CustomTablePagination";

const headCells = [
  {
    id: "id",
    align: "center",
    width: "70px",
    disablePadding: false,
    sortable: true,
    label: "ID",
  },
  {
    id: "name",
    align: "left",
    width: "auto",
    disablePadding: false,
    sortable: true,
    label: "Cửa hàng",
  },
  {
    id: "ownerId",
    align: "left",
    width: "120px",
    disablePadding: false,
    sortable: true,
    label: "Sở hữu",
  },
  {
    id: "sales",
    align: "left",
    width: "120px",
    disablePadding: false,
    sortable: true,
    label: "Doanh thu",
  },
  {
    id: "action",
    width: "24px",
    disablePadding: false,
    sortable: false,
  },
];

function ShopFilters({ userId, isAdmin, filters, setFilters }) {
  const inputRef = useRef();

  const handleChangeKeyword = useCallback((e) => {
    e.preventDefault();
    if (inputRef)
      setFilters((prev) => ({ ...prev, keyword: inputRef.current.value }));
  }, []);

  const resetFilter = useCallback(() => {
    setFilters({
      keyword: "",
      userId: "",
    });
    if (inputRef) inputRef.current.value = "";
  }, []);

  return (
    <Stack
      width="100%"
      spacing={1}
      my={2}
      direction={{ xs: "column", md: "row" }}
    >
      {isAdmin && (
        <TextField
          label="Lọc theo"
          value={filters.userId || ""}
          onChange={(e) => setFilters({ ...filters, userId: e.target.value })}
          select
          size="small"
          fullWidth
          slotProps={{
            select: {
              MenuProps: {
                slotProps: {
                  paper: {
                    style: {
                      maxHeight: 250,
                    },
                  },
                },
              },
            },
          }}
          sx={{ maxWidth: { xs: "auto", md: 200 } }}
        >
          <MenuItem value="">Tất cả</MenuItem>
          <MenuItem value={userId}>Sở hữu</MenuItem>
        </TextField>
      )}
      <form style={{ width: "100%" }} onSubmit={handleChangeKeyword}>
        <TextField
          placeholder="Tìm kiếm"
          autoComplete="products"
          id="products"
          size="small"
          inputRef={inputRef}
          fullWidth
          slotProps={{
            input: {
              startAdornment: <Search sx={{ marginRight: 1 }} />,
            },
          }}
        />
      </form>
      <Box display="flex" justifyContent="center">
        <Button
          sx={{ width: 125 }}
          color="error"
          onClick={resetFilter}
          startIcon={<FilterAltOff />}
        >
          Xoá bộ lọc
        </Button>
      </Box>
    </Stack>
  );
}

export default function TableShops({ handleOpenEdit, pending, setPending }) {
  //#region construct
  const { id, roles } = useAuth();
  const isAdmin = roles.find((role) =>
    ["ROLE_ADMIN", "ROLE_GUEST"]?.includes(role)
  );
  const [selected, setSelected] = useState([]);
  const [deselected, setDeseletected] = useState([]);
  const [selectedAll, setSelectedAll] = useState(false);
  const [dense, setDense] = useState(true);
  const [filters, setFilters] = useState({
    keyword: "",
    userId: "",
  });
  const [pagination, setPagination] = useState({
    number: 0,
    size: 10,
    totalPages: 0,
    sortBy: "id",
    sortDir: "desc",
  });

  //Actions
  const [anchorEl, setAnchorEl] = useState(null);
  const [contextId, setContextId] = useState(null); //Current select product's id
  const openContext = Boolean(anchorEl);

  //Delete hook
  const [deleteShop] = useDeleteShopMutation();
  const [deleteShops] = useDeleteShopsMutation();
  const [deleteShopsInverse] = useDeleteShopsInverseMutation();
  const [deleteAll] = useDeleteAllShopsMutation();

  //Fetch shops
  const { data, isLoading, isSuccess, isError, error } = useGetShopsQuery({
    page: pagination?.number,
    size: pagination?.size,
    sortBy: pagination?.sortBy,
    sortDir: pagination?.sortDir,
    keyword: filters.keyword,
    userId: filters.userId,
  });

  //Set pagination after fetch
  useEffect(() => {
    if (!isLoading && isSuccess && data) {
      setPagination({
        ...pagination,
        totalPages: data?.totalPages,
        number: data?.page,
        size: data?.size,
      });
    }
  }, [data]);

  useDeepEffect(() => {
    handleChangePage(0);
  }, [filters]);

  const handleRequestSort = (e, property) => {
    const isAsc =
      pagination.sortBy === property && pagination.sortDir === "asc";
    const sortDir = isAsc ? "desc" : "asc";
    setPagination({ ...pagination, sortBy: property, sortDir: sortDir });
  };

  const handleSelectAllClick = (e) => {
    if (e.target.checked) {
      //Selected all
      setSelectedAll(true);
      return;
    }

    //Unselected all
    setSelected([]);
    setDeseletected([]);
    setSelectedAll(false);
  };

  //Select
  const handleClick = (e, id) => {
    if (selectedAll) {
      //Set unselected elements for reverse
      const deselectedIndex = deselected?.indexOf(id);
      let newDeselected = [];

      if (deselectedIndex === -1) {
        newDeselected = newDeselected.concat(deselected, id);
      } else if (deselectedIndex === 0) {
        newDeselected = newDeselected.concat(deselected.slice(1));
      } else if (deselectedIndex === deselected?.length - 1) {
        newDeselected = newDeselected.concat(deselected.slice(0, -1));
      } else if (deselectedIndex > 0) {
        newDeselected = newDeselected.concat(
          deselected.slice(0, deselectedIndex),
          deselected.slice(deselectedIndex + 1)
        );
      }

      setDeseletected(newDeselected);
      if (newDeselected.length == data?.totalElements) {
        setDeseletected([]);
        setSelectedAll(false);
      }
    } else {
      //Set main selected elements
      const selectedIndex = selected?.indexOf(id);
      let newSelected = [];

      if (selectedIndex === -1) {
        newSelected = newSelected.concat(selected, id);
      } else if (selectedIndex === 0) {
        newSelected = newSelected.concat(selected.slice(1));
      } else if (selectedIndex === selected?.length - 1) {
        newSelected = newSelected.concat(selected.slice(0, -1));
      } else if (selectedIndex > 0) {
        newSelected = newSelected.concat(
          selected.slice(0, selectedIndex),
          selected.slice(selectedIndex + 1)
        );
      }

      setSelected(newSelected);
      if (newSelected.length == data?.totalElements) {
        setSelectedAll(true);
        setSelected([]);
      }
    }
  };

  //Pagination
  const handleChangePage = useCallback(
    (page) => {
      setPagination({ ...pagination, number: page });
    },
    [pagination]
  );

  const handleChangeRowsPerPage = useCallback(
    (size) => {
      handleChangePage(0);
      const newValue = parseInt(size, 10);
      setPagination({ ...pagination, size: newValue });
    },
    [pagination]
  );

  const handleChangeDense = useCallback((e) => {
    setDense(e.target.checked);
  }, []);

  //Actions
  const handleOpenContext = (e, product) => {
    setAnchorEl(e.currentTarget);
    setContextId(product);
  };

  const handleCloseContext = () => {
    setAnchorEl(null);
    setContextId(null);
  };

  const handleDelete = async (id) => {
    if (pending) return;
    setPending(true);
    const { enqueueSnackbar } = await import("notistack");

    deleteShop(id)
      .unwrap()
      .then((data) => {
        //Unselected
        const selectedIndex = selected.indexOf(id);
        let newSelected = [];

        if (selectedIndex === 0) {
          newSelected = newSelected.concat(selected.slice(1));
          setSelected(newSelected);
        }

        enqueueSnackbar("Đã xoá cửa hàng!", { variant: "success" });
        setPending(false);
      })
      .catch((err) => {
        console.error(err);
        if (!err?.status) {
          enqueueSnackbar("Server không phản hồi!", { variant: "error" });
        } else if (err?.status === 409) {
          enqueueSnackbar(err?.data?.message, { variant: "error" });
        } else if (err?.status === 400) {
          enqueueSnackbar("Id không hợp lệ!", { variant: "error" });
        } else {
          enqueueSnackbar("Xoá cửa hàng thất bại!", { variant: "error" });
        }
        setPending(false);
      });
  };

  const handleDeleteMultiples = async () => {
    if (pending) return;
    setPending(true);
    const { enqueueSnackbar } = await import("notistack");

    if (selectedAll) {
      if (deselected.length == 0) {
        //Delete all
        deleteAll(shop)
          .unwrap()
          .then((data) => {
            //Unselected
            setSelected([]);
            setDeseletected([]);
            setSelectedAll(false);
            enqueueSnackbar("Đã xoá cửa hàng!", { variant: "success" });
            setPending(false);
          })
          .catch((err) => {
            console.error(err);
            if (!err?.status) {
              enqueueSnackbar("Server không phản hồi!", { variant: "error" });
            } else if (err?.status === 409) {
              enqueueSnackbar(err?.data?.message, { variant: "error" });
            } else if (err?.status === 400) {
              enqueueSnackbar("Id không hợp lệ!", { variant: "error" });
            } else {
              enqueueSnackbar("Xoá cửa hàng thất bại!", { variant: "error" });
            }
            setPending(false);
          });
      } else {
        //Delete shops inverse
        deleteShopsInverse({
          keyword: filters.keyword,
          userId: filters.userId,
          ids: deselected,
        })
          .unwrap()
          .then((data) => {
            //Unselected
            setSelected([]);
            setDeseletected([]);
            setSelectedAll(false);
            enqueueSnackbar("Đã xoá cửa hàng!", { variant: "success" });
            setPending(false);
          })
          .catch((err) => {
            console.error(err);
            if (!err?.status) {
              enqueueSnackbar("Server không phản hồi!", { variant: "error" });
            } else if (err?.status === 409) {
              enqueueSnackbar(err?.data?.message, { variant: "error" });
            } else if (err?.status === 400) {
              enqueueSnackbar("Id không hợp lệ!", { variant: "error" });
            } else {
              enqueueSnackbar("Xoá cửa hàng thất bại!", { variant: "error" });
            }
            setPending(false);
          });
      }
    } else {
      //Delete shops
      deleteShops(selected)
        .unwrap()
        .then((data) => {
          //Unselected
          setSelected([]);
          setDeseletected([]);
          setSelectedAll(false);
          enqueueSnackbar("Đã xoá cửa hàng!", { variant: "success" });
          setPending(false);
        })
        .catch((err) => {
          console.error(err);
          if (!err?.status) {
            enqueueSnackbar("Server không phản hồi!", { variant: "error" });
          } else if (err?.status === 409) {
            enqueueSnackbar(err?.data?.message, { variant: "error" });
          } else if (err?.status === 400) {
            enqueueSnackbar("Id không hợp lệ!", { variant: "error" });
          } else {
            enqueueSnackbar("Xoá cửa hàng thất bại!", { variant: "error" });
          }
          setPending(false);
        });
    }
  };

  const isSelected = (id) =>
    (!selectedAll && selected?.indexOf(id) !== -1) ||
    (selectedAll && deselected?.indexOf(id) === -1);
  const numSelected = selectedAll
    ? data?.totalElements - deselected?.length
    : selected?.length;
  const colSpan = headCells.length + 1;
  //#endregion

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
          <Progress color="primary" />
        </TableCell>
      </TableRow>
    );
  } else if (isSuccess) {
    const { ids, entities } = data;

    shopRows = ids?.length ? (
      ids?.map((id, index) => {
        const shop = entities[id];
        const isItemSelected = isSelected(id);
        const labelId = `enhanced-table-checkbox-${index}`;
        const date = new Date(shop?.joinedDate);

        return (
          <TableRow hover aria-checked={isItemSelected} tabIndex={-1} key={id}>
            <TableCell padding="checkbox">
              <Checkbox
                color="primary"
                onChange={(e) => handleClick(e, id)}
                checked={isItemSelected}
                inputProps={{
                  "aria-labelledby": labelId,
                }}
              />
            </TableCell>
            <TableCell
              component="th"
              id={labelId}
              scope="row"
              padding="none"
              align="center"
            >
              <Link to={`/product/${id}`}>{idFormatter(id)}</Link>
            </TableCell>
            <TableCell align="left">
              <Link
                to={`dashboard/shop/${id}`}
                style={{ display: "flex", alignItems: "center" }}
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
              <IconButton onClick={(e) => handleOpenContext(e, id)}>
                <MoreHoriz />
              </IconButton>
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
      <Toolbar>
        <ShopFilters {...{ isAdmin, userId: id, filters, setFilters }} />
      </Toolbar>
      <TableContainer component={Paper}>
        <Table stickyHeader size={dense ? "small" : "medium"}>
          <CustomTableHead
            headCells={headCells}
            numSelected={numSelected}
            sortBy={pagination.sortBy}
            sortDir={pagination.sortDir}
            onSelectAllClick={handleSelectAllClick}
            onRequestSort={handleRequestSort}
            onSubmitDelete={handleDeleteMultiples}
            selectedAll={selectedAll}
          />
          <TableBody>{shopRows}</TableBody>
        </Table>
      </TableContainer>
      <FooterContainer>
        <Box pl={2}>
          <FormControlLabel
            control={<Switch checked={dense} onChange={handleChangeDense} />}
            label={<FooterLabel>Thu gọn</FooterLabel>}
          />
        </Box>
        <CustomTablePagination
          pagination={pagination}
          onPageChange={handleChangePage}
          onSizeChange={handleChangeRowsPerPage}
          count={data?.totalElements ?? 0}
        />
      </FooterContainer>
      <Menu open={openContext} onClose={handleCloseContext} anchorEl={anchorEl}>
        <Link to={`/product/${contextId}`}>
          <MenuItem>
            <ListItemIcon>
              <Visibility fontSize="small" />
            </ListItemIcon>
            <ListItemText>Xem chi tiết</ListItemText>
          </MenuItem>
        </Link>
        <MenuItem onClick={() => handleOpenEdit(contextId)}>
          <ListItemIcon>
            <Edit fontSize="small" />
          </ListItemIcon>
          <ListItemText>Thay đổi</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleDelete(contextId)}>
          <ListItemIcon>
            <Delete color="error" fontSize="small" />
          </ListItemIcon>
          <ListItemText color="error">Xoá</ListItemText>
        </MenuItem>
      </Menu>
    </Paper>
  );
}
