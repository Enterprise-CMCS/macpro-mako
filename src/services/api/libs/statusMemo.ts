export function buildStatusMemoQuery(
  id: string,
  msg: string,
  operation: "insert" | "update" = "update"
) {
  const printable = new Date().toLocaleString("en-US", {
    timeZone: "America/New_York",
  });
  const newEntry = `'- OneMAC Activity: ${printable} - ${msg} \\r'`;
  const existingValue = " + CAST(ISNULL(Status_Memo, '') AS VARCHAR(MAX))";
  if (operation === "update") {
    return newEntry + existingValue;
  } else {
    return newEntry;
  }
}
