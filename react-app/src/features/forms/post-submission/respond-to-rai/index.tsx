import {
    ActionForm,
    RequiredFieldDescription,
    SectionCard,
    ActionFormDescription,
    PackageSection,
} from "@/components";
import { formSchemas } from "@/formSchemas";
import { SEATOOL_STATUS } from "shared-types";
import { useParams } from 'react-router-dom';

export const RespondToRaiMedicaid = () => {
    const { authority, id } = useParams();
    console.log({ authority })
    return (
        <ActionForm
            schema={formSchemas["respond-to-rai-medicaid"]}
            title={`${authority} Formal RAI Response Details`}
            fields={({ control }) => (
                <>
                    <PackageSection />
                </>
            )}
            defaultValues={{ id }}
            attachments={{
                faqLink: "/faq",
            }}
            documentPollerArgs={{
                property: "id",
                documentChecker: (check) =>
                    check.recordExists,
            }}
            breadcrumbText="Respond to Formal RAI"
            preSubmissionMessage="Once complete, you and CMS will receive an email confirmation."
            bannerPostSubmission={{
                header: "RAI response submitted",
                body: `The RAI response for ${id} has been submitted.`,
                variant: "success",
            }} />
    );
}
export const RespondToRaiWaiver = () => {
    const { authority, id } = useParams();
    console.log({ authority })
    return (
        <ActionForm
            schema={formSchemas["respond-to-rai-waiver"]}
            title={`${authority} Waiver Formal RAI Response Details`}
            fields={({ control }) => (
                <>
                    <PackageSection />
                </>
            )}
            defaultValues={{ id }}
            attachments={{
                faqLink: "/faq",
            }}
            documentPollerArgs={{
                property: "id",
                documentChecker: (check) =>
                    check.recordExists,
            }}
            breadcrumbText="Respond to Formal RAI"
            preSubmissionMessage="Once complete, you and CMS will receive an email confirmation."
            bannerPostSubmission={{
                header: "RAI response submitted",
                body: `The RAI response for ${id} has been submitted.`,
                variant: "success",
            }}
        />
    );
}
export const RespondToRaiChip = () => {
    const { authority, id } = useParams();
    return (
        <ActionForm
            schema={formSchemas["respond-to-rai-chip"]}
            title={`${authority} Formal RAI Response Details`}
            fields={({ control }) => (
                <>
                    <PackageSection />
                </>
            )}
            defaultValues={{ id }}
            attachments={{
                faqLink: "/faq",
            }}
            documentPollerArgs={{
                property: "id",
                documentChecker: (check) =>
                    check.recordExists,
            }}
            breadcrumbText="Respond to Formal RAI"
            preSubmissionMessage="Once complete, you and CMS will receive an email confirmation."
            bannerPostSubmission={{
                header: "RAI response submitted",
                body: `The RAI response for ${id} has been submitted.`,
                variant: "success",
            }}
        />
    );
}