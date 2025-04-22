import { ReactElement, ReactNode } from "react";
import reactStringReplace from "react-string-replace";

export const generateBoldAnswerJSX = (searched: string, resultsJSX: ReactElement) => {
  const boldText = (text: string) => {
    const replacedText = reactStringReplace(text, searched, (match, i) => (
      <strong key={`bold-${i}`}>{match}</strong>
    ));

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
