import { http, HttpResponse, PathParams } from "msw";
import { TestStepFunctionRequestBody } from "../../index.d";

const defaultStepFunctionHandler = http.post<PathParams, TestStepFunctionRequestBody>(
  "https://states.us-east-1.amazonaws.com/",
  async ({ request }) => {
    const { input } = await request.json();
    const {
      cfnEvent: {
        ResourceProperties: { stateMachine },
      },
    } = JSON.parse(input);

    if (stateMachine.includes("error")) {
      return new HttpResponse(null, { status: 500 });
    }

    return HttpResponse.json({
      executionArn: "arn://fakearnvalue",
      startDate: Date.now(),
    });
  },
);

export const stepFunctionHandlers = [defaultStepFunctionHandler];
