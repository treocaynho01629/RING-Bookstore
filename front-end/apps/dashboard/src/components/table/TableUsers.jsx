import { useState, useEffect, useRef, useCallback } from "react";
import {
  Box,
  Stack,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Paper,
  Checkbox,
  FormControlLabel,
  Switch,
  Avatar,
  Chip,
  TextField,
  MenuItem,
  IconButton,
  Toolbar,
  Menu,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import {
  Search,
  MoreHoriz,
  Edit,
  Delete,
  Visibility,
  FilterAltOff,
} from "@mui/icons-material";
import { Link } from "react-router";
import {
  useDeleteAllUsersMutation,
  useDeleteUserMutation,
  useDeleteUsersInverseMutation,
  useDeleteUsersMutation,
  useGetUsersQuery,
} from "../../features/users/usersApiSlice";
import { FooterLabel, ItemTitle, FooterContainer } from "../custom/Components";
import { Progress } from "@ring/ui";
import { useDeepEffect, getUserRole, idFormatter } from "@ring/shared";
import { useAppStore } from "@ring/redux";
import CustomTablePagination from "../table/CustomTablePagination";
import CustomTableHead from "../table/CustomTableHead";

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
    id: "username",
    align: "left",
    disablePadding: false,
    sortable: true,
    label: "Tên đăng nhập",
  },
  {
    id: "name",
    align: "left",
    width: "150px",
    disablePadding: false,
    sortable: true,
    label: "Thông tin",
  },
  {
    id: "roles",
    align: "left",
    width: "120px",
    disablePadding: false,
    sortable: false,
    label: "Quyền",
  },
  {
    id: "action",
    width: "35px",
    disablePadding: false,
    sortable: false,
    label: "",
  },
];

function UserFilters({ filters, setFilters }) {
  const store = useAppStore();
  const UserRole = getUserRole(store);

  const inputRef = useRef();

  const handleChangeKeyword = useCallback((e) => {
    e.preventDefault();
    if (inputRef)
      setFilters((prev) => ({ ...prev, keyword: inputRef.current.value }));
  }, []);

  const resetFilter = useCallback(() => {
    setFilters({
      keyword: "",
      role: "",
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
        label="Quyền"
        value={filters.role || ""}
        onChange={(e) => setFilters({ ...filters, role: e.target.value })}
        select
        defaultValue=""
        size="small"
        fullWidth
        sx={{ maxWidth: { xs: "auto", md: 200 } }}
      >
        <MenuItem value="">
          <em>--Tất cả--</em>
        </MenuItem>
        {Object.values(UserRole).map((role, index) => (
          <MenuItem key={`type-${role.value}-${index}`} value={role.value}>
            {role.label}
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

export default function TableUsers({ handleOpenEdit, pending, setPending }) {
  //#region construct
  const [selected, setSelected] = useState([]);
  const [deselected, setDeseletected] = useState([]);
  const [selectedAll, setSelectedAll] = useState(false);
  const [dense, setDense] = useState(true);
  const [filters, setFilters] = useState({
    keyword: "",
    role: "",
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

  //Delete hooks
  const [deleteUser] = useDeleteUserMutation();
  const [deleteUsers] = useDeleteUsersMutation();
  const [deleteUsersInverse] = useDeleteUsersInverseMutation();
  const [deleteAll] = useDeleteAllUsersMutation();

  const { isLoading, isSuccess, isError, error, data } = useGetUsersQuery({
    page: pagination.number,
    size: pagination.size,
    sortBy: pagination.sortBy,
    sortDir: pagination.sortDir,
    keyword: filters.keyword,
    role: filters.role,
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

    deleteUser(id)
      .unwrap()
      .then((data) => {
        //Unselected
        const selectedIndex = selected?.indexOf(id);
        let newSelected = [];

        if (selectedIndex === 0) {
          newSelected = newSelected.concat(selected.slice(1));
          setSelected(newSelected);
        }

        enqueueSnackbar("Đã xoá thành viên!", { variant: "success" });
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
          enqueueSnackbar("Xoá thành viên thất bại!", { variant: "error" });
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
        deleteAll()
          .unwrap()
          .then((data) => {
            //Unselected
            setSelected([]);
            setDeseletected([]);
            setSelectedAll(false);
            enqueueSnackbar("Đã xoá thành viên!", { variant: "success" });
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
              enqueueSnackbar("Xoá thành viên thất bại!", { variant: "error" });
            }
            setPending(false);
          });
      } else {
        //Delete users inverse
        deleteUsersInverse({
          keyword: filters.keyword,
          role: filters.role,
          ids: deselected,
        })
          .unwrap()
          .then((data) => {
            //Unselected
            setSelected([]);
            setDeseletected([]);
            setSelectedAll(false);
            enqueueSnackbar("Đã xoá thành viên!", { variant: "success" });
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
              enqueueSnackbar("Xoá thành viên thất bại!", { variant: "error" });
            }
            setPending(false);
          });
      }
    } else {
      //Delete users
      deleteUsers(selected)
        .unwrap()
        .then((data) => {
          //Unselected
          setSelected([]);
          setDeseletected([]);
          setSelectedAll(false);
          enqueueSnackbar("Đã xoá thành viên!", { variant: "success" });
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
            enqueueSnackbar("Xoá thành viên thất bại!", { variant: "error" });
          }
          setPending(false);
        });
    }
  };

  const isSelected = (id) =>
    selected?.indexOf(id) !== -1 ||
    (selectedAll && deselected?.indexOf(id) === -1);
  const numSelected = selectedAll
    ? data?.totalElements - deselected?.length
    : selected?.length;
  const colSpan = headCells.length + 1;
  //#endregion

  let usersRows;

  if (isLoading) {
    usersRows = (
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

    usersRows = ids?.length ? (
      ids?.map((id, index) => {
        const user = entities[id];
        const isItemSelected = isSelected(id);
        const labelId = `enhanced-table-checkbox-${index}`;
        const roleItem = UserRole[user.roles?.[0]];

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
              <Link to={`/user/${id}`}>{idFormatter(id)}</Link>
            </TableCell>
            <TableCell align="left">
              <Link
                to={`/user/${id}`}
                style={{ display: "flex", alignItems: "center" }}
              >
                <Avatar sx={{ marginRight: 1 }} src={user?.image ?? null}>
                  {user?.username?.charAt(0) ?? ""}
                </Avatar>
                <Box>
                  <ItemTitle>{user.username}</ItemTitle>
                  <ItemTitle className="secondary">{user.email}</ItemTitle>
                </Box>
              </Link>
            </TableCell>
            <TableCell align="left">
              <ItemTitle>{user?.name}</ItemTitle>
              <ItemTitle className="secondary">{user?.phone}</ItemTitle>
            </TableCell>
            <TableCell align="left">
              <Chip
                variant="outlined"
                label={`${roleItem?.label}${user?.roles?.length > 1 ? " +" + (user.roles.length - 1) : ""}`}
                color={roleItem?.color}
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
          <Box>Không tìm thấy thành viên nào!</Box>
        </TableCell>
      </TableRow>
    );
  } else if (isError) {
    usersRows = (
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
        <UserFilters {...{ filters, setFilters }} />
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
          <TableBody>{usersRows}</TableBody>
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
        <Link to={`/user/${contextId}`}>
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
