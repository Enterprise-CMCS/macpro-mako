import { PropsWithChildren, useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import { DependencyRule, DependencyWrapperProps } from "shared-types";

const checkTriggeringValue = (
  dependentValue: unknown[],
  dependency?: DependencyRule,
) => {
  return !!dependency?.conditions?.every((d, i) => {
    switch (d.type) {
      case "expectedValue":
        return dependentValue[i] === d?.expectedValue;
      case "valueExists":
        return (
          (Array.isArray(dependentValue[i]) &&
            (dependentValue[i] as unknown[]).length > 0) ||
          !!dependentValue[i]
        );
      case "valueNotExist":
        return (
          (Array.isArray(dependentValue[i]) &&
            (dependentValue[i] as unknown[]).length === 0) ||
          !dependentValue[i]
        );
    }
  });
};

export const DependencyWrapper = (
  props: PropsWithChildren<DependencyWrapperProps>,
) => {
  // Check for dependencies which won't exist outside of forms
  if (
    !props.dependency ||
    !props.dependency.conditions ||
    !props.dependency.effect
  ) {
    return <>{props.children}</>;
  }

  return <DependencyWrapperHandler {...props} />;
};

const DependencyWrapperHandler = ({
  name,
  dependency,
  children,
  parentValue,
  changeMethod,
}: PropsWithChildren<DependencyWrapperProps>) => {
  const { watch, setValue } = useFormContext();
  const [wasSetLast, setWasSetLast] = useState(false);
  const dependentValues = watch(
    dependency?.conditions?.map((c) => c.name) ?? [],
  );
  const isTriggered =
    dependency && checkTriggeringValue(dependentValues, dependency);

  useEffect(() => {
    if (
      !wasSetLast &&
      dependency?.effect.type === "setValue" &&
      isTriggered &&
      !!name
    ) {
      setValue(name, dependency.effect.newValue);
      setWasSetLast(true);
    } else if (!isTriggered && wasSetLast) {
      setWasSetLast(false);
    }

    // This logic is to give the ability for checkboxes (and eventually radio groups) the ability to have show/hide logic based on UI form logic
    // We are grabbing the parent value (checkbox group array) and remove the value of the child being hidden and filtering it out
    if (
      isTriggered &&
      dependency?.effect.type === "hide" &&
      name &&
      parentValue?.includes(name) &&
      changeMethod
    ) {
      const filteredArray = parentValue.filter((value) => {
        return value !== name;
      });
      changeMethod(filteredArray);
    }
  }, [dependentValues, parentValue, changeMethod, dependency]);

  switch (dependency?.effect.type) {
    case "hide":
      if (isTriggered) {
        return null;
      }
      break;
    case "show":
      if (isTriggered) return <>{children}</>;
      else return null;
  }

  return <>{children}</>;
};
