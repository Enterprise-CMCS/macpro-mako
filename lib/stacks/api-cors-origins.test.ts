import { describe, expect, it } from "vitest";

import { apiCorsAllowOrigins, applicationOriginFromEndpointUrl } from "./api-cors-origins";

describe("apiCorsAllowOrigins", () => {
  it("strips the trailing slash from the application endpoint", () => {
    expect(applicationOriginFromEndpointUrl("https://app.example.com/")).toBe(
      "https://app.example.com",
    );
  });

  it("uses only the app origin for shared stages", () => {
    expect(apiCorsAllowOrigins("https://app.example.com/", false)).toEqual([
      "https://app.example.com",
    ]);
  });

  it("adds localhost for dev stages", () => {
    expect(apiCorsAllowOrigins("https://d111.cloudfront.net/", true)).toEqual([
      "https://d111.cloudfront.net",
      "http://localhost:5173",
    ]);
  });

  it("does not include a wildcard origin", () => {
    expect(apiCorsAllowOrigins("https://app.example.com/", true).join(",")).not.toContain("*");
  });
});
