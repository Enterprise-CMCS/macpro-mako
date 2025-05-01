import { render } from "@testing-library/react";
import React from "react";
import { describe, expect, it } from "vitest";

import { generateBoldAnswerJSX } from "./boldSearchResults";

describe("generateBoldAnswerJSX", () => {
  it("wraps matched text in <strong> for plain text", () => {
    const inputJSX = <p>This is a test answer.</p>;
    const searched = "test";

    const result = generateBoldAnswerJSX(searched, inputJSX);

    const { container } = render(result);
    expect(container.innerHTML).toContain("<strong>test</strong>");
    expect(container.innerHTML).toContain("This is a <strong>test</strong> answer.");
  });

  it("wraps multiple occurrences of the searched word", () => {
    const inputJSX = <p>Testing test cases with test values.</p>;
    const searched = "test";

    const result = generateBoldAnswerJSX(searched, inputJSX);

    const { container } = render(result);
    const strongTags = container.querySelectorAll("strong");
    expect(strongTags.length).toBe(3);
    expect(container.innerHTML).toContain("<strong>test</strong>");
  });

  it("recursively bolds nested elements", () => {
    const inputJSX = (
      <div>
        <p>
          This is a nested <span>test</span> element.
        </p>
      </div>
    );
    const searched = "test";

    const result = generateBoldAnswerJSX(searched, inputJSX);

    const { container } = render(result);
    expect(container.querySelectorAll("strong").length).toBe(1);
    expect(container.innerHTML).toContain("<strong>test</strong>");
  });

  it("returns unchanged JSX if nothing matches", () => {
    const inputJSX = <p>No match here</p>;
    const searched = "test";

    const result = generateBoldAnswerJSX(searched, inputJSX);
    const { container } = render(result);

    expect(container.querySelector("strong")).toBeNull();
    expect(container.textContent).toBe("No match here");
  });
});
