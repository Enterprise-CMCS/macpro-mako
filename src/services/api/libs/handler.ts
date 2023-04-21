import type {
  APIGatewayEvent,
  APIGatewayProxyResult,
  Context,
} from 'aws-lambda'

export const handler = async (
  handler: (
    event?: APIGatewayEvent,
    context?: Context
  ) => Promise<APIGatewayProxyResult>
) => {
  const handlerResponse = await handler()

  const response: APIGatewayProxyResult = {
    headers: {
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'OPTIONS,POST,GET,PUT,DELETE',
    },
    ...handlerResponse,
  }
  return () => response
}

export function response<T = { [key: string | number]: any }>(
  currentResponse: {
    statusCode?: number;
    body?: T;
    headers?: { [key: string]: string };
  },
  options?: { disableCors?: boolean }
) {
  const corsHeaders = {
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'OPTIONS,POST,GET,PUT,DELETE',
  }

  return {
    ...currentResponse,
    body: JSON.stringify(currentResponse?.body ?? {}),
    headers: {
      ...(options?.disableCors ? {} : corsHeaders),
      ...currentResponse.headers,
    },
  }
}
