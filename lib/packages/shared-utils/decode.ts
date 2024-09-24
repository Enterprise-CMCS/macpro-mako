export function decodeBase64WithUtf8(value: string) {
  // Assuming the record value is in base64 encoding
  const base64String = value;
  const buffer = Buffer.from(base64String, "base64");
  const decodedString = buffer.toString("utf-8");
  return decodedString;
}
