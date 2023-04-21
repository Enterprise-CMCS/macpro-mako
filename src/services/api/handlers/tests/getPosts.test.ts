import { it, describe, expect, vi, afterAll } from 'vitest'
import { getPosts } from '../getPosts'

describe('getPosts', () => {
  afterAll(() => {
    vi.resetAllMocks()
  })

  it('should return 200 OK with the posts', async () => {
    const result = await getPosts()
    expect(result.statusCode).toEqual(200)
    expect(JSON.parse(result.body)).toEqual([])
  })
})
