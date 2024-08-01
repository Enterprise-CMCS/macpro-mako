interface Command {
  ToAddresses: string[];
  CcAddresses?: string[];
  BccAddresses?: string[];
}

interface Destination {
  ToAddresses: string[];
  CcAddresses?: string[];
  BccAddresses?: string[];
}

const buildAddressList = (
  addressList: string[],
  data: Record<string, string>,
): string[] => {
  const newList: string[] = [];
  addressList.forEach((address) => {
    const mappedAddress = data[address] ? data[address] : address;

    const extraAddresses = mappedAddress.split(";");
    extraAddresses.forEach((oneAddress) => {
      newList.push(oneAddress);
    });
  });
  return newList;
};

export const buildDestination = (
  command: Command,
  data: Record<string, string>,
): Destination => {
  let destination: Destination = {
    ToAddresses: buildAddressList(command.ToAddresses, data),
  };
  if (command.CcAddresses)
    destination.CcAddresses = buildAddressList(command.CcAddresses, data);
  if (command.BccAddresses)
    destination.BccAddresses = buildAddressList(command.BccAddresses, data);
  return destination;
};
