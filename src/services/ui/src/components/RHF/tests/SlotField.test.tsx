import { describe, test, expect } from "vitest";
import { render } from "@testing-library/react";
import { RHFSlot } from "../.";
import { Form, FormField } from "../../Inputs";
import { Control, useForm } from "react-hook-form";
import { RHFSlotProps } from "shared-types";

const TestWrapper = (props: RHFSlotProps) => {
  const form = useForm();
  return (
    <div>
      <Form {...form}>
        <form>
          <FormField
            control={form.control}
            name={((props.groupNamePrefix ?? "") + props.name) as never}
            render={RHFSlot({
              ...props,
              control: form.control as Control,
              groupNamePrefix: props.groupNamePrefix,
            })}
          />
        </form>
      </Form>
    </div>
  );
};

const testValues: RHFSlotProps = {
  name: "testName",
  rhf: "Input",
  description: "test desc",
  descriptionAbove: false,
  descriptionStyling: "py-2",
  formItemStyling: "py-4",
};

describe("Slot Input Field Tests", () => {
  test("renders Input", () => {
    const rend = render(<TestWrapper {...testValues} />);
    const input = rend.getByRole("textbox", { name: `${testValues.name}` });
    expect(input.id).toBe(testValues.name);
  });
  test("renders Textarea", () => {
    const rend = render(
      <TestWrapper {...testValues} rhf="Textarea" props={{}} />,
    );
    const input = rend.getByRole("textbox", { name: `${testValues.name}` });
    expect(input.name).toBe(testValues.name);
  });
  test("renders Switch", () => {
    const rend = render(
      <TestWrapper {...testValues} rhf="Switch" props={{}} />,
    );
    const input = rend.getByRole("button", { name: `${testValues.name}` });
    expect(input.id).toBe(testValues.name);
  });
  test("renders TextDisplay", () => {
    const rend = render(
      <TestWrapper {...testValues} rhf="TextDisplay" text="Sample Text Comp" />,
    );
    const input = rend.getByText("Sample Text Comp");
    expect(input.id).toBe(testValues.name);
  });
  test("renders Upload", () => {
    const rend = render(
      <TestWrapper {...testValues} rhf="Upload" props={{}} />,
    );
    const input = rend.getByRole("file");
    const fileText = rend.getByText("choose from folder");
    expect(fileText.classList.contains("underline")).toBeTruthy();
    expect(input).toBeTruthy();
  });
  test("renders DatePicker", () => {
    const rend = render(
      <TestWrapper {...testValues} rhf="DatePicker" props={{}} />,
    );
    const input = rend.getByText("Pick a date");
    expect(input.id).toBe(testValues.name);
  });
});
