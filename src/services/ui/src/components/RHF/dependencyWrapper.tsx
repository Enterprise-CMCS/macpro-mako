import { PropsWithChildren, useEffect } from "react";
import { useFormContext } from "react-hook-form";

type ConditionRules =
  | {
      type: "valueExists" | "valueNotExist";
    }
  | {
      type: "expectedValue";
      expectedValue: unknown;
    };

type Condition = { name: string } & ConditionRules;

type Effects =
  | {
      type: "show" | "hide";
    }
  | {
      type: "setValue";
      newValue: unknown;
    };

export interface DependencyRule {
  conditions: Condition[];
  effect: Effects;
}

interface DependencyWrapperProps {
  name?: string;
  dependency?: DependencyRule;
}

const checkTriggeringValue = (
  dependentValue: unknown[],
  dependency?: DependencyRule
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

export const DependencyWrapper = ({
  name,
  dependency,
  children,
}: PropsWithChildren<DependencyWrapperProps>) => {
  const { watch, setValue, getValues } = useFormContext();
  const dependentValues = watch(
    dependency?.conditions?.map((c) => c.name) ?? []
  );
  const isTriggered =
    dependency && checkTriggeringValue(dependentValues, dependency);
  // if (dependency) console.log("getValues()", getValues());

  useEffect(() => {
    if (dependency?.effect.type === "setValue" && isTriggered && !!name)
      setValue(name, dependency.effect.newValue);
  }, [dependentValues]);

  switch (dependency?.effect.type) {
    case "hide":
      if (isTriggered) {
        console.log("should be hiding");
        return null;
      }
      break;
    case "show":
      if (isTriggered) return <>{children}</>;
      else return null;
  }

  return <>{children}</>;
};
