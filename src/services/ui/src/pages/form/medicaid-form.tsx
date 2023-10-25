import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const formSchema = z.object({
  id: z.string(),
  additionalInformation: z.string(),
  attachments: z.object({}),
});

export type MedicaidFormSchema = z.infer<typeof formSchema>;

export const MedicaidForm = () => {
  const { handleSubmit, register, formState } = useForm<MedicaidFormSchema>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit: SubmitHandler<MedicaidFormSchema> = (data) => {
    console.log(data, formState.errors);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register("id")} />
    </form>
  );
};
