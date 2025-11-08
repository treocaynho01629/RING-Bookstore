import styled from "@emotion/styled";
import { Link } from "react-router";
import Button from "@mui/material/Button";
// import { ReactComponent as EmptyIcon } from "@ring/shared/assets/empty";
import SimpleNavbar from "../components/navbar/SimpleNavbar";

//#region styled
const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100dvh;
`;

const RandomShape = styled.span`
  position: fixed;
  top: 0;
  right: 0;
  height: 150dvh;
  width: 50%;
  opacity: 0.7;
  background: hsl(from ${({ theme }) => theme.vars.palette.primary.main} h s l / 0.4);
  z-index: -1;
  transform: translate(60%, 0%) rotate(25deg);

  &:after {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    height: 100dvh;
    width: 100%;
    background: hsl(from ${({ theme }) => theme.vars.palette.primary.main} calc(h + 30) s l / 0.3);
    transform: translate(-80%, -60%) rotate(85deg);
  }

  &:before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: 200%;
    background: hsl(from ${({ theme }) => theme.vars.palette.primary.main} calc(h - 30) s l / 0.2);
    transform: rotate(-130deg) translate(-35%, -60%);
    z-index: -5;
  }

  ${({ theme }) => theme.breakpoints.down("sm")} {
    transform: translate(75%, 5%) rotate(25deg);
  }
`;

const Content = styled.div`
  font-size: 16px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: ${({ theme }) => theme.spacing(1)};

  h2 {
    font-size: 2.25em;
    margin: 0;
  }

  h3 {
    font-size: 1.5em;
    font-weight: 400;
  }

  p {
    margin: 0;
    color: ${({ theme }) => theme.vars.palette.text.secondary};
  }

  ${({ theme }) => theme.breakpoints.down("sm")} {
    font-size: 12px;

    p {
      font-size: 1.25em;
      text-align: center;
    }
  }
`;

// const StyledEmptyIcon = styled(EmptyIcon)`
//   height: 0.75em;
//   width: 0.75em;
//   fill: ${({ theme }) => theme.vars.palette.background.default};
//   stroke: ${({ theme }) => theme.vars.palette.error.main};
//   stroke-width: 10px;
//   overflow: visible;
// `;

const ErrorCode = styled.h1`
  font-size: 13em;
  color: ${({ theme }) => theme.vars.palette.background.default};
  margin: 0;
  text-shadow:
    3px 3px 0 ${({ theme }) => theme.vars.palette.error.main},
    -3px 3px 0 ${({ theme }) => theme.vars.palette.error.main},
    -3px -3px 0 ${({ theme }) => theme.vars.palette.error.main},
    3px -3px 0 ${({ theme }) => theme.vars.palette.error.main};
  border-bottom: 0.02em solid ${({ theme }) => theme.vars.palette.primary.main};
`;

const ErrorContainer = styled("div")(({ theme }) => ({
  mixBlendMode: "darken",
  ...theme.applyStyles("dark", {
    mixBlendMode: "lighten",
  }),
}));
//#endregion

const Missing = () => {
  return (
    <Wrapper>
      <SimpleNavbar />
      <RandomShape></RandomShape>
      <Content>
        <h2>Ôi khônggggg!</h2>
        <ErrorContainer>
          // TODO: Fix missing icon
          <ErrorCode>{/* 4<StyledEmptyIcon />4 */}</ErrorCode>
        </ErrorContainer>
        <h3>Không thể tìm thấy trang bạn yêu cầu</h3>
        <p>Có thể đường dẫn này đã cũ, sai chính tả hoặc không còn tồn tại.</p>
        <Link to="/">
          <Button sx={{ marginTop: 2 }} variant="outlined" color="primary">
            Về trang chủ
          </Button>
        </Link>
      </Content>
    </Wrapper>
  );
};

export default Missing;
