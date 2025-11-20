import styled from "@emotion/styled";
import { Link, useLocation } from "react-router";
import { useCreateReviewMutation, useUpdateReviewMutation } from "../../features/reviews/reviewsApiSlice";
import { forwardRef, useEffect, useState } from "react";
import { capitalize } from "lodash-es";
import { useTranslation } from "react-i18next";
import { rateLabels } from "../../utils/filters";
import Rating from "@mui/material/Rating";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextareaAutosize from "@mui/material/TextareaAutosize";
import Close from "@mui/icons-material/Close";
import Edit from "@mui/icons-material/Edit";
import Star from "@mui/icons-material/Star";
import StarBorder from "@mui/icons-material/StarBorder";
import Slide from "@mui/material/Slide";

//#region styled
const RatingSelect = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin-bottom: 10px;
`;
const RateSelect = styled.div`
  width: 100%;
  padding: 5px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const SuggestText = styled.b`
  font-size: 16px;
  color: ${({ theme }) => theme.vars.palette.text.primary};

  &.error {
    color: ${({ theme }) => theme.vars.palette.error.main};
  }

  &.label {
    font-size: 18px;
    font-weight: 400;
    margin: 5px 0;
    color: ${({ theme }) => theme.vars.palette.warning.main};
  }

  ${({ theme }) => theme.breakpoints.down("sm")} {
    display: flex;
    width: 100%;
    font-size: 14px;
    font-weight: 400;
    justify-content: center;
    padding: ${({ theme }) => theme.spacing(1)};
  }
`;
//#endregion

const Transition = forwardRef(function Transition(props, ref) {
  return <Slide direction="left" ref={ref} {...props} />;
});

const ReviewForm = ({
  username,
  bookId,
  review,
  open,
  handleClose,
  mobileMode,
  handlePageChange,
  pending,
  setPending,
}) => {
  const { t } = useTranslation();
  const location = useLocation();

  // Initial value
  const [content, setContent] = useState(review?.content ?? "");
  const [rating, setRating] = useState(review?.rating ?? 5);
  const [hover, setHover] = useState(-1);

  // Error
  const [err, setErr] = useState([]);
  const [errMsg, setErrMsg] = useState("");

  // Review hook
  const [sendReview, { isLoading: reviewing }] = useCreateReviewMutation();
  const [editReview, { isLoading: editing }] = useUpdateReviewMutation();

  useEffect(() => {
    setContent(review?.content ?? "");
    setRating(review?.rating ?? 5);
  }, [review]);

  /**
   * Handle change content
   */
  const handleChangeContent = (e) => {
    setContent(e.target.value);
  };

  /**
   * Handle submit review
   */
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (reviewing || editing || pending) return;

    setPending(true);
    const { enqueueSnackbar } = await import("notistack");

    if (review?.content) {
      //Edit
      editReview({
        id: review?.id,
        updateReview: {
          content: content,
          rating: rating,
        },
      })
        .unwrap()
        .then((data) => {
          enqueueSnackbar(capitalize(t("message.success", { action: t("update") })), { variant: "success" });
          setErr([]);
          setErrMsg("");
          handleClose();
        })
        .catch((err) => {
          console.error(err);
          setErr(err);
          if (!err?.status) {
            setErrMsg(t("error.server.not.response"));
          } else {
            setErrMsg(err.data.message);
          }
          enqueueSnackbar(capitalize(t("message.error", { action: t("update") })), { variant: "error" });
        });
    } else {
      //New review
      sendReview({
        id: bookId,
        newReview: {
          content: content,
          rating: rating,
        },
      })
        .unwrap()
        .then((data) => {
          enqueueSnackbar(capitalize(t("message.success", { action: t("review.label") })), { variant: "success" });
          setContent("");
          setErr([]);
          setErrMsg("");
          setRating(5);
          handlePageChange(1);
          handleClose();
        })
        .catch((err) => {
          console.error(err);
          setErr(err);
          if (!err?.status) {
            setErrMsg(t("error.server.not.response"));
          } else {
            setErrMsg(err?.data?.message);
          }
          enqueueSnackbar(capitalize(t("message.error", { action: t("review.label") })), { variant: "error" });
        });
    }

    setPending(false);
  };

  return (
    <Dialog
      open={open ?? false}
      scroll={"paper"}
      maxWidth={"md"}
      fullWidth
      onClose={handleClose}
      fullScreen={mobileMode}
      closeAfterTransition={false}
      slots={{
        transition: Transition,
      }}
    >
      <DialogTitle sx={{ display: "flex", alignItems: "center" }}>
        <Edit />
        &nbsp;
        {review?.content ? t("review.update", { ns: "authenticated" }) : t("review.add", { ns: "authenticated" })}
      </DialogTitle>
      <DialogContent sx={{ pt: 0, px: { xs: 1, sm: 3 } }}>
        {username ? (
          <div>
            <form onSubmit={handleSubmitReview}>
              <RatingSelect>
                <SuggestText>{t("review.quality", { ns: "authenticated" })}: </SuggestText>
                <RateSelect>
                  <Rating
                    name="product-rating"
                    value={rating}
                    onChange={(e, newValue) => {
                      setRating(newValue);
                    }}
                    onChangeActive={(e, newHover) => {
                      setHover(newHover);
                    }}
                    getLabelText={(value) => `${value} Star${value !== 1 ? "s" : ""}`}
                    sx={{ fontSize: { xs: 28, md: 36 } }}
                    icon={<Star sx={{ fontSize: "inherit" }} />}
                    emptyIcon={<StarBorder sx={{ fontSize: "inherit" }} />}
                  />
                  {rating !== null && (
                    <SuggestText className="label">
                      {t(rateLabels[hover !== -1 ? hover : rating], { ns: "client" })}
                    </SuggestText>
                  )}
                </RateSelect>
              </RatingSelect>
              <SuggestText className={`${errMsg ? "error" : ""}`}>
                {errMsg
                  ? capitalize(t("message.error", { action: t("review.label") }))
                  : t("review.thought", { ns: "authenticated" })}
              </SuggestText>
              <TextField
                required
                margin="dense"
                id="content"
                placeholder={t("review.thought", { ns: "authenticated" })}
                fullWidth
                multiline
                minRows={6}
                slotProps={{
                  inputComponent: TextareaAutosize,
                  inputProps: {
                    minRows: 6,
                    style: { resize: "auto" },
                  },
                }}
                variant="outlined"
                value={content}
                onChange={handleChangeContent}
                error={err.length > 0 || errMsg != ""}
                helperText={errMsg}
              />
            </form>
          </div>
        ) : (
          <SuggestText>{capitalize(t("required.login", { action: t("review.label") }))}</SuggestText>
        )}
      </DialogContent>
      <DialogActions>
        <Button variant="outlined" color="error" size="large" onClick={handleClose} startIcon={<Close />}>
          {t("cancel")}
        </Button>
        {username ? (
          err?.data?.code === 208 ? (
            <Link to={"/profile"} title="Xem đánh giá">
              <Button variant="contained" color="primary" size="large" sx={{ marginY: "10px" }}>
                {t("review.view", { ns: "authenticated" })}
              </Button>
            </Link>
          ) : err?.data?.code === 204 ? (
            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={() => {
                handleClose();
                scrollTo(0, 0);
              }}
            >
              {t("buy.now")}
            </Button>
          ) : (
            <Button variant="contained" color="primary" size="large" onClick={handleSubmitReview}>
              {review?.content ? t("review.update", { ns: "authenticated" }) : t("review.add", { ns: "authenticated" })}
            </Button>
          )
        ) : (
          <Link to={"/auth/login"} state={{ from: location }} title={t("login")}>
            <Button variant="contained" color="primary" size="large" sx={{ marginY: "10px" }}>
              {t("login.now")}
            </Button>
          </Link>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ReviewForm;
