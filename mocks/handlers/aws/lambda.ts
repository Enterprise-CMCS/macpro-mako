import { http, HttpResponse, PathParams } from "msw";
import {
  consumerGroups,
  TEST_DELETE_TRIGGER_UUID,
  TEST_ERROR_EVENT_SOURCE_FUNCTION_NAME,
  TEST_ERROR_EVENT_SOURCE_UUID,
} from "../../data/lambdas";
import { TestEventSourceMappingRequestBody } from "../../index.d";

const defaultListEventSourceMappingsHandler = http.get(
  "https://lambda.us-east-1.amazonaws.com/2015-03-31/event-source-mappings",
  async ({ request }) => {
    console.log("defaultListEventSourceMappingsHandler", { request, headers: request.headers });
    const requestUrl = new URL(request.url);
    const functionName = requestUrl.searchParams.get("FunctionName") || "";

    if (!functionName) {
      return new HttpResponse("InvalidParameterValueException", { status: 400 });
    }

    if (functionName == TEST_ERROR_EVENT_SOURCE_FUNCTION_NAME) {
      return new HttpResponse(null, { status: 500 });
    }

    return HttpResponse.json({
      EventSourceMappings: consumerGroups[functionName],
    });
  },
);

const defaultCreateEventSourceMappingsHandler = http.post<
  PathParams,
  TestEventSourceMappingRequestBody
>(
  "https://lambda.us-east-1.amazonaws.com/2015-03-31/event-source-mappings",
  async ({ request }) => {
    console.log("defaultCreateEventSourceMappingsHandler", { request, headers: request.headers });
    const { FunctionName, Topics } = await request.json();

    if (!FunctionName) {
      return new HttpResponse("InvalidParameterValueException", { status: 400 });
    }

    if (FunctionName == TEST_ERROR_EVENT_SOURCE_FUNCTION_NAME) {
      return new HttpResponse("ServerError", { status: 500 });
    }

    if (!Topics || Topics.length === 0 || Topics.length > 1 || !Topics[0]) {
      return new HttpResponse("InvalidParameterValueException", { status: 400 });
    }
    const topic = Topics[0];
    if (!topic) {
      return new HttpResponse("InvalidParameterValueException", { status: 400 });
    }

    const mapping = consumerGroups[FunctionName];

    if (!mapping) {
      return new HttpResponse("ResourceNotFoundException", { status: 404 });
    }

    const topicMapping = mapping.find((obj) => obj.Topics && obj.Topics.includes(topic));

    return topicMapping
      ? HttpResponse.json(topicMapping)
      : new HttpResponse("Mapping not found", { status: 404 });
  },
);

const defaultGetEventSourceMappingHandler = http.get(
  "https://lambda.us-east-1.amazonaws.com/2015-03-31/event-source-mappings/:uuid",
  async ({ request, params }) => {
    console.log("defaultGetEventSourceMappingHandler", {
      request,
      headers: request.headers,
      params,
    });
    const { uuid } = params;

    if (!uuid) {
      return new HttpResponse("InvalidParameterValueException", { status: 400 });
    }

    if (uuid == TEST_ERROR_EVENT_SOURCE_UUID || uuid == TEST_DELETE_TRIGGER_UUID) {
      return new HttpResponse(null, { status: 500 });
    }

    const [mapping] = Object.values(consumerGroups).reduce((acc, curr) => {
      return acc.concat(curr.filter((currItem) => currItem.UUID == uuid));
    }, []);

    return mapping ? HttpResponse.json(mapping) : new HttpResponse(null, { status: 404 });
  },
);

const defaultDeleteEventSourceMappingHandler = http.delete(
  "https://lambda.us-east-1.amazonaws.com/2015-03-31/event-source-mappings/:uuid",
  async ({ request, params }) => {
    console.log("", { request, headers: request.headers, params });
    const { uuid } = params;

    if (!uuid) {
      return new HttpResponse("InvalidParameterValueException", { status: 400 });
    }

    if (uuid == TEST_ERROR_EVENT_SOURCE_UUID) {
      return new HttpResponse(null, { status: 500 });
    }

    return new HttpResponse(null, { status: 200 });
  },
);

export const lambdaHandlers = [
  defaultListEventSourceMappingsHandler,
  defaultCreateEventSourceMappingsHandler,
  defaultGetEventSourceMappingHandler,
  defaultDeleteEventSourceMappingHandler,
];
