import { http, HttpResponse } from "msw";

const defaultSecurityRolesMappingHandler = http.patch(
  "https://vpc-opensearchdomain-mock-domain.us-east-1.es.amazonaws.com/_plugins/_security/api/rolesmapping/os-role",
  () => new HttpResponse(null, { status: 200 }),
);

export const errorSecurityRolesMappingHandler = http.patch(
  "https://vpc-opensearchdomain-mock-domain.us-east-1.es.amazonaws.com/_plugins/_security/api/rolesmapping/os-role",
  () => new HttpResponse("Internal server error", { status: 500 }),
);

export const securityHandlers = [defaultSecurityRolesMappingHandler];
