import { useEffect, useState } from "react";
import { useFormState } from "react-hook-form";
import { Section } from "shared-types";

interface SecCollapseProps {
  secIds: string[];
  formId: string;
  collapsible: boolean;
}

export const secIdExtraction = (sec: Section) => {
  const subSecs = sec.subsections?.map((s) => s.sectionId) ?? [];
  return [sec.sectionId, ...subSecs];
};

export const useSecCollapse = ({
  formId,
  secIds,
  collapsible = false,
}: SecCollapseProps) => {
  const [isCollapsed, setIsCollapsed] = useState(collapsible);
  const [hasErrors, setHasErrors] = useState(false);
  const { errors } = useFormState();

  const toggleCollapse = () => {
    if (!hasErrors) setIsCollapsed(!isCollapsed);
  };

  // Check All Sec/SubSecs for field errors
  useEffect(() => {
    if (
      errors &&
      Object.keys(errors)?.some((e) =>
        secIds.some((s) => e.includes(`${formId}_${s}`)),
      )
    ) {
      setIsCollapsed(false);
      setHasErrors(true);
    } else {
      setHasErrors(false);
    }
  }, [errors, secIds, formId]);

  return { isCollapsed, toggleCollapse, hasErrors };
};
