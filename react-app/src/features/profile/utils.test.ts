import { describe, expect, it } from "vitest";

import {
  filterRoleStatus,
  getConfirmationModalText,
  hasPendingRequests,
  orderRoleStatus,
} from "./utils";

const baseRole = {
  eventType: "user-role",
  email: "statesubmitter@nightwatch.test",
  doneByEmail: "approver@example.com",
  doneByName: "State Approver",
  role: "statesubmitter",
  lastModifiedDate: 1744942254306,
};

describe("Profile utils", () => {
  describe("orderRoleStatus", () => {
    it("should return undefined if accesses is undefined", () => {
      // @ts-ignore
      expect(orderRoleStatus()).toBeUndefined();
    });

    it("should return undefined if accesses is null", () => {
      // @ts-ignore
      expect(orderRoleStatus(null)).toBeUndefined();
    });

    it("should return undefined if accesses is an empty array", () => {
      expect(orderRoleStatus([])).toBeUndefined();
    });

    it("should move the revoked statuses to the bottom of the list", () => {
      expect(
        orderRoleStatus([
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
        orderRoleStatus([
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

  describe("filterRoleStatus", () => {
    it("should return an empty array if userProfile is undefined", () => {
      // @ts-ignore
      expect(filterRoleStatus({ role: "statesubmitter" })).toEqual([]);
    });

    it("should return an empty array if userProfile is null", () => {
      // @ts-ignore
      expect(filterRoleStatus({ role: "statesubmitter" }, null)).toEqual([]);
    });

    it("should return an empty array if userProfile is an empty object", () => {
      expect(filterRoleStatus({ role: "statesubmitter" }, {})).toEqual([]);
    });

    it("should return an empty array if stateAccess is null", () => {
      expect(filterRoleStatus({ role: "statesubmitter" }, { stateAccess: null })).toEqual([]);
    });

    it("should return an empty array if stateAccess is an empty array", () => {
      expect(filterRoleStatus({ role: "statesubmitter" }, { stateAccess: [] })).toEqual([]);
    });

    // it("should filter out the ZZ states", () => {
    //   expect(
    //     filterRoleStatus(undefined, {
    //       stateAccess: [
    //         {
    //           ...baseRole,
    //           id: `${baseRole.email}_ZZ_${baseRole.role}`,
    //           status: "active",
    //           territory: "ZZ",
    //         },
    //         {
    //           ...baseRole,
    //           id: `${baseRole.email}_MD_${baseRole.role}`,
    //           status: "active",
    //           territory: "MD",
    //         },
    //       ],
    //     }),
    //   ).toEqual([
    //     {
    //       ...baseRole,
    //       id: `${baseRole.email}_MD_${baseRole.role}`,
    //       status: "active",
    //       territory: "MD",
    //     },
    //   ]);
    // });

    it("should filter all roles except the user's role if it has one", () => {
      expect(
        filterRoleStatus(
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

  describe("hasPendingRequests", () => {
    it("should return false if user has no requests", () => {
      // @ts-ignore
      expect(hasPendingRequests([])).toBe(false);
    });
    it("should return true if user has pending requests", () => {
      const stateAccessArray = [
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
          status: "pending",
          territory: "MD",
        },
      ];
      // @ts-ignore
      expect(hasPendingRequests(stateAccessArray)).toBe(true);
    });
  });
});

describe("Get Confirmation Modal Text", () => {
  const BaseRoleAccess = {
    id: "1",
    eventType: "user-role",
    email: "",
    doneByEmail: "",
    doneByName: "",
  };
  it("should return empty title when selfRemoveRole is null", () => {
    const modalText = getConfirmationModalText(null);
    expect(modalText.dialogTitle).toBe("");
  });

  it("should return Withdraw State Access, when the flag is off (passed in)", () => {
    const modalText = getConfirmationModalText({
      isNewUserRoleDisplay: false,
      role: "statesubmitter",
      territory: "CA",
      status: "active",
      ...BaseRoleAccess,
    });
    expect(modalText.dialogTitle).toBe("Withdraw State Access?");
  });

  it("should return title Withdraw Role Request, when the flag is on and is pending status", () => {
    const modalText = getConfirmationModalText({
      isNewUserRoleDisplay: true,
      role: "statesubmitter",
      territory: "CA",
      status: "pending",
      ...BaseRoleAccess,
    });
    expect(modalText.dialogTitle).toBe("Withdraw Role Request?");
  });

  it("should return title Withdraw California State Submitter Access, when the flag is on and is active status", () => {
    const modalText = getConfirmationModalText({
      isNewUserRoleDisplay: true,
      role: "statesubmitter",
      territory: "CA",
      status: "active",
      ...BaseRoleAccess,
    });
    expect(modalText.dialogTitle).toBe("Withdraw  California State Submitter Access?");
  });
});
