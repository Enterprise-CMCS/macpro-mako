import { AssumeRoleCommand, STSClient } from "@aws-sdk/client-sts";
import { defaultProvider } from "@aws-sdk/credential-provider-node";
import { Client, Connection, errors as OpensearchErrors } from "@opensearch-project/opensearch";
import * as aws4 from "aws4";
import { aws4Interceptor } from "aws4-axios";
import axios from "axios";
import { ItemResult, Document as OSDocument } from "shared-types/opensearch/main";
import { opensearch } from "shared-types";
import { getDomainAndNamespace } from "./utils";

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
      // request.headers["Content-Type"] = "application/json; charset=UTF-8"; // Ensure Content-Type header is set

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
  await client.update(indexObject);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

interface Document {
  id: string;
  [key: string]: any;
}

export async function bulkUpdateData(
  host: string,
  index: string,
  arrayOfDocuments: Document[],
): Promise<void> {
  if (arrayOfDocuments.length === 0) {
    console.log("No documents to update. Skipping bulk update operation.");
    return;
  }

  client = client || (await getClient(host));

  const body: any[] = [];
  for (const doc of arrayOfDocuments) {
    if (doc.delete) {
      body.push({ delete: { _index: index, _id: doc.id } });
    } else {
      body.push({ update: { _index: index, _id: doc.id } }, { doc: doc, doc_as_upsert: true });
    }
  }

  async function attemptBulkUpdate(retries: number = 5, delay: number = 1000): Promise<void> {
    try {
      const response = await client.bulk({ refresh: true, body: body });
      if (response.body.errors) {
        // Check for 429 status within response errors
        const hasRateLimitErrors = response.body.items.some(
          (item: any) => item.update.status === 429,
        );

        if (hasRateLimitErrors && retries > 0) {
          console.log(`Rate limit exceeded, retrying in ${delay}ms...`);
          await sleep(delay);
          return attemptBulkUpdate(retries - 1, delay * 2); // Exponential backoff
        } else if (!hasRateLimitErrors) {
          // Handle or throw other errors normally
          console.error("Bulk update errors:", JSON.stringify(response.body.items, null, 2));
          throw "ERROR:  Bulk update had an error that was not rate related.";
        }
      } else {
        console.log("Bulk update successful.");
      }
    } catch (error: any) {
      if (error.statusCode === 429 && retries > 0) {
        console.log(`Rate limit exceeded, retrying in ${delay}ms...`, error.message);
        await sleep(delay);
        return attemptBulkUpdate(retries - 1, delay * 2); // Exponential backoff
      } else {
        console.error("An error occurred:", error);
        throw error;
      }
    }
  }

  await attemptBulkUpdate();
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
  iamRoleName: string,
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
      }),
    );
    const interceptor = aws4Interceptor({
      options: {
        region: process.env.region,
      },
      credentials: {
        accessKeyId: assumedRoleCommandData?.Credentials?.AccessKeyId || "",
        secretAccessKey: assumedRoleCommandData?.Credentials?.SecretAccessKey || "",
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
      ],
    );
    return decodeUtf8(patchResponse.data);
  } catch (error) {
    console.error("Error making PUT request:", error);
    throw error;
  }
}

export async function search(host: string, index: opensearch.Index, query: any) {
  client = client || (await getClient(host));
  const response = await client.search({
    index: index,
    body: query,
  });
  return decodeUtf8(response).body;
}

export async function getItem(
  host: string,
  index: opensearch.Index,
  id: string,
): Promise<ItemResult | undefined> {
  try {
    client = client || (await getClient(host));
    const response = await client.get({ id, index });
    const item = decodeUtf8(response).body;
    if (item.found === false || !item._source) {
      return undefined;
    }
    return item;
  } catch (error) {
    if (
      (error instanceof OpensearchErrors.ResponseError && error.statusCode === 404) ||
      error.meta?.statusCode === 404
    ) {
      console.log("Error (404) retrieving in OpenSearch:", error);
      return undefined;
    }
    throw error;
  }
}

export async function getItems(ids: string[]): Promise<OSDocument[]> {
  try {
    const { domain, index } = getDomainAndNamespace("main");

    client = client || (await getClient(domain));

    const response = await client.mget<{ docs: ItemResult[] }>({
      index,
      body: {
        ids,
      },
    });

    return response.body.docs.reduce<OSDocument[]>((acc, doc) => {
      if (doc && doc.found && doc._source) {
        return acc.concat(doc._source);
      } else {
        console.error(`Document with ID ${doc._id} not found.`);
        return acc;
      }
    }, []);
  } catch (e) {
    console.log({ e });
    return [];
  }
}

// check it exists - then create
export async function createIndex(host: string, index: opensearch.Index) {
  client = client || (await getClient(host));
  try {
    const exists = await client.indices.exists({ index });
    if (exists.body) return;

    await client.indices.create({ index });
  } catch (error) {
    console.error("Error creating index:", error);
    throw error;
  }
}

export async function updateFieldMapping(
  host: string,
  index: opensearch.Index,
  properties: object,
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

export function decodeUtf8(data: any): any {
  if (typeof data === "string") {
    try {
      return decodeURIComponent(escape(data));
    } catch {
      return data;
    }
  }
  if (Array.isArray(data)) {
    return data.map((item) => decodeUtf8(item));
  }
  if (typeof data === "object" && data !== null) {
    return Object.keys(data).reduce((acc, key) => {
      acc[key] = decodeUtf8(data[key]);
      return acc;
    }, {} as any);
  }
  return data;
}
