import { STATES } from "@/hooks";

type State = keyof typeof STATES;
const isStringAState = (supposedState: string): supposedState is State => supposedState in STATES;

export const convertStateAbbrToFullName = (input: string): string => {
  if (isStringAState(input)) {
    return STATES[input].split(",")[0];
  }

  return input;
};
