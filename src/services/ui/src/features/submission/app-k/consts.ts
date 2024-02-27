import { z } from "zod";
import { zAttachmentRequired } from "@/utils";

export const OPTIONS_STATE = [
  { label: "Alabama", value: "AL" },
  { label: "Alaska", value: "AK" },
  {
    label: "American Samoa",
    value: "AS",
  },
  { label: "Arizona", value: "AZ" },
  { label: "Arkansas", value: "AR" },
  { label: "California", value: "CA" },
  { label: "Colorado", value: "CO" },
  { label: "Connecticut", value: "CT" },
  { label: "Delaware", value: "DE" },
  {
    label: "District of Columbia",
    value: "DC",
  },
  { label: "Florida", value: "FL" },
  { label: "Georgia", value: "GA" },
  { label: "Guam", value: "GU" },
  { label: "Hawaii", value: "HI" },
  { label: "Idaho", value: "ID" },
  { label: "Illinois", value: "IL" },
  { label: "Indiana", value: "IN" },
  { label: "Iowa", value: "IA" },
  { label: "Kansas", value: "KS" },
  { label: "Kentucky", value: "KY" },
  { label: "Louisiana", value: "LA" },
  { label: "Maine", value: "ME" },
  { label: "Maryland", value: "MD" },
  {
    label: "Massachusetts",
    value: "MA",
  },
  { label: "Michigan", value: "MI" },
  { label: "Minnesota", value: "MN" },
  { label: "Mississippi", value: "MS" },
  { label: "Missouri", value: "MO" },
  { label: "Montana", value: "MT" },
  { label: "Nebraska", value: "NE" },
  { label: "Nevada", value: "NV" },
  {
    label: "New Hampshire",
    value: "NH",
  },
  { label: "New Jersey", value: "NJ" },
  { label: "New Mexico", value: "NM" },
  { label: "New York", value: "NY" },
  {
    label: "North Carolina",
    value: "NC",
  },
  {
    label: "North Dakota",
    value: "ND",
  },
  {
    label: "Northern Mariana Islands",
    value: "MP",
  },
  { label: "Ohio", value: "OH" },
  { label: "Oklahoma", value: "OK" },
  { label: "Oregon", value: "OR" },
  {
    label: "Pennsylvania",
    value: "PA",
  },
  { label: "Puerto Rico", value: "PR" },
  {
    label: "Rhode Island",
    value: "RI",
  },
  {
    label: "South Carolina",
    value: "SC",
  },
  {
    label: "South Dakota",
    value: "SD",
  },
  { label: "Tennessee", value: "TN" },
  { label: "Texas", value: "TX" },
  { label: "Utah", value: "UT" },
  { label: "Vermont", value: "VT" },
  {
    label: "Virgin Islands",
    value: "VI",
  },
  { label: "Virginia", value: "VA" },
  { label: "Washington", value: "WA" },
  {
    label: "West Virginia",
    value: "WV",
  },
  { label: "Wisconsin", value: "WI" },
  { label: "Wyoming", value: "WY" },
];

export const zWaiverId = z
  .string()
  .regex(
    /\d{4,5}.R\d{2}.\d{2}$/,
    "ID doesn't match format ####.R##.## or #####.R##.##"
  );

export const FORM = z.object({
  waiverIds: z.array(zWaiverId),
  state: z.string(),
  additionalInformation: z.string().max(4000).optional(),
  attachments: z.object({
    appk: zAttachmentRequired({ min: 1 }),
  }),
  proposedEffectiveDate: z.date(),
  seaActionType: z.string().default("Amend"),
});

export type SchemaForm = z.infer<typeof FORM>;
