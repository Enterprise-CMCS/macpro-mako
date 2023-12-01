import { Client, Connection, ApiResponse } from "@opensearch-project/opensearch";
import { defaultProvider } from "@aws-sdk/credential-provider-node";
import * as aws4 from "aws4";
import { OutgoingHttpHeader } from 'http';
import axios from 'axios';
import { aws4Interceptor } from "aws4-axios";
import { STSClient, AssumeRoleCommand } from "@aws-sdk/client-sts";
let client:Client;

export async function getClient(host:string) {
  return new Client({
    ...createAwsConnector((await defaultProvider()())),
    node: host,
  });
}

function createAwsConnector(credentials: any) {
  class AmazonConnection extends Connection {
    buildRequestObject(params: any) {
      const request = super.buildRequestObject(params);
      request.headers = request.headers || {};
      request.headers["host"] = <OutgoingHttpHeader>request.hostname;

      return aws4.sign(<any>request, credentials);
    }
  }
  return {
    Connection: AmazonConnection,
  };
}

export async function updateData(host:string, indexObject:any) {
  client = client || (await getClient(host));
  // Add a document to the index. 
  var response = await client.update(indexObject);
}

export async function bulkUpdateData(host:string, index:string, arrayOfDocuments:any) {
  client = client || (await getClient(host));
  var response = await client.helpers.bulk({
    datasource: arrayOfDocuments,
    onDocument (doc:any) {
      // The update operation always requires a tuple to be returned, with the
      // first element being the action and the second being the update options.
      return [
        {
          update: { _index: index, _id: doc.id }
        },
        { doc_as_upsert: true }
      ]
    }
  });
  console.log(response);
}

export async function deleteIndex(host:string, index:string) {
  client = client || (await getClient(host));
  var response = await client.indices.delete({index});
}

export async function mapRole(host:string, masterRoleToAssume:string, osRoleName:string, iamRoleName: string) {
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
        secretAccessKey: assumedRoleCommandData?.Credentials?.SecretAccessKey || "",
        sessionToken: assumedRoleCommandData?.Credentials?.SessionToken,
      },
    });
    axios.interceptors.request.use(interceptor);
    const patchResponse = await axios.patch(`${host}/_plugins/_security/api/rolesmapping/${osRoleName}`, [
      {
        op: "add",
        path: "/and_backend_roles",
        value: [iamRoleName]
      }

    ]);
    return patchResponse.data;
  } catch (error) {
    console.error('Error making PUT request:', error);
    throw error;
  }
}

export async function search(host:string, index:string, query:any){
  client = client || (await getClient(host));
  try {
    const response = await client.search({
      index: index,
      body: query,
    });
    return response.body;
  } catch(e) {
    console.log({e})
  }
}

export async function getItem(host:string, index:string, id:string){
  client = client || (await getClient(host));
  try {
    const response = await client.get({id, index})
    return response.body;
  } catch(e) {
    console.log({e})
  }
}

export async function indexExists(host:string, index:string) {
  client = client || (await getClient(host));
  try {
      const indexExists = await client.indices.exists({ index, });
      if (indexExists.body) {
          return true;
      } else {
          return false;
      }
  } catch (error) {
      console.error('Error creating index:', error);
      throw error;
  }
}

export async function createIndex(host:string, index:string) {
  client = client || (await getClient(host));
  try {
    const createResponse = await client.indices.create({
        index,
    });
  } catch (error) {
      console.error('Error creating index:', error);
      throw error;
  }
}

export async function updateFieldMapping(host:string, index:string, properties: object) {
  client = client || (await getClient(host));
  try {
      const response = await client.indices.putMapping({
          index: index,
          body: {
              properties,
          },
      });

      console.log('Field mapping updated:', response);
  } catch (error) {
      console.error('Error updating field mapping:', error);
      throw error;
  }
}