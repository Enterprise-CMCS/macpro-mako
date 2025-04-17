import React, { ReactElement, ReactNode } from "react";
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

  // remove all duplicates from the matched text
  const uniqueMatches = [...new Set(matchedText)];

  // used for 'modifier' in the JSXModify Text
  const boldText = (text: string): Node => {
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

type Node = React.ReactElement | string | undefined;

export function JSXModifyText(e: Node, modifier: (s: string) => ReactNode): Node {
  // a. it's nothing. return and stop.
  if (!e) {
    return e;
  }
  // b. it's text. modify, return and stop.
  if (typeof e === "string") {
    return modifier(e);
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
