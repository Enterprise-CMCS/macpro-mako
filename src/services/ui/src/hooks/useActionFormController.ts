import {
  FieldValues,
  SubmitHandler,
  UseFormProps,
  UseFormReturn,
  useForm,
} from "react-hook-form";
import { useParams } from "@/components/Routing";
import { useGetUser } from "@/api/useGetUser";
import { useModalContext } from "@/pages/form/modals";
import { submit } from "@/api/submissionService";
import { buildActionUrl } from "@/lib";
import { PlanType, opensearch } from "shared-types";

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
export type ActionFormReturn = ReturnType<typeof useActionForm>;
export const useActionForm = <D extends FieldValues>({
  checkConditions,
  item,
  ...props
}: UseFormProps<D> & {
  item: opensearch.main.ItemResult;
  checkConditions?: (data: D) => string[] | null;
}) => {
  const form = useForm(props);
  const { id, type } = useParams("/action/:id/:type");
  const { data: user } = useGetUser();
  const { setSuccessModalOpen, setErrorModalOpen } = useModalContext();

  const onSubmit = form.handleSubmit(async (data) => {
    try {
      const errorConditions = checkConditions?.(data);

      if (errorConditions) {
        throw Error(`Additional conditions were not met: ${errorConditions}`);
      }

      // TODO: Type update for submit generic
      await submit<D & { id: string }>({
        data: { ...data, id: id! },
        endpoint: buildActionUrl(type!),
        user,
        authority: item._source.authority as PlanType,
      });
      setSuccessModalOpen(true);
    } catch (e) {
      console.error(e);
      setErrorModalOpen(true);
    }
  });

  return { onSubmit, ...form };
};
