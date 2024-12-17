import { errors as OpensearchErrors } from "@opensearch-project/opensearch";

export type ErrorResponse = {
  statusCode: number;
  body: {
    error?: string;
    message?: string;
  }
}

export const handleOpensearchError = (error: unknown): ErrorResponse => {
  console.error({ error });
  if (error instanceof OpensearchErrors.ResponseError) {
    return {
      statusCode: error.statusCode || error.meta?.statusCode || 500,
      body: {
        error: error.body || error.meta?.body || error,
        message: error.message,
      }
    };
  }

  return {
    statusCode: 500,
    body: { message: "Internal server error" },
  };
}
