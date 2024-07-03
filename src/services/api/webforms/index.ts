import * as ABP1 from "./ABP1";
import * as ABP2A from "./ABP2A";
import * as ABP2C from "./ABP2C";
import * as ABP2B from "./ABP2B";
import * as ABP3 from "./ABP3";
import * as ABP3_1 from "./ABP3_1";
import * as ABP4 from "./ABP4";
import * as ABP5 from "./ABP5";
import * as ABP6 from "./ABP6";
import * as ABP7 from "./ABP7";
import * as ABP9 from "./ABP9";
import * as ABP10 from "./ABP10";
import * as ABP11 from "./ABP11";
import * as G2A from "./G2A";
import * as G1 from "./G1";
import { FormSchema } from "shared-types";

export const webformVersions: Record<string, Record<string, FormSchema>> = {
  ABP1: {
    v202401: ABP1.v202401,
    v202402: ABP1.v202402,
  },
  ABP2A: {
    v202401: ABP2A.v202401,
  },
  ABP2B: {
    v202401: ABP2B.v202401,
  },
  ABP2C: {
    v202401: ABP2C.v202401,
  },
  ABP3: {
    v202401: ABP3.v202401,
  },
  ABP3_1: {
    v202401: ABP3_1.v202401,
  },
  ABP4: {
    v202401: ABP4.v202401,
  },
  ABP5: {
    v202401: ABP5.v202401,
  },
  ABP6: {
    v202401: ABP6.v202401,
  },
  ABP7: {
    v202401: ABP7.v202401,
  },
  ABP9: {
    v202401: ABP9.v202401,
  },
  ABP10: {
    v202401: ABP10.v202401,
  },
  ABP11: {
    v202401: ABP11.v202401,
  },
  G1: {
    v202401: G1.v202401,
  },
  G2A: {
    v202401: G2A.v202401,
  },
};
