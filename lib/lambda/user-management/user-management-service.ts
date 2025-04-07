import { getDomainAndNamespace } from "lib/libs/utils";
import { getItem, search } from "libs";

export const getUserByEmail = async (email: string) => {
  const { domain, index } = getDomainAndNamespace("users");

  return await getItem(domain, index, email);
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
  console.log(state, "what is STATE");
  return await search(domain, index, {
    query: {
      term: {
        "territory.keyword": state,
      },
    },
  });
};
