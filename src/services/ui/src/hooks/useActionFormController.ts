import { FieldValues, SubmitHandler, UseFormReturn } from "react-hook-form";
import { useParams } from "@/components/Routing";
import { useGetUser } from "@/api/useGetUser";
import { useModalContext } from "@/pages/form/modals";
import { submit } from "@/api/submissionService";
import { buildActionUrl } from "@/lib";
import { Authority } from "shared-types";

export const useActionSubmitHandler = <D extends FieldValues>({
  authority,
}: {
  formHookReturn: UseFormReturn<D>;
  authority: Authority;
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
