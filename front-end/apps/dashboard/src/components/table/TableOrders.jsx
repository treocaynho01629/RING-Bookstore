import { useState, useEffect, Fragment, useCallback, useRef } from "react";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  FormControlLabel,
  Switch,
  Collapse,
  TextField,
  MenuItem,
  Avatar,
  Checkbox,
  Chip,
  Badge,
  Toolbar,
  Button,
  Stack,
} from "@mui/material";
import {
  FilterAltOff,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
  Search,
} from "@mui/icons-material";
import { Link } from "react-router";
import { useGetReceiptsQuery } from "../../features/orders/ordersApiSlice";
import {
  currencyFormat,
  dateFormatter,
  idFormatter,
  getOrderStatus,
  timeFormatter,
} from "@ring/shared";
import { Progress } from "@ring/ui";
import { FooterContainer, FooterLabel, ItemTitle } from "../custom/Components";
import CustomTableHead from "../table/CustomTableHead";
import CustomTablePagination from "../table/CustomTablePagination";

const OrderStatus = getOrderStatus();
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
    id: "user.username",
    align: "left",
    width: "200px",
    disablePadding: false,
    sortable: true,
    label: "Khách hàng",
  },
  {
    id: "address.address",
    align: "left",
    disablePadding: false,
    sortable: true,
    label: "Thông tin",
  },
  {
    id: "createdDate",
    align: "left",
    width: "110px",
    disablePadding: false,
    sortable: true,
    label: "Thời gian",
  },
  {
    id: "total",
    align: "left",
    width: "200px",
    disablePadding: false,
    sortable: true,
    label: "Tổng thống kê",
  },
  {
    id: "action",
    width: "35px",
    disablePadding: false,
    sortable: false,
    label: "",
  },
];

const detailHeadCells = [
  {
    id: "id",
    align: "left",
    width: "70px",
    label: "ID",
  },
  {
    id: "shop",
    align: "left",
    label: "Cửa hàng",
  },
  {
    id: "total",
    align: "left",
    width: "230px",
    label: "Thành tiền(đ)",
  },
  {
    id: "status",
    align: "left",
    width: "150px",
    label: "Trạng thái",
  },
];

function OrderFilters({ filters, setFilters }) {
  const inputRef = useRef();

  const handleChangeKeyword = useCallback((e) => {
    e.preventDefault();
    if (inputRef)
      setFilters((prev) => ({ ...prev, keyword: inputRef.current.value }));
  }, []);

  const resetFilter = useCallback(() => {
    setFilters({
      keyword: "",
      status: "",
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
      <TextField
        label="Trạng thái"
        select
        defaultValue=""
        fullWidth
        size="small"
        value={filters.status || ""}
        onChange={(e) => setFilters({ ...filters, status: e.target.value })}
        sx={{ maxWidth: { xs: "auto", md: 200 } }}
      >
        <MenuItem value="">Tất cả</MenuItem>
        {Object.values(OrderStatus).map((tab, index) => (
          <MenuItem key={`tab-${index}`} value={tab.value}>
            {tab.label}
          </MenuItem>
        ))}
      </TextField>
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

function OrderRow({
  isSelected,
  isOrderSelected,
  index,
  id,
  order,
  dense,
  handleClick,
  onSelectAllDetail,
  colSpan,
}) {
  const [open, setOpen] = useState(false);
  const isItemSelected = isOrderSelected(id);
  const labelId = `order-checkbox-${index}`;
  const date = new Date(order.date);

  const toggleOpen = (e, id) => {
    setOpen((prev) => ({ ...prev, [id]: !prev[id] }));
    e.stopPropagation();
  };

  return (
    <Fragment key={index}>
      <TableRow
        hover
        tabIndex={-1}
        key={id}
        aria-checked={isItemSelected}
        selected={isItemSelected}
      >
        <TableCell padding="checkbox">
          <Checkbox
            checked={isItemSelected}
            onChange={(e) => onSelectAllDetail(e, order)}
            inputProps={{ "aria-label": "Chọn tất cả chi tiết" }}
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
        <TableCell align="left">
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Avatar sx={{ marginRight: 1 }} src={order?.image ?? null}>
              {order?.username?.charAt(0) ?? ""}
            </Avatar>
            <Box>
              <ItemTitle>{order.fullName}</ItemTitle>
              <ItemTitle className="secondary">{order.email}</ItemTitle>
            </Box>
          </Box>
        </TableCell>
        <TableCell align="left">
          <Box>
            <ItemTitle className="address">{order.address}</ItemTitle>
            <ItemTitle className="secondary">SĐT: {order.phone}</ItemTitle>
          </Box>
        </TableCell>
        <TableCell align="left">
          <Box>
            <ItemTitle>{dateFormatter(date)}</ItemTitle>
            <ItemTitle className="secondary">{timeFormatter(date)}</ItemTitle>
          </Box>
        </TableCell>
        <TableCell align="left">
          <Box>
            <ItemTitle>
              {currencyFormat.format(order.total - order.totalDiscount)}
            </ItemTitle>
          </Box>
        </TableCell>
        <TableCell align="left">
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={(e) => toggleOpen(e, id)}
          >
            <Badge color="primary" variant="dot" invisible={!isItemSelected}>
              {open[id] ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
            </Badge>
          </IconButton>
        </TableCell>
      </TableRow>
      <TableRow sx={{ display: open[id] ? "table-row" : "none" }}>
        <TableCell
          sx={{ padding: 1, backgroundColor: "action.hover" }}
          colSpan={colSpan()}
        >
          <Collapse in={open[id]} timeout={250} unmountOnExit>
            <Table aria-label="order-details" size={dense ? "small" : "medium"}>
              <TableHead
                sx={{ backgroundColor: "background.default", height: "42px" }}
              >
                <TableRow>
                  <TableCell padding="checkbox"></TableCell>
                  {detailHeadCells.map((headCell, index) => (
                    <TableCell
                      key={`${headCell.id}-${index}`}
                      align={headCell.align}
                      style={{ width: headCell.width }}
                    >
                      {headCell.label}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {order?.details.map((detail, index) => {
                  const itemStatus = OrderStatus[detail.status];
                  const isDetailSelected = isSelected(detail.id);
                  const detailLabelId = `detail-checkbox-${index}`;

                  return (
                    <TableRow
                      key={`detail-${detail.id}-${index}`}
                      hover
                      tabIndex={-1}
                      aria-checked={isDetailSelected}
                      selected={isDetailSelected}
                      sx={{ backgroundColor: "background.default" }}
                    >
                      <TableCell padding="checkbox">
                        <Checkbox
                          onChange={() => handleClick(order, detail.id)}
                          checked={isDetailSelected}
                          inputProps={{
                            "aria-labelledby": detailLabelId,
                          }}
                        />
                      </TableCell>
                      <TableCell
                        component="th"
                        id={detailLabelId}
                        scope="row"
                        padding="none"
                        align="center"
                      >
                        {idFormatter(detail?.id)}
                      </TableCell>
                      <TableCell align="left">
                        <Link
                          to={`/shop/${detail.shopId}`}
                          style={{ display: "flex", alignItems: "center" }}
                        >
                          <Box>
                            <ItemTitle>{detail.shopName}</ItemTitle>
                            <ItemTitle className="secondary">
                              ID: {idFormatter(detail.shopId)}
                            </ItemTitle>
                          </Box>
                        </Link>
                      </TableCell>
                      <TableCell align="left">
                        <Box>
                          <ItemTitle>
                            {currencyFormat.format(
                              detail.totalPrice +
                                detail.shippingFee -
                                detail.totalDiscount -
                                detail.shippingDiscount
                            )}
                          </ItemTitle>
                          <ItemTitle className="secondary">
                            Số SP: {detail.totalItems}
                          </ItemTitle>
                        </Box>
                      </TableCell>
                      <TableCell align="left">
                        <Chip
                          label={itemStatus.label}
                          color={itemStatus.color}
                          sx={{ fontWeight: "bold" }}
                          variant="outlined"
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Collapse>
        </TableCell>
      </TableRow>
    </Fragment>
  );
}

export default function TableOrders({ shop }) {
  //#region construct
  const [selected, setSelected] = useState([]);
  const [deselected, setDeseletected] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState([]); //For counting elements in table toolbar
  const [deselectedOrder, setDeselectedOrder] = useState([]);
  const [selectedAll, setSelectedAll] = useState(false);
  const [dense, setDense] = useState(true);
  const [filters, setFilters] = useState({
    keyword: "",
    status: "",
  });
  const [pagination, setPagination] = useState({
    number: 0,
    size: 10,
    totalPages: 0,
    sortBy: "lastModifiedDate",
    sortDir: "desc",
  });

  //Fetch receipts
  const { data, isLoading, isSuccess, isError, error } = useGetReceiptsQuery({
    shopId: shop ?? "",
    status: filters?.status,
    keyword: filters?.keyword,
    page: pagination?.number,
    size: pagination?.size,
    sortBy: pagination?.sortBy,
    sortDir: pagination?.sortDir,
  });

  //Set pagination after fetch
  useEffect(() => {
    if (!isLoading && isSuccess && data) {
      setPagination({
        ...pagination,
        totalPages: data?.totalPages,
        currPage: data?.page,
        pageSize: data?.size,
      });
    }
  }, [data]);

  const handleRequestSort = (e, property) => {
    const isAsc =
      pagination.sortBy === property && pagination.sortDir === "asc";
    const sortDir = isAsc ? "desc" : "asc";
    setPagination({ ...pagination, sortBy: property, sortDir: sortDir });
  };

  const handleSelectAllClick = (e) => {
    setSelected([]);
    setDeseletected([]);
    setSelectedOrder([]);
    setDeselectedOrder([]);

    if (e.target.checked) {
      //Selected all
      setSelectedAll(true);
    } else {
      //Unselected all
      setSelectedAll(false);
    }
  };

  const onSelectAllDetail = (e, order) => {
    //Determines which boxes gonna change
    let newSelected = [];
    let newDeselected = [];
    let changed = order?.details;
    changed = changed
      .filter((detail) => e.target.checked !== isSelected(detail.id))
      .map((detail) => detail.id);

    if (e.target.checked) {
      //If check all the empty boxes
      if (selectedAll) {
        //Remove boxes from deselected[]
        newDeselected = deselected;
        newDeselected = newDeselected.filter(
          (id) => changed.indexOf(id) === -1
        );

        setDeseletected(newDeselected);
      } else {
        //Add new boxes to selected[]
        newSelected = selected.concat(changed);
        newSelected = [...new Set(newSelected)];

        setSelected(newSelected);
      }
    } else {
      //Uncheck all selected boxes
      if (selectedAll) {
        //Add boxes to deselected[]
        newDeselected = deselected.concat(changed);
        newDeselected = [...new Set(newDeselected)];

        setDeseletected(newDeselected);
      } else {
        //Remove boxes from selected[]
        let newSelected = selected;
        newSelected = newSelected.filter((id) => changed.indexOf(id) === -1);

        setSelected(newSelected);
      }
    }

    const isOrderSelected =
      order?.details.some((detail) => newSelected?.includes(detail.id)) ||
      (selectedAll &&
        order?.details.some((detail) => !newDeselected?.includes(detail.id)));
    handleSelectedOrder(order.id, isOrderSelected);
  };

  const handleClick = (order, id) => {
    let newDeselected = [];
    let newSelected = [];

    if (selectedAll) {
      //Set unselected elements for reverse
      const deselectedIndex = deselected?.indexOf(id);

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
    } else {
      //Set main selected elements
      const selectedIndex = selected?.indexOf(id);

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
    }

    const isOrderSelected =
      order?.details.some((detail) => newSelected?.includes(detail.id)) ||
      (selectedAll &&
        order?.details.some((detail) => !newDeselected?.includes(detail.id)));
    handleSelectedOrder(order.id, isOrderSelected);
  };

  const handleSelectedOrder = (orderId, isOrderSelected) => {
    if (selectedAll) {
      const deselectedIndex = deselectedOrder?.indexOf(orderId);
      let newDeselected = [];

      if (isOrderSelected) {
        if (deselectedIndex === 0) {
          newDeselected = newDeselected.concat(deselectedOrder.slice(1));
        } else if (deselectedIndex === deselectedOrder?.length - 1) {
          newDeselected = newDeselected.concat(deselectedOrder.slice(0, -1));
        } else if (deselectedIndex > 0) {
          newDeselected = newDeselected.concat(
            deselectedOrder.slice(0, deselectedIndex),
            deselectedOrder.slice(deselectedIndex + 1)
          );
        } else {
          newDeselected = newDeselected.concat(deselectedOrder);
        }
      } else {
        newDeselected = newDeselected.concat(deselectedOrder, orderId);
      }

      setDeselectedOrder(newDeselected);
      if (newDeselected.length == data?.totalElements) {
        setDeselectedOrder([]);
        setSelectedAll(false);
      }
    } else {
      const selectedIndex = selectedOrder?.indexOf(orderId);
      let newSelected = [];

      if (isOrderSelected) {
        if (selectedIndex === -1) {
          newSelected = newSelected.concat(selectedOrder, orderId);
        } else {
          newSelected = newSelected.concat(selectedOrder);
        }
      } else {
        if (selectedIndex === 0) {
          newSelected = newSelected.concat(selectedOrder.slice(1));
        } else if (selectedIndex === selectedOrder?.length - 1) {
          newSelected = newSelected.concat(selectedOrder.slice(0, -1));
        } else if (selectedIndex > 0) {
          newSelected = newSelected.concat(
            selectedOrder.slice(0, selectedIndex),
            selectedOrder.slice(selectedIndex + 1)
          );
        } else {
          newSelected = newSelected.concat(selectedOrder);
        }
      }

      setSelectedOrder(newSelected);
      if (newSelected.length == data?.totalElements) {
        setSelectedOrder(true);
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

  const handleChangeDense = (e) => {
    setDense(e.target.checked);
  };

  const handleDeleteMultiples = async () => {
    if (selectedAll) {
      if (deselected.length == 0) {
        console.log("Delete all");
      } else {
        console.log("Delete multiples reverse: " + deselected);
      }
    } else {
      console.log("Delete multiples: " + selected);
    }
    // if (pending) return;
    // setPending(true);
    // const { enqueueSnackbar } = await import('notistack');

    // deleteMultipleUsers({ ids: selected }).unwrap()
    //   .then((data) => {
    //     //Unselected
    //     setSelected([]);
    //     setSelectedAll(false);
    //     enqueueSnackbar('Đã xoá thành viên!', { variant: 'success' });
    //     setPending(false);
    //   })
    //   .catch((err) => {
    //     console.error(err);
    //     if (!err?.status) {
    //       enqueueSnackbar('Server không phản hồi!', { variant: 'error' });
    //     } else if (err?.status === 409) {
    //       enqueueSnackbar(err?.data?.message, { variant: 'error' });
    //     } else if (err?.status === 400) {
    //       enqueueSnackbar('Id không hợp lệ!', { variant: 'error' });
    //     } else {
    //       enqueueSnackbar('Xoá thành viên thất bại!', { variant: 'error' });
    //     }
    //     setPending(false);
    //   })
  };

  const isSelected = (id) =>
    selected?.indexOf(id) !== -1 ||
    (selectedAll && deselected?.indexOf(id) === -1);
  const isOrderSelected = (orderId) =>
    selectedOrder?.indexOf(orderId) !== -1 ||
    (selectedAll && deselectedOrder?.indexOf(orderId) === -1);
  const numSelected = () =>
    selectedAll
      ? data?.totalElements - [...new Set(deselectedOrder)]?.length
      : [...new Set(selectedOrder)]?.length;
  const colSpan = () => headCells.length + 1;
  //#endregion

  let orderRows;

  if (isLoading) {
    orderRows = (
      <TableRow>
        <TableCell
          scope="row"
          padding="none"
          align="center"
          colSpan={colSpan()}
          sx={{ position: "relative", height: 300 }}
        >
          <Progress color="primary" />
        </TableCell>
      </TableRow>
    );
  } else if (isSuccess) {
    const { ids, entities } = data;

    orderRows = ids?.length ? (
      ids?.map((id, index) => {
        const order = entities[id];

        return (
          <OrderRow
            key={index}
            {...{
              index,
              id,
              order,
              isSelected,
              isOrderSelected,
              dense,
              handleClick,
              onSelectAllDetail,
              colSpan,
            }}
          />
        );
      })
    ) : (
      <TableRow>
        <TableCell
          scope="row"
          padding="none"
          align="center"
          colSpan={colSpan()}
          sx={{ height: 300 }}
        >
          <Box>Không tìm thấy đơn hàng nào!</Box>
        </TableCell>
      </TableRow>
    );
  } else if (isError) {
    orderRows = (
      <TableRow>
        <TableCell
          scope="row"
          padding="none"
          align="center"
          colSpan={colSpan()}
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
        <OrderFilters {...{ filters, setFilters }} />
      </Toolbar>
      <TableContainer>
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
          <TableBody>{orderRows}</TableBody>
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
    </Paper>
  );
}
