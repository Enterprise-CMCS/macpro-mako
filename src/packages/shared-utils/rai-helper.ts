
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
    // if there is an rai, it has a requested date, and it has neither response nor withdrawn dates 
    if(latest && latest.value.requestedDate && (!latest.value.responseDate && !latest.value.withdrawnDate)){
        return latest
    } else {
        return null
    }
}
