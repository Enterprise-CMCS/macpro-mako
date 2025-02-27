import { events } from "shared-types/events";
import { isAuthorized, getAuthDetails, lookupUserAttributes } from "../../../libs/api/auth/user";
import { type APIGatewayEvent } from "aws-lambda";
import { itemExists } from "libs/api/package";

export const newMedicaidSubmission = async (event: APIGatewayEvent) => {
  if (!event.body) return;

  const body = JSON.parse(event.body);

  // Check if it's a draft submission
  const isDraft = body.submissionStatus === "draft";

  // If it's a draft, parse without validation, otherwise use normal validation
  let parsedData;
  if (isDraft) {
    // For drafts, we skip some validations but still need basic structure
    const baseValidation = events["new-medicaid-submission"].baseSchema.safeParse(body);
    if (!baseValidation.success) {
      throw baseValidation.error;
    }
    parsedData = baseValidation.data;
  } else {
    // For regular submissions, use full validation
    const parsedResult = events["new-medicaid-submission"].baseSchema.safeParse(body);
    if (!parsedResult.success) {
      throw parsedResult.error;
    }

    // Regular validation for non-drafts
    parsedData = parsedResult.data;
  }

  // Auth check is still required for both drafts and submissions
  if (!(await isAuthorized(event, parsedData.id.slice(0, 2)))) {
    throw "Unauthorized";
  }

  // For non-drafts, check if item exists
  if (!isDraft && (await itemExists({ id: parsedData.id }))) {
    throw "Item Already Exists";
  }

  const authDetails = getAuthDetails(event);
  const userAttr = await lookupUserAttributes(authDetails.userId, authDetails.poolId);
  const submitterEmail = userAttr.email;
  const submitterName = `${userAttr.given_name} ${userAttr.family_name}`;

  const transformedData = events["new-medicaid-submission"].schema.parse({
    ...parsedData,
    submitterName,
    submitterEmail,
    timestamp: Date.now(),
  });

  return transformedData;
};
