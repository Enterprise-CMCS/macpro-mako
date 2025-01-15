import { describe, expect, it } from "vitest";
import { fetchData } from "./useGetTypes";
import {
  MEDICAID_SPA_AUTHORITY_ID,
  CHIP_SPA_AUTHORITY_ID,
  NOT_FOUND_AUTHORITY_ID,
  ERROR_AUTHORITY_ID,
  TYPE_ONE_ID,
  TYPE_TWO_ID,
  TYPE_THREE_ID,
  DO_NOT_USE_TYPE_ID,
  medicaidTypes,
  medicaidSubtypes,
  chipTypes,
  chipSubtypes,
} from "mocks/data/types";
import { errorSubTypesHandler, errorTypeHandler } from "mocks";
import { mockedApiServer as mockedServer } from "mocks/server";

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
      mockedServer.use(errorTypeHandler);

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
      mockedServer.use(errorSubTypesHandler);

      await expect(fetchData({ authorityId: ERROR_AUTHORITY_ID, typeIds: [] })).rejects.toThrow(
        "Failed to fetch subtypes",
      );
    });
  });
});
