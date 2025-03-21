import { errorApiCpocHandler } from "mocks";
import { cpocsList } from "mocks/data/cpocs";
import { mockedApiServer as mockedServer } from "mocks/server";
import { describe, expect, it } from "vitest";

import { fetchCpocData } from "./useGetCPOCs";

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
    });
  });
});
