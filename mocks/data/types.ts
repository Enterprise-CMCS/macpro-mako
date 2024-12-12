export const AUTHORITY_ONE_ID = 1;
export const AUTHORITY_TWO_ID = 2;

export const TYPE_ONE_ID = 1;
export const TYPE_TWO_ID = 2;
export const TYPE_THREE_ID = 3;
export const TYPE_FOUR_ID = 4;

const types = [
  {
    _source: { id: 101, authorityId: AUTHORITY_ONE_ID, name: "typeOne" },
  },
  {
    _source: { id: 102, authorityId: AUTHORITY_ONE_ID, name: "typetwo" },
  },
  {
    _source: { id: 103, authorityId: AUTHORITY_TWO_ID, name: "typethree" },
  },
  {
    _source: { id: 101, authorityId: AUTHORITY_ONE_ID, name: "subtypeOne", typeId: TYPE_ONE_ID },
  },
  {
    _source: { id: 102, authorityId: AUTHORITY_ONE_ID, name: "subtypetwo", typeId: TYPE_TWO_ID },
  },
  {
    _source: {
      id: 103,
      authorityId: AUTHORITY_TWO_ID,
      name: "subtypethree",
      typeId: TYPE_ONE_ID,
    },
  },
  {
    _source: {
      id: 104,
      authorityId: AUTHORITY_TWO_ID,
      name: "subtypethree",
      typeId: TYPE_FOUR_ID,
    },
  },
  {
    _source: {
      id: 105,
      authorityId: AUTHORITY_TWO_ID,
      name: "subtypethree",
      typeId: TYPE_THREE_ID,
    },
  },
];

export default types;
