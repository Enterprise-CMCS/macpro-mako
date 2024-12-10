import { describe, test, expect } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithQueryClient } from "@/utils/test-helpers/renderForm";
import { RHFSlot } from "../.";
import { Form, FormField } from "../../Inputs";
import { Control, useForm } from "react-hook-form";
import { RHFSlotProps } from "shared-types";
import userEvent from "@testing-library/user-event";

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

describe("Slot Input Field Tests", () => {
  test("renders Input", async () => {
    renderWithQueryClient(<TestWrapper {...testValues} />);
    const input = screen.getByRole("textbox", { name: `${testValues.name}` });
    expect(input.id).toBe(testValues.name);
  });

  test("renders Textarea", async () => {
    renderWithQueryClient(<TestWrapper {...testValues} rhf="Textarea" props={{}} />);
    const input = screen.getByRole("textbox", { name: `${testValues.name}` });
    expect((input as any)?.name).toBe(testValues.name);
  });

  test("renders TextDisplay", async () => {
    renderWithQueryClient(
      <TestWrapper {...testValues} rhf="TextDisplay" text="Sample Text Comp" />,
    );
    const input = screen.getByTestId(testValues.name);
    const input2 = screen.getByText("Sample Text Comp");
    expect(input.firstChild).toEqual(input2.firstChild);
  });

  test("renders Upload", async () => {
    renderWithQueryClient(<TestWrapper {...testValues} rhf="Upload" props={{}} />);
    const input = screen.getByRole("presentation");
    const fileText = screen.getByText("choose from folder");
    expect(fileText.classList.contains("underline")).toBeTruthy();
    expect(input).toBeTruthy();
  });

  test("renders DatePicker", async () => {
    renderWithQueryClient(<TestWrapper {...testValues} rhf="DatePicker" props={{}} />);
    const dpt = screen.getByText("Pick a date");
    expect(dpt).toBeTruthy();
  });

  test("renders Select", async () => {
    renderWithQueryClient(
      <TestWrapper
        {...testValues}
        rhf="Select"
        props={{ options: [{ label: "test", value: "test" }] }}
      />,
    );
    const selectBox = screen.getByRole("combobox");
    expect(selectBox).toBeTruthy();
  });

  describe("Multiselect", () => {
    test("renders Multiselect", async () => {
      renderWithQueryClient(
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

      expect(screen.getByRole("combobox")).toBeInTheDocument();
    });

    test("renders options correctly", async () => {
      const user = userEvent.setup();
      renderWithQueryClient(
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

      await user.click(screen.getByRole("combobox"));
      expect(screen.getByText("test 1")).toBeInTheDocument();
      expect(screen.getByText("test 2")).toBeInTheDocument();
    });

    test("allows multiple selections", async () => {
      const user = userEvent.setup();
      renderWithQueryClient(
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

      expect(screen.queryByText("test 1")).not.toBeInTheDocument();
      expect(screen.queryByText("test 2")).not.toBeInTheDocument();
      expect(screen.queryByText("test 3")).not.toBeInTheDocument();

      const multiselect = screen.getByRole("combobox");
      await user.type(multiselect, "test 1{enter}");
      await user.type(multiselect, "test 2{enter}");
      await user.type(multiselect, "test 3{enter}");

      expect(screen.queryByText("test 1")).toBeInTheDocument();
      expect(screen.queryByText("test 2")).toBeInTheDocument();
      expect(screen.queryByText("test 3")).not.toBeInTheDocument();
    });
  });

  test("renders RadioGroup", async () => {
    const user = userEvent.setup();
    renderWithQueryClient(
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
    const radio1 = screen.getByLabelText("test1");
    const radio2 = screen.getByLabelText("test2");

    await user.click(radio1);
    expect(radio1).toBeChecked();
    expect(radio2).not.toBeChecked();
  });

  test("render CheckGroup with OptChildren", async () => {
    const user = userEvent.setup();
    renderWithQueryClient(
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

    const check1 = screen.getByLabelText("test1");
    const check2 = screen.getByLabelText("test2");

    await user.click(check1);
    expect(check1).toBeChecked();
    expect(check2).not.toBeChecked();

    await user.click(check2);
    const text1 = screen.getByText("sample text display 1");
    const text2 = screen.getByText("sample text display 2");
    expect(check2).toBeChecked();
    expect(text1).toBeInTheDocument();
    expect(text2).toBeInTheDocument();
  });
});
