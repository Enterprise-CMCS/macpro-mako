import {
  getFilteredRoleDocsByEmail,
  getFilteredRoleDocsByState,
  getLatestRoleByEmail,
  idmRolesDoc,
  STATE_SUBMITTER_EMAIL,
  STATE_SUBMITTER_USER,
  STATE_SYSTEM_ADMIN_EMAIL,
  STATE_SYSTEM_ADMIN_USER,
} from "mocks";
import { describe, expect, it } from "vitest";

import {
  getAllUserRoles,
  getAllUserRolesByEmail,
  getAllUserRolesByState,
  getLatestActiveRoleByEmail,
  getUserByEmail,
  getUserRolesWithNames,
  getUsersByEmails,
  userHasThisRole,
} from "./userManagementService";

describe("User Management Service", () => {
  describe("getUserByEmail", () => {
    it("should return null if email is undefined", async () => {
      // @ts-ignore testing undefined email
      const result = await getUserByEmail();
      expect(result).toBeNull();
    });
    it("should return null if the email is null", async () => {
      // @ts-ignore testing null email
      const result = await getUserByEmail(null);
      expect(result).toBeNull();
    });
    it("should return null if the email is an empty string", async () => {
      const result = await getUserByEmail("");
      expect(result).toBeNull();
    });
    it("should return null if the email is not found", async () => {
      const result = await getUserByEmail("invalid@email.com");
      expect(result).toBeNull();
    });
    it("should return the state submitter when searching for their email", async () => {
      const result = await getUserByEmail(STATE_SUBMITTER_EMAIL);
      expect(result).toEqual(STATE_SUBMITTER_USER._source);
    });
    it("should return the state sysadmin when searching for their email", async () => {
      const result = await getUserByEmail(STATE_SYSTEM_ADMIN_EMAIL);
      expect(result).toEqual(STATE_SYSTEM_ADMIN_USER._source);
    });
  });

  describe("getUsersByEmail", () => {
    it("should return an empty object if emails are undefined", async () => {
      // @ts-ignore testing with undefined emails
      const result = await getUsersByEmails();
      expect(result).toEqual({});
    });
    it("should return an empty object if the emails are null", async () => {
      // @ts-ignore testing with null email list
      const result = await getUsersByEmails(null);
      expect(result).toEqual({});
    });
    it("should return an empty object if the emails are empty", async () => {
      const result = await getUsersByEmails([]);
      expect(result).toEqual({});
    });
    it("should return an empty object if the emails are not found", async () => {
      const result = await getUsersByEmails(["invalid@email.com"]);
      expect(result).toEqual({});
    });
    it("should return the state submitter when searching for their email", async () => {
      const result = await getUsersByEmails([STATE_SUBMITTER_EMAIL]);
      expect(result).toEqual({
        [STATE_SUBMITTER_EMAIL]: STATE_SUBMITTER_USER._source,
      });
    });
    it("should return the state sysadmin when searching for their email", async () => {
      const result = await getUsersByEmails([STATE_SYSTEM_ADMIN_EMAIL]);
      expect(result).toEqual({
        [STATE_SYSTEM_ADMIN_EMAIL]: STATE_SYSTEM_ADMIN_USER._source,
      });
    });
    it("should multiple users that match email search", async () => {
      const result = await getUsersByEmails([STATE_SUBMITTER_EMAIL, STATE_SYSTEM_ADMIN_EMAIL]);
      expect(result).toEqual({
        [STATE_SUBMITTER_EMAIL]: STATE_SUBMITTER_USER._source,
        [STATE_SYSTEM_ADMIN_EMAIL]: STATE_SYSTEM_ADMIN_USER._source,
      });
    });
    it("should handle an undefined email in search", async () => {
      // @ts-ignore testing undefined email
      const result = await getUsersByEmails([
        STATE_SUBMITTER_EMAIL,
        STATE_SYSTEM_ADMIN_EMAIL,
        undefined,
      ]);
      expect(result).toEqual({
        [STATE_SUBMITTER_EMAIL]: STATE_SUBMITTER_USER._source,
        [STATE_SYSTEM_ADMIN_EMAIL]: STATE_SYSTEM_ADMIN_USER._source,
      });
    });
    it("should handle a null email in search", async () => {
      // @ts-ignore testing a null email
      const result = await getUsersByEmails([
        STATE_SUBMITTER_EMAIL,
        STATE_SYSTEM_ADMIN_EMAIL,
        null,
      ]);
      expect(result).toEqual({
        [STATE_SUBMITTER_EMAIL]: STATE_SUBMITTER_USER._source,
        [STATE_SYSTEM_ADMIN_EMAIL]: STATE_SYSTEM_ADMIN_USER._source,
      });
    });
    it("should handle an empty string email in search", async () => {
      // @ts-ignore testing null email
      const result = await getUsersByEmails([STATE_SUBMITTER_EMAIL, STATE_SYSTEM_ADMIN_EMAIL, ""]);
      expect(result).toEqual({
        [STATE_SUBMITTER_EMAIL]: STATE_SUBMITTER_USER._source,
        [STATE_SYSTEM_ADMIN_EMAIL]: STATE_SYSTEM_ADMIN_USER._source,
      });
    });
    it("should handle an invalid email in search", async () => {
      const result = await getUsersByEmails([
        STATE_SUBMITTER_EMAIL,
        STATE_SYSTEM_ADMIN_EMAIL,
        "invalid@email.com",
      ]);
      expect(result).toEqual({
        [STATE_SUBMITTER_EMAIL]: STATE_SUBMITTER_USER._source,
        [STATE_SYSTEM_ADMIN_EMAIL]: STATE_SYSTEM_ADMIN_USER._source,
      });
    });
  });

  describe("getAllUserRolesByEmail", () => {
    it("should return an empty array if the email is undefined", async () => {
      // @ts-ignore
      const result = await getAllUserRolesByEmail();
      expect(result).toEqual([]);
    });
    it("should return an empty array if the email is null", async () => {
      // @ts-ignore
      const result = await getAllUserRolesByEmail(null);
      expect(result).toEqual([]);
    });
    it("should return an empty array if the email is an empty string", async () => {
      const result = await getAllUserRolesByEmail("");
      expect(result).toEqual([]);
    });
    it("should return an empty array if the email is invalid", async () => {
      const result = await getAllUserRolesByEmail("invalid@email.com");
      expect(result).toEqual([]);
    });
    it("should return the correct roles for the state submitter", async () => {
      const result = await getAllUserRolesByEmail(STATE_SUBMITTER_EMAIL);
      expect(result).toEqual(getFilteredRoleDocsByEmail(STATE_SUBMITTER_EMAIL));
    });
    it("should return the correct roles for the state sysadmin", async () => {
      const result = await getAllUserRolesByEmail(STATE_SYSTEM_ADMIN_EMAIL);
      expect(result).toEqual(getFilteredRoleDocsByEmail(STATE_SYSTEM_ADMIN_EMAIL));
    });
  });

  describe("userHasThisRole", () => {
    it("should return false if the values are undefined", async () => {
      // @ts-ignore
      const result = await userHasThisRole();
      expect(result).toBeFalsy();
    });
    it("should return false if the values are null", async () => {
      // @ts-ignore
      const result = await userHasThisRole(null, null, null);
      expect(result).toBeFalsy();
    });
    it("should return false if the values are empty strings", async () => {
      const result = await userHasThisRole("", "", "");
      expect(result).toBeFalsy();
    });
    it("should return false if the email and state record exist but for a different role", async () => {
      const result = await userHasThisRole(STATE_SYSTEM_ADMIN_EMAIL, "MD", "statesubmitter");
      expect(result).toBeFalsy();
    });
    it("should return false if the email and role record exist but for a different state", async () => {
      const result = await userHasThisRole(STATE_SYSTEM_ADMIN_EMAIL, "SC", "statesystemadmin");
      expect(result).toBeFalsy();
    });
    it("should return true if the email, state, and role record exist", async () => {
      const result = await userHasThisRole(STATE_SYSTEM_ADMIN_EMAIL, "MD", "statesystemadmin");
      expect(result).toBeTruthy();
    });
  });

  describe("getAllUserRoles", () => {
    it("should return all of the role records", async () => {
      const result = await getAllUserRoles();
      expect(result).toEqual(idmRolesDoc);
    });
  });

  describe("getAllUserRolesByState", () => {
    it("should return an empty array for an undefined state", async () => {
      // @ts-ignore
      const result = await getAllUserRolesByState();
      expect(result).toEqual([]);
    });
    it("should return an empty array for a null state", async () => {
      // @ts-ignore
      const result = await getAllUserRolesByState(null);
      expect(result).toEqual([]);
    });
    it("should return an empty array for an empty state", async () => {
      const result = await getAllUserRolesByState("");
      expect(result).toEqual([]);
    });
    it("should return an empty array for an invalid state", async () => {
      const result = await getAllUserRolesByState("invalid");
      expect(result).toEqual([]);
    });
    it("should return the correct records for MD", async () => {
      const result = await getAllUserRolesByState("MD");
      expect(result).toEqual(getFilteredRoleDocsByState("MD"));
    });
    it("should return the correct records for GU", async () => {
      const result = await getAllUserRolesByState("GU");
      expect(result).toEqual(getFilteredRoleDocsByState("GU"));
    });
  });

  describe("getLatestActiveRoleByEmail", () => {
    it("should return null for an undefined email", async () => {
      // @ts-ignore
      const result = await getLatestActiveRoleByEmail();
      expect(result).toBeNull();
    });
    it("should return null for a null email", async () => {
      // @ts-ignore
      const result = await getLatestActiveRoleByEmail(null);
      expect(result).toBeNull();
    });
    it("should return null for an empty string email", async () => {
      const result = await getLatestActiveRoleByEmail("");
      expect(result).toBeNull();
    });
    it("should return null for an invalid email", async () => {
      const result = await getLatestActiveRoleByEmail("invalid@email.com");
      expect(result).toBeNull();
    });
    it("should return the latest role for the state submitter", async () => {
      const [role] = getLatestRoleByEmail(STATE_SUBMITTER_EMAIL);
      const result = await getLatestActiveRoleByEmail(STATE_SUBMITTER_EMAIL);
      expect(result).toEqual(role._source);
    });
    it("should return the latest role for the state sysadmin", async () => {
      const [role] = getLatestRoleByEmail(STATE_SYSTEM_ADMIN_EMAIL);
      const result = await getLatestActiveRoleByEmail(STATE_SYSTEM_ADMIN_EMAIL);
      expect(result).toEqual(role._source);
    });
  });

  describe("getUserRolesWithNames", () => {
    it("should throw an error if the roleRequests are undefined", async () => {
      // @ts-ignore
      expect(() => getUserRolesWithNames()).rejects.toThrowError("No role requests found");
    });
    it("should throw an error if the roleRequests are null", async () => {
      // @ts-ignore
      expect(() => getUserRolesWithNames(null)).rejects.toThrowError("No role requests found");
    });
    it("should throw an error if the roleRequests are not an array", async () => {
      // @ts-ignore
      expect(() => getUserRolesWithNames("invalid")).rejects.toThrowError("No role requests found");
    });
    it("should throw an error if the roleRequests are an empty array", async () => {
      expect(() => getUserRolesWithNames([])).rejects.toThrowError("No role requests found");
    });
    it("should return default values if the role record email is undefined", async () => {
      const result = await getUserRolesWithNames([{}]);
      expect(result).toEqual([
        {
          email: undefined,
          fullName: "Unknown",
        },
      ]);
    });
    it("should return default values if the role record email is null", async () => {
      const result = await getUserRolesWithNames([{ email: null }]);
      expect(result).toEqual([
        {
          email: undefined,
          fullName: "Unknown",
        },
      ]);
    });
    it("should return default values if the role record email is an empty string", async () => {
      const result = await getUserRolesWithNames([{ email: "" }]);
      expect(result).toEqual([
        {
          email: undefined,
          fullName: "Unknown",
        },
      ]);
    });
    it("should return default values if the role record email is invalid", async () => {
      const result = await getUserRolesWithNames([{ email: "invalid@email.com" }]);
      expect(result).toEqual([
        {
          email: undefined,
          fullName: "Unknown",
        },
      ]);
    });
    it("should return the role record with the email and full name for state submitter", async () => {
      const [roleObj] = getLatestRoleByEmail(STATE_SUBMITTER_EMAIL);
      const result = await getUserRolesWithNames([
        {
          ...roleObj?._source,
        },
      ]);
      expect(result).toEqual([
        {
          ...roleObj?._source,
          email: STATE_SUBMITTER_EMAIL,
          fullName: STATE_SUBMITTER_USER._source.fullName,
        },
      ]);
    });
    it("should return the role record with the email and full name for state sysadmin", async () => {
      const [roleObj] = getLatestRoleByEmail(STATE_SYSTEM_ADMIN_EMAIL);
      const result = await getUserRolesWithNames([
        {
          ...roleObj?._source,
        },
      ]);
      expect(result).toEqual([
        {
          ...roleObj?._source,
          email: STATE_SYSTEM_ADMIN_EMAIL,
          fullName: STATE_SYSTEM_ADMIN_USER._source.fullName,
        },
      ]);
    });
    it("should return the role record with the email and unknown name for unknown user", async () => {
      const result = await getUserRolesWithNames([
        {
          id: "invalid@email.com_MD_statesystemadmin",
          eventType: "legacy-user-role",
          email: "invalid@email.com",
          doneByEmail: "statesystemadmin@nightwatch.test",
          doneByName: "Statesystemadmin Nightwatch",
          status: "active",
          role: "defaultcmsuser",
          territory: "MD",
          lastModifiedDate: 1745003573565,
        },
      ]);
      expect(result).toEqual([
        {
          id: "invalid@email.com_MD_statesystemadmin",
          eventType: "legacy-user-role",
          email: "invalid@email.com",
          doneByEmail: "statesystemadmin@nightwatch.test",
          doneByName: "Statesystemadmin Nightwatch",
          status: "active",
          role: "defaultcmsuser",
          territory: "MD",
          lastModifiedDate: 1745003573565,
          fullName: "Unknown",
        },
      ]);
    });
  });
});
