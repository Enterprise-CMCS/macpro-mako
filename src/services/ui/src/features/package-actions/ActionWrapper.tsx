import { FormProvider, useForm } from "react-hook-form";
import { Outlet, useLocation } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { ZodSchema } from "zod";
import { BreadCrumbs, SimplePageContainer } from "@/components";
import { detailsAndActionsCrumbs } from "@/pages/actions/actions-breadcrumbs";
import { Action } from "shared-types";
import { issueRaiSchema } from "./IssueRai";
import { withdrawRaiSchema } from "./WithdrawRai";
import { toggleRaiResponseWithdrawSchema } from "./ToggleRaiResponseWithdraw";
import { withdrawPackageSchema } from "./WithdrawPackage";
import { respondToRaiSchema } from "./RespondToRai";
import { useParams } from "@/components/Routing";

const schemas = {
  "issue-rai": issueRaiSchema,
  "withdraw-rai": withdrawRaiSchema,
  "enable-rai-withdraw": toggleRaiResponseWithdrawSchema,
  "disable-rai-withdraw": toggleRaiResponseWithdrawSchema,
  "withdraw-package": withdrawPackageSchema,
  "respond-to-rai": respondToRaiSchema,
} satisfies Record<string, ZodSchema<any>>;
type SchemaKeys = keyof typeof schemas;

const actions: Record<SchemaKeys, Action> = {
  "issue-rai": Action.ISSUE_RAI,
  "disable-rai-withdraw": Action.DISABLE_RAI_WITHDRAW,
  "enable-rai-withdraw": Action.ENABLE_RAI_WITHDRAW,
  "respond-to-rai": Action.RESPOND_TO_RAI,
  "withdraw-package": Action.WITHDRAW_PACKAGE,
  "withdraw-rai": Action.WITHDRAW_RAI,
};

export const ActionWrapper = () => {
  const location = useLocation();
  const packageActionType = location.pathname.split("/").pop() as SchemaKeys;

  const { id } = useParams("/action/:authority/:id/:type");

  const methods = useForm({
    resolver: zodResolver(schemas[packageActionType!]),
  });

  return (
    <SimplePageContainer>
      <BreadCrumbs
        options={detailsAndActionsCrumbs({
          id,
          action: actions[packageActionType],
        })}
      />
      <FormProvider {...methods}>
        <Outlet />
      </FormProvider>
    </SimplePageContainer>
  );
};
