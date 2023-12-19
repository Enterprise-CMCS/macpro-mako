export type IssueRaiQueryParams = {
  id: string;
  requestedDate: number;
};

export const issueRaiQuery = ({ id, requestedDate }: IssueRaiQueryParams) => `
INSERT INTO SEA.dbo.RAI (ID_Number, RAI_Requested_Date)
VALUES ('${id}',dateadd(s, convert(int, left(${requestedDate}, 10)), cast('19700101' as datetime)))
`;
