import MedicaidLogo from "@/assets/MedicaidLogo.svg";
import DepartmentOfHealthLogo from "@/assets/DepartmentOfHealthLogo.svg";
import { Alert, Button, Link } from "@/components";

type Props = {
  email: string;
  address: {
    street: string;
    state: string;
    city: string;
    zip: number;
  };
};

export const Footer = ({ email, address }: Props) => {
  return (
    <footer>
      <section className="bg-sky-100">
        <div className="grid grid-cols-12 gap-4 px-10 py-4 max-w-screen-xl mx-auto">
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
            A federal government website managed and paid for by the U.S.
            Centers for Medicare and Medicaid Services and part of the MACPro
            suite.
          </p>
        </div>
      </section>
      <div className="w-full bg-primary">
        <div className="px-10 py-4 text-white text-[.8rem] flex flex-col items-center sm:flex-row max-w-screen-xl mx-auto">
          <div>
            Email{" "}
            <a href={`mailto:${email}`} className="font-bold underline">
              {email}
            </a>{" "}
            for help or feedback
          </div>
          <div className="flex-1"></div>
          <div>
            <span className="sm:block">{address.street} </span>
            <span className="sm:block">
              {address.city}, {address.state} {address.zip}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export const FAQFooter = () => {
  return (
    <Alert
      variant={"infoBlock"}
      className="my-8 items-center flex py-8 px-14 flex-row text-sm justify-center gap-24"
    >
      <p className="text-lg">Do you have questions or need support?</p>
      <Link path="/faq" target="_blank">
        <Button className="mx-4" size="lg">
          View FAQ
        </Button>
      </Link>
    </Alert>
  );
};
