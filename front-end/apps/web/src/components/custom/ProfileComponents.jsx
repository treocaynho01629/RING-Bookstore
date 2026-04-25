import styled from "@emotion/styled";
import { DialogContent, DialogTitle } from "@mui/material";
import { ReactComponent as EmptyIcon } from "@ring/shared/assets/empty";

export const StyledDialogTitle = styled(DialogTitle)`
  position: relative;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  text-align: center;
  font-size: 16px;
  margin-bottom: ${({ theme }) => theme.spacing(2)};
  padding: ${({ theme }) => theme.spacing(1.5)} 0px;
  border-bottom: 0.5px solid ${({ theme }) => theme.vars.palette.divider};
  color: ${({ theme }) => theme.vars.palette.primary.main};
  border-color: ${({ theme }) => theme.vars.palette.primary.main};
  width: 100%;

  a {
    display: none;
    align-items: center;
    color: ${({ theme }) => theme.vars.palette.text.primary};
  }

  ${({ theme }) => theme.breakpoints.down("md_lg")} {
    font-size: 15px;
  }

  ${({ theme }) => theme.breakpoints.down("md")} {
    padding: ${({ theme }) => theme.spacing(2)} 10px;
    margin-bottom: 0;

    a {
      display: flex;
    }
  }
`;

export const StyledDialogContent = styled(DialogContent)`
  ${({ theme }) => theme.breakpoints.up("xs")} {
    padding-left: 0 !important;
    padding-right: 0 !important;
  }

  ${({ theme }) => theme.breakpoints.up("sm")} {
    padding-left: ${({ theme }) => theme.spacing(2)} !important;
    padding-right: ${({ theme }) => theme.spacing(2)} !important;
  }

  ${({ theme }) => theme.breakpoints.up("md")} {
    padding-left: 0 !important;
    padding-right: 0 !important;
  }
`;

export const TabContentContainer = styled.div`
  position: relative;
  padding: 0 ${({ theme }) => theme.spacing(2)};
  border: 0.5px solid ${({ theme }) => theme.vars.palette.divider};
  background-color: ${({ theme }) => theme.vars.palette.background.paper};
  min-height: 60dvh;

  ${({ theme }) => theme.breakpoints.down("md")} {
    padding: 0;
    border: none;
  }
`;

export const MessageContainer = styled.div`
  min-height: 60dvh;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const MainContainer = styled.div`
  min-height: 70dvh;
`;

export const ToggleGroupContainer = styled.div`
  width: 100%;
  background-color: ${({ theme }) => theme.vars.palette.background.paper};
  border-bottom: 1px solid ${({ theme }) => theme.vars.palette.divider};
  white-space: nowrap;
  position: sticky;
  top: ${({ theme }) => theme.mixins.toolbar.minHeight + 16.5}px;
  z-index: 2;

  ${({ theme }) => theme.breakpoints.down("md")} {
    top: 0;

    &::before,
    ::after {
      display: none;
    }
  }

  &:before {
    content: "";
    position: absolute;
    left: 0;
    top: -16px;
    width: 100%;
    height: calc(100% + 16px);
    background-color: ${({ theme }) => theme.vars.palette.background.paper};
    z-index: -1;
  }

  &::after {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: ${({ theme }) => theme.vars.palette.action.hover};
    z-index: -1;
  }
`;

export const StyledEmptyIcon = styled(EmptyIcon)`
  height: 70px;
  width: 70px;
  margin: ${({ theme }) => theme.spacing(1)} 0;
  fill: ${({ theme }) => theme.vars.palette.text.icon};
`;

export const PlaceholderContainer = styled.div`
  width: 100%;
  padding: ${({ theme }) => theme.spacing(16)};
`;

export const LoadContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  margin-bottom: ${({ theme }) => theme.spacing(2)};
`;
