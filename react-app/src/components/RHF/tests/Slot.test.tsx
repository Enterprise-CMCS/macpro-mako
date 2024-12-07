import { describe, test, expect } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithQueryClient } from "@/utils/test-helpers/renderForm";
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
            name={((props.parentId ?? "") + props.name) as never}
            render={RHFSlot({
              ...props,
              control: form.control as Control,
              parentId: props.parentId,
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
  descriptionClassName: "py-2",
  formItemClassName: "py-4",
};

describe("RHFSlot tests", () => {
  test("render label, desc, and comp", () => {
    renderWithQueryClient(<TestWrapper {...testValues} />);
    const desc = screen.getByText(`${testValues.description}`);
    const wrap = screen.getByTestId(`${testValues.name}Wrapper`);
    const input = screen.getByRole("textbox", { name: `${testValues.name}` });
    expect(desc.classList.contains("py-2")).toBeTruthy();
    expect(wrap.classList.contains("py-4")).toBeTruthy();
    expect(input.id).toBe(testValues.name);
  });

  test("desc above, swap values", () => {
    renderWithQueryClient(
      <TestWrapper
        {...testValues}
        descriptionAbove={true}
        descriptionClassName={"py-4"}
        formItemClassName={"py-6"}
      />,
    );
    const desc = screen.getByText(`${testValues.description}`);
    const wrap = screen.getByTestId(`${testValues.name}Wrapper`);
    const input = screen.getByRole("textbox", { name: `${testValues.name}` });
    expect(desc.classList.contains("py-4")).toBeTruthy();
    expect(wrap.classList.contains("py-6")).toBeTruthy();
    expect(input.id).toBe(testValues.name);
  });

  test("no desc, no form styling", () => {
    renderWithQueryClient(<TestWrapper {...testValues} description={""} formItemClassName={""} />);
    const desc = screen.queryByText(`${testValues.description}`);
    const wrap = screen.getByTestId(`${testValues.name}Wrapper`);
    const input = screen.getByRole("textbox", { name: `${testValues.name}` });
    expect(desc).toBeNull();
    expect(wrap.classList.contains("gap-4")).toBeTruthy();
    expect(input.id).toBe(testValues.name);
  });
});
