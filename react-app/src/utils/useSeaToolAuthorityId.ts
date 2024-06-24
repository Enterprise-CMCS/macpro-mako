import { SEATOOL_AUTHORITIES_MAP_TO_ID } from "shared-types";
import { useParams } from "@/components";
import { useState } from "react";

/** takes an Authority and returns the seatool authority ID.
 * REQUIRES :authority url parameter */
export const useSeaToolAuthorityId = () => {
  const { authority } = useParams("/action/:authority/:id/:type");
  const [stAuthorityId] = useState(
    authority ? SEATOOL_AUTHORITIES_MAP_TO_ID[authority] : 0,
  );
  return stAuthorityId;
};
