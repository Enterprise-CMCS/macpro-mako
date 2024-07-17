import { describe, test, expect } from "vitest";
import { render } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { RHFTextDisplay } from "..";
import { RHFTextField } from "shared-types";

const TestComp = (props: { text: RHFTextField }) => {
  return (
    <BrowserRouter>
      <div>
        <RHFTextDisplay text={props.text} />
      </div>
    </BrowserRouter>
  );
};

const testValues: RHFTextField = [
  { text: "br case", type: "br" },
  { text: "brwrap case", type: "brWrap" },
  { text: "bold case", type: "bold" },
  { text: "itallics case", type: "italic" },
  { text: "link case no link", type: "link" },
  { text: "link case", type: "link", link: "example" },
  {
    list: [{ text: "ordered" }, { text: "list" }, { text: "case" }],
    type: "list",
    listType: "ordered",
  },
  {
    list: [{ text: "unordered" }, { text: "list" }, { text: "case" }],
    type: "list",
    listType: "unordered",
  },
  {
    text: "default styled case",
    classname: "font-bold text-black",
  },
  "simple case",
];

describe("RHFTextDisplay Tests", () => {
  test("test base cases", () => {
    const { container, getByText } = render(<TestComp text={testValues} />);
    const itallicTags = container.getElementsByTagName("i");
    const breakTags = container.getElementsByTagName("br");
    const listTags = container.getElementsByTagName("li");
    const linkTags = container.getElementsByTagName("a");
    const defaultCase = getByText("default styled case");

    expect(itallicTags.length).toBe(1);
    expect(breakTags.length).toBe(3);
    expect(listTags.length).toBe(6);
    expect(linkTags.length).toBe(2);
    expect(linkTags[1].href.includes("example")).toBeTruthy();
    expect(defaultCase.className.includes("text-black")).toBeTruthy();
  });
});
