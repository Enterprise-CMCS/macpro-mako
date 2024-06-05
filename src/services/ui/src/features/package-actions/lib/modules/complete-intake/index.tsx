import { z } from "zod";
import { ReactElement } from "react";
import { FormContentHydrator } from "@/features/package-actions/lib/contentSwitch";
import { ActionFormDescription, SectionCard } from "@/components";
import { SubjectInput } from "@/components/Form/fields/SubjectInput";
import { DescriptionInput } from "@/components/Form/fields/DescriptionInput";
import { TypeSelect } from "@/components/Form/fields/TypeSelect";
import { SubTypeSelect } from "@/components/Form/fields/SubTypeSelect";
import { CPOCSelect } from "@/components/Form/fields/CPOCSelect";
import { CheckDocumentFunction } from "@/utils/Poller/documentPoller";

export const defaultCompleteIntakeSchema = z.object({
  subject: z
    .string()
    .trim()
    .min(1, { message: "Required" })
    .max(120, { message: "Subject should be under 120 characters" }),
  description: z
    .string()
    .trim()
    .min(1, { message: "Required" })
    .max(4000, { message: "Description should be under 4000 characters" }),
  typeIds: z.array(z.number()).min(1, { message: "Required" }),
  subTypeIds: z.array(z.number()).min(1, { message: "Required" }),
  cpoc: z.number().min(1, { message: "CPOC is required" }),
});
export const defaultCompleteIntakeFields: ReactElement[] = [
  <ActionFormDescription boldReminder key={"section-desc"}>
    Once you submit this form, the supplied information will be writted to
    SEATool, and intake for the record will be complete.
  </ActionFormDescription>,
  <SectionCard key={"section-form"}>
    <SubjectInput key={"field-subject"} />
    <DescriptionInput key={"field-desc"} />
    <TypeSelect key={"field-type"} />
    <SubTypeSelect key={"field-subtype"} />
    <CPOCSelect key={"field-cpoc"} />
  </SectionCard>,
];
export const defaultCompleteIntakeContent: FormContentHydrator = (
  document,
) => ({
  title: "Complete Intake",
  successBanner: {
    header: "Intake Complete",
    body: `The Intake for ${document.id} has been completed.`,
  },
});

export const intakeCompleted: CheckDocumentFunction = (_checks) => true;
