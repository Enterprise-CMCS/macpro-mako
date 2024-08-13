//////
// {
//   eventSource: 'SelfManagedKafka',
//   bootstrapServers: 'b-1.master-msk.zf7e0q.c7.kafka.us-east-1.amazonaws.com:9094,b-2.master-msk.zf7e0q.c7.kafka.us-east-1.amazonaws.com:9094,b-3.master-msk.zf7e0q.c7.kafka.us-east-1.amazonaws.com:9094',
//   records: { 'aws.seatool.ksql.onemac.agg.State_Plan-0': [ [Object] ] }
// }

/////
// {
//   eventSource: 'SelfManagedKafka',
//   bootstrapServers: 'b-1.master-msk.zf7e0q.c7.kafka.us-east-1.amazonaws.com:9094,b-2.master-msk.zf7e0q.c7.kafka.us-east-1.amazonaws.com:9094,b-3.master-msk.zf7e0q.c7.kafka.us-east-1.amazonaws.com:9094',
//   records: 'too large to display'
// }

//// actualevent

export const widthdrawAsCmsUser = {
  body: {
    took: 15,
    errors: false,
    items: [
      {
        update: {
          _index: "rainmain",
          _id: "CO-24-1901",
          _version: 11,
          result: "noop",
          forced_refresh: true,
          _shards: {
            total: 2,
            successful: 2,
            failed: 0,
          },
          _seq_no: 12425,
          _primary_term: 1,
          status: 200,
        },
      },
    ],
  },
  statusCode: 200,
  headers: {
    date: "Sun, 11 Aug 2024 19:59:35 GMT",
    "content-type": "application/json; charset=UTF-8",
    "content-length": "235",
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
              _id: "CO-24-1901",
            },
          },
          {
            doc: {
              id: "CO-24-1901",
              flavor: "MEDICAID",
              approvedEffectiveDate: null,
              description: "asdf",
              finalDispositionDate: "2024-08-11T00:00:00.000Z",
              leadAnalystOfficerId: 3716,
              initialIntakeNeeded: false,
              leadAnalystName: "Shante Abarabar",
              authorityId: 125,
              authority: "Medicaid SPA",
              types: [
                {
                  SPA_TYPE_ID: 95,
                  SPA_TYPE_NAME: "1915(k) – Community First Choice",
                },
                {
                  SPA_TYPE_ID: 96,
                  SPA_TYPE_NAME: "1915(l) – Support Act IMD Coverage",
                },
                {
                  SPA_TYPE_ID: 104,
                  SPA_TYPE_NAME: "1932(a) Managed Care",
                },
                {
                  SPA_TYPE_ID: 106,
                  SPA_TYPE_NAME: "Cost Sharing & Premiums",
                },
              ],
              subTypes: [
                {
                  TYPE_ID: 782,
                  TYPE_NAME: "Copays/Deductibles/Coinsurance",
                },
                {
                  TYPE_ID: 963,
                  TYPE_NAME: "Concurrent 1115",
                },
                {
                  TYPE_ID: 975,
                  TYPE_NAME: "Concurrent 1915(b)",
                },
              ],
              proposedDate: "2024-02-13T00:00:00.000Z",
              raiReceivedDate: null,
              raiRequestedDate: null,
              raiWithdrawnDate: null,
              reviewTeam: [],
              state: "CO",
              stateStatus: "Package Withdrawn",
              statusDate: "2024-08-11T00:00:00.000Z",
              cmsStatus: "Package Withdrawn",
              seatoolStatus: "Withdrawn",
              submissionDate: "2024-02-09T00:00:00.000Z",
              subject: "asdf",
              secondClock: false,
              raiWithdrawEnabled: false,
            },
            doc_as_upsert: true,
          },
        ],
        querystring: "refresh=true",
        body: '{"update":{"_index":"rainmain","_id":"CO-24-1901"}}\n{"doc":{"id":"CO-24-1901","flavor":"MEDICAID","approvedEffectiveDate":null,"description":"asdf","finalDispositionDate":"2024-08-11T00:00:00.000Z","leadAnalystOfficerId":3716,"initialIntakeNeeded":false,"leadAnalystName":"Shante Abarabar","authorityId":125,"authority":"Medicaid SPA","types":[{"SPA_TYPE_ID":95,"SPA_TYPE_NAME":"1915(k) – Community First Choice"},{"SPA_TYPE_ID":96,"SPA_TYPE_NAME":"1915(l) – Support Act IMD Coverage"},{"SPA_TYPE_ID":104,"SPA_TYPE_NAME":"1932(a) Managed Care"},{"SPA_TYPE_ID":106,"SPA_TYPE_NAME":"Cost Sharing & Premiums"}],"subTypes":[{"TYPE_ID":782,"TYPE_NAME":"Copays/Deductibles/Coinsurance"},{"TYPE_ID":963,"TYPE_NAME":"Concurrent 1115"},{"TYPE_ID":975,"TYPE_NAME":"Concurrent 1915(b)"}],"proposedDate":"2024-02-13T00:00:00.000Z","raiReceivedDate":null,"raiRequestedDate":null,"raiWithdrawnDate":null,"reviewTeam":[],"state":"CO","stateStatus":"Package Withdrawn","statusDate":"2024-08-11T00:00:00.000Z","cmsStatus":"Package Withdrawn","seatoolStatus":"Withdrawn","submissionDate":"2024-02-09T00:00:00.000Z","subject":"asdf","secondClock":false,"raiWithdrawEnabled":false},"doc_as_upsert":true}\n',
        headers: {
          "user-agent":
            "opensearch-js/2.11.0 (linux 5.10.219-229.866.amzn2.x86_64-x64; Node.js v18.20.4)",
          "content-type": "application/x-ndjson",
          "content-length": "1188",
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
