import { Client, Connection } from "@opensearch-project/opensearch";
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
  console.log(response.body);
}

export async function deleteIndex(host:string, index:string) {
  client = client || (await getClient(host));
  var response = await client.indices.delete({index});
  console.log(response);
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
    console.log(patchResponse.data);
    return patchResponse.data;
  } catch (error) {
    console.error('Error making PUT request:', error);
    throw error;
  }
}

export async function search(host:string, index:string, params:{stateCode:string, searchString:string}){
  client = client || (await getClient(host));

  try {
    // const query = {
    //   query: {
    //     match: {
    //       "seatool.STATE_CODE": {
    //         query: params.stateCode,
    //       },
    //     },
    //     // contains: {
    //     //   "seatool.STATE_PLAN.STATUS_MEMO": {
    //     //     query: params.searchString,
    //     //   }
    //     // }
    //   },
    // };
    
    const query = {
      query: {
        bool: {
          must: [
            {
              match: {
                "seatool.STATE_CODE": params.stateCode
              }
            },
          ],
          should: [
            {
              match: {
                "seatool.STATE_PLAN.SUMMARY_MEMO": params.searchString
              }
            }
          ]
        }
      }
    }
    const response = await client.search({
      index: index,
      body: query,
    });
          
    console.log(response.body.hits);
    return response.body.hits;
  } catch(e) {
    console.log({e})
  }
}