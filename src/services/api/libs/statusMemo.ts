export function buildStatusMemoQuery(id: string, msg: string) {
  return `
    UPDATE SEA.dbo.State_Plan
    SET 
        Status_Memo =  '- OneMAC Activity: ' + FORMAT(DATEADD(SECOND, CAST('${Date.now()}' AS BIGINT) / 1000, '1970-01-01'), 'MM/dd/yyyy HH:mm') + ' - ' + '${msg} ' + '\r' + CAST(ISNULL(Status_Memo, '') AS VARCHAR(MAX))
    WHERE ID_Number = '${id}'
  `;
}
