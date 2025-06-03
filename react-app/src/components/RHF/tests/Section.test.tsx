import { screen } from "@testing-library/react";
import { useForm } from "react-hook-form";
import { FormSchema } from "shared-types";
import { describe, expect, test } from "vitest";

import { renderWithQueryClient } from "@/utils/test-helpers";

import { Form } from "../../Inputs";
import { documentInitializer, RHFDocument } from "../index";

const TestWrapper = (props: { data: FormSchema }) => {
  const form = useForm({ defaultValues: documentInitializer(props.data) });
  return (
    <div>
      <Form {...form}>
        <form>
          <RHFDocument document={props.data} {...form} />
        </form>
      </Form>
    </div>
  );
};

const testDocData: FormSchema = {
  formId: "testForm",
  header: "test form",
  sections: [
    {
      sectionId: "sec1",
      title: "Section",
      form: [
        {
          description: "test form group",
          slots: [
            {
              name: "testInput",
              rhf: "Input",
              rules: {
                required: "* required",
              },
            },
          ],
        },
      ],
    },
    {
      sectionId: "sec2",
      subsection: true,
      title: "Subsection",
      form: [],
    },
  ],
};

describe("Section Tests", () => {
  test("renders, subsections distinct", () => {
    renderWithQueryClient(<TestWrapper data={testDocData} />);
    const sectionHeader = screen.getByText("Section");
    const subsectionHeader = screen.getByText("Subsection");

    expect(sectionHeader.parentElement).toBeTruthy();
    expect(sectionHeader.parentElement?.className.includes("bg-primary")).toBeTruthy();
    expect(subsectionHeader.parentElement).toBeTruthy();
    expect(subsectionHeader.parentElement?.className.includes("bg-primary")).toBeFalsy();
  });
});

describe("FormGroup Tests", () => {
  test("renders, allows rules for slots", () => {
    renderWithQueryClient(<TestWrapper data={testDocData} />);
    const formDesc = screen.getByText("test form group");

    expect(formDesc).toBeTruthy();
  });
});
