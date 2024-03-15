import { Client, Connection } from "@opensearch-project/opensearch";
import { defaultProvider } from "@aws-sdk/credential-provider-node";
import * as aws4 from "aws4";
import axios from "axios";
import { aws4Interceptor } from "aws4-axios";
import { STSClient, AssumeRoleCommand } from "@aws-sdk/client-sts";
import { opensearch } from "shared-types";
import { errors as OpensearchErrors } from "@opensearch-project/opensearch";

let client: Client;

export async function getClient(host: string) {
  return new Client({
    ...createAwsConnector(await defaultProvider()()),
    node: host,
  });
}

function createAwsConnector(credentials: any) {
  class AmazonConnection extends Connection {
    buildRequestObject(params: any) {
      const request = super.buildRequestObject(params);
      request.headers = request.headers || {};
      request.headers["host"] = request.hostname ?? undefined;

      return aws4.sign(<any>request, credentials);
    }
  }
  return {
    Connection: AmazonConnection,
  };
}

export async function updateData(host: string, indexObject: any) {
  client = client || (await getClient(host));
  // Add a document to the index.
  var response = await client.update(indexObject);
}

export async function bulkUpdateData(
  host: string,
  index: opensearch.Index,
  arrayOfDocuments: any,
  maxRetries = 5, // Maximum number of retries
  retryDelay = 1000 // Initial delay in milliseconds
) {
  if (arrayOfDocuments.length === 0) {
    console.log("No documents to update. Skipping bulk update operation.");
    return;
  }

  client = client || (await getClient(host));

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await client.helpers.bulk({
        datasource: arrayOfDocuments,
        onDocument(doc: any) {
          return [
            { update: { _index: index, _id: doc.id } },
            { doc_as_upsert: true },
          ];
        },
      });
      console.log(response);
      break; // Break the loop if the request was successful
    } catch (error) {
      if (
        error instanceof OpensearchErrors.ResponseError &&
        error.statusCode === 429
      ) {
        // Handle the 429 error
        console.log(
          `Received 429 error, attempt ${attempt} of ${maxRetries}. Retrying after ${retryDelay}ms...`
        );
        // Wait for the specified delay before retrying
        await new Promise((resolve) => setTimeout(resolve, retryDelay));
        // Increase the delay for the next retry (exponential backoff)
        retryDelay *= 2;
      } else {
        // Throw if the error is not a 429 or if we've reached the maximum number of retries
        console.error("Error updating documents:", error);
        throw error;
      }
    }
  }
}

export async function deleteIndex(host: string, index: opensearch.Index) {
  client = client || (await getClient(host));
  try {
    await client.indices.delete({ index });
  } catch (error) {
    if (
      error instanceof OpensearchErrors.ResponseError &&
      error.message.includes("index_not_found_exception")
    ) {
      console.log(`Index ${index} not found.  Continuing...`);
    } else {
      throw error;
    }
  }
}

export async function mapRole(
  host: string,
  masterRoleToAssume: string,
  osRoleName: string,
  iamRoleName: string
) {
  try {
    const sts = new STSClient({
      region: process.env.region,
    });
    const assumedRoleCommandData = await sts.send(
      new AssumeRoleCommand({
        RoleArn: masterRoleToAssume,
        RoleSessionName: "RoleMappingSession",
        ExternalId: "foo",
      })
    );
    const interceptor = aws4Interceptor({
      options: {
        region: process.env.region,
      },
      credentials: {
        accessKeyId: assumedRoleCommandData?.Credentials?.AccessKeyId || "",
        secretAccessKey:
          assumedRoleCommandData?.Credentials?.SecretAccessKey || "",
        sessionToken: assumedRoleCommandData?.Credentials?.SessionToken,
      },
    });
    axios.interceptors.request.use(interceptor);
    const patchResponse = await axios.patch(
      `${host}/_plugins/_security/api/rolesmapping/${osRoleName}`,
      [
        {
          op: "add",
          path: "/and_backend_roles",
          value: [iamRoleName],
        },
      ]
    );
    return patchResponse.data;
  } catch (error) {
    console.error("Error making PUT request:", error);
    throw error;
  }
}

export async function search(
  host: string,
  index: opensearch.Index,
  query: any
) {
  client = client || (await getClient(host));
  try {
    const response = await client.search({
      index: index,
      body: query,
    });
    return response.body;
  } catch (e) {
    console.log({ e });
  }
}

export async function getItem(
  host: string,
  index: opensearch.Index,
  id: string
) {
  client = client || (await getClient(host));
  try {
    const response = await client.get({ id, index });
    return response.body;
  } catch (e) {
    console.log({ e });
  }
}

// check it exists - then create
export async function createIndex(host: string, index: opensearch.Index) {
  client = client || (await getClient(host));
  try {
    const exists = await client.indices.exists({ index });
    if (!!exists.body) return;

    await client.indices.create({ index });
  } catch (error) {
    console.error("Error creating index:", error);
    throw error;
  }
}

export async function updateFieldMapping(
  host: string,
  index: opensearch.Index,
  properties: object
) {
  client = client || (await getClient(host));
  try {
    const response = await client.indices.putMapping({
      index: index,
      body: {
        properties,
      },
    });

    console.log("Field mapping updated:", response);
  } catch (error) {
    console.error("Error updating field mapping:", error);
    throw error;
  }
}
