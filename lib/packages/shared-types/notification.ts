import { z } from "zod";

export interface BannerNotification {
  notifId: string;
  header: string;
  body: string;
  buttonText?: string;
  buttonLink?: string;
  pubDate: string;
  expDate?: string;
  disabled?: boolean;
}
export const BannerNotificationSchema = z.object({
  notifId: z.string(),
  body: z.string(),
  header: z.string(),
  pubDate: z.string(),
  expDate: z.string(),
  buttonLink: z.string().optional().default(""),
  buttonText: z.string().optional().default(""),
  disabled: z.boolean().optional().default(false),
});
export type ValidBannerNotification = z.infer<typeof BannerNotificationSchema>;
