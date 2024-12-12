import { useNavigation } from "react-router";
import { useFormContext } from "react-hook-form";
import { LoadingSpinner } from "@/components";

export const FormLoadingSpinner = () => {
  const { state } = useNavigation();
  const { formState } = useFormContext();
  return (state === "submitting" || formState.isSubmitting) && <LoadingSpinner />;
};
