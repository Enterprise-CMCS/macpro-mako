const buildAddressList = (addressList, data) => {
    const newList = [];
    console.log("address list and data in: ", addressList, data);
    addressList.forEach((address) => {
        let mappedAddress = address;
        if (address === "submitter")
            if (data.submitterEmail === "george@example.com")
                mappedAddress = `"George's Substitute" <k.grue.stateuser@gmail.com>`;
            else
                mappedAddress = `"${data.submitterName}" <${data.submitterEmail}>`;
        if (address === "osg")
            mappedAddress = process?.env?.osgEmail ? process.env.osgEmail : "'OSG Substitute' <k.grue@theta-llc.com>";
        if (address === "chip")
            mappedAddress = process?.env?.chipInbox ? process.env.chipInbox : "'CHIP Inbox Substitute' <k.grue@theta-llc.com>";
        if (address === "chipCc")
            mappedAddress = process?.env?.chipCcList ? process.env.chipCcList : "'CHIP CC Substitute 1' <k.grue@theta-llc.com>;'CHIP CC Substitute 2' <k.grue.stateadmn@gmail.com>";
        if (address === "cpoc")
            mappedAddress = data?.cpocEmailAndSrtList ? data.cpocEmailAndSrtList : "'CPOC Substitute in mapaddress' <k.grue.cmsapprover@gmail.com>;'SRT 1 Substitute in mapaddress' <k.grue.cmsapprover@gmail.com>;'SRT 2 Substitute in mapaddress' <k.grue.stateadmn@gmail.com>";
        if (address === "srt")
            mappedAddress = data?.cpocEmailAndSrtList ? data.cpocEmailAndSrtList : "'CPOC Substitute in mapaddress' <k.grue.cmsapprover@gmail.com>;'SRT 1 Substitute in mapaddress' <k.grue.cmsapprover@gmail.com>;'SRT 2 Substitute in mapaddress' <k.grue.stateadmn@gmail.com>";
        if (address === "dpo")
            mappedAddress = data?.dpoEmail ? data.dpoEmail : "'DPO Action Substitute in mapaddress' <k.grue.cmsapprover@gmail.com>";

        console.log("mapped address: ", mappedAddress);
        const extraAddresses = mappedAddress.split(';');
        extraAddresses.forEach((oneaddress) => {
            console.log("the individual address: ", oneaddress);
            newList.push(oneaddress);
        })
    });
    console.log("address list: ", newList);
    return newList;
};

export const buildDestination = (command, data) => {
    let destination = { ToAddresses: buildAddressList(command.ToAddresses, data) };
    if (command?.CcAddresses) destination.CcAddresses = buildAddressList(command.CcAddresses, data);
    if (command?.BccAddresses) destination.BccAddresses = buildAddressList(command.BccAddresses, data);
    console.log("Destination object for this email is: ", destination);
    return destination;
}