import { vitest } from "vitest";
import { handler } from "./getAllStateUsers";
import {
  CognitoIdentityProviderClient,
  ListUsersCommand,
} from "@aws-sdk/client-cognito-identity-provider";

vitest.mock("@aws-sdk/client-cognito-identity-provider");

const mockCognitoClient = {
  send: vitest.fn(),
};

vitest
  .mocked(CognitoIdentityProviderClient)
  .mockImplementation(() => mockCognitoClient as any);

describe("getAllStateUsers Lambda", () => {
  const mockEvent = {
    state: "VA",
    userPoolId: "us-east-1_testpool",
  };

  beforeEach(() => {
    vitest.clearAllMocks();
  });

  it("should return filtered users for a given state", async () => {
    mockCognitoClient.send.mockResolvedValueOnce({ Users: testUsers });

    const result = await handler(mockEvent);

    expect(result.statusCode).toBe(200);
    const body = JSON.parse(result.body);
    expect(body).toEqual([
      {
        firstName: "Stateuser",
        lastName: "Tester",
        email: "mako.stateuser@gmail.com",
      },
    ]);

    expect(CognitoIdentityProviderClient).toHaveBeenCalledTimes(1);
    expect(ListUsersCommand).toHaveBeenCalledWith({
      UserPoolId: "us-east-1_testpool",
      Filter: 'cognito:user_status = "CONFIRMED"',
    });
  });

  it("should return an empty array when no users match the criteria", async () => {
    mockCognitoClient.send.mockResolvedValueOnce({ Users: testUsers });

    const result = await handler({ ...mockEvent, state: "NY" });

    expect(result.statusCode).toBe(200);
    const body = JSON.parse(result.body);
    expect(body).toEqual([]);
  });

  it("should handle errors gracefully", async () => {
    mockCognitoClient.send.mockRejectedValueOnce(new Error("Cognito error"));

    const result = await handler(mockEvent);

    expect(result.statusCode).toBe(500);
    const body = JSON.parse(result.body);
    expect(body).toEqual({ message: "Error fetching users" });
  });

  it("should filter out users with Enabled: false", async () => {
    const usersWithDisabled = [
      ...testUsers,
      {
        ...testUsers[1],
        Enabled: false,
      },
    ];
    mockCognitoClient.send.mockResolvedValueOnce({ Users: usersWithDisabled });

    const result = await handler(mockEvent);

    expect(result.statusCode).toBe(200);
    const body = JSON.parse(result.body);
    expect(body).toHaveLength(1);
    expect(body[0].email).toBe("mako.stateuser@gmail.com");
  });

  it('should filter out users with UserStatus not "CONFIRMED"', async () => {
    const usersWithUnconfirmed = [
      ...testUsers,
      {
        ...testUsers[1],
        UserStatus: "UNCONFIRMED",
      },
    ];
    mockCognitoClient.send.mockResolvedValueOnce({
      Users: usersWithUnconfirmed,
    });

    const result = await handler(mockEvent);

    expect(result.statusCode).toBe(200);
    const body = JSON.parse(result.body);
    expect(body).toHaveLength(1);
    expect(body[0].email).toBe("mako.stateuser@gmail.com");
  });

  it("should handle users without required attributes", async () => {
    const usersWithMissingAttributes = [
      ...testUsers,
      {
        Username: "missing-attributes",
        Attributes: [
          { Name: "email", Value: "missing@example.com" },
          { Name: "custom:state", Value: "VA" },
        ],
        Enabled: true,
        UserStatus: "CONFIRMED",
      },
    ];
    mockCognitoClient.send.mockResolvedValueOnce({
      Users: usersWithMissingAttributes,
    });

    const result = await handler(mockEvent);

    expect(result.statusCode).toBe(200);
    const body = JSON.parse(result.body);
    expect(body).toHaveLength(2);
    expect(body[1]).toEqual({
      firstName: undefined,
      lastName: undefined,
      email: "missing@example.com",
    });
  });
});

const testUsers = [
  {
    Username: "c4982438-80f1-7056-6212-53f125ecf074",
    Attributes: [
      {
        Name: "email",
        Value: "mako.cmsuser@outlook.com",
      },
      {
        Name: "email_verified",
        Value: "true",
      },
      {
        Name: "family_name",
        Value: "Cypress",
      },
      {
        Name: "given_name",
        Value: "CMS Reviewer",
      },
      {
        Name: "custom:cms-roles",
        Value: "onemac-micro-reviewer",
      },
      {
        Name: "sub",
        Value: "c4982438-80f1-7056-6212-53f125ecf074",
      },
    ],
    UserCreateDate: "2024-08-21T12:18:16.424000-06:00",
    UserLastModifiedDate: "2024-09-11T01:34:18.757000-06:00",
    Enabled: true,
    UserStatus: "CONFIRMED",
  },
  {
    Username: "4418c418-8091-7029-0bdb-e1f1861f0ba3",
    Attributes: [
      {
        Name: "email",
        Value: "mako.stateuser@gmail.com",
      },
      {
        Name: "email_verified",
        Value: "true",
      },
      {
        Name: "family_name",
        Value: "Tester",
      },
      {
        Name: "given_name",
        Value: "Stateuser",
      },
      {
        Name: "custom:state",
        Value: "VA,OH,SC,CO,GA,MD",
      },
      {
        Name: "custom:cms-roles",
        Value: "onemac-micro-statesubmitter",
      },
    ],
    Enabled: true,
    UserStatus: "CONFIRMED",
  },

  {
    Username: "c4982438-80f1-7056-6212-53f125ecf074",
    Attributes: [
      {
        Name: "email",
        Value: "mako.cmsuser@outlook.com",
      },
      {
        Name: "email_verified",
        Value: "true",
      },
      {
        Name: "family_name",
        Value: "Cypress",
      },
      {
        Name: "given_name",
        Value: "CMS Reviewer",
      },
      {
        Name: "custom:cms-roles",
        Value: "onemac-micro-reviewer",
      },
      {
        Name: "sub",
        Value: "c4982438-80f1-7056-6212-53f125ecf074",
      },
    ],
    UserCreateDate: "2024-08-21T12:18:16.424000-06:00",
    UserLastModifiedDate: "2024-09-11T01:34:18.757000-06:00",
    Enabled: true,
    UserStatus: "CONFIRMED",
  },
  {
    Username: "4418c418-8091-7029-0bdb-e1f1861f0ba3",
    Attributes: [
      {
        Name: "email",
        Value: "mako.stateuser@gmail.com",
      },
      {
        Name: "email_verified",
        Value: "true",
      },
      {
        Name: "family_name",
        Value: "Tester",
      },
      {
        Name: "given_name",
        Value: "Stateuser",
      },
      {
        Name: "custom:state",
        Value: "VA,OH,SC,CO,GA,MD",
      },
      {
        Name: "custom:cms-roles",
        Value: "onemac-micro-statesubmitter",
      },
    ],
    Enabled: true,
    UserStatus: "CONFIRMED",
  },
  {
    Username: "4418c418-8091-7029-0bdb-e1f1861f0ba3",
    Attributes: [
      {
        Name: "email",
        Value: "mako.stateuser@gmail.com",
      },
      {
        Name: "email_verified",
        Value: "true",
      },
      {
        Name: "family_name",
        Value: "Tester",
      },
      {
        Name: "given_name",
        Value: "Stateuser",
      },
      {
        Name: "custom:state",
        Value: "VA,OH,SC,CO,GA,MD",
      },
      {
        Name: "custom:cms-roles",
        Value: "onemac-micro-statesubmitter",
      },
      {
        Name: "sub",
        Value: "4418c418-8091-7029-0bdb-e1f1861f0ba3",
      },
    ],
    UserCreateDate: "2024-08-21T12:18:15.502000-06:00",
    UserLastModifiedDate: "2024-09-11T01:34:17.984000-06:00",
    Enabled: true,
  },

  {
    Username: "c4982438-80f1-7056-6212-53f125ecf074",
    Attributes: [
      {
        Name: "email",
        Value: "mako.cmsuser@outlook.com",
      },
      {
        Name: "email_verified",
        Value: "true",
      },
      {
        Name: "family_name",
        Value: "Cypress",
      },
      {
        Name: "given_name",
        Value: "CMS Reviewer",
      },
      {
        Name: "custom:cms-roles",
        Value: "onemac-micro-reviewer",
      },
      {
        Name: "sub",
        Value: "c4982438-80f1-7056-6212-53f125ecf074",
      },
    ],
    UserCreateDate: "2024-08-21T12:18:16.424000-06:00",
    UserLastModifiedDate: "2024-09-11T01:34:18.757000-06:00",
    Enabled: true,
    UserStatus: "CONFIRMED",
  },

  {
    Username: "c4982438-80f1-7056-6212-53f125ecf074",
    Attributes: [
      {
        Name: "email",
        Value: "mako.cmsuser@outlook.com",
      },
      {
        Name: "email_verified",
        Value: "true",
      },
      {
        Name: "family_name",
        Value: "Cypress",
      },
      {
        Name: "given_name",
        Value: "CMS Reviewer",
      },
      {
        Name: "custom:cms-roles",
        Value: "onemac-micro-reviewer",
      },
      {
        Name: "sub",
        Value: "c4982438-80f1-7056-6212-53f125ecf074",
      },
    ],
    UserCreateDate: "2024-08-21T12:18:16.424000-06:00",
    UserLastModifiedDate: "2024-09-11T01:34:18.757000-06:00",
    Enabled: true,
    UserStatus: "CONFIRMED",
  },
];
