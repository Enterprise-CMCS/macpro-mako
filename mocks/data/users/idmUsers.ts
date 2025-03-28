export const testStateIDMUserMissingIdentity = {
  sub: "0000aaaa-0000-00aa-0a0a-aaaaaa000000",
  "custom:cms-roles": "onemac-micro-statesubmitter",
  "custom:state": "VA,OH,SC,CO,GA,MD",
  email_verified: true,
  given_name: "State",
  family_name: "Person",
  username: "abcd",
  email: "stateperson@example.com",
};

export const testStateIDMUser = {
  sub: "0000aaaa-0000-00aa-0a0a-aaaaaa000000",
  "custom:cms-roles": "onemac-micro-statesubmitter",
  "custom:state": "VA,OH,SC,CO,GA,MD",
  email_verified: true,
  given_name: "State",
  family_name: "Person",
  "custom:username": "fail",
  email: "stateperson@example.com",
  identities:
    '[{"dateCreated":"1709308952587","userId":"abc123","providerName":"IDM","providerType":"OIDC","issuer":null,"primary":"true"}]',
};
export const testStateIDMUserGood = {
  sub: "0000aaaa-0000-00aa-0a0a-aaaaaa000000",
  "custom:cms-roles": "onemac-micro-super",
  "custom:state": "VA,OH,SC,CO,GA,MD",
  email_verified: true,
  given_name: "State",
  family_name: "Person",
  "custom:username": "abcd",
  email: "stateperson@example.com",
  identities:
    '[{"dateCreated":"1709308952587","userId":"abc123","providerName":"IDM","providerType":"OIDC","issuer":null,"primary":"true"}]',
};
export const TEST_IDM_USERS = {
  testStateIDMUser,
  testStateIDMUserGood,
  testStateIDMUserMissingIdentity,
};
