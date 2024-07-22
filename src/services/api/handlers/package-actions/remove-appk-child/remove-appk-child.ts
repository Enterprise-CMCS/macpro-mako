import {
  SEATOOL_STATUS,
  Action,
  removeAppkChildSchema,
  opensearch,
} from "shared-types";
import { seaToolFriendlyTimestamp } from "shared-utils";
import { response } from "../../../libs/handler";
import { TOPIC_NAME } from "../consts";
import { removeAppkChildAction } from "../services/package-action-write-service";
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

  const now = new Date().getTime();
  const today = seaToolFriendlyTimestamp();

  await removeAppkChildAction({
    ...result.data,
    action: Action.REMOVE_APPK_CHILD,
    id: result.data.id,
    spwStatus: SEATOOL_STATUS.WITHDRAWN,
    today: today,
    timestamp: now,
    topicName: TOPIC_NAME,
  });
}
