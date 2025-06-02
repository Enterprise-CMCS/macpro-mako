import { search } from "libs";
import { getDomainAndNamespace } from "libs/utils";
import { Index } from "shared-types/opensearch";

const QUERY_LIMIT = 2000;

export const getUserByEmail = async (
  email: string,
  domainNamespace?: { domain: string; index: Index },
) => {
  console.log("Looking up user by email:", email);
  if (!domainNamespace) domainNamespace = getDomainAndNamespace("users");
  const { domain, index } = domainNamespace;

  const result = await search(domain, index, {
    size: 1,
    query: {
      term: {
        "email.keyword": email,
      },
    },
  });

  return result.hits.hits[0]?._source ?? null;
};

export const getUsersByEmails = async (emails: string[]) => {
  const { domain, index } = getDomainAndNamespace("users");
  const results = await search(domain, index, {
    size: QUERY_LIMIT,
    query: {
      bool: {
        should: emails
          ?.filter((email) => email)
          .map((email) => ({
            term: {
              "email.keyword": email,
            },
          })),
      },
    },
  });

  return results.hits.hits.reduce(
    (acc: any, hit: any) => {
      acc[hit._source.email] = hit._source;
      return acc;
    },
    {} as Record<string, { fullName?: string }>,
  );
};

export const getAllUserRolesByEmail = async (email: string) => {
  const { domain, index } = getDomainAndNamespace("roles");

  const result = await search(domain, index, {
    size: QUERY_LIMIT,
    query: {
      term: {
        "email.keyword": email,
      },
    },
  });

  return result.hits.hits.map((hit: any) => ({ ...hit._source }));
};

export const userHasThisRole = async (email: string, state: string, role: string) => {
  const { domain, index } = getDomainAndNamespace("roles");

  const result = await search(domain, index, {
    size: 100,
    query: {
      bool: {
        must: [
          { term: { "email.keyword": email } },
          { term: { status: "active" } },
          { term: { role: role } },
          { term: { "territory.keyword": state } },
        ],
      },
    },
  });
  return result.hits.hits.length > 0;
};

export const getAllUserRoles = async () => {
  const { domain, index } = getDomainAndNamespace("roles");

  const results = await search(domain, index, {
    query: {
      match_all: {},
    },
    size: QUERY_LIMIT,
  });

  return results.hits.hits.map((hit: any) => ({ ...hit._source }));
};

export const getAllUserRolesByState = async (state: string) => {
  const { domain, index } = getDomainAndNamespace("roles");

  const results = await search(domain, index, {
    query: {
      term: {
        "territory.keyword": state,
      },
    },
    size: QUERY_LIMIT,
  });

  return results.hits.hits.map((hit: any) => ({ ...hit._source }));
};

export const getUserRolesWithNames = async (roleRequests: any[]) => {
  if (!Array.isArray(roleRequests) || !roleRequests.length) {
    throw new Error("No role requests found");
  }

  const emails = roleRequests.map((role) => role.email);
  const users = await getUsersByEmails(emails);

  const rolesWithName = roleRequests.map((roleObj) => {
    const email = roleObj.email;
    const fullName = users[email]?.fullName || "Unknown";

    return {
      ...roleObj,
      email,
      fullName,
    };
  });

  return rolesWithName;
};

export const getLatestActiveRoleByEmail = async (email: string) => {
  const { domain, index } = getDomainAndNamespace("roles");

  const result = await search(domain, index, {
    size: 1,
    query: {
      bool: {
        must: [{ term: { "email.keyword": email } }, { term: { status: "active" } }],
      },
    },
    sort: [
      {
        lastModifiedDate: {
          order: "desc",
        },
      },
    ],
  });

  return result.hits.hits[0]?._source ?? null;
};

// TODO: move to shared type bc this is the same code coppied
const approvingUserRole = {
  statesubmitter: "statesystemadmin",
  statesystemadmin: "cmsroleapprover",
  cmsroleapprover: "systemadmin",
  defaultcmsuser: "cmsroleapprover",
  helpdesk: "systemadmin",
  cmsreviewer: "cmsroleapprover",
};

export const getApproversByRoleState = async (
  role: string,
  state: string,
  domainNamespace?: { domain: string; index: Index },
  userDomainNamespace?: { domain: string; index: Index },
) => {
  if (!domainNamespace) domainNamespace = getDomainAndNamespace("roles");
  if (!userDomainNamespace) userDomainNamespace = getDomainAndNamespace("users");
  const { domain, index } = domainNamespace;

  const approverRole = approvingUserRole[role as keyof typeof approvingUserRole];

  const queryRequirements =
    role === "statesubmitter"
      ? [
          { term: { status: "active" } },
          { term: { role: approverRole } },
          { term: { "territory.keyword": state } },
        ]
      : [{ term: { status: "active" } }, { term: { role: approverRole } }];

  const results = await search(domain, index, {
    query: {
      bool: {
        must: queryRequirements,
      },
    },
    size: 50,
  });

  const approverRoleList: { id: string; email: string }[] = results.hits.hits.map((hit: any) => {
    const { id, email } = hit._source;
    return { id, email };
  });

  const approversInfo = await Promise.all(
    approverRoleList
      .filter((approver) => approver.email)
      .map(async (approver) => {
        const userInfo = await getUserByEmail(approver.email, userDomainNamespace);
        const fullName = userInfo?.fullName ?? "Unknown";
        return { email: approver.email, fullName, id: approver.id };
      }),
  );

  return approversInfo;
};

export const getApproversByRole = async (
  role: string,
  domainNamespace?: { domain: string; index: Index },
  userDomainNamespace?: { domain: string; index: Index },
) => {
  const resolvedDomain = domainNamespace ?? getDomainAndNamespace("roles");
  const resolvedUserDomain = userDomainNamespace ?? getDomainAndNamespace("users");
  const { domain, index } = resolvedDomain;

  const approverRole = approvingUserRole[role as keyof typeof approvingUserRole];

  const results = await search(domain, index, {
    query: {
      bool: {
        must: [{ term: { status: "active" } }, { term: { role: approverRole } }],
      },
    },
    size: QUERY_LIMIT,
  });

  const approverRoleList = results.hits.hits.map((hit: any) => {
    const { id, email, territory } = hit._source;
    return { id, email, territory };
  });

  const approversInfo = await Promise.all(
    approverRoleList
      .filter((approver: { id: string; email: string; territory: string }) => approver.email)
      .map(async (approver: { id: string; email: string; territory: string }) => {
        const userInfo = await getUserByEmail(approver.email, resolvedUserDomain);
        const fullName = userInfo?.fullName ?? "Unknown";
        return {
          email: approver.email,
          fullName,
          id: approver.id,
          territory: approver.territory,
        };
      }),
  );

  return approversInfo;
};

export const getStateUsersByState = async (
  state: string,
): Promise<
  {
    email: string;
    fullName: string;
  }[]
> => {
  const { domain: rolesDomain, index: rolesIndex } = getDomainAndNamespace("roles");
  const { domain: usersDomain, index: usersIndex } = getDomainAndNamespace("users");

  const rolesResult = await search(rolesDomain, rolesIndex, {
    size: QUERY_LIMIT,
    query: {
      bool: {
        must: [
          { term: { status: "active" } },
          { term: { "territory.keyword": state } },
          { terms: { role: ["statesubmitter", "statesystemadmin"] } },
        ],
      },
    },
    _source: ["email"],
  });

  const seen = new Set<string>();
  const emails = rolesResult.hits.hits
    .map((hit: any) => hit._source.email)
    .filter((email: string): email is string => {
      if (seen.has(email)) return false;
      seen.add(email);
      return true;
    });

  if (!emails.length) return [];

  const usersResult = await search(usersDomain, usersIndex, {
    size: QUERY_LIMIT,
    query: {
      bool: {
        should: emails.map((email: string) => ({
          term: { "email.keyword": email },
        })),
      },
    },
    _source: ["email", "fullName"],
  });

  return usersResult.hits.hits.map((hit: any) => {
    const user = hit._source;
    return {
      email: user.email,
      fullName: user.fullName,
    };
  });
};
