import { completeIntakeSchema, Action } from "shared-types";
import { response } from "../../../libs/handler";
import { TOPIC_NAME } from "../consts";
import { type PackageActionWriteService } from "../services/package-action-write-service";

export async function completeIntake(
  body: any,
  packageActionWriteService: PackageActionWriteService = globalThis.packageActionWriteService,
) {
  console.log("CMS performing intake for a record.");

  const result = completeIntakeSchema.safeParse(body);
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

  const now = new Date().getTime();

  await packageActionWriteService.completeIntake({
    timestamp: now,
    action: Action.COMPLETE_INTAKE,
    cpoc: result.data.cpoc,
    description: result.data.description,
    id: result.data.id,
    subject: result.data.subject,
    submitterName: result.data.submitterName,
    subTypeIds: result.data.subTypeIds,
    topicName: TOPIC_NAME,
    typeIds: result.data.typeIds,
  });

  return response({
    statusCode: 200,
    body: {
      message: "record successfully submitted",
    },
  });
}
