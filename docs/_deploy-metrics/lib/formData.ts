

export type FormResult = {
    version: string;
    data: any; // replace 'any' with the actual type of the data returned from the API
  } | null
  
  export type ResultObject = {
    [formId: string]: FormResult[];
  }
  
  export async function getAllFormData(formData: any): Promise<ResultObject> {
    const resultObject: ResultObject = {};
  
    // Loop through each key-value pair in formData
    for (const formId in formData) {
      if (formData.hasOwnProperty(formId)) {
        const formVersions = formData[formId];
  
        // Loop through each formVersion for the current formId
        resultObject[formId] = await Promise.all(
          formVersions.map(async (formVersion: any) => {
            try {
              // Make API request using fetch
              const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_REST_URL}/forms?formId=${formId.toLowerCase()}&formVersion=${formVersion}`
              );
  
              // Ensure the request was successful
              if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
              }
  
              // Extract and format data from the API response
              const data = await response.json();
              const formattedResult: FormResult = {
                version: formVersion,
                data,
              };
  
              return formattedResult;
            } catch (error) {
              // Handle error if API request fails
              console.error(`Error fetching data for formId: ${formId}, version: ${formVersion}`);
              console.error(error);
              return null;
            }
          })
        );
      }
    }
  
    return resultObject;
  }

  type FieldType = "Input" | "FieldArray" | "Select";

interface Rule {
  required: string;
}

interface FieldProps {
  placeholder?: string;
  appendText?: string;
  sort?: string;
  className?: string;
  options?: { label: string; value: string }[];
}

interface Field {
  rhf: FieldType;
  name: string;
  label: string;
  rules?: Rule;
  props?: FieldProps;
  fields?: Field[];
}

interface FormSection {
  title: string;
  slots: Field[];
}

interface FormSchema {
  header: string,
  sections: FormSection[];
}

interface WebformsDocsResult {
  title: string
  sectionsDescriptions: string[]
}

// export function generateFormDocumentation(formSchema: FormSchema): WebformsDocsResult {
//   const documentation = {
//     title: formSchema.header,
//     sectionsDescriptions: formSchema.sections.map((sec) => sec.title)
//   }

//   return documentation;
// }

// import { FormSchema, any, any } from "shared-types";

export function generateFormDocumentation(schema: any): string {
  let documentation = `# ${schema.header}\n\n`;

  function processField(field: any, indentation: string = ""): void {
    documentation += `${indentation}- **${field.description}**\n`;

    if (field.slots) {
      field.slots.forEach((slot: any) => {
        documentation += `${indentation}  - *${slot.name}:* ${slot.rhf}\n`;

        if (slot.props && slot.props.options) {
          slot.props.options.forEach((option: any) => {
            if (option.form) {
              option.form.forEach((subField: any) => {
                processField(subField, `${indentation}    `);
              });
            }

            if (option.slots) {
              option.slots.forEach((subSlot: any) => {
                documentation += `${indentation}      - *${subSlot.name}:* ${subSlot.rhf}\n`;

                if (subSlot.props && subSlot.props.options) {
                  subSlot.props.options.forEach((subOption: any) => {
                    if (subOption.form) {
                      subOption.form.forEach((subField: any) => {
                        processField(subField, `${indentation}        `);
                      });
                    }
                  });
                }
              });
            }
          });
        }
      });
    }
  }

  schema.sections.forEach((section: any) => {
    documentation += `\n## ${section.title}\n\n`;

    section.form.forEach((field: any) => {
      processField(field, "  ");
    });
  });

  return documentation;
}
