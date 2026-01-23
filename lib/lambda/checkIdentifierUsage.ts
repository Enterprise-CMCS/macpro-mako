import { getPackage } from "libs/api/package";
import { APIGatewayEvent } from "shared-types";
import { z } from "zod";

import { nonAuthenticatedMiddy } from "./middleware";

const checkIdentifierUsageEventSchema = z
  .object({
    queryStringParameters: z
      .object({
        id: z.string().min(1),
      })
      .strict(),
  })
  .passthrough();

export type CheckIdentifierUsageEvent = APIGatewayEvent &
  z.infer<typeof checkIdentifierUsageEventSchema>;

const MACPRO_AUTHORITIES = new Set(["CHIP SPA", "Medicaid SPA", "APD", "ADM", "UPL"]);
const WMS_AUTHORITIES = new Set([
  "1115",
  "1115 Indep. Plus",
  "1915(b)",
  "1915(c)",
  "1915(c) Indep. Plus",
]);

const resolveSystem = (origin?: string | null, authority?: string | null): string => {
  if (origin === "OneMAC" || origin === "OneMACLegacy") {
    return "ONEMAC";
  }

  if (authority) {
    if (MACPRO_AUTHORITIES.has(authority)) {
      return "MACPRO";
    }
    if (WMS_AUTHORITIES.has(authority)) {
      return "WMS";
    }
  }

  if (origin === "SEATool") {
    return "SEATOOL";
  }

  return origin ? origin.toUpperCase() : "UNKNOWN";
};

export const handler = nonAuthenticatedMiddy({
  opensearch: true,
  eventSchema: checkIdentifierUsageEventSchema,
}).handler(async (event: CheckIdentifierUsageEvent) => {
  const { id } = event.queryStringParameters;

  const packageResult = await getPackage(id);

  if (!packageResult || !packageResult._source) {
    return {
      statusCode: 200,
      body: { inUse: false },
    };
  }

  const system = resolveSystem(packageResult._source.origin, packageResult._source.authority);

  return {
    statusCode: 200,
    body: { inUse: true, system },
  };
});
