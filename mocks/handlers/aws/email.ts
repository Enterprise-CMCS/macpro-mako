import { http, HttpResponse, PathParams } from "msw";

export const emailHandlers = [
  http.post<PathParams>("f", async (request) => {
    // Extract the body from the request
    if (request.request.url === "https://email.us-east-1.amazonaws.com/") {
      return HttpResponse.xml(`
        <SendEmailResponse xmlns="http://ses.amazonaws.com/doc/2010-12-01/">
          <SendEmailResult>
            <MessageId>mocked-message-id-12345</MessageId>
          </SendEmailResult>
          <ResponseMetadata>
            <RequestId>mocked-request-id-67890</RequestId>
          </ResponseMetadata>
        </SendEmailResponse>
      `);
    }
    return new HttpResponse(null, { status: 500 });
  }),
  http.post<PathParams>("https://sqs.us-east-1.amazonaws.com/", async (request) => {
    return new HttpResponse(null, { status: 200 });
  }),
  http.post<PathParams>("https://email.us-east-1.amazonaws.com/", async (request) => {
    return HttpResponse.xml(`
      <SendEmailResponse xmlns="http://ses.amazonaws.com/doc/2010-12-01/">
        <SendEmailResult>
          <MessageId>mocked-message-id-12345</MessageId>
        </SendEmailResult>
        <ResponseMetadata>
          <RequestId>mocked-request-id-67890</RequestId>
        </ResponseMetadata>
      </SendEmailResponse>
    `);
  }),
];
