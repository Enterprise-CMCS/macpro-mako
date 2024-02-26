export function buildStatusMemoQuery(id: string, msg: string) {
  const printable = new Date().toLocaleString("en-US", {
    timeZone: "America/New_York",
  });
  return `
    UPDATE SEA.dbo.State_Plan
    SET 
        Status_Memo =  '- OneMAC Activity: ${printable} - ${msg} \r' + CAST(ISNULL(Status_Memo, '') AS VARCHAR(MAX))
    WHERE ID_Number = '${id}'
  `;
}
