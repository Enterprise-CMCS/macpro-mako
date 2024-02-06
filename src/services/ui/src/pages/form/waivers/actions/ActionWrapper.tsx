import { FormProvider, useForm } from "react-hook-form";
import { Outlet } from "react-router-dom";
import { issueRaiSchema } from "../..";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnyZodObject } from "zod";

const schemas: Record<string, AnyZodObject> = {
  "issue-rai": issueRaiSchema,
};

export const ActionWrapper = () => {
  const packageActionType = window.location.href.split("/").at(-1);

  const methods = useForm({
    resolver: zodResolver(schemas[packageActionType!]),
  });

  return (
    <main>
      <div>Breadcrumbs will go here</div>
      <FormProvider {...methods}>
        <Outlet />
      </FormProvider>
    </main>
  );
};
