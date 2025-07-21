import { errorApiCpocHandler } from "mocks";
import { cpocsList } from "mocks/data/cpocs";
import { mockedApiServer as mockedServer } from "mocks/server";
import { describe, expect, it, vi } from "vitest";

import * as gaModule from "@/utils/ReactGA/SendGAEvent";

import { fetchCpocData } from "./useGetCPOCs";
vi.mock("@/utils/ReactGA/SendGAEvent", () => ({
  sendGAEvent: vi.fn(),
}));
describe("useGetCPOCs test", () => {
  describe("fetchCpocData tests", () => {
    it("should return CPOCs", async () => {
      const result = await fetchCpocData();
      expect(result).toEqual(cpocsList.map((cpoc) => cpoc?._source));
    });

    it("should handle an error when fetching CPOCs", async () => {
      mockedServer.use(errorApiCpocHandler);

      const result = await fetchCpocData();
      expect(result).toBeUndefined();
      expect(gaModule.sendGAEvent).toHaveBeenCalledWith(
        "api_error",
        expect.objectContaining({
          message: "failure /getCpocs",
        }),
      );
    });
  });
});
