import Fuse from "fuse.js";
import ReactDOMServer from "react-dom/server";

import { FAQContentType } from "@/features/support/SupportMockContent";

import Search from "./search";

interface SearchContentProps {
  placeholderText: string;
  stateSupportContent: FAQContentType[];
  cmsSupportContent: FAQContentType[];
  isSearching: boolean;
  setSearchResults: (searchResults: FAQContentType[], isSearching: boolean) => void;
}

const SearchContent = ({
  stateSupportContent,
  cmsSupportContent,
  setSearchResults,
  isSearching,
  placeholderText,
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
    includeMatches: true,
    threshold: 0.1,
    distance: 10000,
  });

  function reorderSupportContent(supportContent: FAQContentType[], searchResults, searched) {
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
      console.log("SEARCH RESULTS", searchResults);

      if (searchResults.length === 0) {
        console.log("NO RESULTS FOUND");
        setSearchResults([{ sectionTitle: `No matches found for "${s}"`, qanda: [] }], true);
        return;
      }

      const formatedSearchResults = reorderSupportContent(supportContent, searchResults, s);
      setSearchResults(formatedSearchResults, true);
      return;
    }
  };

  return (
    <Search
      handleSearch={handleSearch}
      placeholderText={placeholderText}
      isSearching={isSearching}
    />
  );
};

export default SearchContent;
