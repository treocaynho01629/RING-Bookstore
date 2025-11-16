import styled from "@emotion/styled";
import { useCallback, useEffect, useState, lazy, Suspense, useRef, forwardRef } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router";
import { useGetBooksSuggestionQuery } from "../../features/books/booksApiSlice";
import { debounce, capitalize } from "lodash-es";
import { createFilterOptions } from "@mui/material/useAutocomplete";
import { inputBaseClasses } from "@mui/material/InputBase";
import { useTranslation } from "react-i18next";
import Search from "@mui/icons-material/Search";
import Close from "@mui/icons-material/Close";
import Storefront from "@mui/icons-material/Storefront";
import History from "@mui/icons-material/History";
import KeyboardArrowLeft from "@mui/icons-material/KeyboardArrowLeft";
import Delete from "@mui/icons-material/Delete";
import CategoryOutlined from "@mui/icons-material/CategoryOutlined";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import useAutocomplete from "@mui/material/useAutocomplete";
import useApp from "../../hooks/useApp";
import Slide from "@mui/material/Slide";

const Dialog = lazy(() => import("@mui/material/Dialog"));
const DialogContent = lazy(() => import("@mui/material/DialogContent"));

//#region styled
const AutocompleteContainer = styled.div`
  display: flex;
  align-items: center;
  position: relative;
  width: 40ch;

  &.hidden {
    display: none;
  }

  ${({ theme }) => theme.breakpoints.down("lg")} {
    width: 35ch;
  }

  ${({ theme }) => theme.breakpoints.down("md_lg")} {
    width: 30ch;
  }

  ${({ theme }) => theme.breakpoints.down("md")} {
    width: 100%;
    flex-direction: row-reverse;
    justify-content: center;
  }
`;

const SearchForm = styled.form`
  width: 100%;
  position: relative;

  ${({ theme }) => theme.breakpoints.down("md")} {
    display: flex;
    flex-direction: column;
    height: 100%;
  }
`;

const SearchInputContainer = styled.div`
  ${({ theme }) => theme.breakpoints.down("md")} {
    display: flex;
    align-items: center;
    padding: ${({ theme }) => `${theme.spacing(1.5)} ${theme.spacing(1.5)}`};
    border-bottom: 0.5px solid ${({ theme }) => theme.vars.palette.divider};
  }

  ${({ theme }) => theme.breakpoints.down("sm")} {
    padding: 10px 5px;
  }
`;

const StyledSearchInput = styled(TextField)`
  display: flex;
  color: inherit;
  background: ${({ theme }) => theme.vars.palette.background.paper};

  ${({ theme }) => theme.breakpoints.down("md")} {
    width: 100%;
  }

  .${inputBaseClasses.input} {
    width: 100%;
    background: ${({ theme }) => theme.vars.palette.background.paper};
  }

  .${inputBaseClasses.adornedEnd} {
    padding-right: 6px;
  }
`;

const ListBoxPopover = styled(Paper)`
  width: 100%;
  z-index: 1;
  position: absolute;
  margin-top: ${({ theme }) => theme.spacing(1.5)};
  padding: ${({ theme }) => theme.spacing(0.5)} 0;
`;

const ListBoxContainer = styled.div`
  display: flex;
  flex: 1 1 auto;
  overflow-y: auto;
`;

const Listbox = styled.ul`
  max-height: 50dvh;
  width: 100%;
  margin: 0;
  padding: 0;
  list-style: none;
  background-color: transparent;
  overflow: auto;

  ${({ theme }) => theme.breakpoints.down("md")} {
    max-height: 100%;
  }
`;

const GroupItem = styled.li`
  display: flex;
  flex-direction: column;
`;

const GroupHeader = styled.div`
  height: 40px;
  padding: ${({ theme }) => `0 ${theme.spacing(1.5)}`};
  padding-right: ${({ theme }) => theme.spacing(0.5)};
  display: flex;
  align-items: center;
  justify-content: space-between;
  text-transform: capitalize;
  font-weight: 450;
  background-color: ${({ theme }) => theme.vars.palette.divider};
  border-bottom: 0.5px solid ${({ theme }) => theme.vars.palette.primary.main};
`;

const GroupListBox = styled.ul`
  list-style: none;
  padding: 0;
`;

const ListItem = styled.li`
  padding: ${({ theme }) => `${theme.spacing(0.65)} ${theme.spacing(1)}`};
  padding-right: 0;
  height: 36px;

  &.alt {
    background-color: ${({ theme }) =>
      `color-mix(in srgb, ${theme.vars.palette.success.light}, 
      transparent 90%)`};
  }

  &.Mui-focused {
    background-color: ${({ theme }) => theme.vars.palette.action.hover};
    cursor: pointer;
  }

  &:active {
    background-color: ${({ theme }) => theme.vars.palette.action.selected};
  }

  ${({ theme }) => theme.breakpoints.down("md")} {
    padding: ${({ theme }) => `${theme.spacing(2.75)} ${theme.spacing(1.5)}`};
    padding-right: ${({ theme }) => theme.spacing(0.5)};
    border-bottom: 0.5px solid ${({ theme }) => theme.vars.palette.divider};
  }
`;

const ListLink = styled(Link)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  height: 100%;
`;

const ItemTitle = styled.div`
  display: flex;
  align-items: center;

  svg {
    font-size: 24px;
    margin-right: ${({ theme }) => theme.spacing(1)};
  }
`;

const StyledIconButton = styled(IconButton)`
  border-radius: 0;

  svg {
    font-size: 20px;
  }

  @media (hover: hover) and (pointer: fine) {
    &:hover {
      background-color: transparent;
      color: ${({ theme }) => theme.vars.palette.error.main};
    }
  }
`;

const AdornmentContainer = styled.div`
  display: flex;
  align-items: center;
`;

const SearchButton = styled(Button)`
  height: 30px;
  width: 48px;
  min-width: auto;
  padding: ${({ theme }) => theme.spacing(0.5)};
  border-left: 1px solid ${({ theme }) => theme.vars.palette.divider};

  svg {
    font-size: 22px;
  }
`;
//#endregion

const filter = createFilterOptions();

const AutocompleteComponent = ({
  mobileMode,
  tabletMode,
  searchParams,
  inputValue,
  setInputValue,
  handleOpenDialog,
  handleCloseDialog,
  show,
  isFocus,
  displayRef,
  isShop,
  id,
}) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [suggestValue, setSuggestValue] = useState(searchParams.get("q") ?? "");
  const { keywords: historyOptions, addKeyword, removeKeyword, clearKeywords } = useApp();
  const { data, isLoading, isFetching, isSuccess } = useGetBooksSuggestionQuery(suggestValue, {
    skip: !suggestValue,
  });

  // Ignore if there is no more suggestion (< 9 keywords)
  const debounceSetSuggest = useCallback(
    debounce((newInputValue) => {
      setSuggestValue((prev) =>
        prev != "" && data?.length < 9 && newInputValue.toLowerCase().startsWith(prev.toLowerCase())
          ? prev
          : newInputValue
      );
    }, 200),
    []
  );

  const handleChangeSuggest = useCallback((e, newInputValue) => {
    debounceSetSuggest(newInputValue);
    setInputValue(newInputValue);
  }, []);

  const handleSelectSuggest = (e, newValue) => {
    if (!newValue?.group) return;
    handleSearch(e, newValue);
  };

  // Confirm search
  const handleSearch = (e, newValue) => {
    e.preventDefault();

    const value = newValue?.value ?? inputValue;
    addKeyword(value);
    navigate(
      `/${
        newValue?.group == "SHOP"
          ? "shop"
          : newValue?.group == "STORE"
            ? "store"
            : isShop
              ? id
                ? `shop/${id}`
                : "shop"
              : "store"
      }?q=${value}`
    );
    displayRef.current = value;
    handleCloseDialog();
  };

  const handleRemoveKeyword = (e, keyword) => {
    e.preventDefault();
    e.stopPropagation();
    removeKeyword(keyword);
  };

  // Focus input (autoFocus option only focus once)
  const handleFocus = () => {
    let inputRef = getInputProps().ref;
    if (inputRef.current) inputRef.current.focus();
  };

  // Options
  let options = [];

  if (isLoading || isFetching) {
    options = (tabletMode ? historyOptions : historyOptions.slice(0, 11)).map((option) => {
      return { group: "HISTORY", value: option };
    });
    options.push({ value: t("loading") });
  } else if (isSuccess) {
    options = (tabletMode ? historyOptions : historyOptions.slice(0, 6)).map((option) => {
      return { group: "HISTORY", value: option };
    });

    if (suggestValue) {
      options = options.concat(
        data.map((option) => {
          return { group: "SUGGEST", value: option };
        })
      );
    }
  } else {
    options = historyOptions.map((option) => {
      return { group: "HISTORY", value: option };
    });
  }

  useEffect(() => {
    if (show && isFocus) {
      handleFocus();
      handleOpenDialog();
    }
  }, [show]);

  // Autocomplete
  const { getRootProps, getInputProps, getListboxProps, getOptionProps, getClearProps, groupedOptions } =
    useAutocomplete({
      id: "autocomplete-input",
      options: options,
      freeSolo: true,
      openOnFocus: !tabletMode,
      inputValue: inputValue,
      onInputChange: handleChangeSuggest,
      onChange: handleSelectSuggest,
      getOptionLabel: (option) => {
        // Value selected with enter, right from the input
        if (typeof option === "string") {
          return option;
        }
        // Add "xxx" option created dynamically
        if (option.inputValue) {
          return option.inputValue;
        }
        // Groupt
        if (option.groups?.length) {
          return "group";
        }
        // Regular option
        return option.value;
      },
      filterOptions: (options, params) => {
        let filtered = filter(options, params);
        // Suggest search shop instead
        if (inputValue) {
          filtered = [{ group: isShop && !id ? "STORE" : "SHOP", value: inputValue }].concat(filtered);
        }

        return filtered;
      },
      ...(tabletMode && {
        open: true,
        groupBy: (option) => {
          return option?.group;
        },
      }),
    });

  let endAdornment = (
    <AdornmentContainer>
      {inputValue !== "" && (
        <StyledIconButton {...getClearProps()} aria-label="Clear search value">
          <Close />
        </StyledIconButton>
      )}
      <SearchButton type="submit" size="small" aria-label="Submit search">
        <Search />
      </SearchButton>
    </AdornmentContainer>
  );

  return (
    <SearchForm {...getRootProps()} onSubmit={(e) => handleSearch(e)}>
      {tabletMode ? (
        <>
          <SearchInputContainer>
            {mobileMode && (
              <StyledIconButton onClick={handleCloseDialog} aria-label="Close search dialog">
                <KeyboardArrowLeft />
              </StyledIconButton>
            )}
            <StyledSearchInput
              placeholder={capitalize(`${t("search")} ${isShop ? (id ? t("search.store") : t("store")) : ""}...`)}
              size="small"
              autoFocus
              slotProps={{
                input: {
                  endAdornment: endAdornment,
                },
                htmlInput: {
                  ...getInputProps(),
                },
              }}
            />
          </SearchInputContainer>
          {groupedOptions.length > 0 && (
            <ListBoxContainer>
              <Listbox {...getListboxProps()}>
                {groupedOptions.map((group) => {
                  return (
                    <GroupItem key={`group-${group.key}-${group.index}`}>
                      {group?.group == "HISTORY" ? (
                        <GroupHeader>
                          {t("search.history")}
                          <StyledIconButton onClick={clearKeywords} aria-label={t("search.clear")}>
                            <Delete />
                          </StyledIconButton>
                        </GroupHeader>
                      ) : group?.group == "SUGGEST" ? (
                        <GroupHeader>{t("search.suggest")}</GroupHeader>
                      ) : null}
                      <GroupListBox>
                        {group.options.map((option, index) => {
                          const { key, ...optionProps } = getOptionProps({
                            option,
                            index,
                          });
                          return (
                            <ListItem
                              key={`option-${key}-${index}`}
                              className={option?.group == "SHOP" || option?.group == "STORE" ? "alt" : ""}
                              {...optionProps}
                            >
                              {option?.group == "SHOP" ? (
                                <ListLink to={`/shop?q=${option.value}`}>
                                  <ItemTitle>
                                    <Storefront color="success" />
                                    {capitalize(t("search.for", { ns: "client", value: t("store") }))} "{option.value}"
                                  </ItemTitle>
                                </ListLink>
                              ) : option?.group == "STORE" ? (
                                <ListLink to={`/store?q=${option.value}`}>
                                  <ItemTitle>
                                    <CategoryOutlined color="success" />
                                    {capitalize(t("search.for", { ns: "client", value: t("items") }))} "{option.value}"
                                  </ItemTitle>
                                </ListLink>
                              ) : option?.group == "HISTORY" ? (
                                <ListLink to={`/store?q=${option.value}`}>
                                  <ItemTitle>
                                    <History />
                                    {option.value}
                                  </ItemTitle>
                                  <StyledIconButton
                                    onClick={(e) => handleRemoveKeyword(e, option.value)}
                                    aria-label={t("search.remove", { ns: "client", value: option.value })}
                                  >
                                    <Close />
                                  </StyledIconButton>
                                </ListLink>
                              ) : option?.group == "SUGGEST" ? (
                                <ListLink to={`/store?q=${option.value}`}>
                                  <ItemTitle>
                                    <Search />
                                    {option.value}
                                  </ItemTitle>
                                </ListLink>
                              ) : (
                                option.value
                              )}
                            </ListItem>
                          );
                        })}
                      </GroupListBox>
                    </GroupItem>
                  );
                })}
              </Listbox>
            </ListBoxContainer>
          )}
        </>
      ) : (
        <>
          <SearchInputContainer>
            <StyledSearchInput
              placeholder={capitalize(`${t("search")} ${isShop ? (id ? t("search.store") : t("store")) : ""}...`)}
              size="small"
              slotProps={{
                input: {
                  endAdornment: endAdornment,
                },
                htmlInput: {
                  ...getInputProps(),
                },
              }}
            />
          </SearchInputContainer>
          {groupedOptions.length > 0 && (
            <ListBoxPopover elevation={2}>
              <Listbox {...getListboxProps()}>
                {groupedOptions.map((option, index) => {
                  const { key, ...optionProps } = getOptionProps({
                    option,
                    index,
                  });
                  return (
                    <ListItem
                      key={`option-${key}-${index}`}
                      className={option?.group == "SHOP" || option?.group == "STORE" ? "alt" : ""}
                      {...optionProps}
                    >
                      {option?.group == "SHOP" ? (
                        <ListLink className="alt" to={`/shop?q=${option.value}`}>
                          <ItemTitle>
                            <Storefront color="primary" />
                            {capitalize(t("search.for", { ns: "client", value: t("store") }))} "{option.value}"
                          </ItemTitle>
                        </ListLink>
                      ) : option?.group == "STORE" ? (
                        <ListLink className="alt" to={`/store?q=${option.value}`}>
                          <ItemTitle>
                            <CategoryOutlined color="success" />
                            {capitalize(t("search.for", { ns: "client", value: t("items") }))} "{option.value}"
                          </ItemTitle>
                        </ListLink>
                      ) : option?.group == "HISTORY" ? (
                        <ListLink to={`/store?q=${option.value}`}>
                          <ItemTitle>
                            <History />
                            {option.value}
                          </ItemTitle>
                          <StyledIconButton
                            onClick={(e) => handleRemoveKeyword(e, option.value)}
                            aria-label={t("search.remove", { ns: "client", value: option.value })}
                          >
                            <Close />
                          </StyledIconButton>
                        </ListLink>
                      ) : option?.group == "SUGGEST" ? (
                        <ListLink to={`/store?q=${option.value}`}>
                          <ItemTitle>
                            <Search />
                            {option.value}
                          </ItemTitle>
                        </ListLink>
                      ) : (
                        option.value
                      )}
                    </ListItem>
                  );
                })}
              </Listbox>
            </ListBoxPopover>
          )}
        </>
      )}
    </SearchForm>
  );
};

const Transition = forwardRef(function Transition(props, ref) {
  return <Slide direction="left" ref={ref} {...props} />;
});

const SearchInput = ({ mobileMode, tabletMode, show, isFocus, isShop }) => {
  const displayRef = useRef();
  const { t } = useTranslation();
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [inputValue, setInputValue] = useState(searchParams.get("q") ?? "");
  const [openDialog, setOpenDialog] = useState(undefined);

  useEffect(() => {
    const query = searchParams.get("q");
    setInputValue(query ?? "");
    displayRef.current = query ?? "";
  }, [searchParams]);

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  let autocomplete = (
    <AutocompleteComponent
      {...{
        mobileMode,
        tabletMode,
        searchParams,
        inputValue,
        setInputValue,
        handleOpenDialog,
        handleCloseDialog,
        show,
        isFocus,
        isShop,
        id,
        displayRef,
      }}
    />
  );

  return (
    <>
      {tabletMode ? (
        <AutocompleteContainer className={show ? "" : "hidden"}>
          <StyledSearchInput
            placeholder={capitalize(`${t("search")} ${isShop ? (id ? t("search.store") : t("store")) : ""}...`)}
            size="small"
            value={displayRef.current}
            onClick={handleOpenDialog}
            sx={{ mx: 0.5, maxWidth: 550 }}
            slotProps={{
              input: {
                readOnly: true,
              },
            }}
          />
          <Suspense fallback={null}>
            <Dialog
              open={openDialog}
              fullWidth
              maxWidth={"sm"}
              onClose={handleCloseDialog}
              fullScreen={mobileMode}
              aria-labelledby="search-dialog"
              closeAfterTransition={false}
              slots={{
                transition: Transition,
              }}
              slotProps={{
                paper: {
                  elevation: 2,
                },
              }}
            >
              <DialogContent sx={{ height: 500, padding: "0 !important" }}>{autocomplete}</DialogContent>
            </Dialog>
          </Suspense>
        </AutocompleteContainer>
      ) : (
        <AutocompleteContainer className={show ? "" : "hidden"}>{autocomplete}</AutocompleteContainer>
      )}
    </>
  );
};

export default SearchInput;
