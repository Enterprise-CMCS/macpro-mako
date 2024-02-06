import { FormProvider, useForm } from "react-hook-form";
import { Outlet, useParams } from "react-router-dom";
import { issueRaiSchema } from "../..";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnyZodObject } from "zod";
import { BreadCrumbBar, BreadCrumbs, SimplePageContainer } from "@/components";
import { detailsAndActionsCrumbs } from "@/pages/actions/actions-breadcrumbs";
import { Action } from "shared-types";

const schemas: Record<string, AnyZodObject> = {
  "issue-rai": issueRaiSchema,
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
