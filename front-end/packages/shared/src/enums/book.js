import { getStore } from "@ring/redux/storeRef";

export const getBookLanguage = () => {
  const store = getStore();
  const enums = store?.getState()?.enum?.enums;

  return (
    enums?.["BookLanguage"]?.enums ??
    Object.freeze({
      VN: {
        label: "Tiếng Việt",
        value: "VN",
      },
      EN: {
        label: "Tiếng Anh",
        value: "EN",
      },
      JP: {
        label: "Tiếng Nhật",
        value: "JP",
      },
      CN: {
        label: "Tiếng Trung",
        value: "CN",
      },
    })
  );
};

// TODO: Convert this to normal enums
export const getBookType = () => {
  const store = getStore();
  const enums = store?.getState()?.enum?.enums;

  return (
    enums?.["BookType"]?.enums ??
    Object.freeze({
      HARD_COVER: {
        value: "HARD_COVER",
        label: "Bìa cứng",
      },
      SOFT_COVER: {
        value: "SOFT_COVER",
        label: "Bìa mềm",
      },
      WOOD_COVER: {
        value: "WOOD_COVER",
        label: "Bìa gỗ",
      },
      SLIP_COVER: {
        value: "SLIP_COVER",
        label: "Bìa rời",
      },
      OTHERS: {
        value: "OTHERS",
        label: "Khác",
      },
    })
  );
};
