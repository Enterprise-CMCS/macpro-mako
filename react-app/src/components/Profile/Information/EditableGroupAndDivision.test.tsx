import { describe, expect, it } from "vitest";

import { renderWithQueryClient } from "@/utils/test-helpers";

import { EditableGroupAndDivision } from "./EditableGroupAndDivision";

describe("EditableGroupAndDivision ", () => {
  it("should render correctly with allowEdits true", () => {
    const { asFragment } = renderWithQueryClient(
      <EditableGroupAndDivision allowEdits email="test@example.com" />,
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it("should render correctly with allowEdits false", () => {
    const { asFragment } = renderWithQueryClient(
      <EditableGroupAndDivision allowEdits={false} email="test@example.com" />,
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it("should render correctly with group and division", () => {
    const { asFragment } = renderWithQueryClient(
      <EditableGroupAndDivision
        group="Group A"
        division="Division 1"
        allowEdits
        email="test@example.com"
      />,
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it("should render correctly without group and division", () => {
    const { asFragment } = renderWithQueryClient(
      <EditableGroupAndDivision allowEdits email="test@example.com" />,
    );
    expect(asFragment()).toMatchSnapshot();
  });
});
