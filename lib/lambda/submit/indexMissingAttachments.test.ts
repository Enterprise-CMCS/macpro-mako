import { submit } from "./index";
import { APIGatewayEvent } from "node_modules/shared-types";
import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { bma } from "mocks/data/submit/baseMissingAttachments";

import { makoStateSubmitter } from "mocks";
vi.mock("kafkajs", () => {
  const producer = {
    connect: vi.fn(),
    send: vi.fn(),
    disconnect: vi.fn(),
  };
  const kafka = {
    producer: () => producer,
  };
  return {
    Kafka: vi.fn(() => kafka),
    Producer: vi.fn(() => producer),
  };
});
describe("submit Lambda function missing objects in event", () => {
  let brokerString: string | undefined;
  beforeEach(() => {
    brokerString = process.env.brokerString;
    process.env.brokerString = "broker1,broker2";
  });

  afterEach(() => {
    process.env.brokerString = brokerString;
  });

  it("should start to create an capitated ammendment event", async () => {
    const base = JSON.stringify(bma.capitatedAmendmentBase);

    const event = {
      body: base,
      requestContext: {
        identity: {
          makoStateSubmitter,
          cognitoAuthenticationProvider:
            "https://cognito-idp.us-east-1.amazonaws.com/us-east-1_userPool1,https://cognito-idp.us-east-1.amazonaws.com/us-east-1_userPool1:CognitoSignIn:53832e35-1fbe-4c74-9111-4a0cd29ce2cf",
        },
      },
    } as unknown as APIGatewayEvent;
    const result = await submit(event);
    expect(result.statusCode).toEqual(500);
  });

  it("should start to create an app-k event", async () => {
    const base = JSON.stringify(bma.appkBase);

    const event = {
      body: base,
      requestContext: {
        identity: {
          makoStateSubmitter,
          cognitoAuthenticationProvider:
            "https://cognito-idp.us-east-1.amazonaws.com/us-east-1_userPool1,https://cognito-idp.us-east-1.amazonaws.com/us-east-1_userPool1:CognitoSignIn:53832e35-1fbe-4c74-9111-4a0cd29ce2cf",
        },
      },
    } as unknown as APIGatewayEvent;
    const result = await submit(event);
    expect(result.statusCode).toEqual(500);
  });
  it("should start to create an capitated initial event", async () => {
    const base = JSON.stringify(bma.capitatedInitial);

    const event = {
      body: base,
      requestContext: {
        identity: {
          makoStateSubmitter,
          cognitoAuthenticationProvider:
            "https://cognito-idp.us-east-1.amazonaws.com/us-east-1_userPool1,https://cognito-idp.us-east-1.amazonaws.com/us-east-1_userPool1:CognitoSignIn:53832e35-1fbe-4c74-9111-4a0cd29ce2cf",
        },
      },
    } as unknown as APIGatewayEvent;
    const result = await submit(event);
    expect(result.statusCode).toEqual(500);
  });
  it("should start to create an contracting ammendment event", async () => {
    const base = JSON.stringify(bma.contractingAmmendment);

    const event = {
      body: base,
      requestContext: {
        identity: {
          makoStateSubmitter,
          cognitoAuthenticationProvider:
            "https://cognito-idp.us-east-1.amazonaws.com/us-east-1_userPool1,https://cognito-idp.us-east-1.amazonaws.com/us-east-1_userPool1:CognitoSignIn:53832e35-1fbe-4c74-9111-4a0cd29ce2cf",
        },
      },
    } as unknown as APIGatewayEvent;
    const result = await submit(event);
    expect(result.statusCode).toEqual(500);
  });
  it("should start to create an contracting initial event", async () => {
    const base = JSON.stringify(bma.contractingInitial);

    const event = {
      body: base,
      requestContext: {
        identity: {
          makoStateSubmitter,
          cognitoAuthenticationProvider:
            "https://cognito-idp.us-east-1.amazonaws.com/us-east-1_userPool1,https://cognito-idp.us-east-1.amazonaws.com/us-east-1_userPool1:CognitoSignIn:53832e35-1fbe-4c74-9111-4a0cd29ce2cf",
        },
      },
    } as unknown as APIGatewayEvent;
    const result = await submit(event);
    expect(result.statusCode).toEqual(500);
  });
  it("should start to create an contracting renewal event", async () => {
    const base = JSON.stringify(bma.contractingRenewal);

    const event = {
      body: base,
      requestContext: {
        identity: {
          makoStateSubmitter,
          cognitoAuthenticationProvider:
            "https://cognito-idp.us-east-1.amazonaws.com/us-east-1_userPool1,https://cognito-idp.us-east-1.amazonaws.com/us-east-1_userPool1:CognitoSignIn:53832e35-1fbe-4c74-9111-4a0cd29ce2cf",
        },
      },
    } as unknown as APIGatewayEvent;
    const result = await submit(event);
    expect(result.statusCode).toEqual(500);
  });
  it("should start to create an new chip submission event", async () => {
    const base = JSON.stringify(bma.newChipSubmission);

    const event = {
      body: base,
      requestContext: {
        identity: {
          makoStateSubmitter,
          cognitoAuthenticationProvider:
            "https://cognito-idp.us-east-1.amazonaws.com/us-east-1_userPool1,https://cognito-idp.us-east-1.amazonaws.com/us-east-1_userPool1:CognitoSignIn:53832e35-1fbe-4c74-9111-4a0cd29ce2cf",
        },
      },
    } as unknown as APIGatewayEvent;
    const result = await submit(event);
    expect(result.statusCode).toEqual(500);
  });
  it("should start to create an new chip medicaid submission event", async () => {
    const base = JSON.stringify(bma.newMedicaidSubmission);

    const event = {
      body: base,
      requestContext: {
        identity: {
          makoStateSubmitter,
          cognitoAuthenticationProvider:
            "https://cognito-idp.us-east-1.amazonaws.com/us-east-1_userPool1,https://cognito-idp.us-east-1.amazonaws.com/us-east-1_userPool1:CognitoSignIn:53832e35-1fbe-4c74-9111-4a0cd29ce2cf",
        },
      },
    } as unknown as APIGatewayEvent;
    const result = await submit(event);
    expect(result.statusCode).toEqual(500);
  });
  it("should start to create an new respond to rai event", async () => {
    const base = JSON.stringify(bma.respondToRai);

    const event = {
      body: base,
      requestContext: {
        identity: {
          makoStateSubmitter,
          cognitoAuthenticationProvider:
            "https://cognito-idp.us-east-1.amazonaws.com/us-east-1_userPool1,https://cognito-idp.us-east-1.amazonaws.com/us-east-1_userPool1:CognitoSignIn:53832e35-1fbe-4c74-9111-4a0cd29ce2cf",
        },
      },
    } as unknown as APIGatewayEvent;
    const result = await submit(event);
    expect(result.statusCode).toEqual(500);
  });
  it("should start to create an temporary extension event", async () => {
    const base = JSON.stringify(bma.temporaryExtension);

    const event = {
      body: base,
      requestContext: {
        identity: {
          makoStateSubmitter,
          cognitoAuthenticationProvider:
            "https://cognito-idp.us-east-1.amazonaws.com/us-east-1_userPool1,https://cognito-idp.us-east-1.amazonaws.com/us-east-1_userPool1:CognitoSignIn:53832e35-1fbe-4c74-9111-4a0cd29ce2cf",
        },
      },
    } as unknown as APIGatewayEvent;
    const result = await submit(event);
    expect(result.statusCode).toEqual(500);
  });
  it("should start to create an toggle withdraw event", async () => {
    const base = JSON.stringify(bma.toggleWithdrawRai);

    const event = {
      body: base,
      requestContext: {
        identity: {
          makoStateSubmitter,
          cognitoAuthenticationProvider:
            "https://cognito-idp.us-east-1.amazonaws.com/us-east-1_userPool1,https://cognito-idp.us-east-1.amazonaws.com/us-east-1_userPool1:CognitoSignIn:53832e35-1fbe-4c74-9111-4a0cd29ce2cf",
        },
      },
    } as unknown as APIGatewayEvent;
    const result = await submit(event);
    expect(result.statusCode).toEqual(500);
  });
  it("should start to create an withdraw package event", async () => {
    const base = JSON.stringify(bma.withdrawPackage);

    const event = {
      body: base,
      requestContext: {
        identity: {
          makoStateSubmitter,
          cognitoAuthenticationProvider:
            "https://cognito-idp.us-east-1.amazonaws.com/us-east-1_userPool1,https://cognito-idp.us-east-1.amazonaws.com/us-east-1_userPool1:CognitoSignIn:53832e35-1fbe-4c74-9111-4a0cd29ce2cf",
        },
      },
    } as unknown as APIGatewayEvent;
    const result = await submit(event);
    expect(result.statusCode).toEqual(500);
  });
  it("should start to create an withdraw rai event", async () => {
    const base = JSON.stringify(bma.withdrawRai);

    const event = {
      body: base,
      requestContext: {
        identity: {
          makoStateSubmitter,
          cognitoAuthenticationProvider:
            "https://cognito-idp.us-east-1.amazonaws.com/us-east-1_userPool1,https://cognito-idp.us-east-1.amazonaws.com/us-east-1_userPool1:CognitoSignIn:53832e35-1fbe-4c74-9111-4a0cd29ce2cf",
        },
      },
    } as unknown as APIGatewayEvent;
    const result = await submit(event);
    expect(result.statusCode).toEqual(500);
  });
  it("should start to create an capitated renewal event", async () => {
    const base = JSON.stringify(bma.capitatedRenewal);

    const event = {
      body: base,
      requestContext: {
        identity: {
          makoStateSubmitter,
          cognitoAuthenticationProvider:
            "https://cognito-idp.us-east-1.amazonaws.com/us-east-1_userPool1,https://cognito-idp.us-east-1.amazonaws.com/us-east-1_userPool1:CognitoSignIn:53832e35-1fbe-4c74-9111-4a0cd29ce2cf",
        },
      },
    } as unknown as APIGatewayEvent;
    const result = await submit(event);
    expect(result.statusCode).toEqual(500);
  });
  it("should start to create an contracting initial event", async () => {
    const base = JSON.stringify(bma.contractingInitial);

    const event = {
      body: base,
      requestContext: {
        identity: {
          makoStateSubmitter,
          cognitoAuthenticationProvider:
            "https://cognito-idp.us-east-1.amazonaws.com/us-east-1_userPool1,https://cognito-idp.us-east-1.amazonaws.com/us-east-1_userPool1:CognitoSignIn:53832e35-1fbe-4c74-9111-4a0cd29ce2cf",
        },
      },
    } as unknown as APIGatewayEvent;
    const result = await submit(event);
    expect(result.statusCode).toEqual(500);
  });
  it("should start to create an upload subsequent documents event", async () => {
    const base = JSON.stringify(bma.uploadSubsequentDocuments);

    const event = {
      body: base,
      requestContext: {
        identity: {
          makoStateSubmitter,
          cognitoAuthenticationProvider:
            "https://cognito-idp.us-east-1.amazonaws.com/us-east-1_userPool1,https://cognito-idp.us-east-1.amazonaws.com/us-east-1_userPool1:CognitoSignIn:53832e35-1fbe-4c74-9111-4a0cd29ce2cf",
        },
      },
    } as unknown as APIGatewayEvent;
    const result = await submit(event);
    expect(result.statusCode).toEqual(500);
  });
});
