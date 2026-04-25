import styled from "@emotion/styled";
import { Button, TextField } from "@mui/material";

export const SortWrapper = styled.div`
  position: sticky;
  top: ${({ theme }) => theme.mixins.toolbar.minHeight + 16}px;
  background-color: ${({ theme }) => theme.vars.palette.background.default};
  margin: 20px 0;
  z-index: 2;

  &:before {
    content: "";
    position: absolute;
    left: -10px;
    top: -16px;
    width: calc(100% + 20px);
    height: calc(100% + 16px);
    background-color: ${({ theme }) => theme.vars.palette.background.default};
    z-index: -1;
  }

  ${({ theme }) => theme.breakpoints.down("sm_md")} {
    &:before {
      width: 100%;
    }
  }

  ${({ theme }) => theme.breakpoints.down("sm")} {
    z-index: ${({ theme }) => theme.zIndex.appBar};
    top: ${({ theme }) => theme.mixins.toolbar.minHeight + 4}px;
    border-bottom: 0.5px solid ${({ theme }) => theme.vars.palette.divider};
    margin: 0 0 20px;

    &:before {
      display: none;
    }
  }
`;

export const SortContainer = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
`;

export const MainContainer = styled.div`
  display: flex;
  align-items: center;

  ${({ theme }) => theme.breakpoints.down("sm")} {
    width: 100%;
  }
`;

export const AltContainer = styled.div`
  flex-grow: 1;
  display: flex;
  justify-content: flex-end;

  ${({ theme }) => theme.breakpoints.down("sm")} {
    position: fixed;
    bottom: ${({ theme }) => theme.spacing(1)};
    left: 50%;
    transform: translateX(-50%);
  }
`;

export const FilterTitle = styled.span`
  display: block;
  margin-right: 15px;
  font-weight: 450;
  white-space: nowrap;

  ${({ theme }) => theme.breakpoints.down("sm")} {
    display: none;
  }
`;

export const StyledInput = styled(TextField)`
  background-color: ${({ theme }) => theme.vars.palette.background.paper};

  &:not(::last-of-type) {
    margin-right: ${({ theme }) => theme.spacing(1)};
  }

  &.sort {
    .MuiSelect-select {
      padding-right: 0 !important;
    }
  }

  ${({ theme }) => theme.breakpoints.down("sm")} {
    margin-right: 0;

    .MuiSelect-select {
      font-size: 14px;
    }

    &:not(.border) {
      .MuiOutlinedInput-notchedOutline {
        border: none;
      }
    }
  }
`;

export const StyledSortButton = styled(Button)`
  padding-left: 0;
  padding-right: 0;
  display: none;
  max-width: 100px;
  background-color: ${({ theme }) => theme.vars.palette.background.paper};
  color: ${({ theme }) => theme.vars.palette.text.primary};
  border-radius: 0;
  padding: ${({ theme }) => theme.spacing(0.8, 1.75)};
  border: 0.5px solid ${({ theme }) => theme.vars.palette.divider};
  background-color: ${({ theme }) => theme.vars.palette.background.paper};

  ${({ theme }) => theme.breakpoints.down("md_lg")} {
    display: flex;
  }

  ${({ theme }) => theme.breakpoints.down("sm")} {
    border: none;
    padding: none;
  }
`;

export const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  position: relative;

  ${({ theme }) => theme.breakpoints.up("sm")} {
    margin-right: auto;
    margin-left: auto;
    width: 600px;
  }

  ${({ theme }) => theme.breakpoints.up("sm_md")} {
    width: 750px;
  }

  ${({ theme }) => theme.breakpoints.up("md_lg")} {
    width: 970px;
  }

  ${({ theme }) => theme.breakpoints.up("lg")} {
    width: 1170px;
  }
`;

export const StoreSuggest = styled.div`
  display: flex;
  align-items: center;
  margin: 10px 0 20px;
  padding: ${({ theme }) => theme.spacing(1)};
  border: 0.5px solid ${({ theme }) => theme.vars.palette.success.main};
  background-color: ${({ theme }) => theme.vars.palette.background.paper};
  transition: all 0.2s ease;
  font-size: 14px;

  @media (hover: hover) and (pointer: fine) {
    &:hover {
      color: ${({ theme }) => theme.vars.palette.success.main};
      background-color: ${({ theme }) =>
        `color-mix(in srgb, ${theme.vars.palette.success.light}, 
        transparent 90%)`};
    }
  }

  span {
    b {
      color: ${({ theme }) => theme.vars.palette.success.main};
    }
  }

  ${({ theme }) => theme.breakpoints.down("sm")} {
    margin: ${({ theme }) => `10px ${theme.spacing(1)} 20px`};
    background-color: ${({ theme }) =>
      `color-mix(in srgb, ${theme.vars.palette.success.light}, 
      transparent 90%)`};
  }
`;
