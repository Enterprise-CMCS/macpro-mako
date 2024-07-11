import { RaiIssue, raiIssueSchema, Action } from "shared-types";
import { seaToolFriendlyTimestamp } from "shared-utils";
import { response } from "../../../libs/handler";
import { TOPIC_NAME } from "../consts";
import { type PackageActionWriteService } from "../services/package-action-write-service";

export async function issueRai(
  body: RaiIssue,
  packageActionWriteService: PackageActionWriteService = globalThis.packageActionWriteService,
) {
  console.log("CMS issuing a new RAI");
  const today = seaToolFriendlyTimestamp();
  const result = raiIssueSchema.safeParse({ ...body, requestedDate: today });
  if (result.success === false) {
    console.error(
      "validation error:  The following record failed to parse: ",
      JSON.stringify(body),
      "Because of the following Reason(s):",
      result.error.message,
    );
    return response({
      statusCode: 400,
      body: {
        message: "Event validation error",
      },
    });
  }

  await packageActionWriteService.issueRai({
    ...result.data,
    action: Action.ISSUE_RAI,
    id: result.data.id,
    spwStatus: Action.ISSUE_RAI,
    timestamp: today,
    topicName: TOPIC_NAME,
  });
}
