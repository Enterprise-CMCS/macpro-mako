import { errors as OpensearchErrors } from "@opensearch-project/opensearch";

export type ErrorResponse = {
  statusCode: number;
  body: {
    message?: string;
  };
};

export const handleOpensearchError = (error: unknown): ErrorResponse => {
  console.error({ error });
  if (error instanceof OpensearchErrors.ResponseError) {
    return {
      statusCode: error.statusCode || error.meta?.statusCode || 500,
      body: {
        message: error.body || error.meta?.body,
      },
    };
  }

  return {
    statusCode: 500,
    body: { message: "Internal server error" },
  };
};

export const decorateChangelogAttachments = (changelog: any[]) => {
  const titleMappings: Record<string, string> = {
    "CMS Form 179": "CMS-179 Form",
    // Add more mappings here as needed
  };

  return changelog.map((entry) => {
    if (entry._source?.attachments?.length) {
      entry._source.attachments = entry._source.attachments.map((attachment: any) => {
        const newTitle = titleMappings[attachment.title];
        if (newTitle) {
          return {
            ...attachment,
            title: newTitle,
          };
        }
        return attachment;
      });
    }
    return entry;
  });
};
