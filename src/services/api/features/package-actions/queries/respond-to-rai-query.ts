export type RespondToRaiQueryParams = {
  id: string;
  latestRai: number;
  responseDate: number;
};

export const respondToRaiQuery = ({
  id,
  latestRai,
  responseDate,
}: RespondToRaiQueryParams) => `
UPDATE SEA.dbo.RAI
  SET RAI_RECEIVED_DATE = DATEADD(s, CONVERT(int, LEFT('${responseDate}', 10)), CAST('19700101' AS DATETIME))
  WHERE ID_Number = '${id}' AND RAI_REQUESTED_DATE = DATEADD(s, CONVERT(int, LEFT('${latestRai}', 10)), CAST('19700101' AS DATETIME))
`;
