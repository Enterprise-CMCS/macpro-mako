import { describe, test, expect } from "vitest";
import { screen } from "@testing-library/react";
import { RHFSlot } from "..";
import { Form, FormField } from "../../Inputs";
import { Control, useForm } from "react-hook-form";
import { DefaultFieldGroupProps, RHFSlotProps } from "shared-types";
import { renderWithQueryClient } from "@/utils/test-helpers/renderForm";
import userEvent from "@testing-library/user-event";

const TestWrapper = (props: RHFSlotProps & { defaultValues?: any }) => {
  const form = useForm<any>({
    defaultValues: props.defaultValues ?? { testName: [{ test: "test" }] },
  });
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
  rhf: "FieldArray",
  fields: [
    {
      name: "test",
      rhf: "Input",
      label: "Test Input",
    },
  ],
};

const testValuesGroup: RHFSlotProps = {
  name: "testName",
  rhf: "FieldArray",
  props: { ...DefaultFieldGroupProps },
  fields: [
    {
      name: "test",
      rhf: "Input",
      label: "Test Input",
    },
  ],
};

const testWrapperValues: RHFSlotProps = {
  ...testValues,
  fields: [
    {
      name: "testWrapper",
      rhf: "WrappedGroup",
      fields: [
        {
          name: "test",
          rhf: "Input",
          label: "Test Input",
        },
      ],
    },
  ],
};

const testWrapperDependency: RHFSlotProps = {
  ...testValues,
  fields: [
    {
      name: "testWrapper",
      rhf: "WrappedGroup",
      props: { wrapperClassName: "w-2rem" },
      fields: [
        {
          name: "test",
          rhf: "Input",
          label: "Test Input",
          rules: {
            maxLength: 7,
          },
        },
        {
          name: "test2",
          rhf: "Input",
          label: "Test Input 2",
          dependency: {
            conditions: [
              {
                expectedValue: "test",
                name: "testName.0.test",
                type: "expectedValue",
              },
            ],
            effect: { type: "hide" },
          },
        },
        {
          name: "test3",
          rhf: "Input",
          label: "Test Input 3",
          dependency: {
            conditions: [
              {
                expectedValue: "test",
                name: "testName.0.test",
                type: "expectedValue",
              },
            ],
            effect: { type: "show" },
          },
        },
      ],
    },
  ],
};

// vi.spyOn(api, "useGetUser").mockImplementation(() => {
//   const response = mockUseGetUser();
//   return response as UseQueryResult<OneMacUser, unknown>;
// });

describe("Field Tests", () => {
  test("renders FieldArray", () => {
    renderWithQueryClient(<TestWrapper {...testValues} />);
    const input = screen.getByLabelText("Test Input");
    expect(input.id).toBe(testValues.name + ".0." + testValues.fields?.[0].name);
  });

  test("renders FieldArray with Wrapped Field", () => {
    renderWithQueryClient(<TestWrapper {...testWrapperValues} />);
    const input = screen.getByLabelText("Test Input");
    expect(input.id).toBe(testValues.name + ".0.test");
  });

  test("test wrapper with Dependencies", () => {
    renderWithQueryClient(<TestWrapper {...testWrapperDependency} />);
    const input = screen.getByLabelText("Test Input");
    const input2 = screen.getByLabelText("Test Input 2");
    const input3 = screen.queryByLabelText("Test Input 3");
    expect(input.id).toBe(testValues.name + ".0.test");
    expect(input2.id).toBe(testValues.name + ".0.test2");
    expect(input3).toBeNull();
  });
});

describe("FieldArray Test", () => {
  test("appends New Row, deletes Row", async () => {
    const user = userEvent.setup();
    renderWithQueryClient(<TestWrapper {...testValues} />);
    const addButton = screen.getByTestId("appendRowButton-testName");
    await user.click(addButton);
    const inputs = screen.getAllByLabelText("Test Input");
    expect(inputs).toHaveLength(2);

    const remButton = screen.getByTestId("removeRowButton-1");
    await user.click(remButton);
    const input = screen.getAllByLabelText("Test Input");
    expect(input).toHaveLength(1);
  });

  test("appends New Group, deletes Group", async () => {
    const user = userEvent.setup();
    renderWithQueryClient(<TestWrapper {...testValuesGroup} />);
    const addButton = screen.getByTestId("appendRowButton-testName");
    await user.click(addButton);
    const inputs = screen.getAllByLabelText("Test Input");
    expect(inputs).toHaveLength(2);

    const remButton = screen.getByTestId("removeGroupButton-1");
    await user.click(remButton);
    const input = screen.getAllByLabelText("Test Input");
    expect(input).toHaveLength(1);
  });

  test("sets Default Values", () => {
    renderWithQueryClient(<TestWrapper {...testValues} defaultValues={{ testName: [] }} />);
    const input = screen.getByLabelText("Test Input");
    expect((input as HTMLInputElement).value).toBe("");
  });
});
