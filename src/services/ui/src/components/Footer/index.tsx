import MedicaidLogo from "@/assets/MedicaidLogo.svg";
import DepartmentOfHealthLogo from "@/assets/DepartmentOfHealthLogo.svg";

export const Footer = () => {
  return (
    <footer className="grid grid-cols-12 px-10 py-4 gap-4 bg-[#E1F3F8]">
      <img
        src={MedicaidLogo}
        alt="Logo for Medicaid"
        className="w-36 col-span-6 sm:col-span-6 justify-self-start self-center sm:justify-self-start sm:self-center"
      />
      <img
        className="max-w-36 col-span-6 sm:col-span-2 justify-self-end self-center"
        src={DepartmentOfHealthLogo}
        alt="Logo for Department of Health and Human Services"
      />
      <p className="col-span-12 sm:col-span-4">
        A federal government website managed and paid for by the U.S. Centers
        for Medicare and Medicaid Services and part of the MACPro suite.
      </p>
    </footer>
  );
};
