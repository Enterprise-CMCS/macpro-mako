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
import { getAvailableActions } from "shared-utils";
import { useGetUser } from "@/api/useGetUser";

type SetupOptions = "CHIP SPA" | "Medicaid SPA";
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
  const { data: user } = useGetUser();
  const {
    data: item,
    isLoading: itemIsLoading,
    error: itemError,
  } = useGetItem(id!);

  if (!user?.user) return <></>;
  const actions = getAvailableActions(
    user?.user,
    item?._source as opensearch.main.Document
  );

  // Safety bolt-on to limit non-null assertions needed
  if (!id || !type) return <Navigate path="/" />;

  // Non-form renders
  if (itemIsLoading) return <LoadingSpinner />;
  if (itemError)
    return (
      <Alert className="my-2 max-w-2xl" variant="destructive">
        <strong>ERROR getting item: </strong>
        {itemError.response.data.message}
      </Alert>
    );

  if (!actions.includes(type))
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
    return <ToggleRaiResponseWithdraw {...item} />;
  }

  // Form renders
  switch (type as Action) {
    case "issue-rai":
      return <RaiIssue {...item} />;
    case "respond-to-rai":
      return <RespondToRai {...item} />;
    case "withdraw-rai":
      return <WithdrawRai {...item} />;
    case "withdraw-package":
      return <WithdrawPackage {...item} />;
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
