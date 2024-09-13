import { Authority } from "shared-types/authority";
import { SEATOOL_AUTHORITIES_MAP_TO_ID } from "shared-types/seatool-statics";
import { useState } from "react";
import { useParams } from "react-router-dom";

/** takes an Authority and returns the seatool authority ID.
 * REQUIRES :authority url parameter */
export const useSeaToolAuthorityId = () => {
  const { authority } = useParams<{ authority: Authority }>();
  const [stAuthorityId] = useState(
    authority ? SEATOOL_AUTHORITIES_MAP_TO_ID[authority] : 0,
  );
  return stAuthorityId;
};
