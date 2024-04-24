import {
  BreadCrumbConfig,
  BreadCrumbs,
  FAQFooter,
  SimplePageContainer,
} from "@/components";
import { useParams } from "@/components/Routing";
import { getSetupFor } from "@/features/package-actions/lib";
import { ActionForm } from "@/features/package-actions/ActionForm";
import { Action } from "shared-types";
import { actionCrumb, dashboardCrumb, detailsCrumb } from "@/utils";
const detailsAndActionsCrumbs = ({
  id,
  action,
}: {
  id: string;
  action?: Action;
}): BreadCrumbConfig[] => {
  const base = [dashboardCrumb, detailsCrumb(id)];
  return !action ? base : [...base, actionCrumb(action, id)];
};
export const ActionPage = () => {
  const { id, type, authority } = useParams("/action/:authority/:id/:type");
  return (
    <SimplePageContainer>
      <BreadCrumbs
        options={detailsAndActionsCrumbs({
          id,
          action: type!,
        })}
      />
      <ActionForm setup={getSetupFor(type, authority)} />
      <FAQFooter />
    </SimplePageContainer>
  );
};
