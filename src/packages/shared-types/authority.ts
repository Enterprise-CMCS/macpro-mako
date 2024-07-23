export enum SeatoolAuthority {
  MedicaidSPA = "Medicaid SPA",
  CHIPSPA = "CHIP SPA",
  "1915b" = "1915(b)",
  "1915c" = "1915(c)",
  "1115Waiver" = "1115",
  "1115IndPlus" = "1115 Indep. Plus",
  "1915cIndPlus" = "1915(c) Indep. Plus",
  "ADP" = "APD",
  "ADM" = "ADM",
  "ULP" = "UPL",
}

export type SeatoolAuthorityType = `${SeatoolAuthority}`;

// Now you can use SeatoolAuthorityType wherever you need to allow any value from SeatoolAuthority

// const exampleAuthority: SeatoolAuthorityType = "Medicaid SPA"; // This is valid
// const anotherExample: SeatoolAuthorityType = SeatoolAuthority.CHIPSPA; // This is also valid
