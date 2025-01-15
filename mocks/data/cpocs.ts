import { TestCpocsItemResult } from "../index.d";

export const MUHAMMAD_BASHAR_ID = 100;
export const ELTON_BEATTY_ID = 101;
export const JEDIDIAH_HAYES_ID = 102;
export const MARSHALL_HENDERSON_ID = 103;
export const BRIDGET_HERMANN_ID = 104;
export const MAGGIE_LOWENSTEIN_ID = 105;
export const THOMAS_MANN_ID = 106;
export const DESIREE_MAYER_ID = 107;
export const WINSTON_OCONNOR_ID = 108;
export const MACY_TREMBLAY_ID = 109;

const cpocs: Record<number, TestCpocsItemResult> = {
  [MUHAMMAD_BASHAR_ID]: {
    _id: `${MUHAMMAD_BASHAR_ID}`,
    _source: {
      id: MUHAMMAD_BASHAR_ID,
      firstName: "Muhammad",
      lastName: "Bashar",
      email: "muhammad.bashar@example.com",
    },
  },
  [ELTON_BEATTY_ID]: {
    _id: `${ELTON_BEATTY_ID}`,
    _source: {
      id: ELTON_BEATTY_ID,
      firstName: "Elton",
      lastName: "Beatty",
      email: "elton.beatty@example.com",
    },
  },
  [JEDIDIAH_HAYES_ID]: {
    _id: `${JEDIDIAH_HAYES_ID}`,
    _source: {
      id: JEDIDIAH_HAYES_ID,
      firstName: "Jedidiah",
      lastName: "Hayes",
      email: "jedidiah.hayes@example.com",
    },
  },
  [MARSHALL_HENDERSON_ID]: {
    _id: `${MARSHALL_HENDERSON_ID}`,
    _source: {
      id: MARSHALL_HENDERSON_ID,
      firstName: "Marshall",
      lastName: "Henderson",
      email: "marshall.henderson@example.com",
    },
  },
  [BRIDGET_HERMANN_ID]: {
    _id: `${BRIDGET_HERMANN_ID}`,
    _source: {
      id: BRIDGET_HERMANN_ID,
      firstName: "Bridget",
      lastName: "Hermann",
      email: "bridget.hermann@example.com",
    },
  },
  [MAGGIE_LOWENSTEIN_ID]: {
    _id: `${MAGGIE_LOWENSTEIN_ID}`,
    _source: {
      id: MAGGIE_LOWENSTEIN_ID,
      firstName: "Maggie",
      lastName: "Lowenstein",
      email: "maggie.lowenstein@example.com",
    },
  },
  [THOMAS_MANN_ID]: {
    _id: `${THOMAS_MANN_ID}`,
    _source: {
      id: THOMAS_MANN_ID,
      firstName: "Thomas",
      lastName: "Mann",
      email: "thomas.mann@example.com",
    },
  },
  [DESIREE_MAYER_ID]: {
    _id: `${DESIREE_MAYER_ID}`,
    _source: {
      id: DESIREE_MAYER_ID,
      firstName: "Desiree",
      lastName: "Mayer",
      email: "desiree.mayer@example.com",
    },
  },
  [WINSTON_OCONNOR_ID]: {
    _id: `${WINSTON_OCONNOR_ID}`,
    _source: {
      id: WINSTON_OCONNOR_ID,
      firstName: "Winston",
      lastName: "O'Connor",
      email: "winston.oconnor@example.com",
    },
  },
  [MACY_TREMBLAY_ID]: {
    _id: `${MACY_TREMBLAY_ID}`,
    _source: {
      id: MACY_TREMBLAY_ID,
      firstName: "Macy",
      lastName: "Tremblay",
      email: "macy.tremblay@example.com",
    },
  },
};

export default cpocs;

export const cpocsList = Object.values(cpocs);
