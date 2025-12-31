import styled from "@emotion/styled";
import { useEffect, useState, lazy, Suspense, Fragment } from "react";
import {
  useCreateAddressMutation,
  useDeleteAddressMutation,
  useGetMyAddressesQuery,
  useUpdateAddressMutation,
} from "../../features/addresses/addressesApiSlice";
import { useTranslation } from "react-i18next";
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
import SimpleBar from "simplebar-react";
import ConfirmDialog from "@ring/ui/ConfirmDialog";

const AddressForm = lazy(() => import("./AddressForm"));

//#region styled
const MessageContainer = styled.div`
  min-height: 60dvh;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const StyledSimpleBar = styled(SimpleBar)`
  position: absolute !important;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  padding: inherit;

  .simplebar-track {
    &.simplebar-vertical {
      .simplebar-scrollbar {
        &:before {
          background-color: ${({ theme }) => theme.vars.palette.divider};
        }
      }
    }
  }
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
  const { t } = useTranslation();
  const { addresses: storeAddresses, addNewAddress, removeAddress } = useAddress();
  const [openForm, setOpenForm] = useState(false); //Dialog open state
  const [err, setErr] = useState("");
  const [errMsg, setErrMsg] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const [contextAddress, setContextAddress] = useState(null);
  const [selectedValue, setSelectedValue] = useState(-1);
  const openContext = Boolean(anchorEl);
  const fullScreen = useMediaQuery((theme) => theme.breakpoints.down("sm"));
  const { confirm, ConfirmationDialog } = useConfirm(ConfirmDialog);

  // Fetch addresses
  const { data, isLoading, isSuccess, isError, error } = useGetMyAddressesQuery({}, { skip: !loggedIn });

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

  /**
   * Open the address form
   * @param {object} addressInfo - Address object contains the address to open
   * @returns {void}
   */
  const handleOpen = (addressInfo) => {
    setContextAddress(addressInfo);
    setOpenForm(true);
  };

  /**
   * Close the address form
   * @returns {void}
   */
  const handleClose = () => {
    setContextAddress(null);
    setErr("");
    setOpenForm(false);
  };

  /**
   * Handle the click event
   * @param {object} event - Event object contains the target of the click
   * @param {object} address - Address object contains the address to set
   * @returns {void}
   */
  const handleClick = (event, address) => {
    setAnchorEl(event.currentTarget);
    setContextAddress(address);
  };

  /**
   * Close the context menu
   * @returns {void}
   */
  const handleCloseContext = () => {
    setAnchorEl(null);
    setContextAddress(null);
  };

  /**
   * Remove address from user profile
   * @param {Object} address
   */
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
              setErrMsg(t("error.server.response"));
            } else {
              setErrMsg(err?.data?.message);
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

  const createAddressHandler = async (address, isDefault = false, isTemp = false) => {
    const { enqueueSnackbar } = await import("notistack");
    createAddress({
      name: address.name == "" ? null : address.name,
      companyName: address.companyName == "" ? null : address.companyName,
      phone: address.phone,
      city: address.city,
      address: address.address,
      type: address.type,
      isDefault: address.isDefault,
    })
      .unwrap()
      .then((data) => {
        // Remove stored address if needed
        if (removeStored) handleRemoveAddress(address);

        // Reset state
        handleClose();
        handleCloseContext();
        setErrMsg("");
        setErr([]);
        setPending(false);
        enqueueSnackbar(t("message.success", { action: removeStored ? t("update.address") : t("add.address") }), {
          variant: "success",
        });
      })
      .catch((err) => {
        console.error(err);
        setErr(err);
        if (!err?.status) {
          setErrMsg(t("error.server.response", { ns: "common" }));
        } else {
          setErrMsg(err?.data?.message);
        }
        setPending(false);
        enqueueSnackbar(t("message.error", { action: removeStored ? t("update.address") : t("add.address") }), {
          variant: "error",
        });
      });
  };

  /**
   * Create address
   * @param {Object} address
   * @param {boolean} isDefault
   * @param {boolean} isTemp
   */
  const handleCreateAddress = async (address, removeStored = false) => {
    if (pending || creating || updating || deleting) return;
    setPending(true);

    try {
      if (isTemp) {
        const { isDefault, ...newAddress } = address; // Remove isDefault
        addNewAddress(newAddress);
        handleClose();
        setErrMsg("");
        setErr([]);
        setPending(false);
        enqueueSnackbar(t("message.add.success", { action: "common" }), { variant: "success" });
      } else {
        const newAddress = {
          name: address.name == "" ? null : address.name,
          companyName: address.companyName == "" ? null : address.companyName,
          phone: address.phone,
          city: address.city,
          address: address.address,
          type: address.type,
          isDefault,
        };
        createAddressHandler(newAddress);
      }
    } catch (err) {
      // Redux error
      console.error(err);
      setErr(err);
      handleClose();
      handleCloseContext();
      setPending(false);
      enqueueSnackbar(t("message.error", { action: t("add.address") }), { variant: "error" });
    }
  };

  /**
   * Update address
   * @param {Object} address
   * @param {boolean} isDefault
   */
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
        enqueueSnackbar(t("message.success", { action: t("update.address") }), { variant: "success" });
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
            enqueueSnackbar(t("message.success", { action: t("update.address") }), {
              variant: "success",
            });
          })
          .catch((err) => {
            console.error(err);
            setErr(err);
            if (!err?.status) {
              setErrMsg(t("error.server.response", { ns: "common" }));
            } else {
              setErrMsg(err?.data?.message);
            }
            setPending(false);
            enqueueSnackbar(t("message.error", { action: t("update.address") }), { variant: "error" });
          });
      }
    } catch (err) {
      // Redux error
      console.error(err);
      setErr(err);
      handleClose();
      handleCloseContext();
      setPending(false);
      enqueueSnackbar(t("message.error", { action: t("update.address") }), { variant: "error" });
    }
  };

  /**
   * Convert address
   * @param {Object} address
   * @param {boolean} isTemp
   */
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
        enqueueSnackbar(t("message.success", { action: t("update.address") }), { variant: "success" });
      } else if (isStored && !isTemp) {
        // Convert stored to saved
        const newAddress = {
          name: address.name == "" ? null : address.name,
          companyName: address.companyName == "" ? null : address.companyName,
          phone: address.phone,
          city: address.city,
          address: address.address,
          type: address.type,
          isDefault: false,
        };
        createAddressHandler(newAddress, true);
      }
    } catch (err) {
      // Redux error
      console.error(err);
      setErr(err);
      handleClose();
      handleCloseContext();
      setPending(false);
      enqueueSnackbar(t("message.error", { action: t("add.address") }), { variant: "error" });
    }
  };

  /**
   * Set default address
   * @param {Object} address
   */
  const handleSetDefault = async (address) => {
    if (pending || creating || updating || deleting) return;
    setPending(true);

    try {
      let isStored = address?.isDefault == null;

      if (isStored) {
        // If stored address
        const newAddress = {
          name: address.name,
          companyName: address.companyName,
          phone: address.phone,
          city: address.city,
          address: address.address,
          type: address.type,
          isDefault: true,
        };
        createAddressHandler(newAddress, true);
      } else {
        handleUpdateAddress(address, true); // Update default address
      }
    } catch (err) {
      console.error(err);
      setErr(err);
      handleClose();
      handleCloseContext();
      setPending(false);
    }
  };

  /**
   * Remove address
   * @param {Object} address
   */
  const handleClickRemove = async (address) => {
    const confirmation = await confirm(
      t("address.delete.title", { ns: "authenticated" }),
      t("address.delete.description", { ns: "authenticated" }),
      t("cancel"),
      t("confirm")
    );
    if (confirmation) handleRemoveAddress(address);
  };

  /**
   * Set the address to the context
   * @param {object} address - Address object contains the address to set
   * @returns {void}
   */
  const handleSetAddress = (address) => {
    if (address) {
      setAddressInfo(address);
    } else if (`${selectedValue}`.startsWith("s-")) {
      setAddressInfo(storeAddresses.filter((item) => item.id == selectedValue)[0]);
    } else if (data?.ids?.length) {
      setAddressInfo(data?.entities[selectedValue]);
    }
  };

  /**
   * Handle the submit event
   * @returns {void}
   */
  const handleSubmit = () => {
    handleSetAddress();
    handleCloseDialog();
  };

  // Render the addresses content
  let addressesContent;

  // Render the stored addresses content
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

    addressesContent = ids?.length
      ? ids?.map((id, index) => {
          const savedAddress = entities[id];
          if (savedAddress.isDefault && selectedValue == -1) setSelectedValue(id);

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
      : null;
  } else if (isError) {
    addressesContent = (
      <MessageContainer>
        <Message color="error">{error?.error || t("error.general")}</Message>
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
            &nbsp;{t("address.title", { ns: "authenticated" })}
          </DialogTitle>
          <DialogContent sx={{ height: "100dvh", position: "relative" }} dividers={true}>
            <StyledSimpleBar>
              {addressesContent}
              {storedContent}
              <Button
                variant="outlined"
                size="large"
                color="primary"
                fullWidth
                onClick={() => handleOpen()}
                aria-label="Add address button"
              >
                <AddHome />
                &nbsp;{t("address.add", { ns: "authenticated" })}
              </Button>
              {!isLoading && !isError && !data?.ids?.length && !storeAddresses?.length && (
                <MessageContainer>
                  <Message>
                    <StyledEmptyIcon />
                    {t("address.empty", { ns: "authenticated" })}
                  </Message>
                </MessageContainer>
              )}
            </StyledSimpleBar>
          </DialogContent>
          <DialogActions>
            <Button variant="outlined" color="error" size="large" onClick={handleCloseDialog} startIcon={<Close />}>
              {t("cancel")}
            </Button>
            <Button variant="contained" color="primary" size="large" onClick={handleSubmit} startIcon={<Check />}>
              {t("select")}
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
            <MenuItem disabled={isSelectedDefault} onClick={() => handleClickRemove(contextAddress)}>
              <ListItemIcon>
                <Delete sx={{ color: "error.main" }} fontSize="small" />
              </ListItemIcon>
              <ListItemText sx={{ color: "error.main" }}>
                {t("address.delete.label", { ns: "authenticated" })}
              </ListItemText>
            </MenuItem>
            <MenuItem disabled={isSelectedDefault} onClick={() => handleSetDefault(contextAddress)}>
              <ListItemIcon>
                <Home fontSize="small" />
              </ListItemIcon>
              <ListItemText>{t("address.set.default", { ns: "authenticated" })}</ListItemText>
            </MenuItem>
          </Menu>
        </>
      )}
      <ConfirmationDialog />
    </Dialog>
  );
};

export default AddressSelectDialog;
