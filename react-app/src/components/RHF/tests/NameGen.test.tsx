import { describe, test, expect } from "vitest";
import { render } from "@testing-library/react";
import { RHFDocument } from "../.";
import { Form } from "../../Inputs";
import { useForm } from "react-hook-form";
import { FormSchema } from "shared-types";
import userEvent from "@testing-library/user-event";

const testForm: FormSchema = {
  formId: "testFormId",
  header: "Test Form",
  sections: [
    {
      sectionId: "testSection1",
      title: "Test Section 1",
      form: [
        {
          description: "Sample form group description",
          slots: [
            { name: "testInput1", rhf: "Input", label: "Test Input 1 Label" },
            {
              name: "testInput2",
              rhf: "Input",
              label: "Test Input 2 (dependency)",
              dependency: {
                conditions: [
                  {
                    name: "testFormId_testSection1_testInput1",
                    type: "expectedValue",
                    expectedValue: "sample text 1",
                  },
                ],
                effect: { type: "show" },
              },
            },
          ],
        },
      ],
    },
    {
      sectionId: "testSection2",
      title: "Test Section 2",
      form: [
        {
          slots: [
            { name: "testInput3", rhf: "Input", label: "Test Input 3 Label" },
          ],
        },
      ],
    },
  ],
};

const TestWrapper = (props: { onSubmit: (d: any) => void }) => {
  const form = useForm();
  return (
    <div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(
            (d) => props.onSubmit(d),
            () => console.error("Form Submission Failed"),
          )}
        >
          <RHFDocument document={testForm} {...form} />
        </form>
      </Form>
    </div>
  );
};

describe("Test Name Generation", () => {
  test("Generate Structure Correctly", () => {
    const rend = render(
      <TestWrapper
        onSubmit={() => {
          console.error("onSubmit Called In Invalid Test State");
        }}
      />,
    );
    const input1 = rend.getByLabelText("Test Input 1 Label");
    const input3 = rend.getByLabelText("Test Input 3 Label");
    const input2 = rend.queryByLabelText("Test Input 2 (dependency)");

    expect(input1).toBeTruthy();
    expect(input3).toBeTruthy();
    expect(input2).toBeNull();
  });

  test("Test Dependency Wrapper works with name generation", async () => {
    const rend = render(
      <TestWrapper
        onSubmit={() => {
          console.error("onSubmit Called In Invalid Test State");
        }}
      />,
    );
    const input1 = rend.getByLabelText("Test Input 1 Label");
    const input3 = rend.getByLabelText("Test Input 3 Label");

    await userEvent.type(input1, "sample text 1");

    const input2 = rend.getByLabelText("Test Input 2 (dependency)");
    expect(input1).toBeTruthy();
    expect(input3).toBeTruthy();
    expect(input2).toBeTruthy();
  });

  test("Test data structure matches expectation", async () => {
    let data: any = {};
    const rend = render(
      <TestWrapper
        onSubmit={(d) => {
          console.log("d", d);
          data = d;
        }}
      />,
    );
    const input1 = rend.getByLabelText("Test Input 1 Label");
    const input3 = rend.getByLabelText("Test Input 3 Label");

    await userEvent.type(input1, "sample text 1");

    const input2 = rend.getByLabelText("Test Input 2 (dependency)");

    expect(input1.id).toBe("testFormId_testSection1_testInput1");
    expect(input2.id).toBe("testFormId_testSection1_testInput2");
    expect(input3.id).toBe("testFormId_testSection2_testInput3");
  });
});
