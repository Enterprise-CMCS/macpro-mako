import { errorApiSubTypesHandler, errorApiTypeHandler } from "mocks";
import {
  CHIP_SPA_AUTHORITY_ID,
  chipSubtypes,
  chipTypes,
  DO_NOT_USE_TYPE_ID,
  ERROR_AUTHORITY_ID,
  MEDICAID_SPA_AUTHORITY_ID,
  medicaidSubtypes,
  medicaidTypes,
  NOT_FOUND_AUTHORITY_ID,
  TYPE_ONE_ID,
  TYPE_THREE_ID,
  TYPE_TWO_ID,
} from "mocks/data/types";
import { mockedApiServer as mockedServer } from "mocks/server";
import { describe, expect, it } from "vitest";

import { fetchData } from "./useGetTypes";

describe("fetchData", () => {
  describe("fetchTypes", () => {
    it("makes an AWS Amplify post request for types", async () => {
      const types = await fetchData({ authorityId: MEDICAID_SPA_AUTHORITY_ID });
      expect(types).toEqual(medicaidTypes.map((type) => type?._source));
    });

    it("successfully fetches types for a given authorityId", async () => {
      const types = await fetchData({ authorityId: CHIP_SPA_AUTHORITY_ID });
      expect(types).toEqual(chipTypes.map((type) => type?._source));
    });

    it("returns an empty array when there are no types", async () => {
      const types = await fetchData({ authorityId: NOT_FOUND_AUTHORITY_ID });
      expect(types).toEqual([]);
    });

    it("throws an error when fetch fails", async () => {
      mockedServer.use(errorApiTypeHandler);

      await expect(fetchData({ authorityId: ERROR_AUTHORITY_ID })).rejects.toThrow(
        "Failed to fetch types",
      );
    });
  });

  describe("fetchSubTypes", () => {
    it("makes an AWS Amplify post request for subtypes", async () => {
      const subtypes = await fetchData({
        authorityId: MEDICAID_SPA_AUTHORITY_ID,
        typeIds: [TYPE_ONE_ID, TYPE_TWO_ID],
      });
      expect(subtypes).toEqual(medicaidSubtypes.map((subtype) => subtype?._source));
    });

    it("successfully fetches subtypes for a given authorityId and typeIds", async () => {
      const subtypes = await fetchData({
        authorityId: CHIP_SPA_AUTHORITY_ID,
        typeIds: [TYPE_THREE_ID, DO_NOT_USE_TYPE_ID],
      });
      expect(subtypes).toEqual(chipSubtypes.map((subtype) => subtype?._source));
    });

    it("returns an empty array when there are no subtypes", async () => {
      const subtypes = await fetchData({
        authorityId: CHIP_SPA_AUTHORITY_ID,
        typeIds: [DO_NOT_USE_TYPE_ID],
      });
      expect(subtypes).toEqual([]);
    });

    it("throws an error when fetch fails", async () => {
      mockedServer.use(errorApiSubTypesHandler);

      await expect(fetchData({ authorityId: ERROR_AUTHORITY_ID, typeIds: [] })).rejects.toThrow(
        "Failed to fetch subtypes",
      );
    });
  });
});
