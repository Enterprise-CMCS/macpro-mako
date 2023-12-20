export type LatestRai = {
  key: number;
  status: RaiStatus;
  value: any;
};
export const getLatestRai = (rais: any | undefined): LatestRai | null => {
  if (!rais || Object.keys(rais).length === 0) {
    // No keys = no rai entries
    return null;
  } else {
    const maxKey = Object.keys(rais).reduce(
      (max, key) => Math.max(max, Number(key)),
      -Infinity
    );
    return {
      key: maxKey,
      status: getRaiStatus(rais[maxKey]),
      value: rais[maxKey],
    };
  }
};

export const getRaiStatus = (rai: any) => {
  if (rai.withdrawnDate) {
    return "withdrawn";
  } else if (rai.receivedDate) {
    return "received";
  } else if (rai.requestedDate) {
    return "requested";
  } else {
    return "unknown";
  }
};
export type RaiStatus = ReturnType<typeof getRaiStatus>;
