import { TestRoleDocument, TestRoleResult } from "../index";

export const roleResults: TestRoleResult[] = [
  {
    _id: "systemadmin@example.com_N/A_defaultcmsuser",
    found: true,
    _source: {
      id: "systemadmin@example.com_N/A_defaultcmsuser",
      eventType: "user-role",
      email: "systemadmin@example.com",
      doneByEmail: "systemadmin@example.com",
      doneByName: "System Admin",
      status: "active",
      role: "defaultcmsuser",
      territory: "N/A",
      lastModifiedDate: 1744503573560,
    },
  },
  {
    _id: "systemadmin@example.com_N/A_systemadmin",
    found: true,
    _source: {
      id: "systemadmin@example.com_N/A_systemadmin",
      eventType: "user-role",
      email: "systemadmin@example.com",
      doneByEmail: "systemadmin@example.com",
      doneByName: "System Admin",
      status: "active",
      role: "systemadmin",
      territory: "N/A",
      lastModifiedDate: 1744503573565,
    },
  },
  {
    _id: "helpdesk@example.com_N/A_defaultcmsuser",
    found: true,
    _source: {
      id: "helpdesk@example.com_N/A_defaultcmsuser",
      eventType: "user-role",
      email: "helpdesk@example.com",
      doneByEmail: "systemadmin@example.com",
      doneByName: "System Admin",
      status: "active",
      role: "defaultcmsuser",
      territory: "N/A",
      lastModifiedDate: 1748003573560,
    },
  },
  {
    _id: "helpdesk@example.com_N/A_helpdesk",
    found: true,
    _source: {
      id: "helpdesk@example.com_N/A_helpdesk",
      eventType: "user-role",
      email: "helpdesk@example.com",
      doneByEmail: "systemadmin@example.com",
      doneByName: "System Admin",
      status: "active",
      role: "helpdesk",
      territory: "N/A",
      lastModifiedDate: 1748003573565,
    },
  },
  {
    _id: "cmsroleapprover@example.com_N/A_defaultcmsuser",
    found: true,
    _source: {
      id: "cmsroleapprover@example.com_N/A_defaultcmsuser",
      eventType: "user-role",
      email: "cmsroleapprover@example.com",
      doneByEmail: "systemadmin@example.com",
      doneByName: "System Admin",
      status: "active",
      role: "defaultcmsuser",
      territory: "N/A",
      lastModifiedDate: 1749993573560,
    },
  },
  {
    _id: "cmsroleapprover@example.com_N/A_cmsroleapprover",
    found: true,
    _source: {
      id: "cmsroleapprover@example.com_N/A_cmsroleapprover",
      eventType: "user-role",
      email: "cmsroleapprover@example.com",
      doneByEmail: "systemadmin@example.com",
      doneByName: "System Admin",
      status: "active",
      role: "cmsroleapprover",
      territory: "N/A",
      lastModifiedDate: 1749993573565,
    },
  },
  {
    _id: "defaultcmsuser@example.com_N/A_defaultcmsuser",
    found: true,
    _source: {
      id: "defaultcmsuser@example.com_N/A_defaultcmsuser",
      eventType: "user-role",
      email: "defaultcmsuser@example.com",
      doneByEmail: "systemadmin@example.com",
      doneByName: "System Admin",
      status: "active",
      role: "defaultcmsuser",
      territory: "N/A",
      lastModifiedDate: 1749983573565,
    },
  },
  {
    _id: "reviewer@example.com_N/A_defaultcmsuser",
    found: true,
    _source: {
      id: "reviewer@example.com_N/A_defaultcmsuser",
      eventType: "user-role",
      email: "reviewer@example.com",
      doneByEmail: "systemadmin@example.com",
      doneByName: "System Admin",
      status: "active",
      role: "defaultcmsuser",
      territory: "N/A",
      lastModifiedDate: 1749883573565,
    },
  },
  {
    _id: "reviewer@example.com_N/A_cmsreviewer",
    found: true,
    _source: {
      id: "reviewer@example.com_N/A_cmsreviewer",
      eventType: "user-role",
      email: "reviewer@example.com",
      doneByEmail: "systemadmin@example.com",
      doneByName: "System Admin",
      status: "active",
      role: "cmsreviewer",
      territory: "N/A",
      lastModifiedDate: 1749983573555,
    },
  },
  {
    _id: "mako.cmsuser@outlook.com_N/A_defaultcmsuser",
    found: true,
    _source: {
      id: "mako.cmsuser@outlook.com_N/A_defaultcmsuser",
      eventType: "user-role",
      email: "mako.cmsuser@outlook.com",
      doneByEmail: "systemadmin@example.com",
      doneByName: "System Admin",
      status: "active",
      role: "defaultcmsuser",
      territory: "N/A",
      lastModifiedDate: 1749003573565,
    },
  },
  {
    _id: "mako.cmsuser@outlook.com_N/A_cmsreviewer",
    found: true,
    _source: {
      id: "mako.cmsuser@outlook.com_N/A_cmsreviewer",
      eventType: "user-role",
      email: "mako.cmsuser@outlook.com",
      doneByEmail: "systemadmin@example.com",
      doneByName: "System Admin",
      status: "active",
      role: "cmsreviewer",
      territory: "N/A",
      lastModifiedDate: 1753003573565,
    },
  },
  {
    _id: "statesystemadmin@nightwatch.test_MD_statesystemadmin",
    found: true,
    _source: {
      id: "statesystemadmin@nightwatch.test_MD_statesystemadmin",
      eventType: "legacy-user-role",
      email: "statesystemadmin@nightwatch.test",
      doneByEmail: "systemadmin@example.com",
      doneByName: "System Admin",
      status: "active",
      role: "statesystemadmin",
      territory: "MD",
      lastModifiedDate: 1745003573565,
    },
  },
  {
    _id: "statesystemadmin@noname.com_CA_statesystemadmin",
    found: true,
    _source: {
      id: "statesystemadmin@noname.com_CA_statesystemadmin",
      eventType: "legacy-user-role",
      email: "statesystemadmin@noname.com",
      doneByEmail: "systemadmin@example.com",
      doneByName: "System Admin",
      status: "active",
      role: "statesystemadmin",
      territory: "CA",
      lastModifiedDate: 1745003573565,
    },
  },
  {
    _id: "statesubmitter@nightwatch.test_ZZ_statesubmitter",
    found: true,
    _source: {
      id: "statesubmitter@nightwatch.test_ZZ_statesubmitter",
      eventType: "legacy-user-role",
      email: "statesubmitter@nightwatch.test",
      doneByEmail: "ZZapprover@email.com",
      doneByName: "ZZ Approver",
      status: "revoked",
      role: "statesubmitter",
      territory: "ZZ",
      lastModifiedDate: 1692898671268,
    },
  },
  {
    _id: "statesubmitter@nightwatch.test_NH_statesubmitter",
    found: true,
    _source: {
      id: "statesubmitter@nightwatch.test_NH_statesubmitter",
      eventType: "user-role",
      email: "statesubmitter@nightwatch.test",
      doneByEmail: "NHapprover@email.com",
      doneByName: "NH Approver",
      status: "pending",
      role: "statesubmitter",
      territory: "NH",
      lastModifiedDate: 1744835264244,
    },
  },
  {
    _id: "statesubmitter@nightwatch.test_CT_statesubmitter",
    found: true,
    _source: {
      id: "statesubmitter@nightwatch.test_CT_statesubmitter",
      eventType: "user-role",
      email: "statesubmitter@nightwatch.test",
      doneByEmail: "CTapprover@email.com",
      doneByName: "CT Approver",
      status: "pending",
      role: "statesubmitter",
      territory: "CT",
      lastModifiedDate: 1744941962513,
    },
  },
  {
    _id: "statesubmitter@nightwatch.test_CO_statesubmitter",
    found: true,
    _source: {
      id: "statesubmitter@nightwatch.test_CO_statesubmitter",
      eventType: "legacy-user-role",
      email: "statesubmitter@nightwatch.test",
      doneByEmail: "COapprover@email.com",
      doneByName: "CO Approver",
      status: "pending",
      role: "statesubmitter",
      territory: "CO",
      lastModifiedDate: 1743186342647,
    },
  },
  {
    _id: "statesubmitter@nightwatch.test_GU_statesubmitter",
    found: true,
    _source: {
      id: "statesubmitter@nightwatch.test_GU_statesubmitter",
      eventType: "user-role",
      email: "statesubmitter@nightwatch.test",
      doneByEmail: "GUapprover@email.com",
      doneByName: "GU Approver",
      status: "pending",
      role: "statesubmitter",
      territory: "GU",
      lastModifiedDate: 1744941963058,
    },
  },
  {
    _id: "statesubmitter@nightwatch.test_AR_statesubmitter",
    found: true,
    _source: {
      id: "statesubmitter@nightwatch.test_AR_statesubmitter",
      eventType: "user-role",
      email: "statesubmitter@nightwatch.test",
      doneByEmail: "ARapprover@email.com",
      doneByName: "AR Approver",
      status: "pending",
      role: "statesubmitter",
      territory: "AR",
      lastModifiedDate: 1744942254306,
    },
  },
  {
    _id: "statesubmitter@nightwatch.test_VA_statesubmitter",
    found: true,
    _source: {
      id: "statesubmitter@nightwatch.test_VA_statesubmitter",
      eventType: "legacy-user-role",
      email: "statesubmitter@nightwatch.test",
      doneByEmail: "VAapprover@email.com",
      doneByName: "VA Approver",
      status: "active",
      role: "statesubmitter",
      territory: "VA",
      lastModifiedDate: 1743177658586,
    },
  },
  {
    _id: "statesubmitter@nightwatch.test_FL_statesubmitter",
    found: true,
    _source: {
      id: "statesubmitter@nightwatch.test_FL_statesubmitter",
      eventType: "user-role",
      email: "statesubmitter@nightwatch.test",
      doneByEmail: "FLapprover@email.com",
      doneByName: "FL Approver",
      status: "pending",
      role: "statesubmitter",
      territory: "FL",
      lastModifiedDate: 1744833078617,
    },
  },
  {
    _id: "statesubmitter@nightwatch.test_DE_statesubmitter",
    found: true,
    _source: {
      id: "statesubmitter@nightwatch.test_DE_statesubmitter",
      eventType: "user-role",
      email: "statesubmitter@nightwatch.test",
      doneByEmail: "DEapprover@email.com",
      doneByName: "DE Approver",
      status: "pending",
      role: "statesubmitter",
      territory: "DE",
      lastModifiedDate: 1744935356677,
    },
  },
  {
    _id: "statesubmitter@nightwatch.test_ID_statesubmitter",
    found: true,
    _source: {
      id: "statesubmitter@nightwatch.test_ID_statesubmitter",
      eventType: "user-role",
      email: "statesubmitter@nightwatch.test",
      doneByEmail: "statesystemadmin@nightwatch.test",
      doneByName: "Test Again",
      status: "pending",
      role: "statesubmitter",
      territory: "ID",
      lastModifiedDate: 1745244652809,
    },
  },
  {
    _id: "statesubmitter@nightwatch.test_OH_statesubmitter",
    found: true,
    _source: {
      id: "statesubmitter@nightwatch.test_OH_statesubmitter",
      eventType: "legacy-user-role",
      email: "statesubmitter@nightwatch.test",
      doneByEmail: "OHapprover@email.com",
      doneByName: "OH Approver",
      status: "denied",
      role: "statesubmitter",
      territory: "OH",
      lastModifiedDate: 1742509127340,
    },
  },
  {
    _id: "statesubmitter@nightwatch.test_AS_statesubmitter",
    found: true,
    _source: {
      id: "statesubmitter@nightwatch.test_AS_statesubmitter",
      eventType: "legacy-user-role",
      email: "statesubmitter@nightwatch.test",
      doneByEmail: "ASapprover@email.com",
      doneByName: "AS Approver",
      status: "pending",
      role: "statesubmitter",
      territory: "AS",
      lastModifiedDate: 1743193353300,
    },
  },
  {
    _id: "statesubmitter@nightwatch.test_MD_statesubmitter",
    found: true,
    _source: {
      id: "statesubmitter@nightwatch.test_MD_statesubmitter",
      eventType: "legacy-user-role",
      email: "statesubmitter@nightwatch.test",
      doneByEmail: "statesystemadmin@nightwatch.test",
      doneByName: "Test Again",
      status: "active",
      role: "statesubmitter",
      territory: "MD",
      lastModifiedDate: 1617149287000,
    },
  },
  {
    _id: "statesubmitter@nightwatch.test_CA_statesubmitter",
    found: true,
    _source: {
      id: "statesubmitter@nightwatch.test_CA_statesubmitter",
      eventType: "user-role",
      email: "statesubmitter@nightwatch.test",
      doneByEmail: "CAapprover@email.com",
      doneByName: "CA Approver",
      status: "pending",
      role: "statesubmitter",
      territory: "CA",
      lastModifiedDate: 1744832971754,
    },
  },
  {
    _id: "statesubmitter@nightwatch.test_DC_statesubmitter",
    found: true,
    _source: {
      id: "statesubmitter@nightwatch.test_DC_statesubmitter",
      eventType: "user-role",
      email: "statesubmitter@nightwatch.test",
      doneByEmail: "DCapprover@email.com",
      doneByName: "DC Approver",
      status: "pending",
      role: "statesubmitter",
      territory: "DC",
      lastModifiedDate: 1744942254975,
    },
  },
  {
    _id: "statesubmitter@nightwatch.test_GA_statesubmitter",
    found: true,
    _source: {
      id: "statesubmitter@nightwatch.test_GA_statesubmitter",
      eventType: "legacy-user-role",
      email: "statesubmitter@nightwatch.test",
      doneByEmail: "GAapprover@email.com",
      doneByName: "GA Approver",
      status: "pending",
      role: "statesubmitter",
      territory: "GA",
      lastModifiedDate: 1743619569677,
    },
  },
  {
    _id: "statesubmitter@nightwatch.test_AZ_statesubmitter",
    found: true,
    _source: {
      id: "statesubmitter@nightwatch.test_AZ_statesubmitter",
      eventType: "legacy-user-role",
      email: "statesubmitter@nightwatch.test",
      doneByEmail: "AZapprover@email.com",
      doneByName: "AZ Approver",
      status: "denied",
      role: "statesubmitter",
      territory: "AZ",
      lastModifiedDate: 1670448124416,
    },
  },
  {
    _id: "statesubmitter@nightwatch.test_AK_statesubmitter",
    found: true,
    _source: {
      id: "statesubmitter@nightwatch.test_AK_statesubmitter",
      eventType: "legacy-user-role",
      email: "statesubmitter@nightwatch.test",
      doneByEmail: "AKapprover@email.com",
      doneByName: "AK Approver",
      status: "pending",
      role: "statesubmitter",
      territory: "AK",
      lastModifiedDate: 1744764550057,
    },
  },
  {
    _id: "statesubmitter@nightwatch.test_AL_statesubmitter",
    found: true,
    _source: {
      id: "statesubmitter@nightwatch.test_AL_statesubmitter",
      eventType: "legacy-user-role",
      email: "statesubmitter@nightwatch.test",
      doneByEmail: "ALapprover@email.com",
      doneByName: "AL Approver",
      status: "pending",
      role: "statesubmitter",
      territory: "AL",
      lastModifiedDate: 1744769716872,
    },
  },
  {
    _id: "statesubmitter@nightwatch.test_HI_statesubmitter",
    found: true,
    _source: {
      id: "statesubmitter@nightwatch.test_HI_statesubmitter",
      eventType: "user-role",
      email: "statesubmitter@nightwatch.test",
      doneByEmail: "HIapprover@email.com",
      doneByName: "HI Approver",
      status: "pending",
      role: "statesubmitter",
      territory: "HI",
      lastModifiedDate: 1744941919220,
    },
  },
  {
    _id: "statesubmitter@nightwatch.test_KY_statesubmitter",
    found: true,
    _source: {
      id: "statesubmitter@nightwatch.test_KY_statesubmitter",
      eventType: "user-role",
      email: "statesubmitter@nightwatch.test",
      doneByEmail: "KYapprover@email.com",
      doneByName: "KY Approver",
      status: "pending",
      role: "statesubmitter",
      territory: "KY",
      lastModifiedDate: 1745240095667,
    },
  },
  {
    _id: "statesubmitter@nightwatch.test_NC_statesubmitter",
    found: true,
    _source: {
      id: "statesubmitter@nightwatch.test_NC_statesubmitter",
      eventType: "legacy-user-role",
      email: "statesubmitter@nightwatch.test",
      doneByEmail: "NCapprover@email.com",
      doneByName: "NC Approver",
      status: "pending",
      role: "statesubmitter",
      territory: "NC",
      lastModifiedDate: 1745242641523,
    },
  },
  {
    _id: "statesubmitter@nightwatch.test_SD_statesubmitter",
    found: true,
    _source: {
      id: "statesubmitter@nightwatch.test_SD_statesubmitter",
      eventType: "legacy-user-role",
      email: "statesubmitter@nightwatch.test",
      doneByEmail: "SDapprover@email.com",
      doneByName: "SD Approver",
      status: "pending",
      role: "statesubmitter",
      territory: "SD",
      lastModifiedDate: 1745244449866,
    },
  },
  {
    _id: "mako.stateuser@gmail.com_VA_statesubmitter",
    found: true,
    _source: {
      id: "mako.stateuser@gmail.com_VA_statesubmitter",
      eventType: "user-role",
      email: "mako.stateuser@gmail.com",
      doneByEmail: "VAapprover@email.com",
      doneByName: "VA Approver",
      status: "active",
      role: "statesubmitter",
      territory: "VA",
      lastModifiedDate: 1745245549866,
    },
  },
  {
    _id: "mako.stateuser@gmail.com_OH_statesubmitter",
    found: true,
    _source: {
      id: "mako.stateuser@gmail.com_OH_statesubmitter",
      eventType: "user-role",
      email: "mako.stateuser@gmail.com",
      doneByEmail: "OHapprover",
      doneByName: "OH Approver",
      status: "active",
      role: "statesubmitter",
      territory: "OH",
      lastModifiedDate: 1745244450266,
    },
  },
  {
    _id: "mako.stateuser@gmail.com_SC_statesubmitter",
    found: true,
    _source: {
      id: "mako.stateuser@gmail.com_SC_statesubmitter",
      eventType: "user-role",
      email: "mako.stateuser@gmail.com",
      doneByEmail: "SCapprover@email.com",
      doneByName: "SC Approver",
      status: "active",
      role: "statesubmitter",
      territory: "SC",
      lastModifiedDate: 1747764449866,
    },
  },
  {
    _id: "mako.stateuser@gmail.com_CO_statesubmitter",
    found: true,
    _source: {
      id: "mako.stateuser@gmail.com_CO_statesubmitter",
      eventType: "user-role",
      email: "mako.stateuser@gmail.com",
      doneByEmail: "COapprover@email.com",
      doneByName: "CO Approver",
      status: "active",
      role: "statesubmitter",
      territory: "CO",
      lastModifiedDate: 1745456449866,
    },
  },
  {
    _id: "mako.stateuser@gmail.com_GA_statesubmitter",
    found: true,
    _source: {
      id: "mako.stateuser@gmail.com_GA_statesubmitter",
      eventType: "user-role",
      email: "mako.stateuser@gmail.com",
      doneByEmail: "GAapprover@email.com",
      doneByName: "GA Approver",
      status: "active",
      role: "statesubmitter",
      territory: "GA",
      lastModifiedDate: 1745223549866,
    },
  },
  {
    _id: "mako.stateuser@gmail.com_MD_statesubmitter",
    found: true,
    _source: {
      id: "mako.stateuser@gmail.com_MD_statesubmitter",
      eventType: "user-role",
      email: "mako.stateuser@gmail.com",
      doneByEmail: "statesystemadmin@nightwatch.test",
      doneByName: "Test Again",
      status: "active",
      role: "statesubmitter",
      territory: "MD",
      lastModifiedDate: 1745244568866,
    },
  },
  {
    _id: "multistate@example.com_CA_statesubmitter",
    found: true,
    _source: {
      id: "multistate@example.com_CA_statesubmitter",
      eventType: "user-role",
      email: "multistate@example.com",
      doneByEmail: "CAapprover@email.com",
      doneByName: "CA Approver",
      status: "active",
      role: "statesubmitter",
      territory: "CA",
      lastModifiedDate: 1745289049866,
    },
  },
  {
    _id: "multistate@example.com_NY_statesubmitter",
    found: true,
    _source: {
      id: "multistate@example.com_NY_statesubmitter",
      eventType: "user-role",
      email: "multistate@example.com",
      doneByEmail: "NYapprover@email.com",
      doneByName: "NY Approver",
      status: "active",
      role: "statesubmitter",
      territory: "NY",
      lastModifiedDate: 1745255549866,
    },
  },
  {
    _id: "multistate@example.com_MD_statesubmitter",
    found: true,
    _source: {
      id: "multistate@example.com_MD_statesubmitter",
      eventType: "user-role",
      email: "multistate@example.com",
      doneByEmail: "statesystemadmin@nightwatch.test",
      doneByName: "Test Again",
      status: "active",
      role: "statesubmitter",
      territory: "MD",
      lastModifiedDate: 1745234449866,
    },
  },
  {
    _id: "nullstate@example.com__statesubmitter",
    found: true,
    // @ts-ignore removed territory for testing
    _source: {
      id: "nullstate@example.com__statesubmitter",
      eventType: "user-role",
      email: "nullstate@example.com",
      doneByEmail: "statesystemadmin@nightwatch.test",
      doneByName: "Test Again",
      status: "active",
      role: "statesubmitter",
      lastModifiedDate: 1745234449866,
    },
  },
  {
    _id: "pending@example.com_MD_statesubmitter",
    found: true,
    _source: {
      id: "pending@example.com_MD_statesubmitter",
      eventType: "user-role",
      email: "pending@example.com",
      doneByEmail: "statesystemadmin@nightwatch.test",
      doneByName: "Test Again",
      status: "pending",
      role: "statesubmitter",
      territory: "MD",
      lastModifiedDate: 1745234449866,
    },
  },
  {
    _id: "denied@example.com_MD_statesubmitter",
    found: true,
    _source: {
      id: "denied@example.com_MD_statesubmitter",
      eventType: "user-role",
      email: "denied@example.com",
      doneByEmail: "statesystemadmin@nightwatch.test",
      doneByName: "Test Again",
      status: "denied",
      role: "statesubmitter",
      territory: "MD",
      lastModifiedDate: 1745234449866,
    },
  },
  {
    _id: "revoked@example.com_MD_statesubmitter",
    found: true,
    _source: {
      id: "revoked@example.com_MD_statesubmitter",
      eventType: "user-role",
      email: "revoked@example.com",
      doneByEmail: "statesystemadmin@nightwatch.test",
      doneByName: "Test Again",
      status: "revoked",
      role: "statesubmitter",
      territory: "MD",
      lastModifiedDate: 1745234449866,
    },
  },
];

export const roleDocs = roleResults.map((role) => role?._source as TestRoleDocument);

export const getFilteredRolesByEmail = (email: string) =>
  roleResults.filter((role) => role?._source?.email === email);

export const getFilteredRoleDocsByEmail = (email: string) =>
  getFilteredRolesByEmail(email).map((role) => role?._source as TestRoleDocument);

export const getFilteredRolesByState = (state: string) =>
  roleResults.filter((role) => role?._source?.territory === state);

export const getFilteredRoleDocsByState = (state: string) =>
  getFilteredRolesByState(state).map((role) => role?._source as TestRoleDocument);

export const getFilteredRolesByStateAndRole = (state: string, role: string) =>
  roleResults.filter(
    (roleItem) => roleItem?._source?.territory === state && roleItem?._source?.role === role,
  );

export const getFilteredRoleDocsByStateAndRole = (state: string, role: string) =>
  getFilteredRolesByStateAndRole(state, role).map(
    (roleItem) => roleItem?._source as TestRoleDocument,
  );

export const getFilteredRolesByRole = (role: string) =>
  roleResults.filter((roleItem) => roleItem?._source?.role === role);

export const getFilteredRoleDocsByRole = (role: string) =>
  getFilteredRolesByRole(role).map((roleItem) => roleItem?._source as TestRoleDocument);

export const getLatestRoleByEmail = (email: string) =>
  roleResults
    .filter((role) => role?._source?.email === email && role?._source?.status === "active")
    .sort((a, b) => {
      const lastModifiedDateA = a?._source?.lastModifiedDate || 0;
      const lastModifiedDateB = b?._source?.lastModifiedDate || 0;
      if (lastModifiedDateA > lastModifiedDateB) {
        return -1;
      }
      if (lastModifiedDateA < lastModifiedDateB) {
        return 1;
      }
      return 0;
    })
    ?.slice(0, 1);

export const getActiveStatesForUserByEmail = (email: string, role?: string) =>
  Array.from(
    new Set(
      roleResults
        .filter(
          (roleItem) =>
            roleItem &&
            roleItem._source?.email === email &&
            (!role || roleItem._source?.role === role) &&
            roleItem._source?.status === "active",
        )
        .map((roleItem) => roleItem?._source?.territory)
        .filter((territory) => territory !== undefined && territory !== "N/A") || [],
    ),
  );

export const getApprovedRoleByEmailAndState = (email: string, state: string, role: string) =>
  roleResults.find(
    (roleItem) =>
      roleItem?._source?.email === email &&
      roleItem?._source?.territory === state &&
      roleItem?._source?.role === role &&
      roleItem?._source?.status === "active",
  );
