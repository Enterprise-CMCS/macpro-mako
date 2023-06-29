export type CognitoUserAttributes = {
  sub: string;
  "custom:roles": string[];
  email_verified: boolean;
  "custom:state_codes": string[];
  given_name: string;
  family_name: string;
  email: string;
};
