import * as matchers from "@testing-library/jest-dom/matchers";
import { cleanup } from "@testing-library/react";
import { Auth } from "aws-amplify";
import { mockedServer } from "mocks/server";
import { afterAll, afterEach, beforeAll, beforeEach, expect, vi } from "vitest";

import "./setup.amplify";

global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// global.localStorage = {
//   length: 100,
//   clear: vi.fn(() => console.log("CLEAR")),
//   key: vi.fn((index: number) => {
//     console.log("get key ", index);
//     return "hello world";
//   }),
//   setItem: vi.fn((key, value) => console.log(`setItem ${key}:${value}`)),
//   removeItem: vi.fn((key) => console.log("removeItem ", key)),
//   getItem: vi.fn((key: string) => {
//     if (key.includes("LastAuthUser")) {
//       return "24587408-b0f1-706c-cf5a-36bfccb4b58f";
//     } else if (key.includes("userData")) {
//       return '{"UserAttributes":[{"Name":"email","Value":"george@example.com"},{"Name":"email_verified","Value":"true"},{"Name":"family_name","Value":"Harrison"},{"Name":"given_name","Value":"George",{"Name":"custom:state","Value":"VA,OH,SC,CO,GA,MD"},{"Name":"custom:cms-roles","Value":"onemac-micro-statesubmitter"},{"Name":"sub","Value":"24587408-b0f1-706c-cf5a-36bfccb4b58f"}],"Username":"24587408-b0f1-706c-cf5a-36bfccb4b58f"}';
//     } else if (key.includes("accessToken")) {
//       return "eyJraWQiOiJ2VVcrOUdaK1ZPdzZqTlwvaE9PS0J3dkREdG5VR0gweFV1OThcL25cL2VNSXBJPSIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiIyNDU4NzQwOC1iMGYxLTcwNmMtY2Y1YS0zNmJmY2NiNGI1OGYiLCJpc3MiOiJodHRwczpcL1wvY29nbml0by1pZHAudXMtZWFzdC0xLmFtYXpvbmF3cy5jb21cL3VzLWVhc3QtMV81U1JNRHNIZ0oiLCJ2ZXJzaW9uIjoyLCJjbGllbnRfaWQiOiIxaTA3azB1dGRsOTJpamUzcDRvbjI3MG5sYiIsIm9yaWdpbl9qdGkiOiJhNDhjZjg1Yi05YTNhLTRlMzItODcxZC00N2M0NWUwMzVlZDkiLCJldmVudF9pZCI6ImI2OTAyZTE1LWE0YTktNDJkYy1iZmFhLTUwZDdhMDFlOWM4NyIsInRva2VuX3VzZSI6ImFjY2VzcyIsInNjb3BlIjoiYXdzLmNvZ25pdG8uc2lnbmluLnVzZXIuYWRtaW4gb3BlbmlkIGVtYWlsIiwiYXV0aF90aW1lIjoxNzMyMzMwMDIxLCJleHAiOjE3MzIzMzQyNjUsImlhdCI6MTczMjMzMjQ2NSwianRpIjoiNzFjNmRmNzAtNGI0ZC00NGI2LTkxMzAtMzAzNjY4MmZmMzY2IiwidXNlcm5hbWUiOiIyNDU4NzQwOC1iMGYxLTcwNmMtY2Y1YS0zNmJmY2NiNGI1OGYifQ.ptwE6DzcD0GhgM6nS3XteotLvccBe4A7yDF_iuelWNVwBQm6jQWxxEXEWJrM9KyC93ngkry2liFeuPahnejSFnWS1AVatny0bp8qGtk9G5TtYEp53drAukhzshHWbtZjt2QY6GOcmCFORJVYxeZYu8d0g8vDnEH3-D6v9W_BStc0OZqoug51moC2tHB8k8Ztz26SkCnBllNTZyI9i6YwdpPtgeU8JWn076L4YOTZ4Ypsa_cQSbuAJKxZS8ktX58YMc7DMHmutO2o6SlHkq9Lew6ADyQwOPV95tuyH46BlWudHKoimSHLBoxqirmIbSIIZypqUU6maglWC-4JbEwwoQ";
//     } else if (key.includes("idToken")) {
//       return "eyJraWQiOiIwWUNyR3ducWttMW9BRnhQZCtyY013K2doWTdjNjVET1pEeUdOZlBcL2xscz0iLCJhbGciOiJSUzI1NiJ9.eyJhdF9oYXNoIjoiblhUNGpsLUlkV01vbTRlTXFyR3Q4USIsInN1YiI6IjI0NTg3NDA4LWIwZjEtNzA2Yy1jZjVhLTM2YmZjY2I0YjU4ZiIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJpc3MiOiJodHRwczpcL1wvY29nbml0by1pZHAudXMtZWFzdC0xLmFtYXpvbmF3cy5jb21cL3VzLWVhc3QtMV81U1JNRHNIZ0oiLCJjb2duaXRvOnVzZXJuYW1lIjoiMjQ1ODc0MDgtYjBmMS03MDZjLWNmNWEtMzZiZmNjYjRiNThmIiwib3JpZ2luX2p0aSI6ImE0OGNmODViLTlhM2EtNGUzMi04NzFkLTQ3YzQ1ZTAzNWVkOSIsImF1ZCI6IjFpMDdrMHV0ZGw5MmlqZTNwNG9uMjcwbmxiIiwiZXZlbnRfaWQiOiJiNjkwMmUxNS1hNGE5LTQyZGMtYmZhYS01MGQ3YTAxZTljODciLCJ0b2tlbl91c2UiOiJpZCIsImF1dGhfdGltZSI6MTczMjMzMDAyMSwiZXhwIjoxNzMyMzM0MjY1LCJpYXQiOjE3MzIzMzI0NjUsImp0aSI6IjMyZTc2YjM4LWI1NzEtNDVmNS1iYTg4LWZkNWQ1M2Q2MDc4YyIsImVtYWlsIjoiZ2VvcmdlQGV4YW1wbGUuY29tIn0.JnqptqATJxYP5HwLVs7CzbOVL1hFPgUzgERQpawDpDJ7aWSp9fLK4QMBLCjzXXWGmaoli8XgTCiwt8NjUt6ht79Z4HyMpXHC02h2skEcu6GeI7B4lT4vxUFH477djczxzJljQLeOkTMdd6EAkNNzLLeFyyYVbOzX0CFUk9ICYgqT0T1A-plZ3zI5Q6RZYHm4uV-cFblaSDL3XFmeEUflT36nz7u8dekeObLrDBf8K1_HQhokwQgXxOGaHXHTCp6jfxb4fy2n3yyFhFOXtQoMKsGZyFXUxxqQp_DuYBH8GrWo6snEPjgdzp1Mf97s-SMZMzV0Jv8jOOjModhGpVol4w";
//     } else if (key.includes("refreshToken")) {
//       return "eyJjdHkiOiJKV1QiLCJlbmMiOiJBMjU2R0NNIiwiYWxnIjoiUlNBLU9BRVAifQ.I1s8rtqvEUeMWwMRXY-8zkrj5egYvrsBrnNMoHVqs3xNwjUtUzEImtSNAxWs_gOgL8_yTnpEXVgh59skkD4oJbRufgI1P5OJrHPXpkGPapWKV-4YsVrWIUCRCHMGnoLP5LNSfqtrUdJqof8FdVjEuMy1MlDApI8cokwdZSDyNTQog0pFy3dTp0jHiYFLPJRIZj6yaT9DzgU9TusriEFQH7ovuHsG_SM5TEheZ6Re6bGIewXexVEU4h0g9L9JHEV7vmzpW4KA_R2uMYDkrcab7NmsuD4vFqA_itp3kE82svr9c5AAqJlrOVVAXk0V1SV3NQ6fQGHajXVuzc17UJYfmQ.dHr3Z0ESGTazBGbW.msncq4oUuo8EMydKnB9AO-JsmvrCpme3K7m9i8w6uDbIo3XrR0nUxQHVvige2v3cUb5VL4RY4SZvg6OdMmGg5jKrl4N_tBGrDNQ64tZIgr3W3ELqTR75eogz8emy-S5cyuBNZ9RqHr8mHhONXF9WxVZfNqor9JdtU385Q5OE6h9Tx9Pq-NA6kecKH40_6xUn_-Ny-3EDsIATiDiLz1_yP9H0vkzrA_TV9LB9POYzAVy_EhSPFDiI5dzTM_Ot_iSr5nkkaVSL0EdHvKxvkEDswi96APJatoiWJkNcs9DGrUPaSZ-MvoTro29ejv0JIy13t7-Zb2fZccoRk-BfmCebvbBxvKf2vZ0tuZCKqyTSXXcUFAY2kDlFhC1K6sA741cVFlndHiJEuGvgjkjEU-lUfkRbk_CCjNEpWqFBYX5moJCO8O7IZMn9_UQWSV0QMBoIpBnw5nEZ6JQzJMykUVaLGhTDWSU_W5wOL7zaqzYHKydwJeC9tIdK_FQ8cAAV9CQaDGPjWQ8dD0bOxUlsX6nJb8T8i0G2bTDl6ZKNOMP0oTgSEMfzqo0QBbeYjonD04rv7Vbeyf3vQiy6qBeJvdus-Bnitt62q8110-rwvCMGetg9DdOqnDu6a45Txi2A6o4i8AXA4aWwsGD9_mmK6qU6NGNVJR0OQC0GlYFoqAVeAiFvwCUInAAohgxC1UFBmRuqhghBQfJQO4pIaOEXgzDr8d_w7WyV3TGXestqjsD4FHXAQ54kFKvqJfqWTjIxBMOmogHwIvLMtQA3HVxx8_SIM0r8F4ja5Y5mE18kLDwQapM-n5bPsxwdJabywmfUMvrehhnTa5IFs4DFObdfjUN_GGEUqchzq8l_1UQrdnT3fBdV_nF9qsRhA046oCyJGTLK6TN_82tPpk4EF7HP6MmHn-seCZEXfJ5JlGMq6hD-WW22Yku5ar1XSgx5o43tVgkxYojiLyBbM8-aTEDGEHtuhYeHk3C-381D-zq6PAwUkm4hWRJ460EQdg0O0FORa3UIaUdFMoZeGDBAvIsp7ojuYrpEAt7czCSr9qZwdUxpxaf_tF-42wnobNQITYhsGt9K96dd65cCqFBz4jSVSMFOyZjmSdQgKEbQUk_B3P_ylNtGs6vjJYITWwvBU-o1_GL89_apN9bvhLhUVDKrMaHN1P_4SRpMEcrYsCYKbU_gS5tO4qqUWIhY0Up1NJT_ne10wZmaWYrydWTzYPIIBkCLtKmY3tBHswM_mbVg7ZVaihT_ueM7zOA_PUABsq2Kfcn0lmfIqFuwmIXSpuZx6_SjNFfeyKAmvEpakEaN40hMXxtjkjZe4yhZToXr2X7AkULVObKUlkadkJ0Gt2SWXBUAKzSQnVOvFQBHNn9_1EM.idWMuV3DwYevvyWCVMGvSA";
//     }
//     return "hello again";
//   }),
// };
//aws-amplify-federatedInfo
//CognitoIdentityServiceProvider.1i07k0utdl92ije3p4on270nlb.LastAuthUser = 24587408-b0f1-706c-cf5a-36bfccb4b58f
//CognitoIdentityServiceProvider.1i07k0utdl92ije3p4on270nlb.24587408-b0f1-706c-cf5a-36bfccb4b58f.idToken
//CognitoIdentityServiceProvider.1i07k0utdl92ije3p4on270nlb.24587408-b0f1-706c-cf5a-36bfccb4b58f.accessToken
//CognitoIdentityServiceProvider.1i07k0utdl92ije3p4on270nlb.24587408-b0f1-706c-cf5a-36bfccb4b58f.refreshToken
//CognitoIdentityServiceProvider.1i07k0utdl92ije3p4on270nlb.24587408-b0f1-706c-cf5a-36bfccb4b58f.clockDrift = 0
//CognitoIdentityServiceProvider.1i07k0utdl92ije3p4on270nlb.24587408-b0f1-706c-cf5a-36bfccb4b58f.deviceKey

// extends Vitest's expect method with methods from react-testing-library
expect.extend(matchers);

class MockPointerEvent extends Event {
  button: number;
  ctrlKey: boolean;
  pointerType: string;

  constructor(type: string, props: PointerEventInit) {
    super(type, props);
    this.button = props.button || 0;
    this.ctrlKey = props.ctrlKey || false;
    this.pointerType = props.pointerType || "mouse";
  }
}
window.PointerEvent = MockPointerEvent as any;
window.HTMLElement.prototype.scrollIntoView = vi.fn();
window.HTMLElement.prototype.releasePointerCapture = vi.fn();
window.HTMLElement.prototype.hasPointerCapture = vi.fn();

// Add this to remove all the expected errors in console when running unit tests.
beforeAll(async () => {
  vi.spyOn(console, "error").mockImplementation(() => {});
  // localStorage.setItem(
  //   "CognitoIdentityServiceProvider.1i07k0utdl92ije3p4on270nlb.cd400c39-9e7c-4341-b62f-234e2ecb339d.idToken",
  //   "eyJraWQiOiIwWUNyR3ducWttMW9BRnhQZCtyY013K2doWTdjNjVET1pEeUdOZlBcL2xscz0iLCJhbGciOiJSUzI1NiJ9.eyJhdF9oYXNoIjoiUDMzOTllWHBYSmpJX1VaYllRd0ZOdyIsInN1YiI6IjI0NTg3NDA4LWIwZjEtNzA2Yy1jZjVhLTM2YmZjY2I0YjU4ZiIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJpc3MiOiJodHRwczpcL1wvY29nbml0by1pZHAudXMtZWFzdC0xLmFtYXpvbmF3cy5jb21cL3VzLWVhc3QtMV81U1JNRHNIZ0oiLCJjb2duaXRvOnVzZXJuYW1lIjoiMjQ1ODc0MDgtYjBmMS03MDZjLWNmNWEtMzZiZmNjYjRiNThmIiwib3JpZ2luX2p0aSI6IjQ4NTg5ZTU2LTk4ZTUtNGZiZC04MjkwLWEwOTY1OWY1ZGNhOSIsImF1ZCI6IjFpMDdrMHV0ZGw5MmlqZTNwNG9uMjcwbmxiIiwidG9rZW5fdXNlIjoiaWQiLCJhdXRoX3RpbWUiOjE3MzI1NjU1MjYsImV4cCI6MTczMjU2NzMzMywiaWF0IjoxNzMyNTY1NTMzLCJqdGkiOiI5ZjU2ZTgyYS1jNmM0LTQ2ZDktOTAwOS02OWQ4ODg1NzUyZDkiLCJlbWFpbCI6Imdlb3JnZUBleGFtcGxlLmNvbSJ9.p-sThQuDN2hgxMuMQT2g1x9IqFQSNecsUiILOI7q_Pi9g86J4O3W3UL0Zza_XidUCjTvmIFJFJhujcjhwFyJMKcTBBMWFCsr-GHDc6GOX1gZbGIZxDuPFU269sP-QxYbGD8RlFHub4Oj1e64eYJD9XJLb4_SFjcI98choWdKph2_XueN64Jo71h3tAiwOgZT4kso2EAHVAj2dSVhz1x1B5BMy6KvqmlhFILykxxqugVfWicXVCYFlpPhAY1MB6M0avLRd7ukZOfZQNyM942QxA7TdubE86Ow09gt8Q8xu47liDdAbBM-dYXGDDFyF5Yl8Oho7SLzB6-vx2bfumbxtw",
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
  // console.log("\n--------------\n");
  // const session = useDefaultStateSubmitter();
  // if (session) {
  //   console.log({ userPool });
  //   const credentials = await Auth.Credentials.set(session, "session");
  //   const user = new CognitoUser({
  //     Username: "cd400c39-9e7c-4341-b62f-234e2ecb339d",
  //     Pool: userPool,
  //   });
  //   user.setSignInUserSession(session);
  // }

  // console.log("process.env.MOCK_USER_DATA: ", process.env.MOCK_USER_DATA);
  // if (process.env.MOCK_USER_DATA) {
  //   const user = JSON.parse(process.env.MOCK_USER_DATA);
  //   await Auth.userSession(user);
  // }
  console.log("starting MSW listener");
  mockedServer.listen({
    onUnhandledRequest: "warn",
  });
  Auth.signIn("mako.stateuser@gmail.com", "");
  // localStorage.setItem(
  //   "CognitoIdentityServiceProvider.1i07k0utdl92ije3p4on270nlb.mako.stateuser@gmail.com.userData",
  //   '{"UserAttributes":[{"Name":"email","Value":"george@example.com"},{"Name":"email_verified","Value":"true"},{"Name":"family_name","Value":"Harrison"},{"Name":"given_name","Value":"George"},{"Name":"custom:state","Value":"VA,OH,SC,CO,GA,MD"},{"Name":"custom:cms-roles","Value":"onemac-micro-statesubmitter"},{"Name":"sub","Value":"24587408-b0f1-706c-cf5a-36bfccb4b58f"}],"Username":"24587408-b0f1-706c-cf5a-36bfccb4b58f"}',
  // );

  if (process.env.MOCK_API_REFINES) {
    vi.mock("@/components/Inputs/upload.utilities", () => ({
      getPresignedUrl: vi.fn(async () => "hello world"),
      uploadToS3: vi.fn(async () => {}),
      extractBucketAndKeyFromUrl: vi.fn(() => ({
        bucket: "hello",
        key: "world",
      })),
    }));
  }
});

beforeEach(() => {
  // console.log("process.env.MOCK_USER_DATA: ", process.env.MOCK_USER_DATA);
  // if (process.env.MOCK_USER_DATA) {
  //   localStorage.setItem(
  //     "CognitoIdentityServiceProvider.1i07k0utdl92ije3p4on270nlb.24587408-b0f1-706c-cf5a-36bfccb4b58f.userData",
  //     process.env.MOCK_USER_DATA,
  //   );
  // }
});

afterEach(() => {
  if (process.env.SKIP_CLEANUP) return;
  // Reset any request handlers that we may add during the tests,
  // so they don't affect other tests.
  mockedServer.resetHandlers();
  cleanup();
});

afterAll(() => {
  delete process.env.SKIP_CLEANUP;
  // Clean up after the tests are finished.
  mockedServer.close();
  vi.restoreAllMocks();
});
