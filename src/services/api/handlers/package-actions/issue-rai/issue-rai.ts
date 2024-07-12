import { RaiIssue, raiIssueSchema, Action, SEATOOL_STATUS } from "shared-types";
import { seaToolFriendlyTimestamp } from "shared-utils";
import { response } from "../../../libs/handler";
import { TOPIC_NAME } from "../consts";
import { type PackageActionWriteService } from "../services/package-action-write-service";

export async function issueRai(
  body: RaiIssue,
  packageActionWriteService: PackageActionWriteService = globalThis.packageActionWriteService,
) {
  console.log("CMS issuing a new RAI");
  const now = new Date().getTime();
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
    spwStatus: SEATOOL_STATUS.PENDING_RAI,
    today: today,
    timestamp: now,
    topicName: TOPIC_NAME,
  });
}
