import { http, HttpResponse } from "msw";
import exports from "../../data/cloudFormationsExports";

export const errorCloudFormationHandler = http.post(
  `https://cloudformation.us-east-1.amazonaws.com/`,
  async () =>
    HttpResponse.xml(
      `
<Error>
  <Code>ServiceUnavailable</Code>
  <Message>Service is unable to handle request.</Message>
</Error>
    `,
      {
        status: 503,
        statusText: "ServiceUnavailable",
      },
    )
);

const defaultCloudFormationHandler = http.post(
  `https://cloudformation.us-east-1.amazonaws.com/`,
  async () => {
    let xmlResponse = `
  <ListExportsResponse xmlns="http://cloudformation.amazonaws.com/doc/2010-05-15/">
  <ListExportsResult>
    <Exports>
  `;

    xmlResponse += exports
      .map(
        (val) => `
      <member>
        <Name>${val.Name}</Name>
        <ExportingStackId>${val.ExportingStackId}</ExportingStackId>
        <Value>${val.Value}</Value>
      </member>
      `,
      )
      .join();

    xmlResponse += `
    </Exports>
  </ListExportsResult>
  <ResponseMetadata>
    <RequestId>5ccc7dcd-744c-11e5-be70-1b08c228efb3</RequestId>
  </ResponseMetadata>
</ListExportsResponse>`;

    return HttpResponse.xml(xmlResponse);
  },
);

export const cloudFormationHandlers = [defaultCloudFormationHandler];
