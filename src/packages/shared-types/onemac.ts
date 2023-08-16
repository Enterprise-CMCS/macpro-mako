import { z } from "zod";
import { s3ParseUrl } from "shared-utils/s3-url-parser";

export enum ComponentType {
  CHIP_SPA = "chipspa",
  CHIP_SPA_RAI = "chipsparai",
  CHIP_SPA_WITHDRAW = "chipspawithdraw",
  MEDICAID_SPA = "medicaidspa",
  MEDICAID_SPA_RAI = "medicaidsparai",
  MEDICAID_SPA_WITHDRAW = "medicaidspawithdraw",
  WAIVER = "waiver",
  WAIVER_INITIAL = "waivernew",
  WAIVER_INITIAL_WITHDRAW = "waivernewwithdraw",
  WAIVER_AMENDMENT = "waiveramendment",
  WAIVER_AMENDMENT_WITHDRAW = "waiveramendmentwithdraw",
  WAIVER_RENEWAL = "waiverrenewal",
  WAIVER_RENEWAL_WITHDRAW = "waiverrenewalwithdraw",
  WAIVER_RAI = "waiverrai",
  WAIVER_EXTENSION = "waiverextension",
  WAIVER_EXTENSION_B = "waiverextensionb",
  WAIVER_EXTENSION_C = "waiverextensionc",
  WAIVER_APP_K = "waiverappk",
  WAIVER_APP_K_RAI = "waiverappkrai",
  WAIVER_APP_K_WITHDRAW = "waiverappkwithdraw",
  ENABLE_RAI_WITHDRAW = "enableraiwithdraw",
  RAI_RESPONSE_WITHDRAW = "rairesponsewithdraw",
}

const onemacComponentTypeSchema = z.nativeEnum(ComponentType);
export type OnemacComponentType = z.infer<typeof onemacComponentTypeSchema>;

export const onemacSchema = z.object({
  additionalInformation: z.string().optional(),
  componentType: z.nativeEnum(ComponentType),
  submitterName: z.string(),
  submitterEmail: z.string(),
  attachments: z
    .array(
      z.object({
        s3Key: z.string(),
        filename: z.string(),
        title: z.string(),
        contentType: z.string(),
        url: z.string().url(),
      })
    )
    .nullish(),
});

export const transformOnemac = (id: string) => {
  return onemacSchema.transform((data) => ({
    id,
    attachments:
      data.attachments?.map((attachment) => {
        const uploadDate = parseInt(attachment.s3Key.split("/")[0]);
        const parsedUrl = s3ParseUrl(attachment.url);
        if (!parsedUrl) return null;
        const { bucket, key } = parsedUrl;

        return {
          ...attachment,
          uploadDate,
          bucket,
          key,
        };
      }) ?? null,
    additionalInformation: data.additionalInformation,
    componentType: data.componentType,
    submissionOrigin: "OneMAC",
    submitterEmail: data.submitterEmail,
    submitterName: data.submitterName,
  }));
};

export type OneMacSink = z.infer<typeof onemacSchema>;
export type OneMacTransform = z.infer<ReturnType<typeof transformOnemac>>;
