import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import useApp from "../../hooks/useApp";

const LanguageSync = () => {
  const { setLanguage } = useApp();
  const { i18n } = useTranslation();

  useEffect(() => {
    setLanguage(i18n.language);
  }, [i18n.language]);
};

export default LanguageSync;
