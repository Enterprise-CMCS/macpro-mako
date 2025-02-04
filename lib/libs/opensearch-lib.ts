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

export interface OpenSearchCredentials {
  accessKeyId: string;
  secretAccessKey: string;
  sessionToken?: string;
}

export interface OpenSearchRequest extends Omit<aws4.Request, "port"> {
  method?: string;
  path?: string;
  body?: any;
  querystring?: any;
  headers?: { [key: string]: string | string[] | number | undefined };
  hostname?: string;
  region?: string;
  service?: string;
  port?: number;
}

export interface OpenSearchError {
  message: string;
  statusCode?: number;
  meta?: {
    statusCode: number;
  };
  stack?: string;
}

export interface OpenSearchQuery {
  query?: {
    bool?: {
      must?: any[];
      must_not?: any[];
      should?: any[];
      filter?: any[];
    };
  };
  from?: number;
  size?: number;
  sort?: Array<Record<string, { order: "asc" | "desc" }>>;
  timeout?: string;
}

export interface OpenSearchUpdateParams {
  index: string;
  id: string;
  body: {
    doc: Record<string, any>;
    doc_as_upsert?: boolean;
  };
}

export async function getClient(host: string): Promise<Client> {
  return new Client({
    ...createAwsConnector(await defaultProvider()()),
    node: host,
  });
}

function createAwsConnector(credentials: OpenSearchCredentials) {
  class AmazonConnection extends Connection {
    buildRequestObject(params: OpenSearchRequest): OpenSearchRequest {
      const request = super.buildRequestObject(params);
      request.headers = request.headers || {};
      request.headers["host"] = request.hostname ?? undefined;
      if (typeof request.port === "string") {
        request.port = parseInt(request.port, 10);
      }
      if (request.port === null) {
        delete request.port;
      }

      const signedRequest = aws4.sign(request as aws4.Request, credentials);
      return signedRequest as OpenSearchRequest;
    }
  }
  return {
    Connection: AmazonConnection,
  };
}

export async function updateData(host: string, indexObject: OpenSearchUpdateParams): Promise<void> {
  client = client || (await getClient(host));
  await client.update(indexObject);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export interface OpenSearchDocument {
  id: string;
  delete?: boolean;
  [key: string]: any;
}

export interface BulkResponse {
  body: {
    errors: boolean;
    items: Array<{
      update?: { status: number; error?: any };
      delete?: { status: number; error?: any };
    }>;
  };
}

export interface SearchResponse<T = any> {
  body: {
    hits: {
      total: { value: number };
      hits: Array<{
        _id: string;
        _source: T;
      }>;
    };
  };
}

export async function bulkUpdateData(
  host: string,
  index: string,
  arrayOfDocuments: OpenSearchDocument[],
): Promise<void> {
  if (arrayOfDocuments.length === 0) {
    console.log("No documents to update. Skipping bulk update operation.");
    return;
  }

  client = client || (await getClient(host));

  const chunkSize = 500;
  const chunks = [];
  for (let i = 0; i < arrayOfDocuments.length; i += chunkSize) {
    chunks.push(arrayOfDocuments.slice(i, i + chunkSize));
  }

  for (const chunk of chunks) {
    const body: any[] = [];
    for (const doc of chunk) {
      if (doc.delete) {
        body.push({ delete: { _index: index, _id: doc.id } });
      } else {
        body.push({ update: { _index: index, _id: doc.id } }, { doc: doc, doc_as_upsert: true });
      }
    }

    async function attemptBulkUpdate(retries: number = 5, delay: number = 1000): Promise<void> {
      try {
        const response = await client.bulk({
          refresh: true,
          body: body,
          timeout: "30s",
        });

        if (response.body.errors) {
          const hasRateLimitErrors = response.body.items.some(
            (item: any) => item.update?.status === 429 || item.delete?.status === 429,
          );

          if (hasRateLimitErrors && retries > 0) {
            console.log(`Rate limit exceeded, retrying in ${delay}ms...`);
            await sleep(delay);
            return attemptBulkUpdate(retries - 1, delay * 2);
          } else {
            const errorItems = response.body.items.filter(
              (item: any) => item.update?.error || item.delete?.error,
            );
            console.error("Bulk update errors:", JSON.stringify(errorItems, null, 2));
            throw new Error("Bulk update had errors: " + JSON.stringify(errorItems));
          }
        } else {
          console.log(`Bulk update successful for ${chunk.length} documents.`);
        }
      } catch (error: any) {
        if ((error.statusCode === 429 || error.message?.includes("429")) && retries > 0) {
          console.log(`Rate limit exceeded, retrying in ${delay}ms...`, error.message);
          await sleep(delay);
          return attemptBulkUpdate(retries - 1, delay * 2);
        } else {
          console.error("Bulk update error:", {
            message: error.message,
            statusCode: error.statusCode,
            stack: error.stack,
          });
          throw error;
        }
      }
    }

    await attemptBulkUpdate();
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
    if (!item || item.found === false || !item._source) {
      return undefined;
    }
    return {
      _id: id,
      _index: index,
      _source: item._source,
      found: true,
      _score: 1,
      sort: [1],
    };
  } catch (error) {
    if (
      (error instanceof OpensearchErrors.ResponseError && error.statusCode === 404) ||
      error.meta?.statusCode === 404
    ) {
      return undefined;
    }
    throw error;
  }
}

export async function getItemAndThrowAllErrors(
  host: string,
  index: opensearch.Index,
  id: string,
): Promise<ItemResult | undefined> {
  client = client || (await getClient(host));
  const response = await client.get({ id, index });
  const item = decodeUtf8(response).body;
  if (item.found === false || !item._source) {
    return undefined;
  }
  return item;
}

export async function getItems(ids: string[]): Promise<OSDocument[]> {
  if (!ids.length) return [];
  try {
    const { domain, index } = getDomainAndNamespace("main");
    if (!domain || !index) throw new Error("Missing domain or index");

    client = client || (await getClient(domain));

    const response = await client.mget<{ docs: ItemResult[] }>({
      index,
      body: {
        ids,
      },
    });

    if (!response?.body?.docs) {
      console.error("Invalid response format from OpenSearch");
      return [];
    }

    return response.body.docs
      .filter((doc) => doc && doc.found && doc._source)
      .map((doc) => doc._source as OSDocument);
  } catch (e) {
    console.error("Error fetching items:", e);
    return [];
  }
}

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
      return decodeURIComponent(data);
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
