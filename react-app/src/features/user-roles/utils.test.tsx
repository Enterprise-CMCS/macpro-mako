import { describe, expect, it } from "vitest";

import { initSortUserData, sortUserData, UserRoleType } from "./utils";

const abeDavisPending: UserRoleType = {
  id: "adavis@email.com_N/A_defaultcmsuser",
  email: "adavis@email.com",
  fullName: "Abe Davis",
  role: "defaultcmsuser",
  territory: "N/A",
  doneByEmail: "approver@email.com",
  doneByName: "CMS Role Approver",
  lastModifiedDate: 1744942254406,
  status: "pending",
  eventType: "",
};

const bridgetTurnerPending: UserRoleType = {
  id: "bturner@email.com_N/A_defaultcmsuser",
  email: "bturner@email.com",
  fullName: "Bridget Turner",
  role: "defaultcmsuser",
  territory: "N/A",
  doneByEmail: "approver@email.com",
  doneByName: "CMS Role Approver",
  lastModifiedDate: 1744942254106,
  status: "pending",
  eventType: "",
};

const kathyMartinPending: UserRoleType = {
  id: "kmartin@email.com_N/A_defaultcmsuser",
  email: "kmartin@email.com",
  fullName: "Kathy Martin",
  role: "defaultcmsuser",
  territory: "N/A",
  doneByEmail: "approver@email.com",
  doneByName: "CMS Role Approver",
  lastModifiedDate: 1744942284106,
  status: "pending",
  eventType: "",
};

const ariSmithActive: UserRoleType = {
  id: "asmith@email.com_N/A_defaultcmsuser",
  email: "asmith@email.com",
  fullName: "Ari Smith",
  role: "defaultcmsuser",
  territory: "N/A",
  doneByEmail: "approver@email.com",
  doneByName: "CMS Role Approver",
  lastModifiedDate: 1744942254306,
  status: "active",
  eventType: "",
};

const ariSmithActive2: UserRoleType = {
  id: "asmith@email.com_N/A_cmsroleapprover",
  email: "asmith@email.com",
  fullName: "Ari Smith",
  role: "cmsroleapprover",
  territory: "N/A",
  doneByEmail: "approver@email.com",
  doneByName: "CMS Role Approver",
  lastModifiedDate: 1744942254306,
  status: "active",
  eventType: "",
};

const carolNewtonRevoked: UserRoleType = {
  id: "cnewton@email.com_N/A_defaultcmsuser",
  email: "cnewton@email.com",
  fullName: "Carol Newton",
  role: "defaultcmsuser",
  territory: "N/A",
  doneByEmail: "approver@email.com",
  doneByName: "CMS Role Approver",
  lastModifiedDate: 1744943254506,
  status: "revoked",
  eventType: "",
};

const dylanSmithDenied: UserRoleType = {
  id: "dsmith@email.com_N/A_defaultcmsuser",
  email: "dsmith@email.com",
  fullName: "Dylan Smith",
  role: "defaultcmsuser",
  territory: "N/A",
  doneByEmail: "approver@email.com",
  doneByName: "CMS Role Approver",
  lastModifiedDate: 1744942254506,
  status: "denied",
  eventType: "",
};

describe("UserManagement Utils", () => {
  describe("initSortUserData", () => {
    it("should return empty array if no data is passed", () => {
      expect(initSortUserData([])).toEqual([]);
    });

    it("should sort pending users at the top", () => {
      expect(initSortUserData([ariSmithActive, bridgetTurnerPending])).toEqual([
        bridgetTurnerPending,
        ariSmithActive,
      ]);
    });

    it("should sort pending users and non-pending users", () => {
      expect(
        initSortUserData([
          bridgetTurnerPending,
          ariSmithActive,
          ariSmithActive2,
          abeDavisPending,
          kathyMartinPending,
          dylanSmithDenied,
          carolNewtonRevoked,
        ]),
      ).toEqual([
        abeDavisPending,
        bridgetTurnerPending,
        kathyMartinPending,
        ariSmithActive,
        ariSmithActive2,
        carolNewtonRevoked,
        dylanSmithDenied,
      ]);
    });
  });

  describe("sortUserData", () => {
    it("should return empty array if no data is passed", () => {
      expect(sortUserData("email", true, [])).toEqual([]);
    });

    it("should sort by email in ascending order", () => {
      expect(
        sortUserData("email", false, [
          kathyMartinPending,
          ariSmithActive,
          carolNewtonRevoked,
          dylanSmithDenied,
        ]),
      ).toEqual([ariSmithActive, carolNewtonRevoked, dylanSmithDenied, kathyMartinPending]);
    });

    it("should sort by email in descending order", () => {
      expect(
        sortUserData("email", true, [
          kathyMartinPending,
          ariSmithActive,
          carolNewtonRevoked,
          dylanSmithDenied,
        ]),
      ).toEqual([kathyMartinPending, dylanSmithDenied, carolNewtonRevoked, ariSmithActive]);
    });

    it("should sort by status in ascending order", () => {
      expect(
        sortUserData("status", false, [
          kathyMartinPending,
          ariSmithActive,
          carolNewtonRevoked,
          dylanSmithDenied,
        ]),
      ).toEqual([kathyMartinPending, ariSmithActive, dylanSmithDenied, carolNewtonRevoked]);
    });

    it("should sort by status in descending order", () => {
      expect(
        sortUserData("status", true, [
          kathyMartinPending,
          ariSmithActive,
          carolNewtonRevoked,
          dylanSmithDenied,
        ]),
      ).toEqual([carolNewtonRevoked, dylanSmithDenied, ariSmithActive, kathyMartinPending]);
    });
  });
});
