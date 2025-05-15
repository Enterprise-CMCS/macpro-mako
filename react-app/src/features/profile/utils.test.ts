import { describe, expect, it } from "vitest";

import { filterStateAccess, orderStateAccess } from "./utils";

const baseRole = {
  eventType: "user-role",
  email: "statesubmitter@nightwatch.test",
  doneByEmail: "approver@example.com",
  doneByName: "State Approver",
  role: "statesubmitter",
  lastModifiedDate: 1744942254306,
};

describe("Profile utils", () => {
  describe("orderStateAccess", () => {
    it("should return undefined if accesses is undefined", () => {
      // @ts-ignore
      expect(orderStateAccess()).toBeUndefined();
    });

    it("should return undefined if accesses is null", () => {
      // @ts-ignore
      expect(orderStateAccess(null)).toBeUndefined();
    });

    it("should return undefined if accesses is an empty array", () => {
      expect(orderStateAccess([])).toBeUndefined();
    });

    it("should move the revoked statuses to the bottom of the list", () => {
      expect(
        orderStateAccess([
          {
            ...baseRole,
            id: `${baseRole.email}_AK_${baseRole.role}`,
            status: "revoked",
            territory: "AK",
          },
          {
            ...baseRole,
            id: `${baseRole.email}_MO_${baseRole.role}`,
            status: "pending",
            territory: "MO",
          },
        ]),
      ).toEqual([
        {
          ...baseRole,
          id: `${baseRole.email}_MO_${baseRole.role}`,
          status: "pending",
          territory: "MO",
        },
        {
          ...baseRole,
          id: `${baseRole.email}_AK_${baseRole.role}`,
          status: "revoked",
          territory: "AK",
        },
      ]);
    });

    it("should sort the roles by active and revoked statuses and full state name ", () => {
      expect(
        orderStateAccess([
          {
            ...baseRole,
            id: `${baseRole.email}_MA_${baseRole.role}`,
            status: "revoked",
            territory: "MA",
          },
          {
            ...baseRole,
            id: `${baseRole.email}_MO_${baseRole.role}`,
            status: "pending",
            territory: "MO",
          },
          {
            ...baseRole,
            id: `${baseRole.email}_ME_${baseRole.role}`,
            status: "revoked",
            territory: "ME",
          },
          {
            ...baseRole,
            id: `${baseRole.email}_MD_${baseRole.role}`,
            status: "revoked",
            territory: "MD",
          },
          {
            ...baseRole,
            id: `${baseRole.email}_MN_${baseRole.role}`,
            status: "active",
            territory: "MN",
          },
          {
            ...baseRole,
            id: `${baseRole.email}_MS_${baseRole.role}`,
            status: "denied",
            territory: "MS",
          },
        ]),
      ).toEqual([
        {
          ...baseRole,
          id: `${baseRole.email}_MN_${baseRole.role}`,
          status: "active",
          territory: "MN",
        },
        {
          ...baseRole,
          id: `${baseRole.email}_MS_${baseRole.role}`,
          status: "denied",
          territory: "MS",
        },
        {
          ...baseRole,
          id: `${baseRole.email}_MO_${baseRole.role}`,
          status: "pending",
          territory: "MO",
        },
        {
          ...baseRole,
          id: `${baseRole.email}_ME_${baseRole.role}`,
          status: "revoked",
          territory: "ME",
        },
        {
          ...baseRole,
          id: `${baseRole.email}_MD_${baseRole.role}`,
          status: "revoked",
          territory: "MD",
        },
        {
          ...baseRole,
          id: `${baseRole.email}_MA_${baseRole.role}`,
          status: "revoked",
          territory: "MA",
        },
      ]);
    });
  });

  describe("filterStateAccess", () => {
    it("should return an empty array if userProfile is undefined", () => {
      // @ts-ignore
      expect(filterStateAccess({ role: "statesubmitter" })).toEqual([]);
    });

    it("should return an empty array if userProfile is null", () => {
      // @ts-ignore
      expect(filterStateAccess({ role: "statesubmitter" }, null)).toEqual([]);
    });

    it("should return an empty array if userProfile is an empty object", () => {
      expect(filterStateAccess({ role: "statesubmitter" }, {})).toEqual([]);
    });

    it("should return an empty array if stateAccess is null", () => {
      expect(filterStateAccess({ role: "statesubmitter" }, { stateAccess: null })).toEqual([]);
    });

    it("should return an empty array if stateAccess is an empty array", () => {
      expect(filterStateAccess({ role: "statesubmitter" }, { stateAccess: [] })).toEqual([]);
    });

    it("should filter out the ZZ states", () => {
      expect(
        filterStateAccess(undefined, {
          stateAccess: [
            {
              ...baseRole,
              id: `${baseRole.email}_ZZ_${baseRole.role}`,
              status: "active",
              territory: "ZZ",
            },
            {
              ...baseRole,
              id: `${baseRole.email}_MD_${baseRole.role}`,
              status: "active",
              territory: "MD",
            },
          ],
        }),
      ).toEqual([
        {
          ...baseRole,
          id: `${baseRole.email}_MD_${baseRole.role}`,
          status: "active",
          territory: "MD",
        },
      ]);
    });

    it("should filter all roles except the user's role if it has one", () => {
      expect(
        filterStateAccess(
          { role: "statesubmitter" },
          {
            stateAccess: [
              {
                ...baseRole,
                role: "statesystemadmin",
                id: `${baseRole.email}_MD_statesystemadmin`,
                status: "active",
                territory: "MD",
              },
              {
                ...baseRole,
                id: `${baseRole.email}_MD_${baseRole.role}`,
                status: "active",
                territory: "MD",
              },
            ],
          },
        ),
      ).toEqual([
        {
          ...baseRole,
          id: `${baseRole.email}_MD_${baseRole.role}`,
          status: "active",
          territory: "MD",
        },
      ]);
    });
  });
});
