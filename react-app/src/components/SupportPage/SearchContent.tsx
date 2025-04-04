import Fuse from "fuse.js";
import ReactDOMServer from "react-dom/server";

import { FAQContent } from "@/features/support/SupportMockContent";

import { SearchForm } from "../SearchForm";

interface SearchContentProps {
  stateSupportContent: FAQContent[];
  cmsSupportContent: FAQContent[];
  setSearchResults: (searchResults: FAQContent[], isSearching: boolean) => void;
}

const SearchContent = ({
  stateSupportContent,
  cmsSupportContent,
  setSearchResults,
}: SearchContentProps) => {
  const removeTags = (jsxElement: JSX.Element) => {
    const text = ReactDOMServer.renderToStaticMarkup(jsxElement);
    return text.replace(/(<([^>]+)>)/gi, "");
  };

  const supportContent = stateSupportContent.concat(cmsSupportContent);

  const searchAbleContent = supportContent.flatMap(({ qanda }) =>
    qanda.map(({ question, answerJSX, anchorText }) => {
      const answer = removeTags(answerJSX);
      return { question: question, answer: answer, anchorText };
    }),
  );

  const fuse = new Fuse(searchAbleContent, {
    includeScore: true,
    keys: ["question", "answer"],
    findAllMatches: true,
    threshold: 0.3,
    distance: 10000,
  });

  function reorderSupportContent(supportContent: FAQContent[], searchResults, searched) {
    const contentMap = new Map();

    supportContent.forEach((section) => {
      section.qanda.forEach((q) => {
        contentMap.set(q.anchorText, { ...q, sectionTitle: section.sectionTitle });
      });
    });

    const formatedSearchResults = searchResults
      .map((result) => contentMap.get(result.item.anchorText))
      .filter(Boolean);

    return [{ sectionTitle: `Search results for "${searched}"`, qanda: formatedSearchResults }];
  }

  const handleSearch = (s: string) => {
    if (s.length) {
      const searchResults = fuse.search(s);

      if (searchResults.length === 0) {
        setSearchResults([{ sectionTitle: `No results found for "${s}"`, qanda: [] }], true);
        return;
      }

      const formatedSearchResults = reorderSupportContent(supportContent, searchResults, s);
      setSearchResults(formatedSearchResults, true);
      return;
    }
    setSearchResults([], false);
  };

  return <SearchForm handleSearch={handleSearch} isSearching={false} disabled={false} />;
};

export default SearchContent;
