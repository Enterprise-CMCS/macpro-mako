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
import { detailsAndActionsCrumbs } from "@/pages/actions/actions-breadcrumbs";
import {
  chipRespondToRaiSetup,
  chipWithdrawPackageSetup,
  defaultIssueRaiSetup,
  defaultWithdrawRaiSetup,
  FormSetup,
  medicaidRespondToRaiSetup,
  medicaidWithdrawPackageSetup,
} from "@/pages/actions/setups";

export type SetupOptions = "CHIP SPA" | "Medicaid SPA";
const getFormSetup = (opt: SetupOptions, type: Action): FormSetup | null => {
  switch (type) {
    case "issue-rai":
      return defaultIssueRaiSetup;
    case "respond-to-rai":
      return {
        "Medicaid SPA": medicaidRespondToRaiSetup,
        "CHIP SPA": chipRespondToRaiSetup,
      }[opt];
    case "withdraw-rai":
      return defaultWithdrawRaiSetup;
    case "withdraw-package":
      return {
        "Medicaid SPA": medicaidWithdrawPackageSetup,
        "CHIP SPA": chipWithdrawPackageSetup,
      }[opt];
    case "enable-rai-withdraw":
    case "disable-rai-withdraw":
    default:
      return null;
  }
};

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

  // Enable/Disable Rai Withdraw is an "Admin Action", and breaks
  // the mold for a "form" in that it does not utilize any form
  // tooling or elements. A later refactor could be considered.
  if (
    (type as Action) === "enable-rai-withdraw" ||
    (type as Action) === "disable-rai-withdraw"
  ) {
    return <ToggleRaiResponseWithdraw item={item} />;
  } else {
    const setup = getFormSetup(
      item!._source.planType as string as SetupOptions,
      type
    );
    if (!setup) return <Navigate path="/" />;
    // Form renders
    switch (type as Action) {
      case "issue-rai":
        return <RaiIssue item={item} {...setup} />;
      case "respond-to-rai":
        return <RespondToRai item={item} {...setup} />;
      case "withdraw-rai":
        return <WithdrawRai item={item} {...setup} />;
      case "withdraw-package":
        return <WithdrawPackage item={item} {...setup} />;
      default:
        return <Navigate path="/" />;
    }
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
