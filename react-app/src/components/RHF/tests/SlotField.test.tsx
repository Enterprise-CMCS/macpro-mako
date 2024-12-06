import { describe, test, expect, vi } from "vitest";
import { render, fireEvent } from "@testing-library/react";
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

vi.mock("@/api", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...(actual as object),
    useGetCounties: vi.fn(() => {
      return { data: [], isLoading: false, error: null };
    }),
  };
});

describe("Slot Input Field Tests", () => {
  test("renders Input", () => {
    const rend = render(<TestWrapper {...testValues} />);
    const input = rend.getByRole("textbox", { name: `${testValues.name}` });
    expect(input.id).toBe(testValues.name);
  });

  test("renders Textarea", () => {
    const rend = render(<TestWrapper {...testValues} rhf="Textarea" props={{}} />);
    const input = rend.getByRole("textbox", { name: `${testValues.name}` });
    expect((input as any)?.name).toBe(testValues.name);
  });

  test("renders TextDisplay", () => {
    const rend = render(<TestWrapper {...testValues} rhf="TextDisplay" text="Sample Text Comp" />);
    const input = rend.getByTestId(testValues.name);
    const input2 = rend.getByText("Sample Text Comp");
    expect(input.firstChild).toEqual(input2.firstChild);
  });

  test("renders Upload", () => {
    const rend = render(<TestWrapper {...testValues} rhf="Upload" props={{}} />);
    const input = rend.getByRole("presentation");
    const fileText = rend.getByText("choose from folder");
    expect(fileText.classList.contains("underline")).toBeTruthy();
    expect(input).toBeTruthy();
  });

  test("renders DatePicker", () => {
    const rend = render(<TestWrapper {...testValues} rhf="DatePicker" props={{}} />);
    const dpt = rend.getByText("Pick a date");
    expect(dpt).toBeTruthy();
  });

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

  describe("Multiselect", () => {
    test("renders Multiselect", () => {
      const { getByRole } = render(
        <TestWrapper
          {...testValues}
          rhf="Multiselect"
          props={{
            options: [
              { label: "test 1", value: "test-1" },
              { label: "test 2", value: "test-2" },
            ],
          }}
        />,
      );

      expect(getByRole("combobox")).toBeInTheDocument();
    });

    test("renders options correctly", () => {
      const { getByText, getByRole } = render(
        <TestWrapper
          {...testValues}
          rhf="Multiselect"
          props={{
            options: [
              { label: "test 1", value: "test-1" },
              { label: "test 2", value: "test-2" },
            ],
          }}
        />,
      );

      fireEvent.mouseDown(getByRole("combobox"));
      expect(getByText("test 1")).toBeInTheDocument();
      expect(getByText("test 2")).toBeInTheDocument();
    });

    test("allows multiple selections", () => {
      const { getByText, getByRole, container } = render(
        <TestWrapper
          {...testValues}
          rhf="Multiselect"
          props={{
            options: [
              { label: "test 1", value: "test-1" },
              { label: "test 2", value: "test-2" },
            ],
          }}
        />,
      );

      fireEvent.mouseDown(getByRole("combobox"));
      fireEvent.click(getByText("test 1"));
      fireEvent.mouseDown(getByRole("combobox"));
      fireEvent.click(getByText("test 2"));

      const selectedOptions = container.querySelectorAll(".css-1p3m7a8-multiValue");
      expect(selectedOptions).toHaveLength(2);
      expect(selectedOptions[0]).toHaveTextContent("test 1");
      expect(selectedOptions[1]).toHaveTextContent("test 2");
    });
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
    const radio1 = rend.getByLabelText("test1");
    const radio2 = rend.getByLabelText("test2");

    fireEvent.click(radio1);
    expect(radio1).toBeChecked();
    expect(radio2).not.toBeChecked();
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

    const check1 = rend.getByLabelText("test1");
    const check2 = rend.getByLabelText("test2");

    fireEvent.click(check1);
    expect(check1).toBeChecked();
    expect(check2).not.toBeChecked();

    fireEvent.click(check2);
    const text1 = rend.getByText("sample text display 1");
    const text2 = rend.getByText("sample text display 2");
    expect(check2).toBeChecked();
    expect(text1).toBeTruthy();
    expect(text2).toBeTruthy();
  });
});
