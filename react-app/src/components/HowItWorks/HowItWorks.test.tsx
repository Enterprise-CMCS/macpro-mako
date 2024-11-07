import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { TrashIcon } from "@radix-ui/react-icons";

import { HowItWorks, Step } from "./index";

describe("HowItWorks", () => {
  it("renders", () => {
    render(
      <HowItWorks>
        <Step
          icon={<TrashIcon data-testid="trash1" />}
          title="Example Title 1"
          content="Example Content 1"
        />
        <Step
          icon={<TrashIcon data-testid="trash2" />}
          title="Example Title 2"
          content="Example Content 2"
        />
      </HowItWorks>,
    );

    expect(screen.getByText("How it works")).toBeInTheDocument();
    expect(screen.getByText("Example Title 1")).toBeInTheDocument();
    expect(screen.getByText("Example Title 1")).toBeInTheDocument();
    expect(screen.getByText("Example Content 2")).toBeInTheDocument();
    expect(screen.getByText("Example Content 2")).toBeInTheDocument();
    expect(screen.getByTestId("trash1")).toBeInTheDocument();
    expect(screen.getByTestId("trash2")).toBeInTheDocument();
  });
});
