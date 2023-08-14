import { SeaToolTransform } from "./seatool";
import { OneMacTransform } from "./onemac";

type OpenSearchSource<TSource> = {
  hits: {
    _index: string;
    _id: string;
    _score: number;
    _source: TSource;
  }[];
  total: number;
};

export type OSSearch = OpenSearchSource<OneMacTransform & SeaToolTransform>;

// {
//   "_shards": {
//     "total": 5,
//     "failed": 0,
//     "successful": 5,
//     "skipped": 0
//   },
//   "hits": {
//     "hits": [{
//         "_index": "accounts",
//         "_type": "account",
//         "_source": {
//           "firstname": "Nanette",
//           "age": 28,
//           "lastname": "Bates"
//         },
//         "_id": "13",
//         "sort": [
//           28
//         ],
//         "_score": null
//       },
//       {
//         "_index": "accounts",
//         "_type": "account",
//         "_source": {
//           "firstname": "Amber",
//           "age": 32,
//           "lastname": "Duke"
//         },
//         "_id": "1",
//         "sort": [
//           32
//         ],
//         "_score": null
//       }
//     ],
//     "total": {
//       "value": 4,
//       "relation": "eq"
//     },
//     "max_score": null
//   },
//   "took": 100,
//   "timed_out": false
// }
