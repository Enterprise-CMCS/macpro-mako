import { describe, expect, it } from "vitest";
import { response } from "./handler-lib";

describe("handler-lib", () => {
  describe("response", () => {
    it("should return a basic response with CORS headers", () => {
      const result = response({});

      expect(result).toEqual({
        body: "{}",
        headers: {
          "Access-Control-Allow-Headers": "Content-Type",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "OPTIONS,POST,GET,PUT,DELETE",
        },
      });
    });

    it("should include status code and stringify body", () => {
      const result = response({
        statusCode: 200,
        body: { message: "success" },
      });

      expect(result).toEqual({
        statusCode: 200,
        body: JSON.stringify({ message: "success" }),
        headers: {
          "Access-Control-Allow-Headers": "Content-Type",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "OPTIONS,POST,GET,PUT,DELETE",
        },
      });
    });

    it("should merge custom headers with CORS headers", () => {
      const result = response({
        headers: {
          "Content-Type": "application/json",
        },
      });

      expect(result).toEqual({
        body: "{}",
        headers: {
          "Access-Control-Allow-Headers": "Content-Type",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "OPTIONS,POST,GET,PUT,DELETE",
          "Content-Type": "application/json",
        },
      });
    });

    it("should not include CORS headers when disableCors is true", () => {
      const result = response(
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
        { disableCors: true },
      );

      expect(result).toEqual({
        body: "{}",
        headers: {
          "Content-Type": "application/json",
        },
      });
    });

    it("should handle undefined body", () => {
      const result = response({
        body: undefined,
      });

      expect(result).toEqual({
        body: "{}",
        headers: {
          "Access-Control-Allow-Headers": "Content-Type",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "OPTIONS,POST,GET,PUT,DELETE",
        },
      });
    });
  });
});
