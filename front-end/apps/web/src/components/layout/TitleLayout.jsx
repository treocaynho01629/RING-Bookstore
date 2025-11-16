import { useMatches } from "react-router";
import { useTranslation } from "react-i18next";
import useTitle from "@ring/shared/useTitle";

const DEFAULT_TITLE = "RING! - Bookstore";

const TitleLayout = () => {
  const matches = useMatches();
  const { t } = useTranslation();

  // Find the last match with a title (most specific route)
  const matchWithTitle = matches
    .slice()
    .reverse()
    .find((match) => match.handle?.title);

  // Set title
  const title = matchWithTitle?.handle?.title || DEFAULT_TITLE;
  useTitle(t(title));
};

export default TitleLayout;
