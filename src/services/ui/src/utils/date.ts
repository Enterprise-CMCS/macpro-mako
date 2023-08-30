export function isISOString(str: string): boolean {
  // ISO 8601 date format: YYYY-MM-DDTHH:mm:ss.sssZ
  const isoDatePattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
  return isoDatePattern.test(str);
}
