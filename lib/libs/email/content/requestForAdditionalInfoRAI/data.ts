export const requestForAdditinalIntoFromCMS = {
  body: {
    took: 230,
    errors: false,
    items: [
      {
        update: {
          _index: "rainmain",
          _id: "CO-24-8110",
          _version: 12,
          result: "noop",
          forced_refresh: true,
          _shards: {
            total: 2,
            successful: 2,
            failed: 0,
          },
          _seq_no: 11871,
          _primary_term: 1,
          status: 200,
        },
      },
    ],
  },
  statusCode: 200,
  headers: {
    date: "Sun, 11 Aug 2024 19:41:10 GMT",
    "content-type": "application/json; charset=UTF-8",
    "content-length": "236",
    connection: "keep-alive",
    "access-control-allow-origin": "*",
  },
  meta: {
    context: null,
    request: {
      params: {
        method: "POST",
        path: "/_bulk",
        bulkBody: [
          {
            update: {
              _index: "rainmain",
              _id: "CO-24-8110",
            },
          },
          {
            doc: {
              id: "CO-24-8110",
              flavor: "CHIP",
              actionType: "Amend",
              actionTypeId: 84,
              approvedEffectiveDate: "2024-08-13T00:00:00.000Z",
              description: "This is the description text",
              finalDispositionDate: null,
              leadAnalystOfficerId: 3392,
              initialIntakeNeeded: false,
              leadAnalystName: "Cheryl Brimage",
              authorityId: 124,
              authority: "CHIP SPA",
              types: [
                {
                  SPA_TYPE_ID: 42,
                  SPA_TYPE_NAME: "Application/Enroll",
                },
                {
                  SPA_TYPE_ID: 64,
                  SPA_TYPE_NAME: "Affordable Care Act",
                },
              ],
              subTypes: [
                {
                  TYPE_ID: 311,
                  TYPE_NAME: "ACA-Application Type",
                },
                {
                  TYPE_ID: 419,
                  TYPE_NAME: "MAGI-CHIP",
                },
              ],
              proposedDate: "2024-08-31T00:00:00.000Z",
              raiReceivedDate: "2024-08-23T00:00:00.000Z",
              raiRequestedDate: "2024-08-19T00:00:00.000Z",
              raiWithdrawnDate: null,
              reviewTeam: ["Philip Bailey", "Andrew Badaracco"],
              state: "CO",
              stateStatus: "Under Review",
              statusDate: "2024-08-11T11:51:11.997Z",
              cmsStatus: "Pending",
              seatoolStatus: "Pending",
              submissionDate: "2024-08-12T00:00:00.000Z",
              subject: "This is th subject text",
              secondClock: false,
            },
            doc_as_upsert: true,
          },
        ],
        querystring: "refresh=true",
        body: '{"update":{"_index":"rainmain","_id":"CO-24-8110"}}\n{"doc":{"id":"CO-24-8110","flavor":"CHIP","actionType":"Amend","actionTypeId":84,"approvedEffectiveDate":"2024-08-13T00:00:00.000Z","description":"This is the description text","finalDispositionDate":null,"leadAnalystOfficerId":3392,"initialIntakeNeeded":false,"leadAnalystName":"Cheryl Brimage","authorityId":124,"authority":"CHIP SPA","types":[{"SPA_TYPE_ID":42,"SPA_TYPE_NAME":"Application/Enroll"},{"SPA_TYPE_ID":64,"SPA_TYPE_NAME":"Affordable Care Act"}],"subTypes":[{"TYPE_ID":311,"TYPE_NAME":"ACA-Application Type"},{"TYPE_ID":419,"TYPE_NAME":"MAGI-CHIP"}],"proposedDate":"2024-08-31T00:00:00.000Z","raiReceivedDate":"2024-08-23T00:00:00.000Z","raiRequestedDate":"2024-08-19T00:00:00.000Z","raiWithdrawnDate":null,"reviewTeam":["Philip Bailey","Andrew Badaracco"],"state":"CO","stateStatus":"Under Review","statusDate":"2024-08-11T11:51:11.997Z","cmsStatus":"Pending","seatoolStatus":"Pending","submissionDate":"2024-08-12T00:00:00.000Z","subject":"This is th subject text","secondClock":false},"doc_as_upsert":true}\n',
        headers: {
          "user-agent":
            "opensearch-js/2.11.0 (linux 5.10.219-229.866.amzn2.x86_64-x64; Node.js v18.20.4)",
          "content-type": "application/x-ndjson",
          "content-length": "1076",
        },
        timeout: 30000,
      },
      options: {},
      id: 4,
    },
    name: "opensearch-js",
    connection: {
      url: "https://vpc-opensearchdomai-rzzjuyi48nzc-wp5em7c73qkotfxn3vjnsep6em.us-east-1.es.amazonaws.com/",
      id: "https://vpc-opensearchdomai-rzzjuyi48nzc-wp5em7c73qkotfxn3vjnsep6em.us-east-1.es.amazonaws.com/",
      headers: {},
      deadCount: 0,
      resurrectTimeout: 0,
      _openRequests: 0,
      status: "alive",
      roles: {
        data: true,
        ingest: true,
      },
    },
    attempts: 0,
    aborted: false,
  },
};
