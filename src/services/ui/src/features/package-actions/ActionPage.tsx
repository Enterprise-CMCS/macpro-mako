import { BreadCrumbs, FAQFooter, SimplePageContainer } from "@/components";
import { getSetupFor } from "@/features/package-actions/lib";
import { ActionForm } from "@/features/package-actions/ActionForm";
import { detailsAndActionsCrumbs } from "@/utils";
import { Navigate, useParams } from "react-router-dom";
import { Action, AuthorityUnion } from "shared-types";

export const ActionPage = () => {
  const {
    id,
    type: actionType,
    authority,
  } = useParams<{ id: string; type: Action; authority: AuthorityUnion }>();

  // TODO: use zod
  if (!id || !actionType || !authority) {
    return <Navigate to="/dashboard" />;
  }

  const setup = getSetupFor(actionType, authority);

  return (
    <SimplePageContainer>
      <BreadCrumbs
        options={detailsAndActionsCrumbs({
          id,
          authority,
          actionType,
        })}
      />
      <ActionForm
        setup={setup}
        actionType={actionType}
        authority={authority}
        id={id}
      />
      <FAQFooter />
    </SimplePageContainer>
  );
};
