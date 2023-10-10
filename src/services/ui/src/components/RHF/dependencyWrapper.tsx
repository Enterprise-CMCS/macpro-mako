import { PropsWithChildren, useEffect } from "react";
import { useFormContext } from "react-hook-form";

export interface DependencyRule {
  name: string;
  condition: "valueExists" | "expectedValue" | "valueNotExist";
  effect: "show" | "hide" | "setValue";
  expectedValue?: unknown;
  newValue?: unknown;
}

interface DependencyWrapperProps {
  name?: string;
  dependency?: DependencyRule;
}

const checkTriggeringValue = (
  dependentValue: unknown,
  dependency?: DependencyRule
) => {
  switch (dependency?.condition ?? "") {
    case "expectedValue":
      return dependentValue === dependency?.expectedValue;
    case "valueExists":
      return !!dependentValue;
    case "valueNotExist":
      return !dependentValue;
  }
  return false;
};

export const DependencyWrapper = ({
  name,
  dependency,
  children,
  ...props
}: PropsWithChildren<DependencyWrapperProps>) => {
  const { watch, setValue } = useFormContext();
  const dependentValue = watch(dependency?.name ?? "");
  const isTriggered = checkTriggeringValue(dependentValue, dependency);
  // console.log(name, dependency, dependentValue, isTriggered, props);

  useEffect(() => {
    if (dependency?.effect === "setValue" && isTriggered && !!name)
      setValue(name, dependency.newValue);
  }, [dependentValue]);

  switch (dependency?.effect) {
    case "hide":
      if (isTriggered) return null;
      break;
    case "show":
      if (isTriggered) return <>{children}</>;
      else return null;
  }

  return <>{children}</>;
};
