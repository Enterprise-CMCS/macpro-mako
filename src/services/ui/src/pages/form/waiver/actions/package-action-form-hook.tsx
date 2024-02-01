import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";

export const usePackageActionForm = <
  TSchema extends z.AnyZodObject,
  TPayload extends Record<string | number, unknown>
>({
  schema,
  submissionPayload,
}: {
  schema: TSchema;
  submissionPayload?: (data: z.infer<TSchema>) => TPayload;
}) => {
  type TransformedPayload = typeof submissionPayload extends (
    ...args: unknown[]
  ) => unknown
    ? TPayload
    : z.infer<TSchema>;

  const form = useForm<z.infer<TSchema>>({
    resolver: zodResolver(schema),
  });

  const { mutate: submit, ...rest } = useMutation({
    mutationFn: async (data: TransformedPayload) => {
      console.log("data", data);
      // call api
    },
  });

  const handleSubmit = form.handleSubmit((data) => {
    const transformedData = submissionPayload
      ? submissionPayload(data)
      : (data as z.infer<TSchema>);
    submit(transformedData);
  });

  return {
    form,
    handleSubmit,
    ...rest,
  };
};
