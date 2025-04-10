export function decodeBase64WithUtf8(base64Value: string) {
  const buffer = Buffer.from(base64Value, "base64");

  return buffer.toString("utf-8");
}
