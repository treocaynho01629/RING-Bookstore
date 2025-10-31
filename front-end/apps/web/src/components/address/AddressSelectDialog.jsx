import styled from "@emotion/styled";
import { useEffect, useState, lazy, Suspense, Fragment } from "react";
import {
  useCreateAddressMutation,
  useDeleteAddressMutation,
  useGetMyAddressesQuery,
  useUpdateAddressMutation,
} from "../../features/addresses/addressesApiSlice";
import { ReactComponent as EmptyIcon } from "@ring/shared/assets/empty";
import { Message } from "@ring/ui/Components";
import useConfirm from "@ring/shared/useConfirm";
import Dialog from "@mui/material/Dialog";
import Button from "@mui/material/Button";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import useMediaQuery from "@mui/material/useMediaQuery";
import DialogTitle from "@mui/material/DialogTitle";
import CircularProgress from "@mui/material/CircularProgress";
import AddHome from "@mui/icons-material/AddHome";
import Check from "@mui/icons-material/Check";
import Delete from "@mui/icons-material/Delete";
import Home from "@mui/icons-material/Home";
import LocationOn from "@mui/icons-material/LocationOn";
import Close from "@mui/icons-material/Close";
import AddressItem from "./AddressItem";
import useAddress from "../../hooks/useAddress";

const AddressForm = lazy(() => import("./AddressForm"));

//#region styled
const MessageContainer = styled.div`
  min-height: 60dvh;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const PlaceholderContainer = styled.div`
  min-height: 50dvh;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const StyledEmptyIcon = styled(EmptyIcon)`
  height: 70px;
  width: 70px;
  margin: ${({ theme }) => theme.spacing(1)} 0;
  fill: ${({ theme }) => theme.vars.palette.text.icon};
`;
//#endregion

const AddressSelectDialog = ({
  address,
  loggedIn = true,
  pending,
  setPending,
  setAddressInfo,
  openDialog,
  handleCloseDialog,
}) => {
  const {
    addresses: storeAddresses,
    addNewAddress,
    removeAddress,
  } = useAddress();
  const [openForm, setOpenForm] = useState(false); //Dialog open state
  const [err, setErr] = useState("");
  const [errMsg, setErrMsg] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const [contextAddress, setContextAddress] = useState(null);
  const [selectedValue, setSelectedValue] = useState(-1);
  const openContext = Boolean(anchorEl);
  const fullScreen = useMediaQuery((theme) => theme.breakpoints.down("sm"));
  const [ConfirmationDialog, confirm] = useConfirm(
    "Xoá địa chỉ?",
    "Xoá địa chỉ khỏi sổ địa chỉ?"
  );

  // Fetch addresses
  const { data, isLoading, isSuccess, isError, error } = useGetMyAddressesQuery(
    {},
    { skip: !loggedIn }
  );

  // Update address
  const [createAddress, { isLoading: creating }] = useCreateAddressMutation();
  const [updateAddress, { isLoading: updating }] = useUpdateAddressMutation();
  const [deleteAddress, { isLoading: deleting }] = useDeleteAddressMutation();

  useEffect(() => {
    if (selectedValue == -1) {
      handleSetAddress(address);
    } else {
      handleSetAddress();
    }
  }, [address, storeAddresses]);

  // Dialog
  const handleOpen = (addressInfo) => {
    setContextAddress(addressInfo);
    setOpenForm(true);
  };

  const handleClose = () => {
    setContextAddress(null);
    setErr("");
    setOpenForm(false);
  };

  // Context
  const handleClick = (event, address) => {
    setAnchorEl(event.currentTarget);
    setContextAddress(address);
  };

  const handleCloseContext = () => {
    setAnchorEl(null);
    setContextAddress(null);
  };

  const handleRemoveAddress = (address) => {
    if (pending || creating || updating || deleting) return;
    setPending(true);

    try {
      let isStored = address?.isDefault == null;

      if (isStored) {
        removeAddress(address.id);
        handleClose();
        handleCloseContext();
        setPending(false);
      } else {
        deleteAddress(address.id)
          .unwrap()
          .then((data) => {
            handleClose();
            handleCloseContext();
            setErrMsg("");
            setErr([]);
            setPending(false);
          })
          .catch((err) => {
            console.error(err);
            setErr(err);
            if (!err?.status) {
              setErrMsg("Server không phản hồi");
            } else if (err?.status === 400) {
              setErrMsg("Sai định dạng thông tin!");
            } else {
              setErrMsg("Xoá địa chỉ thất bại");
            }
            setPending(false);
          });
      }
    } catch (err) {
      console.error(err);
      setErr(err);
      handleClose();
      handleCloseContext();
      setPending(false);
    }
  };

  const handleCreateAddress = async (
    address,
    isDefault = false,
    isTemp = false
  ) => {
    if (pending || creating || updating || deleting) return;
    setPending(true);
    const { enqueueSnackbar } = await import("notistack");

    try {
      if (isTemp) {
        const { isDefault, ...newAddress } = address; // Remove isDefault
        addNewAddress(newAddress);
        handleClose();
        setErrMsg("");
        setErr([]);
        setPending(false);
        enqueueSnackbar("Thêm địa chỉ thành công!", { variant: "success" });
      } else {
        // Saved address
        createAddress({
          name: address.name,
          companyName: address.company,
          phone: address.phone,
          city: address.city,
          address: address.address,
          type: address.type,
          isDefault,
        })
          .unwrap()
          .then((data) => {
            handleClose();
            handleCloseContext();
            setErrMsg("");
            setErr([]);
            setPending(false);
            enqueueSnackbar("Thêm địa chỉ thành công!", { variant: "success" });
          })
          .catch((err) => {
            console.error(err);
            setErr(err);
            if (!err?.status) {
              setErrMsg("Server không phản hồi");
            } else {
              setErrMsg(err?.data?.message);
            }
            setPending(false);
            enqueueSnackbar("Thêm địa chỉ thất bại!", { variant: "error" });
          });
      }
    } catch (err) {
      // Redux error
      console.error(err);
      setErr(err);
      handleClose();
      handleCloseContext();
      setPending(false);
      enqueueSnackbar("Thêm địa chỉ thất bại!", { variant: "error" });
    }
  };

  const handleUpdateAddress = async (address, isDefault = false) => {
    if (pending || creating || updating || deleting) return;
    setPending(true);
    const { enqueueSnackbar } = await import("notistack");

    try {
      let isStored = address?.isDefault == null;

      if (isStored) {
        // If stored address
        const { isDefault, ...newAddress } = address; // Remove isDefault
        addNewAddress({ ...newAddress, id: address?.id });
        handleClose();
        handleCloseContext();
        setErrMsg("");
        setErr([]);
        setPending(false);
        enqueueSnackbar("Cập nhật địa chỉ thành công!", { variant: "success" });
      } else {
        // Saved address
        updateAddress({
          id: address.id,
          updatedAddress: {
            name: address.name,
            companyName: address.company,
            phone: address.phone,
            city: address.city,
            address: address.address,
            type: address.type,
            isDefault,
          },
        })
          .unwrap()
          .then((data) => {
            handleClose();
            handleCloseContext();
            setErrMsg("");
            setErr([]);
            setPending(false);
            enqueueSnackbar("Cập nhật địa chỉ thành công!", {
              variant: "success",
            });
          })
          .catch((err) => {
            console.error(err);
            setErr(err);
            if (!err?.status) {
              setErrMsg("Server không phản hồi");
            } else {
              setErrMsg(err?.data?.message);
            }
            setPending(false);
            enqueueSnackbar("Cập nhật địa chỉ thất bại!", { variant: "error" });
          });
      }
    } catch (err) {
      // Redux error
      console.error(err);
      setErr(err);
      handleClose();
      handleCloseContext();
      setPending(false);
      enqueueSnackbar("Cập nhật địa chỉ thất bại!", { variant: "error" });
    }
  };

  const handleConvertAddress = async (address, isTemp) => {
    if (pending || creating || updating || deleting) return;
    setPending(true);
    const { enqueueSnackbar } = await import("notistack");

    try {
      let isStored = address?.isDefault == null;

      if (!isStored && isTemp) {
        // Convert saved to stored
        const { isDefault, ...newAddress } = address; //Remove isDefault
        handleRemoveAddress(address); //Remove saved address
        addNewAddress(newAddress); //Add to store
        handleClose();
        setErrMsg("");
        setErr([]);
        setPending(false);
        enqueueSnackbar("Cập nhật địa chỉ thành công!", { variant: "success" });
      } else if (isStored && !isTemp) {
        // Convert stored to saved
        createAddress({
          name: address.name,
          companyName: address.company,
          phone: address.phone,
          city: address.city,
          address: address.address,
          type: address.type,
        })
          .unwrap()
          .then((data) => {
            handleRemoveAddress(address); // Remove stored address

            //Reset state
            handleClose();
            handleCloseContext();
            setErrMsg("");
            setErr([]);
            setPending(false);
            enqueueSnackbar("Cập nhật địa chỉ thành công!", {
              variant: "success",
            });
          })
          .catch((err) => {
            console.error(err);
            setErr(err);
            if (!err?.status) {
              setErrMsg("Server không phản hồi");
            } else if (err?.status === 400) {
              setErrMsg("Sai định dạng thông tin!");
            } else if (err?.status === 409) {
              setErrMsg(
                "Vượt quá số lượng cho phép (5), vui lòng xoá bớt hoặc tạm lưu vào bộ nhớ!"
              );
            } else {
              setErrMsg("Cập nhật địa chỉ thất bại");
            }
            setPending(false);
            enqueueSnackbar("Cập nhật địa chỉ thất bại!", { variant: "error" });
          });
      }
    } catch (err) {
      // Redux error
      console.error(err);
      setErr(err);
      handleClose();
      handleCloseContext();
      setPending(false);
      enqueueSnackbar("Thêm địa chỉ thất bại!", { variant: "error" });
    }
  };

  const handleSetDefault = async (address) => {
    if (pending || creating || updating || deleting) return;
    setPending(true);
    const { enqueueSnackbar } = await import("notistack");

    try {
      let isStored = address?.isDefault == null;

      if (isStored) {
        // If stored address
        createAddress({
          name: address.name,
          companyName: address.company,
          phone: address.phone,
          city: address.city,
          address: address.address,
          type: address.type,
          isDefault: true,
        })
          .unwrap()
          .then((data) => {
            handleRemoveAddress(address); // Remove stored address

            // Reset state
            handleClose();
            handleCloseContext();
            setErrMsg("");
            setErr([]);
            setPending(false);
            enqueueSnackbar("Cập nhật địa chỉ thành công!", {
              variant: "success",
            });
          })
          .catch((err) => {
            console.error(err);
            setErr(err);
            if (!err?.status) {
              setErrMsg("Server không phản hồi");
            } else if (err?.status === 400) {
              setErrMsg("Sai định dạng thông tin!");
            } else if (err?.status === 409) {
              setErrMsg(
                "Vượt quá số lượng cho phép (5), vui lòng xoá bớt hoặc tạm lưu vào bộ nhớ!"
              );
            } else {
              setErrMsg("Thêm địa chỉ thất bại");
            }
            setPending(false);
            enqueueSnackbar("Thêm địa chỉ thất bại!", { variant: "error" });
          });
      } else {
        handleUpdateAddress(address, true); //Update default address
      }
    } catch (err) {
      console.error(err);
      setErr(err);
      handleClose();
      handleCloseContext();
      setPending(false);
    }
  };

  const handleClickRemove = async (address) => {
    const confirmation = await confirm();
    if (confirmation) {
      handleRemoveAddress(address);
    } else {
      console.log("Cancel");
    }
  };

  const handleSetAddress = (address) => {
    if (address) {
      setAddressInfo(address);
    } else if (`${selectedValue}`.startsWith("s-")) {
      setAddressInfo(
        storeAddresses.filter((item) => item.id == selectedValue)[0]
      );
    } else if (data?.ids?.length) {
      setAddressInfo(data?.entities[selectedValue]);
    }
  };

  const handleSubmit = () => {
    handleSetAddress();
    handleCloseDialog();
  };

  let addressesContent;
  let storedContent = storeAddresses?.map((address, index) => (
    <Fragment key={`stored-${address?.id}-${index}`}>
      <AddressItem
        onCheck={(e) => setSelectedValue(e.target.value)}
        {...{
          addressInfo: address,
          handleOpen,
          handleClick,
          selectedValue,
          isTemp: true,
        }}
      />
    </Fragment>
  ));

  if (isLoading) {
    addressesContent = (
      <PlaceholderContainer>
        <CircularProgress color="primary" size={40} thickness={5} />
      </PlaceholderContainer>
    );
  } else if (isSuccess) {
    const { ids, entities } = data;

    addressesContent = (
      <>
        {ids?.length
          ? ids?.map((id, index) => {
              const savedAddress = entities[id];
              if (savedAddress.isDefault && selectedValue == -1)
                setSelectedValue(id);

              return (
                <Fragment key={`saved-${id}-${index}`}>
                  <AddressItem
                    onCheck={(e) => setSelectedValue(e.target.value)}
                    {...{
                      addressInfo: savedAddress,
                      handleOpen,
                      handleClick,
                      selectedValue,
                    }}
                  />
                </Fragment>
              );
            })
          : null}
      </>
    );
  } else if (isError) {
    addressesContent = (
      <MessageContainer>
        <Message color="error">{error?.error || "Đã xảy ra lỗi"}</Message>
      </MessageContainer>
    );
  }

  const isSelectedDefault = contextAddress != null && contextAddress?.isDefault;

  return (
    <Dialog
      open={openDialog}
      scroll={"paper"}
      maxWidth={"sm"}
      fullWidth
      onClose={handleCloseDialog}
      fullScreen={fullScreen}
      closeAfterTransition={false}
      aria-modal
    >
      {openForm ? (
        <Suspense fallBack={null}>
          <AddressForm
            {...{
              open,
              handleClose,
              addressInfo: contextAddress,
              err,
              errMsg,
              setErrMsg,
              addNewAddress,
              pending,
              setPending,
              handleConvertAddress,
              handleSetDefault,
              handleCreateAddress,
              handleClickRemove,
              handleUpdateAddress,
            }}
          />
        </Suspense>
      ) : (
        <>
          <DialogTitle sx={{ display: "flex", alignItems: "center" }}>
            <LocationOn />
            &nbsp;Địa chỉ của bạn
          </DialogTitle>
          <DialogContent sx={{ height: "100dvh" }}>
            {addressesContent}
            {storedContent}
            <Button
              variant="outlined"
              size="large"
              color="primary"
              sx={{ width: "100%", padding: "10px" }}
              onClick={() => handleOpen()}
            >
              <AddHome />
              &nbsp;Thêm địa chỉ
            </Button>
            {!isLoading &&
              !isError &&
              !data?.ids?.length &&
              !storeAddresses?.length && (
                <MessageContainer>
                  <Message>
                    <StyledEmptyIcon />
                    Chưa có địa chỉ nào
                  </Message>
                </MessageContainer>
              )}
          </DialogContent>
          <DialogActions>
            <Button
              variant="outlined"
              color="error"
              size="large"
              onClick={handleCloseDialog}
              startIcon={<Close />}
            >
              Huỷ
            </Button>
            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={handleSubmit}
              startIcon={<Check />}
            >
              Chọn
            </Button>
          </DialogActions>
          <Menu
            open={openContext}
            onClose={handleCloseContext}
            anchorEl={anchorEl}
            sx={{ display: { xs: "none", sm: "block" } }}
            slotProps={{
              list: { "aria-labelledby": "basic-button" },
            }}
          >
            <MenuItem
              disabled={isSelectedDefault}
              onClick={() => handleClickRemove(contextAddress)}
            >
              <ListItemIcon>
                <Delete sx={{ color: "error.main" }} fontSize="small" />
              </ListItemIcon>
              <ListItemText sx={{ color: "error.main" }}>
                Xoá địa chỉ
              </ListItemText>
            </MenuItem>
            <MenuItem
              disabled={isSelectedDefault}
              onClick={() => handleSetDefault(contextAddress)}
            >
              <ListItemIcon>
                <Home fontSize="small" />
              </ListItemIcon>
              <ListItemText>Đặt làm mặc định</ListItemText>
            </MenuItem>
          </Menu>
          <ConfirmationDialog />
        </>
      )}
    </Dialog>
  );
};

export default AddressSelectDialog;
