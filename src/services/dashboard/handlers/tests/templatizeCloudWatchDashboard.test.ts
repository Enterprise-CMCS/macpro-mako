import { it, describe, expect, beforeEach, afterEach } from 'vitest'
import {
  CloudWatchClient,
  GetDashboardCommand,
} from '@aws-sdk/client-cloudwatch'
import type {
  APIGatewayEvent,
  APIGatewayProxyCallback,
  Context,
} from 'aws-lambda'
import { handler, replaceStringValues } from '../templatizeCloudWatchDashboard'
import { mockClient } from 'aws-sdk-client-mock'

const cloudWatchClientMock = mockClient(CloudWatchClient)

describe('replaceStringValues', () => {
  it('replaces string with correct values', () => {
    const string = 'hello jim'
    const replacables = { hello: 'world', jim: 'wally' }
    const response = replaceStringValues(string, replacables)
    expect(response).toBe('world wally')
  })

  it('should handle empty string', () => {
    const string = ''
    const replacables = { name: 'Alice' }
    expect(replaceStringValues(string, replacables)).toBe('')
  })
})

describe('handler', () => {
  const mockEvent: APIGatewayEvent = {} as APIGatewayEvent
  const mockContext: Context = {} as Context
  const mockCallback: APIGatewayProxyCallback = {} as APIGatewayProxyCallback

  beforeEach(() => {
    process.env.service = 'test-service'
    process.env.accountId = 'test-account-id'
    process.env.stage = 'test-stage'
    process.env.region = 'test-region'
  })
  afterEach(() => {
    cloudWatchClientMock.reset()
    delete process.env.service
    delete process.env.accountId
    delete process.env.stage
    delete process.env.region
  })

  it('should return the replaced dashboard body', async () => {
    cloudWatchClientMock
      .on(GetDashboardCommand)
      .resolves({ DashboardBody: 'test-stage-test-region-body' })
    const result = await handler(mockEvent, mockContext, mockCallback)
    expect(result).toBe('${sls:stage}-${env:REGION_A}-body')
  })

  it('should handle errors', async () => {
    cloudWatchClientMock.rejects()
    try {
      await handler(mockEvent, mockContext, mockCallback)
    } catch (e) {
      expect(e).toBeInstanceOf(Error)
    }
  })
})
