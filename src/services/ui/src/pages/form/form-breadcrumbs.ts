import { Route } from "@/components/Routing/types";
import { optionCrumbsFromPath } from "@/pages/create/create-breadcrumbs";
import { submissionFormCrumb } from "@/utils/crumbs";

export const formCrumbsFromPath = (path: string) => {
  // We broke this out of the Option crumb flow as that's more complex due to the nature
  // of the options triage (New Submission choice flow).
  const previousOptionsCrumbs = [...optionCrumbsFromPath(path)];
  return [
    ...previousOptionsCrumbs,
    submissionFormCrumb(path as Route, previousOptionsCrumbs.length),
  ];
};
