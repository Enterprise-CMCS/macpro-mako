

type FormResult = {
    version: string;
    data: any; // replace 'any' with the actual type of the data returned from the API
  } | null
  
  interface ResultObject {
    [formId: string]: FormResult[];
  }
  
  async function getAllFormData(formData: any): Promise<ResultObject> {
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
                `${process.env.API_REST_URL}/forms?formId=${formId.toLowerCase()}&formVersion=${formVersion}`
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
