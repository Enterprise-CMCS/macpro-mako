import { getOsData } from "./useSearch";

export const itemExists = async (id: string): Promise<boolean> => {
  const data = await getOsData({
    pagination: {
      number: 0,
      size: 100,
    },
    index: "main",
    filters: [
      {
        type: "term",
        field: "id.keyword",
        value: id,
        prefix: "must",
        options: {
          case_insensitive: true,
        },
      },
    ],
  });
  return !!data.hits.hits;
};
