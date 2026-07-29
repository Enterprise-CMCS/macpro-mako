import process from "node:process";

import {
  AdminDisableUserCommand,
  CognitoIdentityProviderClient,
  ListUsersCommand,
  type UserType,
} from "@aws-sdk/client-cognito-identity-provider";
import { fromIni } from "@aws-sdk/credential-providers";

type Options = {
  userPoolId: string;
  region: string;
  profile?: string;
  apply: boolean;
  disableDuplicates: boolean;
};

type UserSummary = {
  username: string;
  email: string;
  normalizedEmail: string;
  enabled: boolean;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
};

const parseArgs = (argv: string[]): Options => {
  const options: Partial<Options> = {
    region: process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION || "us-east-1",
    apply: false,
    disableDuplicates: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const next = argv[index + 1];

    if (arg === "--user-pool-id" && next) {
      options.userPoolId = next;
      index += 1;
      continue;
    }

    if (arg === "--region" && next) {
      options.region = next;
      index += 1;
      continue;
    }

    if (arg === "--profile" && next) {
      options.profile = next;
      index += 1;
      continue;
    }

    if (arg === "--apply") {
      options.apply = true;
      continue;
    }

    if (arg === "--disable-duplicates") {
      options.disableDuplicates = true;
      continue;
    }
  }

  if (!options.userPoolId) {
    throw new Error(
      "Missing required argument --user-pool-id. Example: bunx tsx scripts/audit-case-insensitive-user-duplicates.ts --user-pool-id us-east-1_example",
    );
  }

  return options as Options;
};

const normalizeEmail = (email?: string | null) => email?.trim().toLowerCase() || "";

const getEmail = (user: UserType): string => {
  const attribute = user.Attributes?.find((item) => item.Name === "email");
  return attribute?.Value || "";
};

const summarizeUser = (user: UserType): UserSummary | null => {
  const email = getEmail(user);
  const normalizedEmail = normalizeEmail(email);

  if (!normalizedEmail || !user.Username) {
    return null;
  }

  return {
    username: user.Username,
    email,
    normalizedEmail,
    enabled: user.Enabled ?? false,
    status: user.UserStatus,
    createdAt: user.UserCreateDate?.toISOString(),
    updatedAt: user.UserLastModifiedDate?.toISOString(),
  };
};

const chooseCanonicalUser = (users: UserSummary[]) =>
  [...users].sort((left, right) => {
    if (normalizeEmail(left.email) === left.email && normalizeEmail(right.email) !== right.email) {
      return -1;
    }
    if (normalizeEmail(left.email) !== left.email && normalizeEmail(right.email) === right.email) {
      return 1;
    }
    if ((left.enabled ? 1 : 0) !== (right.enabled ? 1 : 0)) {
      return right.enabled ? 1 : -1;
    }
    return (left.createdAt || "").localeCompare(right.createdAt || "");
  })[0];

const listAllUsers = async (client: CognitoIdentityProviderClient, userPoolId: string) => {
  const users: UserType[] = [];
  let paginationToken: string | undefined;

  do {
    const response = await client.send(
      new ListUsersCommand({
        UserPoolId: userPoolId,
        Limit: 60,
        PaginationToken: paginationToken,
      }),
    );

    users.push(...(response.Users || []));
    paginationToken = response.PaginationToken;
  } while (paginationToken);

  return users;
};

const main = async () => {
  const options = parseArgs(process.argv.slice(2));

  const client = new CognitoIdentityProviderClient({
    region: options.region,
    credentials: options.profile ? fromIni({ profile: options.profile }) : undefined,
  });

  const users = await listAllUsers(client, options.userPoolId);
  const grouped = new Map<string, UserSummary[]>();

  for (const user of users) {
    const summary = summarizeUser(user);
    if (!summary) {
      continue;
    }

    const existing = grouped.get(summary.normalizedEmail) || [];
    existing.push(summary);
    grouped.set(summary.normalizedEmail, existing);
  }

  const duplicates = [...grouped.entries()]
    .filter(([, groupedUsers]) => groupedUsers.length > 1)
    .map(([normalizedEmail, groupedUsers]) => {
      const canonical = chooseCanonicalUser(groupedUsers);
      const duplicatesToDisable = groupedUsers.filter(
        (user) => user.username !== canonical.username,
      );

      return {
        normalizedEmail,
        canonical,
        duplicates: duplicatesToDisable,
      };
    })
    .sort((left, right) => left.normalizedEmail.localeCompare(right.normalizedEmail));

  const report = {
    userPoolId: options.userPoolId,
    region: options.region,
    totalUsers: users.length,
    duplicateEmailGroups: duplicates.length,
    dryRun: !options.apply,
    disableDuplicatesRequested: options.disableDuplicates,
    duplicates,
  };

  console.log(JSON.stringify(report, null, 2));

  if (!options.apply || !options.disableDuplicates) {
    return;
  }

  for (const duplicateGroup of duplicates) {
    for (const duplicate of duplicateGroup.duplicates) {
      if (!duplicate.enabled) {
        continue;
      }

      await client.send(
        new AdminDisableUserCommand({
          UserPoolId: options.userPoolId,
          Username: duplicate.username,
        }),
      );

      console.log(
        `Disabled duplicate user ${duplicate.username} for ${duplicateGroup.normalizedEmail}`,
      );
    }
  }
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
