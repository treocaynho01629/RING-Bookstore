import styled from "@emotion/styled";
import { useState, lazy, Suspense } from "react";
import { useParams } from "react-router";
import { useTranslation } from "react-i18next";

const PendingModal = lazy(() => import("@ring/ui/PendingModal"));
const ForgotTab = lazy(() => import("../components/authorize/ForgotTab"));
const ResetTab = lazy(() => import("../components/authorize/ResetTab"));

//#region styled
const Wrapper = styled.div`
  display: flex;
  overflow: hidden;
  height: 100dvh;

  ${({ theme }) => theme.breakpoints.down("md")} {
    flex-direction: column-reverse;
  }
`;

const Container = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;

  ${({ theme }) => theme.breakpoints.down("md")} {
    margin-top: -${({ theme }) => theme.spacing(8)};
  }
`;

const ContentContainer = styled.div`
  position: relative;
  width: 90%;
  max-width: 350px;
`;
//#endregion

function ResetPage() {
  const { token } = useParams();
  const { t } = useTranslation();
  const [pending, setPending] = useState(false);

  return (
    <Wrapper>
      {pending && (
        <Suspense fallBack={null}>
          <PendingModal open={pending} message={t("pending")} />
        </Suspense>
      )}
      <Container>
        <Suspense fallback={null}>
          <ContentContainer>
            {token ? (
              <ResetTab resetToken={token} pending={pending} setPending={setPending} />
            ) : (
              <ForgotTab pending={pending} setPending={setPending} />
            )}
          </ContentContainer>
        </Suspense>
      </Container>
    </Wrapper>
  );
}

export default ResetPage;
