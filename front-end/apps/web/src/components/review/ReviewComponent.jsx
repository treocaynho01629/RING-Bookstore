import styled from "@emotion/styled";
import { useState, lazy, Suspense, Fragment, memo, forwardRef } from "react";
import { useGetReviewByBookIdQuery, useGetReviewsByBookIdQuery } from "../../features/reviews/reviewsApiSlice";
import { Message, MobileExtendButton, Showmore, Title } from "@ring/ui/Components";
import { numFormat } from "@ring/shared/utils/convert";
import { ReactComponent as EmptyIcon } from "@ring/shared/assets/empty";
import { useTranslation } from "react-i18next";
import { ActionButtons } from "../product/detail/ProductAction";
import { capitalize } from "lodash-es";
import useAuth from "../../hooks/useAuth";
import Button from "@mui/material/Button";
import DialogActions from "@mui/material/DialogActions";
import DialogTitle from "@mui/material/DialogTitle";
import Rating from "@mui/material/Rating";
import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";
import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";
import KeyboardArrowLeft from "@mui/icons-material/KeyboardArrowLeft";
import Star from "@mui/icons-material/Star";
import StarBorder from "@mui/icons-material/StarBorder";
import EditOutlined from "@mui/icons-material/EditOutlined";
import Slide from "@mui/material/Slide";
import Placeholder from "@ring/ui/Placeholder";
import ReviewItem from "./ReviewItem";

const ReviewSort = lazy(() => import("./ReviewSort"));
const ReviewForm = lazy(() => import("./ReviewForm"));
const ReviewInfo = lazy(() => import("./ReviewInfo"));
const AppPagination = lazy(() => import("../custom/AppPagination"));
const Dialog = lazy(() => import("@mui/material/Dialog"));
const DialogContent = lazy(() => import("@mui/material/DialogContent"));

//#region styled
const ReviewsWrapper = styled.div`
  position: relative;
  padding: ${({ theme }) => theme.spacing(1, 2.5)};
  border: 0.5px solid ${({ theme }) => theme.vars.palette.divider};
  background-color: ${({ theme }) => theme.vars.palette.background.paper};

  ${({ theme }) => theme.breakpoints.down("md")} {
    padding: 0 ${({ theme }) => theme.spacing(1.5)};
  }
`;

const PreviewContainer = styled.div`
  position: relative;

  ${({ theme }) => theme.breakpoints.down("md")} {
    margin-bottom: ${({ theme }) => theme.spacing(2.5)};
    margin-top: -10px;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
    max-height: 200px;
  }
`;

const ReviewsContainer = styled.div`
  position: relative;

  ${({ theme }) => theme.breakpoints.down("md")} {
    padding: 10px;
  }
`;

const TitleContainer = styled.div`
  width: 100%;
  text-align: left;
`;

const ReviewSummary = styled.div`
  display: flex;
  align-items: center;
`;

const Label = styled.span`
  margin: 0;
  margin-left: 5px;
  font-size: 14px;
  display: flex;
  align-items: center;
  color: ${({ theme }) => theme.vars.palette.warning.light};

  &.secondary {
    font-size: 14px;
    color: ${({ theme }) => theme.vars.palette.text.secondary};
  }
`;

const StyledEmptyIcon = styled(EmptyIcon)`
  height: 70px;
  width: 70px;
  margin: ${({ theme }) => theme.spacing(1)} 0;
  fill: ${({ theme }) => theme.vars.palette.text.icon};
`;
//#endregion

const Pagination = memo(AppPagination);
const Transition = forwardRef(function Transition(props, ref) {
  return <Slide direction="left" ref={ref} {...props} />;
});

const ReviewComponent = ({ book, scrollIntoTab, tabletMode, pending, setPending, isReview, handleToggleReview }) => {
  //#region construct
  const { username } = useAuth();
  const { t } = useTranslation();
  const [openForm, setOpenForm] = useState(undefined);

  // Pagination & filter
  const [filterBy, setFilterBy] = useState("all");
  const [pagination, setPagination] = useState({
    number: 0,
    size: 8,
    sortBy: "createdDate",
  });

  // Fetch reviews
  const productReviewsCount = book?.reviewsInfo?.total;
  const haveReviews = !(!book || productReviewsCount == 0);
  const {
    data: userReview,
    isSuccess: doneReview,
    error: errorReview,
  } = useGetReviewByBookIdQuery(
    book?.id, //User's review of this product
    { skip: !username || !book }
  );
  const { data, isLoading, isFetching, isSuccess, isUninitialized, isError, error } = useGetReviewsByBookIdQuery(
    {
      id: book?.id,
      page: pagination?.number,
      size: pagination?.size,
      sortBy: pagination?.sortBy,
      sortDir: "desc",
      rating: filterBy === "all" ? null : filterBy,
    },
    { skip: !haveReviews }
  );
  const loading = isLoading || isFetching || isError || isUninitialized;

  /**
   * Handle page change
   * @param {number} page
   */
  const handlePageChange = (page) => {
    setPagination({ ...pagination, number: page - 1 });
    scrollIntoTab();
  };

  /**
   * Handle change order
   * @param {Event} e
   */
  const handleChangeOrder = (e) => {
    setPagination({ ...pagination, sortBy: e.target.value });
    scrollIntoTab();
  };

  /**
   * Handle change filter
   * @param {Event} e
   */
  const handleChangeFilter = (e) => {
    setFilterBy(e.target.value);
  };

  /**
   * Handle change size
   * @param {number} newValue
   */
  const handleChangeSize = (newValue) => {
    setPagination({ ...pagination, size: newValue, number: 0 });
  };

  /**
   * Handle open review form
   */
  const handleOpenForm = () => {
    setOpenForm(true);
  };

  /**
   * Handle close review form
   */
  const handleCloseForm = () => {
    setOpenForm(false);
  };

  let reviewsContent;
  let mainContent;

  if (isLoading && !isUninitialized) {
    reviewsContent = [...Array(productReviewsCount > pagination?.size ? pagination?.size : productReviewsCount)].map(
      (item, index) => (
        <Fragment key={`temp-review-${index}`}>
          <ReviewItem />
        </Fragment>
      )
    );
  } else if (isSuccess) {
    const { ids, entities } = data;

    reviewsContent = (
      <>
        {doneReview && userReview && <ReviewItem {...{ username, review: userReview, handleClick: handleOpenForm }} />}
        {ids?.length ? (
          ids?.map((id, index) => {
            const review = entities[id];

            if (id != userReview?.id) {
              return (
                <Fragment key={`${id}-${index}`}>
                  <ReviewItem {...{ username, review, handleClick: handleOpenForm }} />
                </Fragment>
              );
            }
          })
        ) : (
          <Message>
            <StyledEmptyIcon />
            {t("review.suggest")}
          </Message>
        )}
        {ids?.length > 0 && ids?.length < pagination.size && (
          <Message color="warning">{capitalize(t("message.out", { item: t("review.label") }))}</Message>
        )}
      </>
    );
  } else if (isError) {
    reviewsContent = <Message color="error">{error?.error || t("error.general")}</Message>;
  } else if (isUninitialized && productReviewsCount == 0) {
    reviewsContent = (
      <Message>
        <StyledEmptyIcon />
        {t("review.suggest")}
      </Message>
    );
  }

  mainContent = (
    <>
      {book?.reviewsInfo?.total > 0 && (
        <Suspense
          fallback={
            <Box display="flex">
              <Skeleton
                variant="text"
                sx={{
                  mr: 2,
                  fontSize: "16px",
                  display: { xs: "none", md: "block" },
                }}
                width={64}
              />
              <Skeleton variant="rectangular" sx={{ mr: 1, height: 40, width: 190 }} />
              <Skeleton variant="rectangular" sx={{ height: 40, width: 190 }} />
            </Box>
          }
        >
          <ReviewSort
            {...{
              sortBy: pagination?.sortBy,
              handleChangeOrder,
              filterBy,
              handleChangeFilter,
              count: book?.reviewsInfo?.rates,
            }}
          />
        </Suspense>
      )}
      <ReviewsContainer>{reviewsContent}</ReviewsContainer>
      {book?.reviewsInfo?.total > pagination.size && (
        <Suspense fallback={null}>
          <Pagination
            page={pagination?.number}
            size={pagination?.size}
            count={data?.totalPages ?? 0}
            sizes={[8, 16, 24]}
            onPageChange={handlePageChange}
            onSizeChange={handleChangeSize}
          />
        </Suspense>
      )}
    </>
  );
  //#endregion

  const isReviewable = !book || errorReview?.status != 403;
  const isEditable = haveReviews && userReview != null;

  return (
    <ReviewsWrapper>
      <Title>
        <TitleContainer>
          {book ? t("review.title") : <Skeleton variant="text" sx={{ fontSize: "inherit" }} width="40%" />}
          {tabletMode ? (
            <ReviewSummary>
              {book ? (
                <>
                  <Rating
                    name="product-rating"
                    value={book?.reviewsInfo?.rating ?? 0}
                    readOnly
                    sx={{ fontSize: 16 }}
                    icon={<Star sx={{ fontSize: 16 }} />}
                    emptyIcon={<StarBorder sx={{ fontSize: 16 }} />}
                  />
                  <Label>{(book?.reviewsInfo?.rating ?? 0).toFixed(1)}/5</Label>
                  <Label className="secondary">
                    ({numFormat.format(productReviewsCount ?? 0)} {t("review.label")})
                  </Label>
                </>
              ) : (
                <Skeleton variant="text" sx={{ fontSize: "16px" }} width={200} />
              )}
            </ReviewSummary>
          ) : (
            <Suspense fallback={<Placeholder sx={{ height: { xs: 131, md: 140 } }} />}>
              <ReviewInfo
                {...{
                  handleClick: handleOpenForm,
                  book,
                  disabled: !isReviewable,
                  editable: isEditable,
                }}
              />
            </Suspense>
          )}
        </TitleContainer>
        {tabletMode && (
          <MobileExtendButton disabled={!book} onClick={() => handleToggleReview(true)}>
            {book ? (
              <Label>
                {t("show.all")} <KeyboardArrowRight fontSize="small" />
              </Label>
            ) : (
              <Label>
                <Skeleton variant="text" sx={{ fontSize: "inherit" }} width={80} />
              </Label>
            )}
          </MobileExtendButton>
        )}
      </Title>
      <PreviewContainer>{tabletMode ? reviewsContent : mainContent}</PreviewContainer>
      {tabletMode &&
        book?.reviewsInfo?.total > 0 && ( // View all
          <Showmore onClick={() => handleToggleReview(true)}>
            <Label>
              {t("show.all")} ({numFormat.format(productReviewsCount ?? 0)} {t("review.label")})
              <KeyboardArrowRight fontSize="small" />
            </Label>
          </Showmore>
        )}
      {isReview !== undefined &&
        tabletMode && ( // Mobile component
          <Suspense fallback={null}>
            <Dialog
              fullScreen
              scroll="paper"
              closeAfterTransition={false}
              open={isReview}
              onClose={() => handleToggleReview(false)}
              slots={{
                transition: Transition,
              }}
            >
              <DialogTitle sx={{ display: "flex", alignItems: "center" }}>
                <KeyboardArrowLeft onClick={() => handleToggleReview(false)} style={{ marginRight: "4px" }} />
                {t("review.label")}
              </DialogTitle>
              <Suspense fallback={<Placeholder />}>
                <DialogContent dividers={true} sx={{ px: "0 !important" }}>
                  <ReviewInfo book={book} />
                  <ReviewsContainer>{mainContent}</ReviewsContainer>
                </DialogContent>
              </Suspense>
              <DialogActions>
                {!isReviewable ? (
                  <ActionButtons book={book} outlined={true} />
                ) : (
                  <Button
                    variant="outlined"
                    size="large"
                    fullWidth
                    disabled={!isReviewable}
                    onClick={() => setOpenForm(true)}
                    startIcon={<EditOutlined />}
                  >
                    {isEditable
                      ? t("review.update", { ns: "authenticated" })
                      : t("review.add", { ns: "authenticated" })}
                  </Button>
                )}
              </DialogActions>
            </Dialog>
          </Suspense>
        )}
      {openForm !== undefined && (
        <Suspense fallback={null}>
          <ReviewForm
            {...{
              username,
              bookId: book?.id,
              open: openForm,
              handleClose: handleCloseForm,
              mobileMode: tabletMode,
              pending,
              setPending,
              handlePageChange,
              review: haveReviews ? userReview : null,
            }}
          />
        </Suspense>
      )}
    </ReviewsWrapper>
  );
};

export default ReviewComponent;
