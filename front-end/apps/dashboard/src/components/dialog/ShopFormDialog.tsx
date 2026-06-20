"use client";

import { useState, useEffect, type FormEvent } from "react";
import {
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Box,
  useMediaQuery,
  Button,
  Grid,
  MenuItem,
} from "@mui/material";
import type { Theme } from "@mui/material/styles";
import { Check, Close as CloseIcon, Store as StoreIcon } from "@mui/icons-material";
import { Title } from "../custom/Components";
import { useCreateShopMutation, useUpdateShopMutation } from "../../features/shops/shopsApiSlice";
import { Instruction } from "@ring/ui";
import { useTranslations } from "next-intl";
import { PatternFormat } from "react-number-format";
import { AddressType } from "@ring/shared/models/addressType";
import usePendingModal from "@/hooks/usePendingModal";

import type { ShopDetailDTO } from "@ring/shared/models/shopDetailDTO";
import type { ShopRequest } from "@ring/shared/models/shopRequest";
import type { AddressRequest } from "@ring/shared/models/addressRequest";

import SingleImageCropUpload from "../custom/SingleImageCropUpload";

const DEFAULT_ADDRESS: AddressRequest = {
  name: "",
  companyName: "",
  phone: "",
  provinceId: -1,
  districtId: -1,
  wardCode: "",
  address: "",
  detail: "",
  type: AddressType.OFFICE,
  isDefault: false,
};

const DEFAULT_FORM = {
  name: "",
  description: "",
  address: DEFAULT_ADDRESS,
  files: [] as File[],
};

export interface ShopFormDialogProps {
  shop?: ShopDetailDTO | null;
  open: boolean;
  handleClose: () => void;
}

const ShopFormDialog = ({
  shop = null,
  open,
  handleClose,
}: ShopFormDialogProps) => {
  const t = useTranslations();
  const { open: pending, showPending, hidePending } = usePendingModal();
  const fullScreen = useMediaQuery((theme: Theme) => theme.breakpoints.down("sm"));
  const [name, setName] = useState(DEFAULT_FORM.name);
  const [description, setDescription] = useState(DEFAULT_FORM.description);
  const [address, setAddress] = useState<AddressRequest>(DEFAULT_FORM.address);
  const [files, setFiles] = useState<File[]>(DEFAULT_FORM.files);
  const [pic, setPic] = useState<string | null>(shop?.image ?? null);
  const [err, setErr] = useState<{
    status?: number;
    data?: { message?: string; errors?: Record<string, string> };
  } | null>(null);
  const [errMsg, setErrMsg] = useState("");

  const [createShop, { isLoading: creating }] = useCreateShopMutation();
  const [updateShop, { isLoading: updating }] = useUpdateShopMutation();

  useEffect(() => {
    if (shop) {
      setName(shop?.name ?? DEFAULT_FORM.name);
      setDescription(shop?.description ?? DEFAULT_FORM.description);
      setAddress({
        name: shop?.address?.name ?? "",
        companyName: shop?.address?.companyName ?? "",
        phone: shop?.address?.phone ?? "",
        provinceId: -1,
        districtId: -1,
        wardCode: "",
        address: shop?.address?.address ?? "",
        detail: "",
        type: (shop?.address?.type as AddressType) ?? AddressType.OFFICE,
        isDefault: shop?.address?.isDefault ?? false,
      });
      setErr(null);
      setErrMsg("");
      setFiles([]);
      setPic(shop?.image ?? null);
    } else {
      setName(DEFAULT_FORM.name);
      setDescription(DEFAULT_FORM.description);
      setAddress(DEFAULT_FORM.address);
      setErr(null);
      setErrMsg("");
      setFiles([]);
      setPic(null);
    }
  }, [shop]);

  const handleCloseDialog = () => {
    setFiles(DEFAULT_FORM.files);
    handleClose();
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (creating || updating || pending) return;

    showPending();
    const { enqueueSnackbar } = await import("notistack");

    const request: ShopRequest = {
      name,
      description,
      addressRequest: address,
    };

    const formData = new FormData();
    const blob = new Blob([JSON.stringify(request)], { type: "application/json" });
    formData.append("request", blob);
    if (files?.length > 0) {
      formData.append("image", files[0]);
    }

    if (shop) {
      updateShop({ id: shop.id!, updatedShop: formData })
        .unwrap()
        .then(() => {
          setErrMsg("");
          setErr(null);
          enqueueSnackbar(t("message.success.update"), { variant: "success" });
          hidePending();
          handleCloseDialog();
        })
        .catch((err: { status?: number; data?: { message?: string } }) => {
          setErr(err);
          setErrMsg(err?.data?.message ?? t("message.error.update"));
          enqueueSnackbar(t("message.error.update"), { variant: "error" });
          hidePending();
        });
    } else {
      createShop(formData)
        .unwrap()
        .then(() => {
          setErrMsg("");
          setErr(null);
          enqueueSnackbar(t("message.success.create"), { variant: "success" });
          hidePending();
          handleCloseDialog();
        })
        .catch((err: { status?: number; data?: { message?: string } }) => {
          setErr(err);
          setErrMsg(err?.data?.message ?? t("message.error.create"));
          enqueueSnackbar(t("message.error.create"), { variant: "error" });
          hidePending();
        });
    }
  };

  return (
    <Dialog
      open={open}
      scroll="body"
      maxWidth="md"
      fullWidth
      onClose={handleCloseDialog}
      fullScreen={fullScreen}
      aria-modal
    >
      <DialogTitle sx={{ display: "flex", alignItems: "center" }}>
        <StoreIcon fontSize="inherit" sx={{ mr: 1 }} />
        &nbsp;{shop ? t("shop.edit") : t("shop.add")}
      </DialogTitle>
      <DialogContent dividers>
        <form onSubmit={handleSubmit}>
          <Instruction style={{ display: errMsg ? "block" : "none" }}>{errMsg}</Instruction>
          <Grid container spacing={1}>
            <Box component="span" sx={{ display: "flex", alignItems: "center", width: "100%", mt: 1.5, mb: 1 }}>
              <StoreIcon fontSize="small" sx={{ mr: 1 }} />
              <Title>{t("shop.basic")}</Title>
            </Box>
            <Grid size={12}>
              <TextField
                required
                id="shop-name"
                label={t("shop.name")}
                fullWidth
                variant="outlined"
                value={name}
                onChange={(e) => setName(e.target.value)}
                error={!!err?.data?.errors?.name}
                helperText={err?.data?.errors?.name}
              />
            </Grid>
            <Grid size={12}>
              <TextField
                id="shop-description"
                label={t("shop.description")}
                fullWidth
                multiline
                minRows={4}
                variant="outlined"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </Grid>
            <Box component="span" sx={{ display: "flex", alignItems: "center", width: "100%", mt: 1.5, mb: 1 }}>
              <StoreIcon fontSize="small" sx={{ mr: 1 }} />
              <Title>{t("shop.address")}</Title>
            </Box>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                required
                label={t("shop.form.recipientName")}
                fullWidth
                value={address.name}
                onChange={(e) => setAddress((p) => ({ ...p, name: e.target.value }))}
                error={!!err?.data?.errors?.["addressRequest.name"]}
                helperText={err?.data?.errors?.["addressRequest.name"]}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label={t("shop.form.companyName")}
                fullWidth
                value={address.companyName ?? ""}
                onChange={(e) => setAddress((p) => ({ ...p, companyName: e.target.value }))}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <PatternFormat
                format="### ### ####"
                customInput={TextField}
                label={t("shop.form.phone")}
                fullWidth
                required
                value={address.phone}
                onValueChange={(v) => setAddress((p) => ({ ...p, phone: v.value ?? "" }))}
                error={!!err?.data?.errors?.["addressRequest.phone"]}
                helperText={err?.data?.errors?.["addressRequest.phone"]}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                required
                label={t("shop.form.city")}
                fullWidth
                value={""}
                onChange={(e) => setAddress((p) => ({ ...p, city: e.target.value }))}
                error={!!err?.data?.errors?.["addressRequest.city"]}
                helperText={err?.data?.errors?.["addressRequest.city"]}
              />
            </Grid>
            <Grid size={12}>
              <TextField
                required
                label={t("shop.form.address")}
                fullWidth
                multiline
                minRows={2}
                value={address.address}
                onChange={(e) => setAddress((p) => ({ ...p, address: e.target.value }))}
                error={!!err?.data?.errors?.["addressRequest.address"]}
                helperText={err?.data?.errors?.["addressRequest.address"]}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                select
                label={t("shop.addressType.label")}
                fullWidth
                value={address.type ?? AddressType.OFFICE}
                onChange={(e) => setAddress((p) => ({ ...p, type: e.target.value as AddressType }))}
              >
                <MenuItem value={AddressType.HOME}>{t("shop.addressType.home")}</MenuItem>
                <MenuItem value={AddressType.OFFICE}>{t("shop.addressType.office")}</MenuItem>
              </TextField>
            </Grid>
            <Box component="span" sx={{ display: "flex", alignItems: "center", width: "100%", mt: 1.5, mb: 1 }}>
              <StoreIcon fontSize="small" sx={{ mr: 1 }} />
              <Title>{t("product.images")}</Title>
            </Box>
            <Grid size={12}>
              <SingleImageCropUpload
                image={pic}
                file={files}
                setFile={setFiles}
                onImageSelected={() => setPic(null)}
                onImageCleared={() => {
                  setFiles([]);
                  setPic(null);
                }}
                helperText="Max 2MB"
              />
            </Grid>
          </Grid>
        </form>
      </DialogContent>
      <DialogActions>
        <Button variant="outlined" color="error" size="large" onClick={handleCloseDialog} startIcon={<CloseIcon />}>
          {t("cancel")}
        </Button>
        <Button
          variant="contained"
          color="primary"
          size="large"
          onClick={() => handleSubmit({ preventDefault: () => {} } as FormEvent<HTMLFormElement>)}
          startIcon={<Check />}
        >
          {t("apply")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ShopFormDialog;
