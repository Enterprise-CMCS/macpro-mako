export enum Authority {
  MED_SPA = "medicaid spa",
  CHIP_SPA = "chip spa",
}

export const isSpa = (planType: string | undefined) =>
  !planType
    ? false
    : [Authority.MED_SPA, Authority.CHIP_SPA].includes(
        planType.toLowerCase() as Authority
      );
