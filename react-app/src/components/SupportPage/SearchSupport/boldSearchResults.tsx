import { ReactElement, ReactNode } from "react";
import reactStringReplace from "react-string-replace";

export const generateBoldAnswerJSX = (
  resultText: string,
  resultsJSX: ReactElement,
  regions: [number, number][] = [],
) => {
  const matchedText = [];

  // get the substring matches abstracted
  regions.forEach((region) => {
    const [start, end] = region;
    const lastRegionNextIndex = end + 1;

    matchedText.push(resultText.substring(start, lastRegionNextIndex));
  });

  // we want the longest (aka closest) matches to be found first
  matchedText.sort((a, b) => b.length - a.length);
  // remove all duplicates from the matched text
  const uniqueMatches = [...new Set(matchedText)];

  // used for 'modifier' in the JSXModify Text
  // keep in the scope of this function to be able to use uniqueMatches
  const boldText = (text: string) => {
    let replacedText = reactStringReplace(text, uniqueMatches[0], (match, i) => (
      <strong key={`bold-${i}`}>{match}</strong>
    ));

    uniqueMatches.forEach(
      (match) =>
        (replacedText = reactStringReplace(replacedText, match, (match, i) => (
          <strong key={`bold-${i}`}>{match}</strong>
        ))),
    );
    return replacedText;
  };

  return JSXModifyText(resultsJSX, boldText);
};

// https://adueck.github.io/blog/recursively-modify-text-jsx-react/ - Modify JSX

type Node = ReactElement;

export function JSXModifyText(e: Node, modifier: (s: string) => ReactNode): ReactElement {
  // a. it's nothing. return and stop.
  if (!e) {
    return e;
  }
  // b. it's text. modify, return and stop.
  if (typeof e === "string") {
    return <>{modifier(e)}</>;
  }
  // we have an element with something inside
  // let's return the outside and recursively work on the inside
  return {
    ...e,
    props: {
      ...e.props,
      children:
        // c. There's an array of nodes inside -> repeat for each one ⤴
        Array.isArray(e.props.children)
          ? e.props.children.map((x: Node) => JSXModifyText(x, modifier))
          : // d. There's just one node inside -> repeat for it ⤴
            JSXModifyText(e.props.children, modifier),
    },
  };
}
