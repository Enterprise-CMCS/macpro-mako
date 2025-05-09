export type UserInformationProps = {
  fullName: string;
  role: string;
  email: string;
};

export const UserInformation = ({ fullName, role, email }: UserInformationProps) => (
  <div className="flex flex-col gap-6 md:basis-1/2">
    <h2 className="text-2xl font-bold">My Information</h2>

    <div className="leading-9">
      <h3 className="font-bold">Full Name</h3>
      <p>{fullName}</p>
    </div>

    <div className="leading-9">
      <h3 className="font-bold">Role</h3>
      <p>{role}</p>
    </div>

    <div className="leading-9">
      <h3 className="font-bold">Email</h3>
      <p>{email}</p>
    </div>

    <div className="">
      <p className="italic">
        This page contains Profile Information for the {role}. The information cannot be changed in
        the portal.
      </p>
    </div>
  </div>
);
