
export const getLatestRai = (rais: any) => {
    const keys = Object.keys(rais);
    if (keys.length === 0) {
        return null;
    } else {
        const maxKey = keys.reduce((max, key) => Math.max(max, Number(key)), -Infinity);
        return {
            key: maxKey,
            value: rais[maxKey],
        };
    }
};

export const getActiveRai = (rais:any) => {
    const latest = getLatestRai(rais);
    // If the latest RAI does not have a received or withdrawn date
    if(latest && !latest.value.receivedDate && !latest.value.withdrawnDate){
        return latest
    } else {
        return null
    }
}
