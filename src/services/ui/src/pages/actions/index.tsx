import { Navigate, useParams } from "@/components/Routing";
import { ToggleRaiResponseWithdrawForm } from "@/pages/actions/ToggleRaiResponseWithdraw";
import { Action } from "shared-types";
import { useGetItem, useGetPackageActions } from "@/api";
import {
  Alert,
  BreadCrumbs,
  LoadingSpinner,
  SimplePageContainer,
} from "@/components";
import { detailsAndActionsCrumbs } from "@/pages/actions/actions-breadcrumbs";
import React from "react";
import { ModalProvider } from "@/pages/form/modals";
import { NewPackageActionForm } from "@/pages/actions/PackageActionForm";
import {
  fcIssueRai,
  fcRespondToMedicaidRai,
  fcWithdrawPackage,
  fcWithdrawRai,
} from "@/pages/actions/configs";

const ActionFormSwitch = () => {
  const { id, type } = useParams("/action/:id/:type");
  const {
    data: item,
    isLoading: itemIsLoading,
    error: itemError,
  } = useGetItem(id!);
  const {
    data: actions,
    isLoading: actionsAreLoading,
    error: actionsError,
  } = useGetPackageActions(id!);
  // Safety bolt-on to limit non-null assertions needed
  if (!id || !type) return <Navigate path="/" />;

  // Non-form renders
  if (itemIsLoading || actionsAreLoading) return <LoadingSpinner />;
  if (itemError)
    return (
      <Alert className="my-2 max-w-2xl" variant="destructive">
        <strong>ERROR getting item: </strong>
        {itemError.response.data.message}
      </Alert>
    );
  if (actionsError)
    return (
      <Alert className="my-2 max-w-2xl" variant="destructive">
        <strong>ERROR getting available actions: </strong>
        {actionsError.response.data.message}
      </Alert>
    );
  if (!actionsError && !actions?.actions.includes(type))
    return (
      <Alert className="my-2 max-w-2xl" variant="destructive">
        <strong>ERROR, invalid action: </strong>
        You cannot perform {type} on this package.
      </Alert>
    );

  // Form renders
  switch (type) {
    case Action.WITHDRAW_PACKAGE:
      return <NewPackageActionForm {...fcWithdrawPackage} item={item} />;
    case Action.ENABLE_RAI_WITHDRAW:
    case Action.DISABLE_RAI_WITHDRAW:
      return <ToggleRaiResponseWithdrawForm item={item} />;
    case Action.ISSUE_RAI:
      return <NewPackageActionForm {...fcIssueRai} item={item} />;
    case Action.WITHDRAW_RAI:
      return <NewPackageActionForm {...fcWithdrawRai} item={item} />;
    case Action.RESPOND_TO_RAI:
      return <NewPackageActionForm {...fcRespondToMedicaidRai} item={item} />;
    default:
      return <Navigate path="/" />;
  }
};

export const ActionFormIndex = () => {
  const { id, type } = useParams("/action/:id/:type");
  return (
    <SimplePageContainer>
      <ModalProvider>
        <BreadCrumbs
          options={detailsAndActionsCrumbs({ id: id, action: type })}
        />
        <ActionFormSwitch />
      </ModalProvider>
    </SimplePageContainer>
  );
};
