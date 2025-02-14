import { useGetUser } from "@/api";
import { Alert, CardWithTopBorder, SubNavHeader, Button } from "@/components";
import { RoleDescriptionStrings } from "shared-types";
import { convertStateAbbrToFullName } from "@/utils";
import config from "@/config";

const getRoleDescriptionsFromUser = (roles: string | undefined) => {
  if (roles === undefined) {
    return "";
  }

  return roles
    .split(",")
    .map((role) => RoleDescriptionStrings[role])
    .join(", ");
};

const getFullStateNamesFromUser = (states: string | undefined) => {
  if (states === undefined) {
    return "";
  }

  return states.split(",").map(convertStateAbbrToFullName).join(", ");
};

export const Profile = () => {
  const { data: userData } = useGetUser();

  const fullStateNames = getFullStateNamesFromUser(userData?.user["custom:state"]);

  const euaRoles = getRoleDescriptionsFromUser(userData?.user["custom:cms-roles"]);
  const idmRoles = getRoleDescriptionsFromUser(userData?.user["custom:ismemberof"]);

  const userRoles = euaRoles ? euaRoles : idmRoles;

  return (
    <>
      <SubNavHeader>
        <h1 className="text-xl font-medium">My Profile</h1>
      </SubNavHeader>

      <section className="block max-w-screen-xl m-auto px-4 lg:px-8 py-8 gap-10">
        <Alert className="mb-6 bg-sky-50 flex flex-row">
          <div className="py-1 mr-2 flex-none w-8">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-8 h-8"
            >
              <path
                fillRule="evenodd"
                d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z"
                clipRule="evenodd"
              />
            </svg>
          </div>

          <div className="py-2 flex-1 mr-4">
            All changes to your access or profile must be made in IDM.
          </div>
          <a href={config.idm.home_url} target="_blank" rel="noreferrer">
            <Button variant="outline">Go to IDM</Button>
          </a>
        </Alert>

        <div className="flex flex-col md:flex-row">
          <div className="flex flex-col gap-6 md:basis-1/2">
            <h2 className="text-2xl font-bold">My Information</h2>

            <div className="leading-9">
              <h3 className="font-bold">Full Name</h3>
              <p>
                {userData?.user?.given_name} {userData?.user?.family_name}
              </p>
            </div>

            <div className="leading-9">
              <h3 className="font-bold">Role</h3>
              <p>{userRoles}</p>
            </div>

            <div className="leading-9">
              <h3 className="font-bold">Email</h3>
              <p>{userData?.user?.email}</p>
            </div>
          </div>

          {fullStateNames && (
            <div className="my-4 md:my-0 md:basis-1/2">
              <CardWithTopBorder>
                <div className="px-8 py-2">
                  <h3 className="text-xl font-bold">{fullStateNames}</h3>
                  <p className="italic">Access Granted</p>
                </div>
              </CardWithTopBorder>
            </div>
          )}
        </div>
      </section>
    </>
  );
};
