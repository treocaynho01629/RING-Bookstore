import { useDispatch, useSelector } from "react-redux";
import {
  selectKeywords,
  addKeyword as addStatekeyword,
  removeKeyword as removeStateKeyword,
  resetKeywords,
  selectLanguage,
  setLanguage as setStateLanguage,
} from "../features/app/appReducer";

const useApp = () => {
  const dispatch = useDispatch();
  const keywords = useSelector(selectKeywords);
  const language = useSelector(selectLanguage);

  const addKeyword = (keyword) => {
    dispatch(addStatekeyword(keyword));
  };
  const removeKeyword = (keyword) => dispatch(removeStateKeyword(keyword));
  const clearKeywords = () => dispatch(resetKeywords());
  const setLanguage = (language) => dispatch(setStateLanguage(language));

  return {
    keywords,
    language,
    addKeyword,
    removeKeyword,
    clearKeywords,
    setLanguage,
  };
};

export default useApp;
