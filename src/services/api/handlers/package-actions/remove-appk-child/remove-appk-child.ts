import {
  SEATOOL_STATUS,
  Action,
  removeAppkChildSchema,
  opensearch,
} from "shared-types";
import { seaToolFriendlyTimestamp } from "shared-utils";
import { response } from "../../../libs/handler";
import { TOPIC_NAME } from "../consts";
export async function removeAppkChild(doc: opensearch.main.Document) {
  const result = removeAppkChildSchema.safeParse(doc);

  if (!result.success) {
    return response({
      statusCode: 400,
      body: {
        message: "Remove Appk Child event validation error",
      },
    });
  }

  const today = seaToolFriendlyTimestamp();

  await packageActionWriteService.removeAppkChild({
    ...result.data,
    action: Action.REMOVE_APPK_CHILD,
    id: result.data.id,
    spwStatus: SEATOOL_STATUS.WITHDRAWN,
    timestamp: today,
    topicName: TOPIC_NAME,
  });
}
