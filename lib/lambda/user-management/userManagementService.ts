import { search } from "libs";
import { getDomainAndNamespace } from "libs/utils";

export const getUserByEmail = async (email: string) => {
  const { domain, index } = getDomainAndNamespace("users");

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
    size: 100,
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
    query: {
      term: {
        "email.keyword": email,
      },
    },
    size: 200,
  });

  return result.hits.hits.map((hit: any) => ({ ...hit._source }));
};

export const userHasThisRole = async (email: string, state: string, role: string) => {
  const { domain, index } = getDomainAndNamespace("roles");

  const result = await search(domain, index, {
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
    size: 200,
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
    size: 200,
  });

  return results.hits.hits.map((hit: any) => ({ ...hit._source }));
};

export const getUserRolesWithNames = async (roleRequests: any[]) => {
  if (!Array.isArray(roleRequests) || !roleRequests.length) {
    throw new Error("No role requests found");
  }

  const emails = roleRequests.map((role) => role.email);
  const users = await getUsersByEmails(emails);
  console.log({ emails, users });

  const rolesWithName = roleRequests.map((roleObj) => {
    const email = roleObj.id?.split("_")[0];
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

export const getActiveStatesForUserByEmail = async (email: string): Promise<string[]> => {
  const { domain, index } = getDomainAndNamespace("roles");

  const result = await search(domain, index, {
    size: 1000,
    query: {
      bool: {
        must: [{ term: { "email.keyword": email } }, { term: { status: "active" } }],
        must_not: [{ terms: { territory: ["N/A"] } }],
      },
    },
    _source: ["territory"],
  });

  const states = result.hits?.hits
    .map((hit: any) => hit._source.territory)
    .filter((v: any): v is string => typeof v === "string");

  return Array.from(new Set(states));
};
