import { PropsWithChildren, useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import { Condition, DependencyRule, DependencyWrapperProps } from "shared-types";

export const checkTriggeringValue = (dependentValue: unknown[], dependency?: DependencyRule) => {
  if (dependency?.looseConditions) {
    return !!dependency?.conditions?.some((d, i) => triggerCheckSwitch(dependentValue, d, i));
  }
  return !!dependency?.conditions?.every((d, i) => triggerCheckSwitch(dependentValue, d, i));
};

const triggerCheckSwitch = (dependentValue: unknown[], d: Condition, i: number) => {
  switch (d.type) {
    case "expectedValue":
      if (Array.isArray(dependentValue[i])) {
        return (dependentValue[i] as unknown[]).includes(d.expectedValue);
      } else {
        return dependentValue[i] === d?.expectedValue;
      }
    case "notBadValue":
      if (Array.isArray(dependentValue[i])) {
        return (
          (dependentValue[i] as unknown[]).length > 0 &&
          !(dependentValue[i] as unknown[]).includes(d.expectedValue)
        );
      } else {
        return !!dependentValue[i] && !(dependentValue[i] === d?.expectedValue);
      }
    case "notOnlyBadValue":
      if (Array.isArray(dependentValue[i])) {
        return !(
          (dependentValue[i] as unknown[]).length === 1 &&
          (dependentValue[i] as unknown[]).includes(d.expectedValue)
        );
      } else {
        return !!dependentValue[i] && !(dependentValue[i] === d?.expectedValue);
      }
    case "valueExists":
      return (
        (Array.isArray(dependentValue[i]) && (dependentValue[i] as unknown[]).length > 0) ||
        (!Array.isArray(dependentValue[i]) && !!dependentValue[i])
      );
    case "valueNotExist":
      return (
        (Array.isArray(dependentValue[i]) && (dependentValue[i] as unknown[]).length === 0) ||
        !dependentValue[i]
      );
  }
};

export const DependencyWrapper = (props: PropsWithChildren<DependencyWrapperProps>) => {
  // Check for dependencies which won't exist outside of forms
  if (!props.dependency || !props.dependency.conditions || !props.dependency.effect) {
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
  const { watch, setValue, getValues } = useFormContext();
  const [wasSetLast, setWasSetLast] = useState(false);
  const dependentValues = watch(dependency?.conditions?.map((c) => c.name) ?? []);
  const isTriggered = dependency && checkTriggeringValue(dependentValues, dependency);
  useEffect(() => {
    if (
      !wasSetLast &&
      dependency?.effect.type === "setValue" &&
      isTriggered &&
      !!dependency?.effect.fieldName
    ) {
      const value = getValues(dependency.effect.fieldName);
      if (Array.isArray(value)) {
        if (Array.isArray(dependency.effect.newValue)) {
          let newValArr = [...value, ...dependency.effect.newValue];

          if (dependency.effect.checkUnique)
            newValArr = newValArr.filter((v, i, a) => a.indexOf(v) === i);

          setValue(dependency.effect.fieldName, newValArr);
        } else {
          let newValArr = [...value, dependency.effect.newValue];

          if (dependency.effect.checkUnique)
            newValArr = newValArr.filter((v, i, a) => a.indexOf(v) === i);

          setValue(dependency.effect.fieldName, newValArr);
        }
      } else {
        setValue(dependency.effect.fieldName, dependency.effect.newValue);
      }
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
