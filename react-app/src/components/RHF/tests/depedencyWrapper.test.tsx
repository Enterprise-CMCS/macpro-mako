import { describe, test, expect } from "vitest";
import { render } from "@testing-library/react";
import { useForm, FormProvider } from "react-hook-form";
import { DependencyWrapper } from "../dependencyWrapper";
import { PropsWithChildren } from "react";
import { DependencyRule } from "shared-types";

const TestComp = ({
  name,
  dependency,
  parentValue,
  changeMethod,
  children,
}: PropsWithChildren<{
  name: string;
  dependency: DependencyRule;
  parentValue: string[];
  changeMethod: (values: string[]) => void;
}>) => {
  const methods = useForm({
    defaultValues: {
      [name]: parentValue,
      field1: "test",
      field2: "",
    },
  });

  return (
    <FormProvider {...methods}>
      <DependencyWrapper
        name={name}
        dependency={dependency}
        parentValue={parentValue}
        changeMethod={changeMethod}
      >
        {children}
      </DependencyWrapper>
    </FormProvider>
  );
};

describe("DependencyWrapper Tests", () => {
  test("test show effect", () => {
    const dependency: DependencyRule = {
      conditions: [
        { type: "expectedValue", expectedValue: "test", name: "field1" },
      ],
      effect: { type: "show" },
    };
    const { getByText } = render(
      <TestComp
        name="testField"
        dependency={dependency}
        parentValue={["testField"]}
        changeMethod={(value) => {
          console.log(value);
        }}
      >
        <div>Child Component</div>
      </TestComp>,
    );

    expect(getByText("Child Component")).toBeTruthy();
  });

  test("test hide effect", () => {
    const dependency: DependencyRule = {
      conditions: [
        { type: "expectedValue", expectedValue: "test", name: "field1" },
      ],
      effect: { type: "hide" },
    };
    const { queryByText } = render(
      <TestComp
        name="testField"
        dependency={dependency}
        parentValue={["testField"]}
        changeMethod={(value) => {
          console.log(value);
        }}
      >
        <div>Child Component</div>
      </TestComp>,
    );

    expect(queryByText("Child Component")).toBeNull();
  });

  test("test set value effect", () => {
    const dependency: DependencyRule = {
      conditions: [
        { type: "expectedValue", expectedValue: "test", name: "field1" },
      ],
      effect: { type: "setValue", fieldName: "field2", newValue: "newValue" },
    };

    let methods: any;

    const TestCompWithMethods = (
      props: PropsWithChildren<{
        name: string;
        dependency: DependencyRule;
        parentValue: string[];
        changeMethod: (values: string[]) => void;
      }>,
    ) => {
      methods = useForm({
        defaultValues: {
          [props.name]: props.parentValue,
          field1: "test",
          field2: "",
        },
      });

      return (
        <FormProvider {...methods}>
          <DependencyWrapper {...props}>{props.children}</DependencyWrapper>
        </FormProvider>
      );
    };

    render(
      <TestCompWithMethods
        name="testField"
        dependency={dependency}
        parentValue={["testField"]}
        changeMethod={(value) => {
          console.log(value);
        }}
      >
        <div>Child Component</div>
      </TestCompWithMethods>,
    );

    expect(methods.getValues("field2")).toBe("newValue");
  });
});
