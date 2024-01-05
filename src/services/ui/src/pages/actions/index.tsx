import { Navigate, useParams } from "@/components/Routing";
import { ToggleRaiResponseWithdraw } from "@/pages/actions/ToggleRaiResponseWithdraw";
import { RaiIssue } from "@/pages/actions/IssueRai";
import { WithdrawPackage } from "@/pages/actions/WithdrawPackage";
import { RespondToRai } from "@/pages/actions/RespondToRai";
import { Action } from "shared-types";
import { WithdrawRai } from "./WithdrawRai";
import { useGetItem, useGetPackageActions } from "@/api";
import {
  Alert,
  BreadCrumbs,
  LoadingSpinner,
  SimplePageContainer,
} from "@/components";
import { ModalProvider } from "@/pages/form/modals";
import { DETAILS_AND_ACTIONS_CRUMBS } from "@/pages/actions/actions-breadcrumbs";

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
      return <WithdrawPackage item={item} />;
    case Action.ENABLE_RAI_WITHDRAW:
    case Action.DISABLE_RAI_WITHDRAW:
      return <ToggleRaiResponseWithdraw item={item} />;
    case Action.ISSUE_RAI:
      return <RaiIssue item={item} />;
    case Action.WITHDRAW_RAI:
      return <WithdrawRai item={item} />;
    case Action.RESPOND_TO_RAI:
      return <RespondToRai item={item} />;
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
          options={DETAILS_AND_ACTIONS_CRUMBS({ id: id, action: type })}
        />
        <ActionFormSwitch />
      </ModalProvider>
    </SimplePageContainer>
  );
};
