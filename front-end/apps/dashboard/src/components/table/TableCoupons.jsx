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
  TextField,
  MenuItem,
  Menu,
  ListItemIcon,
  ListItemText,
  Stack,
  Toolbar,
  Button,
  Chip,
} from "@mui/material";
import {
  Search,
  MoreHoriz,
  Edit,
  Delete,
  FilterAltOff,
} from "@mui/icons-material";
import { ItemTitle, FooterContainer, FooterLabel } from "../custom/Components";
import {
  idFormatter,
  useDeepEffect,
  getCouponType,
  dateFormatter,
} from "@ring/shared";
import { Progress } from "@ring/ui";
import CustomTableHead from "./CustomTableHead";
import CustomTablePagination from "./CustomTablePagination";
import {
  useGetCouponsQuery,
  useDeleteAllCouponsMutation,
  useDeleteCouponMutation,
  useDeleteCouponsInverseMutation,
  useDeleteCouponsMutation,
} from "../../features/coupons/couponsApiSlice";

const CouponType = getCouponType();
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
    id: "code",
    align: "left",
    width: "130px",
    disablePadding: false,
    sortable: true,
    label: "Mã",
  },
  {
    id: "detail.discount",
    align: "left",
    disablePadding: false,
    sortable: true,
    label: "Điều kiện",
  },
  {
    id: "shop.id",
    align: "left",
    width: "120px",
    disablePadding: false,
    sortable: true,
    label: "Shop",
  },
  {
    id: "detail.expDate",
    align: "left",
    width: "110px",
    disablePadding: false,
    sortable: true,
    label: "Hạn sử dụng",
  },
  {
    id: "detail.type",
    align: "left",
    width: "105px",
    disablePadding: false,
    sortable: true,
    label: "Thể loại",
  },
  {
    id: "action",
    width: "24px",
    disablePadding: false,
    sortable: false,
  },
];

function CouponFilters({ filters, setFilters }) {
  const inputRef = useRef();
  const [types, setTypes] = useState(filters.types);

  const handleChangeTypes = useCallback((e) => {
    const value = e.target.value;
    if (!types?.includes(value)) setTypes(value);
  }, []);

  const handleChangeCode = useCallback((e) => {
    e.preventDefault();
    if (inputRef)
      setFilters((prev) => ({ ...prev, code: inputRef.current.value }));
  }, []);

  const handleApplyTypes = () => {
    setFilters((prev) => ({ ...prev, types: types }));
  };

  const resetFilter = useCallback(() => {
    setFilters({
      code: "",
      cate: "",
      pubIds: [],
      types: [],
    });
    setTypes([]);
    if (inputRef) inputRef.current.value = "";
  }, []);

  return (
    <Stack
      width="100%"
      spacing={1}
      my={2}
      direction={{ xs: "column", md: "row" }}
    >
      <TextField
        label="Lọc theo hạn"
        value={filters.showExpired || ""}
        onChange={(e) =>
          setFilters({ ...filters, showExpired: e.target.value })
        }
        select
        size="small"
        fullWidth
        sx={{ maxWidth: { xs: "auto", md: 200 } }}
      >
        <MenuItem value="">Còn hạn</MenuItem>
        <MenuItem value="all">Tất cả (Bao gồm hết hạn)</MenuItem>
      </TextField>
      <TextField
        label="Lọc theo sở hữu"
        value={filters.byShop || ""}
        onChange={(e) => setFilters({ ...filters, byShop: e.target.value })}
        select
        size="small"
        fullWidth
        sx={{ maxWidth: { xs: "auto", md: 200 } }}
      >
        <MenuItem value="">Tất cả</MenuItem>
        <MenuItem value="ring">RING!</MenuItem>
        <MenuItem value="shop">Cửa hàng</MenuItem>
      </TextField>
      <TextField
        label="Thể loại"
        select
        size="small"
        fullWidth
        slotProps={{
          select: {
            multiple: true,
            value: types,
            onChange: (e) => handleChangeTypes(e),
            onClose: handleApplyTypes,
            renderValue: (selected) => {
              const filteredLabel = selected?.map(
                (value) => CouponType[value].label
              );
              return filteredLabel.join(", ");
            },
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
        {Object.values(CouponType).map((type, index) => (
          <MenuItem key={`type-${type.value}-${index}`} value={type.value}>
            <Checkbox
              sx={{ py: 0.5, pr: 1, pl: 0 }}
              disableRipple
              checked={types?.includes(type.value)}
            />
            <ListItemText primary={type.label} />
          </MenuItem>
        ))}
      </TextField>
      <form style={{ width: "100%" }} onSubmit={handleChangeCode}>
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

export default function TableCoupons({
  shop,
  userId,
  isAdmin,
  handleOpenEdit,
  pending,
  setPending,
}) {
  //#region construct
  const [selected, setSelected] = useState([]);
  const [deselected, setDeseletected] = useState([]);
  const [selectedAll, setSelectedAll] = useState(false);
  const [dense, setDense] = useState(true);
  const [filters, setFilters] = useState({
    code: "",
    types: [],
    showExpired: "",
    byShop: "",
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
  const [deleteCoupon] = useDeleteCouponMutation();
  const [deleteCoupons] = useDeleteCouponsMutation();
  const [deleteCouponsInverse] = useDeleteCouponsInverseMutation();
  const [deleteAll] = useDeleteAllCouponsMutation();

  //Fetch coupons
  const { data, isLoading, isSuccess, isError, error } = useGetCouponsQuery(
    {
      page: pagination?.number,
      size: pagination?.size,
      sortBy: pagination?.sortBy,
      sortDir: pagination?.sortDir,
      shopId: shop ?? "",
      code: filters.code,
      showExpired: filters.showExpired == "all" ? true : null,
      byShop:
        filters.byShop == "ring"
          ? false
          : filters.byShop == "shop"
            ? true
            : null,
      types: filters.types ?? "",
      userId: isAdmin ? null : userId,
    },
    { skip: !userId }
  );

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

    deleteCoupon(id)
      .unwrap()
      .then((data) => {
        //Unselected
        const selectedIndex = selected.indexOf(id);
        let newSelected = [];

        if (selectedIndex === 0) {
          newSelected = newSelected.concat(selected.slice(1));
          setSelected(newSelected);
        }

        enqueueSnackbar("Đã xoá mã giảm giá!", { variant: "success" });
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
          enqueueSnackbar("Xoá mã giảm giá thất bại!", { variant: "error" });
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
            enqueueSnackbar("Đã xoá mã giảm giá!", { variant: "success" });
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
              enqueueSnackbar("Xoá mã giảm giá thất bại!", {
                variant: "error",
              });
            }
            setPending(false);
          });
      } else {
        //Delete coupons inverse
        deleteCouponsInverse({
          shopId: shop ?? "",
          code: filters.code,
          showExpired: filters.showExpired,
          types: filters.types ?? "",
          ids: deselected,
        })
          .unwrap()
          .then((data) => {
            //Unselected
            setSelected([]);
            setDeseletected([]);
            setSelectedAll(false);
            enqueueSnackbar("Đã xoá mã giảm giá!", { variant: "success" });
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
              enqueueSnackbar("Xoá mã giảm giá thất bại!", {
                variant: "error",
              });
            }
            setPending(false);
          });
      }
    } else {
      //Delete coupons
      deleteCoupons(selected)
        .unwrap()
        .then((data) => {
          //Unselected
          setSelected([]);
          setDeseletected([]);
          setSelectedAll(false);
          enqueueSnackbar("Đã xoá mã giảm giá!", { variant: "success" });
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
            enqueueSnackbar("Xoá mã giảm giá thất bại!", { variant: "error" });
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
          <Progress color="primary" />
        </TableCell>
      </TableRow>
    );
  } else if (isSuccess) {
    const { ids, entities } = data;

    bookRows = ids?.length ? (
      ids?.map((id, index) => {
        const coupon = entities[id];
        const isItemSelected = isSelected(id);
        const labelId = `enhanced-table-checkbox-${index}`;
        const date = new Date(coupon?.expDate);
        const couponItem = CouponType[coupon?.type];

        return (
          <TableRow hover aria-checked={isItemSelected} tabIndex={-1} key={id}>
            <TableCell padding="checkbox">
              <Checkbox
                color="primary"
                onChange={(e) => handleClick(e, coupon.id)}
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
              {idFormatter(id)}
            </TableCell>
            <TableCell align="left">{coupon?.code}</TableCell>
            <TableCell align="left">
              <ItemTitle>{coupon?.summary}</ItemTitle>
              <ItemTitle className="secondary">{coupon?.condition}</ItemTitle>
            </TableCell>
            <TableCell align="left">
              <ItemTitle>{coupon?.shopName}</ItemTitle>
            </TableCell>
            <TableCell align="left">
              <ItemTitle>HSD: {dateFormatter(date)}</ItemTitle>
              <ItemTitle className="secondary">
                Còn {coupon?.usage} lần
              </ItemTitle>
            </TableCell>
            <TableCell align="left">
              <Chip
                variant="outlined"
                label={couponItem?.label}
                color={couponItem?.color}
                sx={{ fontWeight: "bold" }}
              />
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
          <Box>Không tìm thấy mã giảm giá nào!</Box>
        </TableCell>
      </TableRow>
    );
  } else if (isError) {
    bookRows = (
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
        <CouponFilters {...{ filters, setFilters }} />
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
          <TableBody>{bookRows}</TableBody>
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
