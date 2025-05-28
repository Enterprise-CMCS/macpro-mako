export type StatusType = "active" | "pending" | "denied" | "revoked";
export type UserRoleType = {
  id: string;
  email: string;
  fullName: string;
  role: string;
  territory: string;
  doneByEmail: string;
  doneByName: string;
  lastModifiedDate: number;
  status: StatusType;
  eventType: string;
  group?: string;
  division?: string;
};

export const initSortUserData = (userData: UserRoleType[]) => {
  if (!userData.length) return [];
  // separate pending / other
  const pendingRoles = userData.filter((x: UserRoleType) => x.status === "pending");
  const remainingRoles = userData.filter((x: UserRoleType) => x.status !== "pending");

  const compare = (a: UserRoleType, b: UserRoleType) => {
    const nameA = a.fullName.toLocaleLowerCase();
    const nameB = b.fullName.toLocaleLowerCase();

    if (nameA < nameB) return -1;
    if (nameA > nameB) return 1;
    return 0;
  };
  const sorted = pendingRoles.sort(compare).concat(remainingRoles.sort(compare));

  return sorted;
};

export const sortUserData = (
  sortByKey: keyof UserRoleType,
  direction: boolean,
  data: UserRoleType[],
) => {
  if (!data.length) return [];

  // when direction is true, that means we are descending
  const [last, first] = direction ? [-1, 1] : [1, -1];
  const sortStatus = (a: UserRoleType, b: UserRoleType) => {
    switch (a.status) {
      case "pending":
        return first;
      case "active":
        return b.status === "pending" ? last : first;
      case "denied":
        return b.status === "revoked" ? first : last;
      case "revoked":
        return last;
      default:
        return last;
    }
  };
  const mainSort = (a: UserRoleType, b: UserRoleType) =>
    a[sortByKey] < b[sortByKey] ? first : last;

  if (sortByKey === "status") return data.sort((a, b) => sortStatus(a, b));

  return data.sort((a, b) => mainSort(a, b));
};
