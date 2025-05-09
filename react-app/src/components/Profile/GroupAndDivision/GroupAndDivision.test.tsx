import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { GroupAndDivision } from "./index";

describe("GroupAndDivision", () => {
  it("should return null if user is a defaultcmsuser", () => {
    render(<GroupAndDivision division="Test" group="Testers" role="defaultcmsuser" />);
    expect(screen.queryByText("Group & Division")).toBeNull();
  });

  it("should return null if user is a systemadmin", () => {
    render(<GroupAndDivision division="Test" group="Testers" role="systemadmin" />);
    expect(screen.queryByText("Group & Division")).toBeNull();
  });

  it("should return null if user is a cmsroleapprover", () => {
    render(<GroupAndDivision division="Test" group="Testers" role="cmsroleapprover" />);
    expect(screen.getByText("Group & Division")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Group:" })).toBeInTheDocument();
    expect(screen.getByText("Testers")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Division:" })).toBeInTheDocument();
    expect(screen.getByText("Test")).toBeInTheDocument();
  });
});
