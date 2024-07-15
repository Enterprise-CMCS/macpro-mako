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
    const rend = render(<TestWrapper {...testValues} />);
    const desc = rend.getByText(`${testValues.description}`);
    const wrap = rend.getByTestId(`${testValues.name}Wrapper`);
    const input = rend.getByRole("textbox", { name: `${testValues.name}` });
    expect(desc.classList.contains("py-2")).toBeTruthy();
    expect(wrap.classList.contains("py-4")).toBeTruthy();
    expect(input.id).toBe(testValues.name);
  });

  test("desc above, swap values", () => {
    const rend = render(
      <TestWrapper
        {...testValues}
        descriptionAbove={true}
        descriptionClassName={"py-4"}
        formItemClassName={"py-6"}
      />,
    );
    const desc = rend.getByText(`${testValues.description}`);
    const wrap = rend.getByTestId(`${testValues.name}Wrapper`);
    const input = rend.getByRole("textbox", { name: `${testValues.name}` });
    expect(desc.classList.contains("py-4")).toBeTruthy();
    expect(wrap.classList.contains("py-6")).toBeTruthy();
    expect(input.id).toBe(testValues.name);
  });

  test("no desc, no form styling", () => {
    const rend = render(
      <TestWrapper {...testValues} description={""} formItemClassName={""} />,
    );
    const desc = rend.queryByText(`${testValues.description}`);
    const wrap = rend.getByTestId(`${testValues.name}Wrapper`);
    const input = rend.getByRole("textbox", { name: `${testValues.name}` });
    expect(desc).toBeNull();
    expect(wrap.classList.contains("pb-4")).toBeTruthy();
    expect(input.id).toBe(testValues.name);
  });
});
