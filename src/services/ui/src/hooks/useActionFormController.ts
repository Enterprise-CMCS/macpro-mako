import { useCallback } from "react";
import { UseFormReturn } from "react-hook-form";
import { useParams } from "@/components/Routing";
import { useGetUser } from "@/api/useGetUser";
import { useModalContext } from "@/pages/form/modals";
import { submit } from "@/api/submissionService";
import { buildActionUrl } from "@/lib";
import { PlanType } from "shared-types";

export const useActionSubmitHandler = ({
  formHookReturn,
  authority,
  addDataConditions,
}: {
  // TODO: Refine "any" in prop types
  formHookReturn: UseFormReturn<any>;
  authority: PlanType;
  /** Reserved for things zod cannot check. Throw from
   * check fn to catch in the submit handler. */
  addDataConditions?: ((data: any) => void)[];
}) => {
  const { id, type } = useParams("/action/:id/:type");
  const { data: user } = useGetUser();
  const { setSuccessModalOpen, setErrorModalOpen } = useModalContext();
  return useCallback(
    async () =>
      formHookReturn.handleSubmit(async (formData) => {
        try {
          if (addDataConditions?.length)
            addDataConditions.forEach((fn) => fn(formData));
          // TODO: Type update for submit generic
          await submit({
            data: { ...formData, id: id! },
            endpoint: buildActionUrl(type!),
            user,
            authority: authority,
          });
          setSuccessModalOpen(true);
        } catch (e) {
          console.error(e);
          setErrorModalOpen(true);
        }
      }),
    [formHookReturn, authority]
  );
};
