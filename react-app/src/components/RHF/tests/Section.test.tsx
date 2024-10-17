import { describe, test, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import { RHFDocument, documentInitializer } from "..";
import { Form } from "../../Inputs";
import { useForm } from "react-hook-form";
import { FormSchema } from "shared-types";

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

vi.mock("@/api", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...(actual as object),
    useGetCounties: vi.fn(() => {
      return { data: [], isLoading: false, error: null };
    }),
  };
});

describe("Section Tests", () => {
  test("renders, subsections distinct", () => {
    const rend = render(<TestWrapper data={testDocData} />);
    const sectionHeader = rend.getByText("Section");
    const subsectionHeader = rend.getByText("Subsection");

    expect(sectionHeader.parentElement).toBeTruthy();
    expect(
      sectionHeader.parentElement?.className.includes("bg-primary"),
    ).toBeTruthy();
    expect(subsectionHeader.parentElement).toBeTruthy();
    expect(
      subsectionHeader.parentElement?.className.includes("bg-primary"),
    ).toBeFalsy();
  });
});

describe("FormGroup Tests", () => {
  test("renders, allows rules for slots", () => {
    const rend = render(<TestWrapper data={testDocData} />);
    const formDesc = rend.getByText("test form group");

    expect(formDesc).toBeTruthy();
  });
});
