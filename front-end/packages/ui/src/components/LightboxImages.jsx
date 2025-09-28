import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import Lightbox from "yet-another-react-lightbox";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import Counter from "yet-another-react-lightbox/plugins/counter";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/thumbnails.css";
import "yet-another-react-lightbox/plugins/counter.css";

const LightboxImages = ({ images, open, handleClose }) => {
  const theme = useTheme();
  const mobileMode = useMediaQuery((theme) => theme.breakpoints.down("sm"));

  return (
    <Lightbox
      open={open}
      close={handleClose}
      slides={images}
      plugins={[Thumbnails, Zoom, Counter]}
      carousel={{
        padding: 0,
        imageProps: { loading: "lazy" },
      }}
      zoom={{ maxZoomPixelRatio: 10 }}
      thumbnails={{
        width: mobileMode ? 50 : 80,
        height: mobileMode ? 50 : 80,
        borderRadius: 0,
        border: 3,
        gap: 8,
      }}
      counter={{ container: { style: { top: 0 } } }}
      controller={{
        closeOnPullDown: true,
        closeOnBackdropClick: true,
      }}
      render={{
        buttonPrev: mobileMode ? () => null : undefined,
        buttonNext: mobileMode ? () => null : undefined,
        buttonZoom: mobileMode ? () => null : undefined,
      }}
      styles={{
        container: { backgroundColor: "rgba(0, 0, 0, .95)" },
        root: {
          "--yarl__thumbnails_thumbnail_border_color": "transparent",
          "--yarl__thumbnails_thumbnail_active_border_color":
            theme.vars.palette.primary.main,
        },
      }}
    />
  );
};

export default LightboxImages;
