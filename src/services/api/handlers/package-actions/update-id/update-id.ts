import { updateIdSchema, SEATOOL_STATUS, Action } from "shared-types";
import { seaToolFriendlyTimestamp } from "shared-utils";
import { response } from "../../../libs/handler";
import { TOPIC_NAME } from "../consts";

export async function updateId(body: any) {
  console.log("CMS updating the ID of a package.");

  const result = updateIdSchema.safeParse(body);
  if (!result.success) {
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
  console.log(JSON.stringify(result.data, null, 2));

  const now = new Date().getTime();
  const today = seaToolFriendlyTimestamp();

  await packageActionWriteService.updateId({
    ...result.data,
    action: Action.UPDATE_ID,
    id: body.id,
    newId: result.data.newId,
    spwStatus: SEATOOL_STATUS.TERMINATED,
    timestamp: now,
    today,
    topicName: TOPIC_NAME,
  });
}
