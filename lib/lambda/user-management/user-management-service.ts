import { getDomainAndNamespace } from "lib/libs/utils";
import { getItem, search } from "libs";

export const getUserByEmail = async (email: string) => {
  const { domain, index } = getDomainAndNamespace("users");

  return await getItem(domain, index, email);
};

export const getUsersByEmails = async (emails: string[]) => {
  const { domain, index } = getDomainAndNamespace("users");

  const results = await search(domain, index, {
    size: emails.length,
    query: {
      bool: {
        should: emails.map((email) => ({
          term: {
            email: email,
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
  });

  return result.hits.hits.map((hit: any) => ({ ...hit._source }));
};

export const userHasThisRole = async (email: string, state: string, role: string) => {
  const { domain, index } = getDomainAndNamespace("roles");

  const result = await search(domain, index, {
    query: {
      bool: {
        must: [
          { term: { email } },
          { term: { status: "approved" } },
          { term: { role } },
          { term: { state } },
        ],
      },
    },
  });

  return result.hits.hits.length > 0;
};

export const getAllUserRoles = async () => {
  const { domain, index } = getDomainAndNamespace("roles");

  return await search(domain, index, {
    query: {
      match_all: {},
    },
  });
};

export const getAllUserRolesByState = async (state: string) => {
  const { domain, index } = getDomainAndNamespace("roles");

  const results = await search(domain, index, {
    query: {
      term: {
        "territory.keyword": state,
      },
    },
  });

  return results.hits.hits.map((hit: any) => ({ ...hit._source }));
};

export const getUserRolesWithNames = async (roleRequests: any[]) => {
  if (!Array.isArray(roleRequests) || !roleRequests.length) {
    throw new Error("No role requests found");
  }

  const emails = roleRequests.map((role) => role._id?.split("_")[0]).filter(Boolean);
  console.log(emails, "EMAILSSS");
  const users = await getUsersByEmails(emails);
  console.log(users, "USERSSS");

  const rolesWithName = roleRequests.map((roleObj) => {
    console.log(roleObj, "ROLE OBJ");
    const email = roleObj._id?.split("_")[0];
    const user = users[email];
    const fullName = user?.fullName || "Unknown";

    return {
      ...roleObj,
      email,
      fullName,
    };
  });

  return rolesWithName;
};
