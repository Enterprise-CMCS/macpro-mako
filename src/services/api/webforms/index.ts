import * as ABP1 from "./ABP1";
import * as ABP2B from "./ABP2B";
import * as ABP10 from "./ABP10";
import * as ABP11 from "./ABP11";
import * as ABP3 from "./ABP3";
import * as ABP3_1 from "./ABP3_1";
import { FormSchema } from "shared-types";

export const webformVersions: Record<string, Record<string, FormSchema>> = {
  ABP1: {
    v202401: ABP1.v202401,
    v202402: ABP1.v202402,
  },
  ABP2B: {
    v202401: ABP2B.v202401,
  },
  ABP3: {
    v202401: ABP3.v202401,
  },
  ABP3_1: {
    v202401: ABP3_1.v202401,
  },
  ABP10: {
    v202401: ABP10.v202401,
  },
  ABP11: {
    v202401: ABP11.v202401,
  },
};
