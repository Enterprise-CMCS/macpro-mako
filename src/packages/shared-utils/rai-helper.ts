
export const getLatestRai = (rais: any) => {
    const keys = Object.keys(rais);
    if (keys.length === 0) {
        return null;
    } else {
        const maxKey = keys.reduce((max, key) => Math.max(max, Number(key)), -Infinity);
        return {
            key: maxKey,
            status: getRaiStatus(rais[maxKey]),
            value: rais[maxKey],
        };
    }
};

export const getRaiStatus = (rai: any) => {
    if(rai.withdrawnDate) {
        return "withdrawn"
    } else if(rai.receivedDate) {
        return "received"
    } else if (rai.requestedDate) {
        return "requested"
    } else {
        return "unknown"
    }
}
