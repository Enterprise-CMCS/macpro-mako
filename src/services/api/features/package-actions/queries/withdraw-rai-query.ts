export type WithdrawRaiQueryParams = {
  activeRaiDate: number;
  id: string;
  withdrawnDate: number;
};

export const withdrawRaiQuery = ({
  activeRaiDate,
  withdrawnDate,
  id,
}: WithdrawRaiQueryParams) => `
  UPDATE SEA.dbo.RAI
  SET RAI_WITHDRAWN_DATE = DATEADD(s, CONVERT(int, LEFT('${withdrawnDate}', 10)), CAST('19700101' AS DATETIME))
  WHERE ID_Number = '${id}' AND RAI_REQUESTED_DATE = DATEADD(s, CONVERT(int, LEFT('${activeRaiDate}', 10)), CAST('19700101' AS DATETIME))
`;
