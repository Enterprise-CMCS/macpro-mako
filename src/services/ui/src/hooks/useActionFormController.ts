import { FieldValues, SubmitHandler, UseFormReturn } from "react-hook-form";
import { useParams } from "@/components";
import { useGetUser } from "@/api";
import { useModalContext } from "@/components/Modal/FormModals";
import { submit } from "@/api";
import { buildActionUrl } from "@/utils";
import { PlanType } from "shared-types";

export const useActionSubmitHandler = <D extends FieldValues>({
  authority,
}: {
  formHookReturn: UseFormReturn<D>;
  authority: PlanType;
}): SubmitHandler<D> => {
  const { id, type } = useParams("/action/:id/:type");
  const { data: user } = useGetUser();
  const { setSuccessModalOpen, setErrorModalOpen } = useModalContext();
  return async (data) => {
    try {
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
