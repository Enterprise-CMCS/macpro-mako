import { Route, useAlertContext } from "@/components";
import { useEffect } from "react";
import { SubmitHandler, useFormContext } from "react-hook-form";
import {
  ActionFunctionArgs,
  useActionData,
  useLocation,
  useNavigate,
  useSubmit,
} from "react-router-dom";

// ONLY used by temp extension legacy-page.tsx, will be refactored out

export const useSubmitForm = () => {
  const methods = useFormContext();
  const submit = useSubmit();
  const location = useLocation();

  const validSubmission: SubmitHandler<any> = (data, e) => {
    const formData = new FormData();
    // Append all other data
    for (const key in data) {
      if (key !== "attachments") {
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

  const validSubmission: SubmitHandler<any> = (data, e) => {
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
  const alert = useAlertContext();
  const data = useActionData() as ActionFunctionReturnType;
  const navigate = useNavigate();
  const location = useLocation();

  return useEffect(() => {
    if (data?.submitted) {
      alert.setContent({
        header,
        body,
      });
      alert.setBannerStyle("success");
      alert.setBannerShow(true);
      if (location.pathname?.endsWith("/update-id")) {
        alert.setBannerDisplayOn("/dashboard");
        navigate("/dashboard");
      } else {
        alert.setBannerDisplayOn(
          location.state?.from?.split("?")[0] ?? "/dashboard",
        );
        navigate(location.state?.from ?? "/dashboard");
      }
    } else if (!data?.submitted && data?.error) {
      alert.setContent({
        header: "An unexpected error has occurred:",
        body:
          data.error instanceof Error ? data.error.message : String(data.error),
      });
      alert.setBannerStyle("destructive");
      alert.setBannerDisplayOn(window.location.pathname as Route);
      alert.setBannerShow(true);
      window.scrollTo(0, 0);
    }
  }, [data, alert, navigate, location.state, location.pathname]);
};

// Utility Functions
const filterUndefinedValues = (obj: Record<any, any>) => {
  if (obj) {
    return Object.fromEntries(
      Object.entries(obj).filter(([key, value]) => value !== undefined),
    );
  }
  return {};
};

// Types
export type ActionFunction = (
  args: ActionFunctionArgs,
) => Promise<{ submitted: boolean; error?: Error | unknown }>;
export type ActionFunctionReturnType = Awaited<ReturnType<ActionFunction>>;
