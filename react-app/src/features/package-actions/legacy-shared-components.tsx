import { banner } from "@/components";
import { getFormOrigin } from "@/utils";
import { useEffect } from "react";
import { SubmitHandler, useFormContext } from "react-hook-form";
import {
  ActionFunctionArgs,
  useActionData,
  useLocation,
  useNavigate,
  useSubmit,
} from "react-router-dom";
import { Authority } from "shared-types";

// ONLY used by temp extension legacy-page.tsx, will be refactored out

export const useSubmitForm = () => {
  const methods = useFormContext();
  const submit = useSubmit();
  const location = useLocation();

  const validSubmission: SubmitHandler<any> = (data) => {
    const formData = new FormData();
    // Append all other data
    for (const key in data) {
      if (key !== "attachments" && data[key] !== undefined) {
        formData.append(key, data[key]);
      }
    }
    const attachments =
      Object.keys(filterUndefinedValues(data.attachments)).length > 0
        ? data.attachments
        : {};
    for (const key in attachments) {
      attachments[key]?.forEach((file: any, index: number) => {
        formData.append(`attachments.${key}.${index}`, file as any);
      });
    }

    submit(formData, {
      method: "post",
      encType: "multipart/form-data",
      state: location.state,
    });
  };

  return {
    handleSubmit: methods.handleSubmit(validSubmission),
    formMethods: methods,
  };
};

export const useIntakePackage = () => {
  const methods = useFormContext();
  const submit = useSubmit();
  const location = useLocation();

  const validSubmission: SubmitHandler<any> = (data) => {
    submit(data, {
      method: "post",
      encType: "application/json",
      state: location.state,
    });
  };

  return {
    handleSubmit: methods.handleSubmit(validSubmission),
    formMethods: methods,
  };
};

export const useDisplaySubmissionAlert = (header: string, body: string) => {
  const data = useActionData() as ActionFunctionReturnType & { isTe?: boolean };
  const navigate = useNavigate();
  const location = useLocation();

  return useEffect(() => {
    if (data?.submitted) {
      if (location.pathname.endsWith("/update-id")) {
        banner({
          header,
          body,
          variant: "success",
          pathnameToDisplayOn: "/dashboard",
        });
        return navigate("/dashboard");
      }

      const formOrigin = getFormOrigin({ authority: Authority["1915c"] });

      banner({
        header,
        body,
        variant: "success",
        pathnameToDisplayOn: formOrigin.pathname,
      });

      navigate(formOrigin);
    }

    if (!data?.submitted && data?.error) {
      window.scrollTo(0, 0);
      return banner({
        header: "An unexpected error has occurred:",
        body:
          data.error instanceof Error ? data.error.message : String(data.error),
        variant: "destructive",
        pathnameToDisplayOn: window.location.pathname,
      });
    }
  }, [data, navigate, location, body, header]);
};

// Utility Functions
const filterUndefinedValues = (obj: Record<any, any>) => {
  if (obj) {
    return Object.fromEntries(
      Object.entries(obj).filter(([, value]) => value !== undefined),
    );
  }
  return {};
};

// Types
export type ActionFunction = (
  args: ActionFunctionArgs,
) => Promise<{ submitted: boolean; error?: Error | unknown }>;
export type ActionFunctionReturnType = Awaited<ReturnType<ActionFunction>>;
