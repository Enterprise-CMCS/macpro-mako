export const CHIP_SPA = "CHIP SPA" as const;
export const MEDICAD_SPA = "Medicaid SPA" as const;
export const WAIVER_1915_B = "1915(b)" as const;
export const WAIVER_1915_C = "1915(c)" as const;

export const AUTHORITY = {
  [CHIP_SPA]: "chip spa",
  [MEDICAD_SPA]: "medicaid spa",
  [WAIVER_1915_B]: "1915(b)",
  [WAIVER_1915_C]: "1915(c)",
} as const;

export type Authority = keyof typeof AUTHORITY;
export type SeatoolAuthority = (typeof AUTHORITY)[keyof typeof AUTHORITY];
