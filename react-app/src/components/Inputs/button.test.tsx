import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Button } from "./button";

describe("Button Component", () => {
  it("renders children correctly", () => {
    render(<Button>Click Me</Button>);
    expect(screen.getByText("Click Me")).toBeInTheDocument();
  });

  it("applies default variant and size classes", () => {
    render(<Button>Click Me</Button>);
    const button = screen.getByText("Click Me");
    expect(button).toHaveClass("bg-primary text-slate-50");
  });

  it("applies the correct variant and size classes when props are set", () => {
    render(
      <Button variant="destructive" size="lg">
        Delete
      </Button>,
    );
    const button = screen.getByText("Delete");
    expect(button).toHaveClass("bg-destructive");
    expect(button).toHaveClass("h-11 px-8");
  });

  it("shows a loading spinner when loading prop is true", () => {
    const { container } = render(<Button loading>Loading</Button>);
    const spinner = container.querySelector(".animate-spin");
    expect(spinner).toBeInTheDocument();
  });

  it("disables the button when the disabled prop is true", () => {
    render(<Button disabled>Disabled</Button>);
    const button = screen.getByText("Disabled");
    expect(button).toBeDisabled();
  });
});
