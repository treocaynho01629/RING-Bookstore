import { Fragment, Suspense, useCallback, useState, useEffect, lazy } from "react";
import { useGetMyReviewsScrollInfiniteQuery } from "../../features/reviews/reviewsApiSlice";
import { Message } from "@ring/ui/Components";
import { capitalize, debounce } from "lodash-es";
import { LoadContainer, MessageContainer, PlaceholderContainer, StyledDialogTitle } from "../custom/ProfileComponents";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import useAuth from "../../hooks/useAuth";
import KeyboardArrowLeft from "@mui/icons-material/KeyboardArrowLeft";
import Try from "@mui/icons-material/Try";
import CircularProgress from "@mui/material/CircularProgress";
import DialogContent from "@mui/material/DialogContent";
import ReviewItem from "./ReviewItem";
import styled from "@emotion/styled";

const ReviewForm = lazy(() => import("./ReviewForm"));

//#region styled
const ReviewsContainer = styled.div`
  padding-bottom: ${({ theme }) => theme.spacing(2)};
`;
//#endregion

const DEFAULT_SIZE = 5;

const ReviewsList = ({ mobileMode, tabletMode, pending, setPending }) => {
  const { username } = useAuth();
  const { t } = useTranslation();
  const [openForm, setOpenForm] = useState(undefined);
  const [contextReview, setContextReview] = useState(null);

  // Fetch orders
  const { data, isLoading, isSuccess, isError, error, isFetchingNextPage, hasNextPage, fetchNextPage } =
    useGetMyReviewsScrollInfiniteQuery({
      size: DEFAULT_SIZE,
    });

  // Show more
  const handleShowMore = () => {
    if (isFetchingNextPage || !hasNextPage) return;
    fetchNextPage();
  };

  /**
   * Open the edit form
   */
  const handleOpenEdit = (review) => {
    setContextReview(review);
    setOpenForm(true);
  };

  /**
   * Close the edit form
   */
  const handleCloseForm = () => {
    setOpenForm(false);
  };

  /**
   * Handle window scroll
   */
  const handleWindowScroll = (e) => {
    const trigger = document.body.scrollHeight - 300 < window.scrollY + window.innerHeight;
    if (trigger) handleShowMore();
  };

  /**
   * Handle scroll
   */
  const handleScroll = (e) => {
    const trigger = e.target.scrollHeight - e.target.scrollTop === e.target.clientHeight;
    if (trigger) handleShowMore();
  };

  const windowScrollListener = useCallback(debounce(handleWindowScroll, 500), [data]);
  const scrollListener = useCallback(debounce(handleScroll, 500), [data]);

  useEffect(() => {
    window.removeEventListener("scroll", windowScrollListener);
    if (!tabletMode) window.addEventListener("scroll", windowScrollListener);

    return () => {
      window.removeEventListener("scroll", windowScrollListener);
    };
  }, [tabletMode, data]);

  let reviewsContent;

  if (isLoading) {
    reviewsContent = (
      <PlaceholderContainer>
        <LoadContainer>
          <CircularProgress color="primary" />
        </LoadContainer>
      </PlaceholderContainer>
    );
  } else if (isSuccess) {
    const content = data?.pages?.flatMap((p) => p.content ?? []);
    const ids = content.map((b) => b.id);
    const entities = Object.fromEntries(content.map((b) => [b.id, b]));

    reviewsContent = (
      <>
        {ids?.length ? (
          ids?.map((id, index) => {
            const review = entities[id];

            return (
              <Fragment key={`${id}-${index}`}>
                <ReviewItem review={review} isPreview={true} handleClick={() => handleOpenEdit(review)} />
              </Fragment>
            );
          })
        ) : (
          <MessageContainer>
            <Message>{capitalize(t("message.empty", { item: t("review.label") }))}</Message>
          </MessageContainer>
        )}
      </>
    );
  } else if (isError) {
    reviewsContent = (
      <MessageContainer>
        <Message color="error">{error?.error || t("error.general")}</Message>
      </MessageContainer>
    );
  }

  return (
    <>
      <StyledDialogTitle>
        <Link to={-1}>
          <KeyboardArrowLeft />
        </Link>
        <Try />
        &nbsp;{t("review.title", { ns: "authenticated" })}
      </StyledDialogTitle>
      <DialogContent
        sx={{ py: 0, px: { xs: 1, sm: 2, md: 0 }, height: { xs: "100dvh", md: "auto" } }}
        onScroll={tabletMode ? scrollListener : undefined}
      >
        <ReviewsContainer>
          {reviewsContent}
          {isFetchingNextPage && (
            <LoadContainer>
              <CircularProgress size={30} color="primary" />
            </LoadContainer>
          )}
          {data?.ids?.length > 0 && data?.ids?.length == data?.totalElements && (
            <Message color="warning">{capitalize(t("message.out", { item: t("review.label") }))}</Message>
          )}
        </ReviewsContainer>
      </DialogContent>
      {openForm !== undefined && (
        <Suspense fallback={null}>
          <ReviewForm
            {...{
              username,
              open: openForm,
              handleClose: handleCloseForm,
              mobileMode,
              pending,
              setPending,
              review: contextReview,
            }}
          />
        </Suspense>
      )}
    </>
  );
};

export default ReviewsList;
