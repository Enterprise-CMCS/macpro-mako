export function response<T>(
  currentResponse: {
    statusCode?: number;
    body?: T;
    headers?: { [key: string]: string };
  },
  options?: { disableCors?: boolean }
) {
  const corsHeaders = {
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "OPTIONS,POST,GET,PUT,DELETE",
  };

  return {
    ...currentResponse,
    body: JSON.stringify(currentResponse?.body ?? {}),
    headers: {
      ...(options?.disableCors ? {} : corsHeaders),
      ...currentResponse.headers,
    },
  };
}
