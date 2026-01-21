import { http, HttpResponse, PathParams } from "msw";

import { ATTACHMENT_BUCKET_NAME, PROJECT } from "../../consts";

interface SSMRequestBody {
  Name: string;
}

const ssmParameterHandler = http.post<PathParams, SSMRequestBody>(
  `https://ssm.us-east-1.amazonaws.com`,
  async ({ request }) => {
    const body = await request.json();
    const { Name } = body;
    
    if (!Name) {
      return HttpResponse.json({
        __type: "InvalidParameterException",
        message: "Missing Name in request body",
      }, { status: 400 });
    }

    const target = request.headers.get("x-amz-target");
    
    if (target === "AmazonSSM.GetParameter") {
      if (Name === `/${PROJECT}/dev/attachmentsBucketName`) {
        return HttpResponse.json({
          Parameter: {
            Name,
            Value: ATTACHMENT_BUCKET_NAME,
            Type: "String",
            Version: 1,
            ARN: `arn:aws:ssm:us-east-1:123456789012:parameter${Name}`,
          },
        });
      }
      
      if (Name === `/${PROJECT}/main/attachmentsBucketName`) {
        return HttpResponse.json({
          Parameter: {
            Name,
            Value: ATTACHMENT_BUCKET_NAME,
            Type: "String",
            Version: 1,
            ARN: `arn:aws:ssm:us-east-1:123456789012:parameter${Name}`,
          },
        });
      }

      if (Name === `/${PROJECT}/val/attachmentsBucketName`) {
        return HttpResponse.json({
          Parameter: {
            Name,
            Value: ATTACHMENT_BUCKET_NAME,
            Type: "String",
            Version: 1,
            ARN: `arn:aws:ssm:us-east-1:123456789012:parameter${Name}`,
          },
        });
      }

      if (Name === `/${PROJECT}/production/attachmentsBucketName`) {
        return HttpResponse.json({
          Parameter: {
            Name,
            Value: ATTACHMENT_BUCKET_NAME,
            Type: "String",
            Version: 1,
            ARN: `arn:aws:ssm:us-east-1:123456789012:parameter${Name}`,
          },
        });
      }

      if (Name.includes("test-project")) {
        return HttpResponse.json({
          Parameter: {
            Name,
            Value: ATTACHMENT_BUCKET_NAME,
            Type: "String",
            Version: 1,
            ARN: `arn:aws:ssm:us-east-1:123456789012:parameter${Name}`,
          },
        });
      }

      return HttpResponse.json({
        __type: "ParameterNotFound",
        message: `Parameter ${Name} not found.`,
      }, { status: 400 });
    }

    return HttpResponse.json({
      __type: "InvalidAction",
      message: `Action ${target} not supported`,
    }, { status: 400 });
  },
);

export const ssmHandlers = [ssmParameterHandler];

