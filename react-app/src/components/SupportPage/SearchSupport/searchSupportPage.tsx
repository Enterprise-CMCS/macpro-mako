import Fuse from "fuse.js";
import ReactDOMServer from "react-dom/server";

import { FAQContentType, QuestionAnswer } from "@/features/support/SupportMockContent";

import { generateBoldAnswerJSX } from "./boldSearchResults";
import Search from "./searchBarUI";

interface SearchContentProps {
  placeholderText: string;
  supportContent: FAQContentType[];
  isSearching: boolean;
  setSearchResults: (searchResults: FAQContentType[], isSearching: boolean) => void;
}

const SearchContent = ({
  supportContent,
  setSearchResults,
  isSearching,
  placeholderText,
}: SearchContentProps) => {
  const removeTags = (jsxElement: JSX.Element) => {
    const text = ReactDOMServer.renderToStaticMarkup(jsxElement);
    return text.replace(/(<([^>]+)>)/gi, "");
  };

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
    minMatchCharLength: 2,
    distance: 1000000,
  });

  function reorderSupportContent(supportContent: FAQContentType[], searchResults, searched) {
    const contentMap = new Map();

    supportContent.forEach((section) => {
      section.qanda.forEach((q) => {
        contentMap.set(q.anchorText, { ...q, sectionTitle: section.sectionTitle });
      });
    });

    const formatedSearchResults = searchResults
      .map((result) => {
        const matches: { indices: [number, number][]; value: string }[] = result.matches.filter(
          (matches) => matches.key === "answer",
        );
        const resultsInOgFormat: QuestionAnswer = contentMap.get(result.item.anchorText);

        matches.forEach((match) => {
          resultsInOgFormat.answerJSX = generateBoldAnswerJSX(
            match.value,
            resultsInOgFormat.answerJSX,
            match.indices,
          );
        });

        return resultsInOgFormat;
      })
      .filter(Boolean);

    return [{ sectionTitle: `Search results for "${searched}"`, qanda: formatedSearchResults }];
  }

  const handleSearch = (s: string) => {
    if (s.length) {
      const searchResults = fuse.search(s);

      if (searchResults.length === 0) {
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
