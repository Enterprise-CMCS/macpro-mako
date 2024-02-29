const buildAddressList = (addressList, data) => {
    const newList = [];
    console.log("address list and data in: ", addressList, data);
    addressList.forEach((address) => {
        const mappedAddress = data[address] ? data[address] : address;

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