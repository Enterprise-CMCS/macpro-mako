import { response } from "../libs/handler";
// import { Issue } from "../types/Issue";

export const updateIssue = async ({ pathParameters, body }) => {
  try {
    const { id } = pathParameters;

    if (!body || Object.keys(body).length === 0) {
      return response({
        statusCode: 400,
        body: { message: "Invalid request" },
      });
    }

    // await updateIssueById(id, post);

    return response({
      statusCode: 200,
      body: { message: `Issue with ${id} was updated` },
    });
  } catch (error) {
    return response({
      statusCode: 500,
      body: { message: "Internal server error" },
    });
  }
};

export const handler = updateIssue;
