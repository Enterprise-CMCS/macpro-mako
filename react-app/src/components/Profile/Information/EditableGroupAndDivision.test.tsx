import { screen } from "@testing-library/react";
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

  it("maps numeric group and division values to labels", () => {
    renderWithQueryClient(
      <EditableGroupAndDivision group="1" division="16" allowEdits email="test@example.com" />,
    );
    expect(screen.getByText("CAHPG/DSCP")).toBeInTheDocument();
  });

  it("should render correctly without group and division", () => {
    const { asFragment } = renderWithQueryClient(
      <EditableGroupAndDivision allowEdits email="test@example.com" />,
    );
    expect(asFragment()).toMatchSnapshot();
  });
});
