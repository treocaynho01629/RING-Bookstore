import styled from "@emotion/styled";
import { Fragment, useState, lazy, Suspense } from "react";
import {
  useCreateAddressMutation,
  useDeleteAddressMutation,
  useGetMyAddressesQuery,
  useUpdateAddressMutation,
} from "../../features/addresses/addressesApiSlice";
import { CircularProgress, Dialog, ListItemIcon, ListItemText, Menu, MenuItem, DialogContent } from "@mui/material";
import { AddHome, Delete, Home, KeyboardArrowLeft, LocationOn } from "@mui/icons-material";
import { StyledDialogTitle } from "../custom/ProfileComponents";
import { ReactComponent as EmptyIcon } from "@ring/shared/assets/empty";
import { Link } from "react-router";
import { Message } from "@ring/ui/Components";
import { useTranslation } from "react-i18next";
import useConfirm from "@ring/shared/useConfirm";
import AddressItem from "./AddressItem";
import useAddress from "../../hooks/useAddress";
import ConfirmDiaog from "@ring/ui/ConfirmDialog";

const AddressForm = lazy(() => import("./AddressForm"));

//#region styled
const TitleContainer = styled.div`
  display: flex;
  flex-grow: 1;
  align-items: center;
`;

const ContentContainer = styled.div`
  min-height: 70dvh;
`;

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

  ${({ theme }) => theme.breakpoints.down("md")} {
    min-height: 100dvh;
  }
`;

const StyledEmptyIcon = styled(EmptyIcon)`
  height: 70px;
  width: 70px;
  margin: ${({ theme }) => theme.spacing(1)} 0;
  fill: ${({ theme }) => theme.vars.palette.text.icon};
`;

const StyledAddButton = styled.span`
  font-size: 12px;
  display: flex;
  align-items: flex-start;
  color: ${({ theme }) => theme.vars.palette.success.main};
  cursor: pointer;

  svg {
    margin-left: ${({ theme }) => theme.spacing(0.5)};
    font-size: 20px;
  }
`;
//#endregion

const AddressComponent = ({ pending, setPending, mobileMode }) => {
  const { addresses: storeAddresses, addNewAddress, removeAddress } = useAddress();
  const { t } = useTranslation();
  const [open, setOpen] = useState(undefined);
  const [err, setErr] = useState("");
  const [errMsg, setErrMsg] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const [contextAddress, setContextAddress] = useState(null);
  const openContext = Boolean(anchorEl);
  const { confirm, ConfirmationDialog } = useConfirm(ConfirmDialog);

  // Fetch addresses
  const { data, isLoading, isSuccess, isError, error } = useGetMyAddressesQuery();

  // Update address
  const [createAddress, { isLoading: creating }] = useCreateAddressMutation();
  const [updateAddress, { isLoading: updating }] = useUpdateAddressMutation();
  const [deleteAddress, { isLoading: deleting }] = useDeleteAddressMutation();

  /**
   * Open address form
   * @param {Object} addressInfo
   */
  const handleOpen = (addressInfo) => {
    setContextAddress(addressInfo);
    setOpen(true);
  };

  /**
   * Close address form
   */
  const handleClose = () => {
    setContextAddress(null);
    setErrMsg("");
    setErr([]);
    setOpen(false);
  };

  /**
   * Open context menu
   * @param {Event} event
   * @param {Object} address
   */
  const handleClick = (event, address) => {
    setAnchorEl(event.currentTarget);
    setContextAddress(address);
  };

  /**
   * Close context menu
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
              setErrMsg(t("error.server.not.response"));
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

  /**
   * Save address to user profile
   * @param {Object} address
   * @param {boolean} removeStored
   */
  const createAddressHandler = async (address, removeStored = false) => {
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
          setErrMsg(t("error.server.not.response"));
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
  const handleCreateAddress = async (address, isDefault = false, isTemp = false) => {
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
        enqueueSnackbar(t("message.success", { action: t("add.address") }), { variant: "success" });
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
            name: address.name == "" ? null : address.name,
            companyName: address.companyName == "" ? null : address.companyName,
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
              setErrMsg(t("error.server.not.response"));
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

    try {
      let isStored = address?.isDefault == null;

      if (!isStored && isTemp) {
        // Convert saved to stored
        const { isDefault, ...newAddress } = address; // Remove isDefault
        handleRemoveAddress(address); // Remove saved address
        addNewAddress(newAddress); // Add to store
        handleClose();
        setErrMsg("");
        setErr([]);
        setPending(false);
        enqueueSnackbar(t("message.success", { action: t("update.address") }), { variant: "success" });
      } else if (isStored && !isTemp) {
        // Convert stored to saved
        const newAddress = {
          name: address.name,
          companyName: address.companyName,
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
      enqueueSnackbar(t("message.error", { action: t("update.address") }), { variant: "error" });
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

  // Render addresses content
  let addressesContent;
  let storedContent = storeAddresses?.map((address, index) => (
    <Fragment key={`stored-${address?.id}-${index}`}>
      <AddressItem {...{ addressInfo: address, handleOpen, handleClick, isTemp: true }} />
    </Fragment>
  ));

  // Render loading content
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

              return (
                <Fragment key={`saved-${id}-${index}`}>
                  <AddressItem {...{ addressInfo: savedAddress, handleOpen, handleClick }} />
                </Fragment>
              );
            })
          : null}
      </>
    );
  } else if (isError) {
    addressesContent = (
      <MessageContainer>
        <Message color="error">{error?.error || t("error.general")}</Message>
      </MessageContainer>
    );
  }

  const isSelectedDefault = contextAddress != null && contextAddress?.isDefault;

  return (
    <>
      <StyledDialogTitle>
        <TitleContainer>
          <Link to={-1}>
            <KeyboardArrowLeft />
          </Link>
          <LocationOn />
          &nbsp;{t("address.title", { ns: "authenticated" })}
        </TitleContainer>
        <StyledAddButton onClick={() => handleOpen(null)}>
          {t("address.add", { ns: "authenticated" })} <AddHome />
        </StyledAddButton>
      </StyledDialogTitle>
      <DialogContent sx={{ p: { xs: 1, sm: 2, md: 0 }, mt: { xs: 1, md: 0 }, height: { xs: "100dvh", md: "auto" } }}>
        <ContentContainer>
          {addressesContent}
          {storedContent}
          {!isLoading && !isError && !data?.ids?.length && !storeAddresses?.length && (
            <MessageContainer>
              <Message>
                <StyledEmptyIcon />
                {t("address.empty", { ns: "authenticated" })}
              </Message>
            </MessageContainer>
          )}
        </ContentContainer>
      </DialogContent>
      <Dialog
        open={open}
        scroll={"paper"}
        maxWidth={"sm"}
        fullWidth
        onClose={handleClose}
        fullScreen={mobileMode}
        closeAfterTransition={false}
      >
        {open != undefined && (
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
        )}
      </Dialog>
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
          <ListItemText sx={{ color: "error.main" }}>{t("address.delete", { ns: "authenticated" })}</ListItemText>
        </MenuItem>
        <MenuItem disabled={isSelectedDefault} onClick={() => handleSetDefault(contextAddress)}>
          <ListItemIcon>
            <Home fontSize="small" />
          </ListItemIcon>
          <ListItemText>{t("address.default.set", { ns: "authenticated" })}</ListItemText>
        </MenuItem>
      </Menu>
      <ConfirmationDialog />
    </>
  );
};

export default AddressComponent;
