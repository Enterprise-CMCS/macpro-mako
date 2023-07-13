import { Client, Connection } from "@opensearch-project/opensearch";
import { defaultProvider } from "@aws-sdk/credential-provider-node";
import * as aws4 from "aws4";
import { OutgoingHttpHeader } from 'http';
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

export async function search(host:string, index:string, params:{stateCode:string}){
  client = client || (await getClient(host));

  try {
    const query = {
      query: {
        match: {
          "seatool.STATE_CODE": {
            query: params.stateCode,
          },
        },
      },
    };
    
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