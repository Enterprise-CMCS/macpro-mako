const buildAddressList = (addressList, data) => {
    const newList = [];
    addressList.forEach((address) => {
        const mappedAddress = data[address] ? data[address] : address;

        const extraAddresses = mappedAddress.split(';');
        extraAddresses.forEach((oneaddress) => {
            newList.push(oneaddress);
        })
    });
    return newList;
};

export const buildDestination = (command, data) => {
    let destination = { ToAddresses: buildAddressList(command.ToAddresses, data) };
    if (command?.CcAddresses) destination.CcAddresses = buildAddressList(command.CcAddresses, data);
    if (command?.BccAddresses) destination.BccAddresses = buildAddressList(command.BccAddresses, data);
    return destination;
}