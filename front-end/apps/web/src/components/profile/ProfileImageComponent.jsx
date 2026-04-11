import styled from "@emotion/styled";
import { useState } from "react";
import { getCroppedImg } from "@ring/shared/utils/canvas";
import { useTranslation } from "react-i18next";
import Cropper from "react-easy-crop";
import Slider from "@mui/material/Slider";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import ZoomIn from "@mui/icons-material/ZoomIn";
import ZoomOut from "@mui/icons-material/ZoomOut";

//#region styled
const CropperContainer = styled.div`
  width: 100%;
  aspect-ratio: 1/1;
  position: relative;
`;

const Slidercontainer = styled.div`
  width: 80%;
  margin-left: auto;
  margin-right: auto;
  padding: ${({ theme }) => theme.spacing(2, 5, 0)};
  display: flex;
  align-items: center;
  justify-content: space-between;

  ${({ theme }) => theme.breakpoints.down("md")} {
    display: none;
  }
`;

const StyledContent = styled(DialogContent)`
  min-height: 60dvh;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;

  ${({ theme }) => theme.breakpoints.down("md")} {
    padding: 0 !important;
  }
`;
//#endregion

const ProfileImageComponent = ({ image, mobileMode, handleCropComplete, handleClose }) => {
  const { t } = useTranslation();
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const onCropComplete = (croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const onApply = async () => {
    try {
      const croppedImage = await getCroppedImg(image, croppedAreaPixels);
      handleCropComplete(croppedImage);
    } catch (e) {
      console.error(e);
    } finally {
      handleClose();
    }
  };

  return (
    <Dialog open={image != null} maxWidth="sm" fullScreen={mobileMode} fullWidth onClose={handleClose}>
      <DialogTitle>{t("profile.media.label")}</DialogTitle>
      <StyledContent dividers>
        <CropperContainer>
          <Cropper
            image={image}
            crop={crop}
            zoom={zoom}
            aspect={1}
            cropShape="round"
            showGrid={false}
            onCropChange={setCrop}
            onCropComplete={onCropComplete}
            onZoomChange={setZoom}
            objectFit="cover"
          />
        </CropperContainer>
        <Slidercontainer>
          <ZoomOut />
          <Slider
            value={zoom}
            min={1}
            max={3}
            step={0.1}
            sx={{ mx: 2 }}
            aria-labelledby="Zoom"
            onChange={(e, zoom) => setZoom(zoom)}
          />
          <ZoomIn />
        </Slidercontainer>
      </StyledContent>
      <DialogActions>
        <Button color="error" onClick={handleClose}>
          {t("cancel")}
        </Button>
        <Button onClick={onApply}>{t("apply")}</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProfileImageComponent;
