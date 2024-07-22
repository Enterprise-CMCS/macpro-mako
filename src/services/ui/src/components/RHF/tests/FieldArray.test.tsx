import { describe, test, expect } from "vitest";
import { fireEvent, render } from "@testing-library/react";
import { RHFSlot } from "..";
import { Form, FormField } from "../../Inputs";
import { Control, useForm } from "react-hook-form";
import { RHFSlotProps } from "shared-types";

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
  rhf: "FieldGroup",
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

describe("Field Tests", () => {
  test("renders FieldArray", () => {
    const rend = render(<TestWrapper {...testValues} />);
    const input = rend.getByLabelText("Test Input");
    expect(input.id).toBe(
      testValues.name + ".0." + testValues.fields?.[0].name,
    );
  });

  test("renders FieldArray with Wrapped Field", () => {
    const rend = render(<TestWrapper {...testWrapperValues} />);
    const input = rend.getByLabelText("Test Input");
    expect(input.id).toBe(testValues.name + ".0.test");
  });

  test("test wrapper with Dependencies", () => {
    const rend = render(<TestWrapper {...testWrapperDependency} />);
    const input = rend.getByLabelText("Test Input");
    const input2 = rend.getByLabelText("Test Input 2");
    const input3 = rend.queryByLabelText("Test Input 3");
    expect(input.id).toBe(testValues.name + ".0.test");
    expect(input2.id).toBe(testValues.name + ".0.test2");
    expect(input3).toBeNull();
  });
});

describe("FieldArray Test", () => {
  test("appends New Row, deletes Row", () => {
    const rend = render(<TestWrapper {...testValues} />);
    const addButton = rend.getByTestId("appendRowButton-testName");
    fireEvent.click(addButton);
    const inputs = rend.getAllByLabelText("Test Input");
    expect(inputs).toHaveLength(2);

    const remButton = rend.getByTestId("removeRowButton-1");
    fireEvent.click(remButton);
    const input = rend.getAllByLabelText("Test Input");
    expect(input).toHaveLength(1);
  });

  test("appends New Group, deletes Group", () => {
    const rend = render(<TestWrapper {...testValuesGroup} />);
    const addButton = rend.getByTestId("appendRowButton-testName");
    fireEvent.click(addButton);
    const inputs = rend.getAllByLabelText("Test Input");
    expect(inputs).toHaveLength(2);

    const remButton = rend.getByTestId("removeGroupButton-1");
    fireEvent.click(remButton);
    const input = rend.getAllByLabelText("Test Input");
    expect(input).toHaveLength(1);
  });

  test("sets Default Values", () => {
    const rend = render(
      <TestWrapper {...testValues} defaultValues={{ testName: [] }} />,
    );
    const input = rend.getByLabelText("Test Input");
    expect((input as HTMLInputElement).value).toBe("");
  });
});
