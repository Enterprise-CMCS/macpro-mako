import { Amplify } from "aws-amplify";
// import * as cdk from "aws-cdk-lib";
// import * as cognito from "aws-cdk-lib/aws-cognito";
// import { ManageUsers } from "lib/local-constructs";
import { Storage } from "mocks";

const storage = new Storage();
globalThis.localStorage = storage;
globalThis.sessionStorage = storage;

// localStorage.setItem(
//   "CognitoIdentityServiceProvider.1i07k0utdl92ije3p4on270nlb.cd400c39-9e7c-4341-b62f-234e2ecb339d.idToken",
//   "eyJraWQiOiIwWUNyR3ducWttMW9BRnhQZCtyY013K2doWTdjNjVET1pEeUdOZlBcL2xscz0iLCJhbGciOiJSUzI1NiJ9.eyJhdF9oYXNoIjoiMjZsaFlRSWUyNlNMSXM2bEFpd3E5USIsInN1YiI6IjI0NTg3NDA4LWIwZjEtNzA2Yy1jZjVhLTM2YmZjY2I0YjU4ZiIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJpc3MiOiJodHRwczpcL1wvY29nbml0by1pZHAudXMtZWFzdC0xLmFtYXpvbmF3cy5jb21cL3VzLWVhc3QtMV81U1JNRHNIZ0oiLCJjb2duaXRvOnVzZXJuYW1lIjoiMjQ1ODc0MDgtYjBmMS03MDZjLWNmNWEtMzZiZmNjYjRiNThmIiwib3JpZ2luX2p0aSI6ImM4YWFhYThlLTliMjEtNGM1Yy04NGUzLTMxZDlmODk4ZDViMSIsImF1ZCI6IjFpMDdrMHV0ZGw5MmlqZTNwNG9uMjcwbmxiIiwidG9rZW5fdXNlIjoiaWQiLCJhdXRoX3RpbWUiOjE3MzI1Njc0ODIsImV4cCI6MTczMjU2OTI4MiwiaWF0IjoxNzMyNTY3NDgyLCJqdGkiOiJkZDlmMTkxYy04YmFlLTRkNjUtYjViZC03OTAxMmJlYWM3MGYiLCJlbWFpbCI6Imdlb3JnZUBleGFtcGxlLmNvbSJ9.cszCNXjVjdrDJJvqi_8sRhUlwp967MSZTsj7HF0ki79EPfYMLfff0KH3Wg89HHIlaKK-2byYCLJ7ic2WSl9nL26nDy2Ecj4dAE5rGj7MqjWXF1gTCWoR61-Of_es6nHtrUDorY1JoPDsLnSECx60kB3x5cDAxE47bH3iYZW4cNghP8ya_Mt-Qbh67R5pL9AP0T1OMVoCd4xyuy3fDPMiQhoNgLP7jqj7-hsVO8zwYJbLDGGEgxglCRxuzwE7ZgPCXr7MpP4SHlqNsh0LsUiIkviZkfXQcvktDtNgrR4q_ssIj7mC7C3r0IQka-HBvw7DcD-aaMteOfVxQionmV5kLQ",
// );
// localStorage.setItem(
//   "CognitoIdentityServiceProvider.1i07k0utdl92ije3p4on270nlb.LastAuthUser",
//   "cd400c39-9e7c-4341-b62f-234e2ecb339d",
// );
// localStorage.setItem(
//   "CognitoIdentityServiceProvider.1i07k0utdl92ije3p4on270nlb.cd400c39-9e7c-4341-b62f-234e2ecb339d.userData",
//   JSON.stringify({
//     UserAttributes: [
//       {
//         Name: "email",
//         Value: "mako.stateuser@gmail.com",
//       },
//       {
//         Name: "email_verified",
//         Value: "true",
//       },
//       {
//         Name: "given_name",
//         Value: "Stateuser",
//       },
//       {
//         Name: "family_name",
//         Value: "Tester",
//       },
//       {
//         Name: "custom:state",
//         Value: "VA,OH,SC,CO,GA,MD",
//       },
//       {
//         Name: "custom:cms-roles",
//         Value: "onemac-micro-statesubmitter",
//       },
//       {
//         Name: "sub",
//         Value: "cd400c39-9e7c-4341-b62f-234e2ecb339d",
//       },
//     ],
//     Username: "cd400c39-9e7c-4341-b62f-234e2ecb339d",
//   }),
// );
// localStorage.setItem(
//   "CognitoIdentityServiceProvider.1i07k0utdl92ije3p4on270nlb.cd400c39-9e7c-4341-b62f-234e2ecb339d.clockDrift",
//   "0",
// );
// localStorage.setItem(
//   "CognitoIdentityServiceProvider.1i07k0utdl92ije3p4on270nlb.cd400c39-9e7c-4341-b62f-234e2ecb339d.accessToken",
//   "eyJraWQiOiJ2VVcrOUdaK1ZPdzZqTlwvaE9PS0J3dkREdG5VR0gweFV1OThcL25cL2VNSXBJPSIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiIyNDU4NzQwOC1iMGYxLTcwNmMtY2Y1YS0zNmJmY2NiNGI1OGYiLCJpc3MiOiJodHRwczpcL1wvY29nbml0by1pZHAudXMtZWFzdC0xLmFtYXpvbmF3cy5jb21cL3VzLWVhc3QtMV81U1JNRHNIZ0oiLCJ2ZXJzaW9uIjoyLCJjbGllbnRfaWQiOiIxaTA3azB1dGRsOTJpamUzcDRvbjI3MG5sYiIsIm9yaWdpbl9qdGkiOiJjOGFhYWE4ZS05YjIxLTRjNWMtODRlMy0zMWQ5Zjg5OGQ1YjEiLCJ0b2tlbl91c2UiOiJhY2Nlc3MiLCJzY29wZSI6ImF3cy5jb2duaXRvLnNpZ25pbi51c2VyLmFkbWluIG9wZW5pZCBlbWFpbCIsImF1dGhfdGltZSI6MTczMjU2NzQ4MiwiZXhwIjoxNzMyNTY5MjgyLCJpYXQiOjE3MzI1Njc0ODIsImp0aSI6IjBjYWVkOThjLWI5ZGYtNGJhMy1iMDk5LWI1YWI2OTFhZDM3ZCIsInVzZXJuYW1lIjoiMjQ1ODc0MDgtYjBmMS03MDZjLWNmNWEtMzZiZmNjYjRiNThmIn0.CY2qalSStEqErSyMiebVww93wh__vT6EhKJ4XXG2eEgKBsb7NxRo2JkAgIoTxnH97E7ZTA4q0O23yMCj--jZ6mshqdZgPu8-6ZgvsLTfZt-2Js4exE3LTuASDxRumiqkcwSdlUZFdXLib0O39Hqn-iGt8ThVUGQveuNx9qmmpN1sPFFQDaQGnAt9asr0a4seUCRUE6Tjtb5aoy_e-S9avK5MxgEP0wTL9yaScmV4n6MNvv8GdkyDhHXv8q8FAsz13oljIeJ-9CrW19fDbDD9upuIyEAX_Ros7kvlCVOWWBAzDnP1ZAYQQBRlILwdu01FW56IjU8J4JajJRd_uWsrOg",
// );
// localStorage.setItem(
//   "CognitoIdentityServiceProvider.1i07k0utdl92ije3p4on270nlb.cd400c39-9e7c-4341-b62f-234e2ecb339d.refreshToken",
//   "eyJjdHkiOiJKV1QiLCJlbmMiOiJBMjU2R0NNIiwiYWxnIjoiUlNBLU9BRVAifQ.Xt2iCUMSKOaTmixn4prqhumKN_bZrUDSfX8UAiKmGyWzfGi_phxbAOOCVEF97e9PqtJh4EzLhmcv9dPKaxSca7UloUufcEb_aR5Z-nCslj8Ma89FygYLgHVxwoNVRVh7dmr2Bk3TduMZtrSbqAc--urFZ9th8LEUKv-OwmClk1D1MyzQoCsA6fAUhfrmAZbJ6arxSfRu7sI62SfN-826Em4pNQ-If2hnFWFC4HHxW_kdEkKjh-hsYUeoBaPVabzxofrG84fq1WUN_7UyhBosgoxzNISv7ziQ_2yk-TPR6CU4ad4LzFb_eYMmDJCiNy6Rwxru5qPOjaFsu6zLwjTj7A.hbfq6ith87KVcZMe.zBqOFqT5OeiA4LVepoiklX3KhmBJafhe0DChOwAf0Wo8Zw2oV37o7mN61PNEduWvG52kX5mB7vjRikPyCokwyWCxKDTwE9hwfHGgSuv_g6kOu4hSPDrFJOrxqmafGguflMqQBK3TmUykjLiEjSfVO3QCH5E13F4Tv9wg3oDaMyhNXE_sVbyKiXdPeRC6x03mK7h61sRdE5lNNDgCyu516QmRK8ZZxz7tk3-4cV0Qga119t4Jv7B2E1L7gLBOOXbxF8FFCmmL3AE0C5J2c0f-DUhEL8CeruuwqC3uB_BDLRX13juYzlU-E-IveNaj_0eVFHJHE_v6dE9qeGqfwXzG7U5onYaT_7QMlJoImpUU5cw4WATYJpVQNpFV_CPogT40qaSFTVV6M2B0jKb-aKKfgauvMEQVnY4LNhrdZQVp5-2oBGyfiBFbdBvHvW2yPvWUNQPiYx0g2QCjOg0IryMK3_OnQwee20GAoqa4xcm6v2hqVnjtYqIGZ8aYevz_TkbvMsJf6-WoCMEMQN1wmgwWC1UI0gWQsTv6LDDTekT4xpFQAmRICGBxM6zpyxR9TKsBz83DIqWcRQAR8r96ocqlcjW9fPw65q00trrGVhnnV8_3Adxkq2TFpje-phnC5YZ6guOMDW0areStOpjrOZ-RTeo896WQ8rhnKHViN3d1iBhabr9RfQeYq9LKWRMFBqIRxX-VAed_srP4EO86oN5xoHIGTEcSITwrl_uY3pH7fDESzzQe2sebGc8pzMdriiZjg7IoAYqMaESyA7h51WOLuKELa3AbWNeGjzIH91ZpJw6v5mzkZ2OF64vCNNXuxDJI6cPlysYv-pmX8F4XMZogAWHI5VjmH1zBaLlQtGu6Ug9WF0aM3k520tblFA2mGvC5EnIB4S_rEGcIt1FFmZki2tmIYMot5-GBsTDjSwiqOiEFN5lrGh1GgNQZR7nU50sEhvdfvKYvhtEE9NaYSQ1CuIJ4Bbc3g0mvI3D1LDvA8fIY1OKo18D36rjc0fduoVaQ4jL6gewWOKzNQucacIPr57EBcKEQZRnnatEIbwo-8kobnQ07ZVSvBQrxGbL02brycZFtjKWwhNTw_LECs94sou0jU8-v-p5_CnNDJDNPYxFhDgIaJ-2fvx6zid8bmsJPmbzG06ZpeEsUAOlU6DKPRodyvMkx_koue6_NeOSYNmulqrCuT1SJt46dQ5X2LvgP4OnV-IvtoQz2W-zqXj6MpjX8v4I8VTNvDlbcDt3fq6lrWlV-5cKjYJ_-G8we2HzbMJWwBQGbFmbcbw.UAZ2RXIFNzyiR8fOCA06Zg",
// );
// console.log("\n--------------\n");

Amplify.configure({
  Auth: {
    mandatorySignIn: true,
    region: "us-east-1",
    userPoolId: "us-east-1_5SRMDsHgJ",
    identityPoolId: "us-east-1:d9eb759d-11cd-4753-84d6-3dfbfc2e24c7",
    userPoolWebClientId: "1i07k0utdl92ije3p4on270nlb",
    oauth: {
      domain: "test-login-1i07k0utdl92ije3p4on270nlb.auth.us-east-1.amazoncognito.com",
      redirectSignIn: "http://localhost:5000/",
      redirectSignOut: "http://localhost:5000/",
      scope: ["email", "openid"],
      responseType: "code",
    },
  },
  API: {
    endpoints: [
      {
        name: "os",
        endpoint: "https://71v5znlyyg.execute-api.us-east-1.amazonaws.com/mocking-tests",
        region: "us-east-1",
      },
    ],
  },
});

// const app = new cdk.App();
// const stack = new cdk.Stack(app, "MockTestStack");

// export const userPool = new cognito.UserPool(stack, "MockUserPool");
// console.log({ userPool });
// const passwordSecretArn = "mockPasswordSecretArn"; // pragma: allowlist secret

// export const manageUsers = new ManageUsers(
//   stack,
//   "ManageUsers",
//   userPool,
//   users,
//   passwordSecretArn,
// );
