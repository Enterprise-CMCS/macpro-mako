import { describe, test, expect } from "vitest";
import { render, prettyDOM } from "@testing-library/react";
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
  descriptionClassName: "py-2",
  formItemClassName: "py-4",
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

  test("renders TextDisplay", () => {
    const rend = render(
      <TestWrapper {...testValues} rhf="TextDisplay" text="Sample Text Comp" />,
    );
    const input = rend.getByTestId(testValues.name);
    const input2 = rend.getByText("Sample Text Comp");
    expect(input.firstChild).toEqual(input2.firstChild);
  });

  test("renders Upload", () => {
    const rend = render(
      <TestWrapper {...testValues} rhf="Upload" props={{}} />,
    );
    const input = rend.getByRole("presentation");
    const fileText = rend.getByText("choose from folder");
    expect(fileText.classList.contains("underline")).toBeTruthy();
    expect(input).toBeTruthy();
  });

  test("renders DatePicker", () => {
    const rend = render(
      <TestWrapper {...testValues} rhf="DatePicker" props={{}} />,
    );
    const input = rend.getByText("Pick a date");
    expect(input).toBeTruthy();
  });

  test("Datepicker has value selected", () => {});

  test("renders Select", () => {
    const rend = render(
      <TestWrapper
        {...testValues}
        rhf="Select"
        props={{ options: [{ label: "test", value: "test" }] }}
      />,
    );
    const selectBox = rend.getByRole("combobox");
    expect(selectBox).toBeTruthy();
  });

  test("renders RadioGroup", () => {
    const rend = render(
      <TestWrapper
        {...testValues}
        rhf="Radio"
        props={{
          options: [
            { label: "test1", value: "test1" },
            { label: "test2", value: "test2" },
          ],
        }}
      />,
    );
    console.log("select", prettyDOM(rend.container.firstChild));
  });

  test("render CheckGroup with OptChildren", () => {
    const rend = render(
      <TestWrapper
        {...testValues}
        rhf="Checkbox"
        props={{
          options: [
            {
              label: "test1",
              value: "test1",
              form: [
                {
                  description: "sample form text",
                  slots: [
                    {
                      rhf: "TextDisplay",
                      name: "testTextDisplay1",
                      text: "sample text display 1",
                    },
                  ],
                },
              ],
            },
            {
              label: "test2",
              value: "test2",
              slots: [
                {
                  rhf: "TextDisplay",
                  name: "testTextDisplay1",
                  text: "sample text display 2",
                },
              ],
            },
          ],
        }}
      />,
    );
  });
});
