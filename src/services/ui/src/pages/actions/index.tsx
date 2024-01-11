import { Navigate, useParams } from "@/components/Routing";
import { ToggleRaiResponseWithdraw } from "@/pages/actions/ToggleRaiResponseWithdraw";
import { RaiIssue } from "@/pages/actions/IssueRai";
import { WithdrawPackage } from "@/pages/actions/WithdrawPackage";
import { RespondToRai } from "@/pages/actions/RespondToRai";
import { opensearch, Action } from "shared-types";
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

type SetupOptions = "CHIP SPA" | "Medicaid SPA";
const useFormSetup = (item?: opensearch.main.ItemResult, type?: Action) => {
  const getFormSetup = (opt: SetupOptions, type: Action): FormSetup => {
    console.log(opt);
    switch (type) {
      case "issue-rai":
        return defaultIssueRaiSetup;
      case "respond-to-rai":
        return {
          "Medicaid SPA": medicaidRespondToRaiSetup,
          "CHIP SPA": chipRespondToRaiSetup,
        }[opt];
      case "enable-rai-withdraw":
      case "disable-rai-withdraw":
        return;
      case "withdraw-rai":
        return defaultWithdrawRaiSetup;
      case "withdraw-package":
        return {
          "Medicaid SPA": medicaidWithdrawPackageSetup,
          "CHIP SPA": chipWithdrawPackageSetup,
        }[opt];
    }
  };
  // This null assertion is safe, because every valid submission is given
  // a plan type, and the only way to arrive at this page is with a valid
  // action `type` in the url
  return getFormSetup(item!._source.planType as string as SetupOptions, type!);
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
  const setup = useFormSetup(item, type);
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
    case Action.ISSUE_RAI:
      return <RaiIssue item={item} {...setup} />;
    case Action.RESPOND_TO_RAI:
      return <RespondToRai item={item} {...setup} />;
    case Action.ENABLE_RAI_WITHDRAW:
    case Action.DISABLE_RAI_WITHDRAW:
      return <ToggleRaiResponseWithdraw item={item} />;
    case Action.WITHDRAW_RAI:
      return <WithdrawRai item={item} {...setup} />;
    case Action.WITHDRAW_PACKAGE:
      return <WithdrawPackage item={item} {...setup} />;
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
