export const DRAFTABLE_EVENTS = [
  "new-medicaid-submission",
  "new-chip-submission",
  "new-chip-details-submission",
  "capitated-initial",
  "capitated-renewal",
  "capitated-amendment",
  "contracting-initial",
  "contracting-renewal",
  "contracting-amendment",
  "temporary-extension",
  "app-k",
] as const;

export type DraftableEvent = (typeof DRAFTABLE_EVENTS)[number];
