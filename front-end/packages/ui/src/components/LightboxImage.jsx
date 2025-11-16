import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import Lightbox from "yet-another-react-lightbox";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/thumbnails.css";
import "yet-another-react-lightbox/plugins/counter.css";

const LightboxImage = ({ image, open, handleClose, children }) => {
  const theme = useTheme();
  const mobileMode = useMediaQuery((theme) => theme.breakpoints.down("sm"));

  return (
    <Lightbox
      open={open}
      close={handleClose}
      slides={[{ src: image }]}
      plugins={[Zoom]}
      carousel={{
        padding: 0,
        imageProps: { loading: "lazy" },
        finite: true,
      }}
      zoom={{ maxZoomPixelRatio: 10 }}
      controller={{
        closeOnPullDown: true,
        closeOnBackdropClick: true,
      }}
      render={{
        buttonPrev: () => null,
        buttonNext: () => null,
        buttonZoom: mobileMode ? () => null : undefined,
        slideFooter: children ? () => <>{children}</> : () => null,
      }}
      styles={{
        container: { backgroundColor: "rgba(0, 0, 0, .95)" },
        root: { zIndex: theme.vars.zIndex.modal },
      }}
    />
  );
};

export default LightboxImage;
