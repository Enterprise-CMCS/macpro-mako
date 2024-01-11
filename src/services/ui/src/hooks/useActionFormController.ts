import { FieldValues, SubmitHandler, UseFormReturn } from "react-hook-form";
import { useParams } from "@/components/Routing";
import { useGetUser } from "@/api/useGetUser";
import { useModalContext } from "@/pages/form/modals";
import { submit } from "@/api/submissionService";
import { buildActionUrl } from "@/lib";
import { PlanType } from "shared-types";

type DataConditionError = {
  message: string;
};

export const useActionSubmitHandler = <D extends FieldValues>({
  authority,
  addDataConditions,
}: {
  formHookReturn: UseFormReturn<D>;
  authority: PlanType;
  /** Reserved for things zod cannot check. */
  addDataConditions?: ((data: D) => DataConditionError | null)[];
}): SubmitHandler<D> => {
  const { id, type } = useParams("/action/:id/:type");
  const { data: user } = useGetUser();
  const { setSuccessModalOpen, setErrorModalOpen } = useModalContext();
  return async (data) => {
    try {
      if (addDataConditions?.length) {
        const errors = addDataConditions
          .map((fn) => fn(data))
          .filter((err) => err) // Filter out nulls
          .map((err) => err?.message);
        if (errors.length)
          throw Error(`Additional conditions were not met: ${errors}`);
      }
      // TODO: Type update for submit generic
      await submit<D & { id: string }>({
        data: { ...data, id: id! },
        endpoint: buildActionUrl(type!),
        user,
        authority: authority,
      });
      setSuccessModalOpen(true);
    } catch (e) {
      console.error(e);
      setErrorModalOpen(true);
    }
  };
};
