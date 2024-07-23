import { SeatoolAuthority, SeatoolAuthorityType } from "../authority";

export const SEATOOL_AUTHORITIES_MAP_TO_ID: Record<
  SeatoolAuthorityType,
  number
> = {
  [SeatoolAuthority["1115Waiver"]]: 121,
  [SeatoolAuthority["1915b"]]: 122,
  [SeatoolAuthority["1915c"]]: 123,
  [SeatoolAuthority["CHIPSPA"]]: 124,
  [SeatoolAuthority["MedicaidSPA"]]: 125,
  [SeatoolAuthority["1115IndPlus"]]: 126,
  [SeatoolAuthority["1915cIndPlus"]]: 127,
  [SeatoolAuthority["ADP"]]: 128,
  [SeatoolAuthority["ADM"]]: 129,
  [SeatoolAuthority["ULP"]]: 130,
};
