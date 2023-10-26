import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import * as I from "@/components/Inputs";
import { SimplePageContainer } from "@/components";
import { PropsWithChildren } from "react";
import { Link } from "react-router-dom";

const formSchema = z.object({
  id: z.string(),
  additionalInformation: z.string(),
  //  : z.object({}),
  // proposedEffectiveDate: z.date(),
});

export type MedicaidFormSchema = z.infer<typeof formSchema>;

export const MedicaidForm = () => {
  const { handleSubmit, register, formState } = useForm<MedicaidFormSchema>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit: SubmitHandler<MedicaidFormSchema> = (data) => {
    console.log(data, formState.errors);
  };

  console.log(formState.errors);

  return (
    <SimplePageContainer>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mx-auto mt-8 max-w-3xl flex flex-col gap-8"
      >
        <section>
          <h1 className="bold text-2xl mb-2">Medicaid SPA Details</h1>
          <p>
            Once you submit this form, a confirmation email is sent to you and
            to CMS. CMS will use this content to review your package, and you
            will not be able to edit this form. If CMS needs any additional
            information, they will follow up by email.{" "}
            <strong className="bold">
              If you leave this page, you will lose your progress on this form.
            </strong>
          </p>
        </section>

        <section>
          <div className="flex justify-between">
            <I.Label htmlFor="id">SPA ID</I.Label>
            <Link to="/faq" className="hover:underline text-blue-600">
              What is my SPA ID?
            </Link>
          </div>
          <HelpText>
            Must follow the format SS-YY-NNNN or SS-YY-NNNN-xxxx.
          </HelpText>
          <HintText>
            Reminder - CMS recommends that all SPA numbers start with the year
            in which the package is submitted.
          </HintText>
          <I.Input {...register("id")} className="max-w-sm" />
        </section>

        <section>
          <I.Label htmlFor="additionalInformation">
            Additional Information
          </I.Label>
          <I.Textarea
            id="additionalInformation"
            {...register("additionalInformation")}
            className="max-w-sm"
          />
        </section>

        <div className="flex gap-2">
          <I.Button type="submit">Submit</I.Button>
          <I.Button type="submit" variant="outline">
            Cancel
          </I.Button>
        </div>
      </form>
    </SimplePageContainer>
  );
};

const HelpText = ({ children }: PropsWithChildren) => <p>{children}</p>;
const HintText = ({ children }: PropsWithChildren) => (
  <p className="italic">{children}</p>
);
