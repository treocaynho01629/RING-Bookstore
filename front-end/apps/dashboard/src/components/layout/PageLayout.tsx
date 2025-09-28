import { BoxProps } from "@mui/material/Box";
import Box from "@mui/material/Box";

export type PageLayoutProps = BoxProps;

const PageLayout = ({ sx, children, className, ...other }: PageLayoutProps) => {
  return (
    <Box display={{ xs: "block", md: "flex" }}>
      <Box position="relative" flexGrow={{ xs: "auto", md: 1 }}>
        {children}
      </Box>
    </Box>
  );
};

export default PageLayout;
