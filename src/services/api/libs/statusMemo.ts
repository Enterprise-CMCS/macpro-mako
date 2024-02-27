export function buildStatusMemoQuery(id: string, msg: string) {
  const printable = new Date().toLocaleString("en-US", {
    timeZone: "America/New_York",
  });
  return `Status_Memo =  '- OneMAC Activity: ${printable} - ${msg} \r' + CAST(ISNULL(Status_Memo, '') AS VARCHAR(MAX))`;
}
