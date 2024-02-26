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

export function generateDocs(obj: any, results: any = [], parentName: string = '', prompt: string = '') {
  if (typeof obj === 'object' && obj !== null) {
      if ('rhf' in obj) {
          const resultItem: any = { rhf: obj.rhf };
          
          if ('label' in obj) {
              resultItem.label = obj.label;
          }
          
          if ('name' in obj) {
              resultItem.name = obj.name;
          }

          if ((obj.rhf === 'Select' || obj.rhf === 'Radio') && obj.props) {
            resultItem.options = []
              obj.props?.options.forEach((field: any) => {
                resultItem.options?.push(field.value)
              })
          }
          
          resultItem.parentName = parentName;
          resultItem.prompt = prompt;
          
          results.push(resultItem);
      }

      for (const key in obj) {
          if (obj.hasOwnProperty(key)) {
            if ('name' in obj) {
              parentName = obj.name;
            }
            if ('description' in obj) {
              prompt = obj.description;
            }
              generateDocs(obj[key], results, parentName, prompt);
          }
      }
  }
}
