import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { useForm, FormProvider } from "react-hook-form";
import { FormField } from "@/components";
import { SlotAdditionalInfo } from "@/features/forms/renderSlots";
import { PropsWithChildren } from "react";

type TestFormSchema = { additionalInfo: string };

const Wrapper = (props: PropsWithChildren) => {
  const formMethods = useForm<TestFormSchema>();
  return <FormProvider {...formMethods}>{props.children}</FormProvider>;
};

describe("SlotAdditionalInfo", () => {
  const setupTestableElements = (): {
    [target: string]: HTMLElement | null;
  } => ({
    heading: screen.queryByRole("heading"),
    label: screen.queryByTestId("addl-info-label"),
    input: screen.queryByRole("textbox"),
    counter: screen.queryByText("4000 characters remaining"),
  });

  it("renders all elements", () => {
    const Component = () => {
      const form = useForm<TestFormSchema>();
      return (
        <FormField
          name={"additionalInfo"}
          control={form.control}
          render={SlotAdditionalInfo({})}
        />
      );
    };
    render(<Component />, { wrapper: Wrapper });
    const { heading, input, counter } = setupTestableElements();
    expect(heading).not.toBeNull();
    expect(heading).toBeInTheDocument();
    expect(input).not.toBeNull();
    expect(input).toBeInTheDocument();
    expect(counter).not.toBeNull();
    expect(counter).toBeInTheDocument();

    expect(heading).toHaveTextContent("Additional Information");
  });

  it("renders without a heading through props", () => {
    const Component = () => {
      const form = useForm<TestFormSchema>();
      return (
        <FormField
          name={"additionalInfo"}
          control={form.control}
          render={SlotAdditionalInfo({
            withoutHeading: true,
          })}
        />
      );
    };
    render(<Component />, { wrapper: Wrapper });
    const { heading } = setupTestableElements();
    expect(heading).toBeNull();
  });

  it("renders a label (instructional element) through props", () => {
    const Component = () => {
      const form = useForm<TestFormSchema>();
      return (
        <FormField
          name={"additionalInfo"}
          control={form.control}
          render={SlotAdditionalInfo({
            label: <p>Here are some instructions</p>,
          })}
        />
      );
    };
    render(<Component />, { wrapper: Wrapper });
    const { label } = setupTestableElements();
    expect(label).not.toBeNull();
    expect(label).toHaveTextContent("Here are some instructions");
  });

  it("counts characters dynamically", () => {
    const Component = () => {
      const form = useForm<TestFormSchema>();
      return (
        <FormField
          name={"additionalInfo"}
          control={form.control}
          render={SlotAdditionalInfo({})}
        />
      );
    };
    render(<Component />, { wrapper: Wrapper });
    const { input, counter } = setupTestableElements();
    const charLimit = 4000;
    const message = "Test message";

    expect(input).toHaveValue("");
    expect(counter).toHaveTextContent(`${charLimit} characters remaining`);

    fireEvent.change(input!, { target: { value: message } });

    expect(input).toHaveValue(message);
    expect(counter).toHaveTextContent(
      `${charLimit - message.length} characters remaining`,
    );
  });
});
