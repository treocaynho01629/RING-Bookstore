import styled from "@emotion/styled";

export const Instruction = styled.p`
  font-size: 14px;
  font-style: italic;
  margin: ${({ theme }) => theme.spacing(1)} 0;
  overflow: hidden;
  text-overflow: ellipsis;
  color: ${({ theme }) => theme.vars.palette.error.main};
  display: ${({ display }) => display || "flex"};
  align-items: center;

  span:not(:first-of-type) {
    display: none;
  }
`;

export const LogoImage = styled.img`
  height: 40px;
  padding: 4px;

  ${({ theme }) =>
    theme.applyStyles &&
    theme.applyStyles("light", {
      filter: `contrast(0.9)`,
    })}

  &.contrast {
    filter: drop-shadow(0px -2000px 0 ${({ theme }) => theme.vars.palette.text.primary});
    transform: translateY(2000px);
  }
`;

export const LogoTitle = styled.span`
  font-family: abel;
  font-size: 27px;
  text-transform: uppercase;
  font-weight: 500;
  color: ${({ theme }) => theme.vars.palette.primary.main};
  text-shadow: 1.5px 1.5px ${({ theme }) => theme.vars.palette.background.paper};
  margin-left: 10px;
  white-space: nowrap;
  transition: width 0.25s ease;
`;

export const LogoSubtitle = styled(LogoTitle)`
  color: ${({ theme }) => theme.vars.palette.text.secondary};
  margin-left: 0;
`;

export const MobileExtendButton = styled.div`
  position: absolute;
  right: -1%;
  top: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin: auto;
  width: 102%;
  height: 100%;
  max-height: 30px;
  font-size: 14px;
  cursor: pointer;
  color: ${({ theme, disabled }) => (disabled ? theme.vars.palette.text.disabled : theme.vars.palette.text.secondary)};
  pointer-events: ${({ theme, disabled }) => (disabled ? "none" : "all")};
  overflow: hidden;
  z-index: 1;

  &::before {
    content: "";
    position: absolute;
    top: -2%;
    right: 0;
    width: 100%;
    height: 104%;
    background-image: linear-gradient(
      to left,
      ${({ theme }) => theme.vars.palette.background.paper},
      ${({ theme }) => theme.vars.palette.background.paper} 5%,
      transparent 15%,
      transparent 100%
    );
    z-index: -1;
  }

  &.transparent {
    &::before {
      display: none;
    }
  }

  ${({ theme }) => theme.breakpoints.up("md")} {
    display: none;
  }
`;

export const Title = styled.h3`
  position: relative;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  text-align: center;
  text-transform: uppercase;
  margin: 0 0 20px;
  padding: 15px 0;
  border-bottom: 0.5px solid ${({ theme, color }) => theme.vars.palette[color]?.main || theme.vars.palette.divider};
  color: ${({ theme, color }) => theme.vars.palette[color]?.main || theme.vars.palette.text.primary};
  border-color: ${({ theme, color }) => theme.vars.palette[color]?.main || theme.vars.palette.primary.main};
  width: 100%;

  a {
    display: none;
    align-items: center;
    color: ${({ theme }) => theme.vars.palette.text.primary};
  }

  ${({ theme }) => theme.breakpoints.down("md")} {
    font-size: 16px;
    margin: 0 0 15px;
    text-transform: none;

    a {
      display: flex;
    }
  }
`;

export const Showmore = styled.div`
  font-size: 14px;
  font-weight: 500;
  flex-grow: 1;
  padding: 15px 0;
  margin-top: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.vars.palette.info.main};
  cursor: pointer;

  &::after {
    content: "";
    z-index: 0;
    position: absolute;
    top: -55px;
    left: 0;
    height: 100%;
    width: 100%;
    pointer-events: none;
    border-bottom: 0.5px solid ${({ theme }) => theme.vars.palette.divider};
    background-image: linear-gradient(
      180deg,
      transparent,
      transparent 60%,
      ${({ theme }) => theme.vars.palette.background.paper} 100%
    );
  }

  &.expand {
    margin-top: 10px;

    &::after {
      background-image: none;
    }
  }

  ${({ theme }) => theme.breakpoints.down("md")} {
    margin-top: 0;
  }
`;

export const Message = styled.span`
  font-size: 14px;
  margin: 20px 0 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  white-space: wrap;
  color: ${({ theme, color }) => theme.vars.palette[color]?.main || theme.vars.palette.text.primary};
`;
