import { FormProvider, useForm } from "react-hook-form";
import { Outlet, useParams } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnyZodObject } from "zod";
import { BreadCrumbs, SimplePageContainer } from "@/components";
import { detailsAndActionsCrumbs } from "@/pages/actions/actions-breadcrumbs";
import { Action } from "shared-types";
import { issueRaiSchema } from "./IssueRai";
import { withdrawRaiSchema } from "./WithdrawRai";
import { toggleRaiResponseWithdrawSchema } from "./ToggleRaiResponseWithdraw";
import { withdrawPackageSchema } from "./WithdrawPackage";
import { respondToRaiSchema } from "./RespondToRai";

const schemas: Record<string, AnyZodObject> = {
  "issue-rai": issueRaiSchema,
  "withdraw-rai": withdrawRaiSchema,
  "enable-rai-withdraw": toggleRaiResponseWithdrawSchema,
  "disable-rai-withdraw": toggleRaiResponseWithdrawSchema,
  "withdraw-package": withdrawPackageSchema,
  "respond-to-rai": respondToRaiSchema,
};

export const ActionWrapper = () => {
  const packageActionType = window.location.href.split("/").at(-1);
  const { id } = useParams() as { id: string };

  const methods = useForm({
    resolver: zodResolver(schemas[packageActionType!]),
  });

  return (
    <SimplePageContainer>
      <BreadCrumbs
        options={detailsAndActionsCrumbs({ id, action: Action.ISSUE_RAI })}
      />
      <FormProvider {...methods}>
        <Outlet />
      </FormProvider>
    </SimplePageContainer>
  );
};
