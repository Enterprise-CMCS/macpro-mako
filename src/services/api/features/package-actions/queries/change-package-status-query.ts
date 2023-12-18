import { SEATOOL_STATUS } from "shared-types/statusHelper";

export type ChangePackageStatusQueryParams = {
  id: string;
  status: keyof typeof SEATOOL_STATUS;
};

export const changePackageStatusQuery = ({
  id,
  status,
}: ChangePackageStatusQueryParams) => `
  UPDATE SEA.dbo.State_Plan
  SET SPW_Status_ID = (Select SPW_Status_ID from SEA.dbo.SPW_Status where SPW_Status_DESC = '${status}')
  WHERE ID_Number = '${id}'
`;
