export const CHIP_SPA_AUTHORITY_ID = 124;
export const MEDICAID_SPA_AUTHORITY_ID = 125;
export const NOT_FOUND_AUTHORITY_ID = 10;
export const ERROR_AUTHORITY_ID = "throw error";

export const TYPE_ONE_ID = 1;
export const TYPE_TWO_ID = 2;
export const TYPE_THREE_ID = 3;
export const DO_NOT_USE_TYPE_ID = 4;

export const medicaidTypes = [
  {
    _source: {
      id: TYPE_ONE_ID,
      authorityId: MEDICAID_SPA_AUTHORITY_ID,
      name: "Type One",
    },
  },
  {
    _source: {
      id: TYPE_TWO_ID,
      authorityId: MEDICAID_SPA_AUTHORITY_ID,
      name: "Type Two",
    },
  },
];

export const chipTypes = [
  {
    _source: {
      id: TYPE_THREE_ID,
      authorityId: CHIP_SPA_AUTHORITY_ID,
      name: "Type Three",
    },
  },
];

export const types = [
  ...medicaidTypes,
  ...chipTypes,
  {
    _source: {
      id: DO_NOT_USE_TYPE_ID,
      authorityId: CHIP_SPA_AUTHORITY_ID,
      name: "Do Not Use Type Four",
    },
  },
];

export const medicaidSubtypes = [
  {
    _source: {
      id: 4,
      authorityId: MEDICAID_SPA_AUTHORITY_ID,
      name: "Sub Type Four",
      typeId: TYPE_ONE_ID,
    },
  },
  {
    _source: {
      id: 5,
      authorityId: MEDICAID_SPA_AUTHORITY_ID,
      name: "Sub Type Five",
      typeId: TYPE_TWO_ID,
    },
  },
];

export const chipSubtypes = [
  {
    _source: {
      id: 6,
      authorityId: CHIP_SPA_AUTHORITY_ID,
      name: "Sub Type Six",
      typeId: TYPE_THREE_ID,
    },
  },
  {
    _source: {
      id: 7,
      authorityId: CHIP_SPA_AUTHORITY_ID,
      name: "Sub Type Seven",
      typeId: TYPE_THREE_ID,
    },
  },
];

export const subtypes = [
  ...medicaidSubtypes,
  ...chipSubtypes,
  {
    _source: {
      id: 8,
      authorityId: CHIP_SPA_AUTHORITY_ID,
      name: "Do Not Use Sub Type Eight",
      typeId: DO_NOT_USE_TYPE_ID,
    },
  },
];
