import { beforeEach, describe, expect, it, vi } from 'vitest'
import * as queries from '../queries'
import * as service from './user.service'

const { createUser, signUpEmail } = vi.hoisted(() => ({
  createUser: vi.fn<() => Promise<Response>>(),
  signUpEmail: vi.fn<() => Promise<Response>>(),
}))
vi.mock('~/lib/auth', () => ({ auth: { api: { createUser, signUpEmail } } }))
vi.mock('../queries', () => ({
  countAdmin: vi.fn(),
  assignRoleByName: vi.fn(),
  findPaginated: vi.fn(),
  findById: vi.fn(),
  findByEmail: vi.fn(),
  update: vi.fn(),
  deleteById: vi.fn(),
  deleteMany: vi.fn(),
}))
const user = {
  id: 'user',
  name: 'Test',
  email: 'test@example.com',
  emailVerified: false,
  image: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  roles: [],
}
const input = { name: user.name, email: user.email, password: 'password123' }
describe('user service', () => {
  beforeEach(() => vi.resetAllMocks())
  it('creates a user with the Better Auth admin API and assigns the app role', async () => {
    createUser.mockResolvedValue(Response.json({ user: { id: user.id } }))

    await expect(service.create(input)).resolves.toEqual({
      userId: user.id,
      setCookie: null,
    })
    expect(createUser).toHaveBeenCalledWith({
      body: { ...input, role: 'user' },
      asResponse: true,
    })
    expect(queries.assignRoleByName).toHaveBeenCalledWith(user.id, 'User')
  })
  it.each([
    [400, 'Invalid user data'],
    [409, 'Email already exists'],
    [500, 'Failed to create user'],
  ])('propagates signup error %s', async (status, message) => {
    createUser.mockResolvedValue(Response.json({ message }, { status: Number(status) }))
    await expect(service.create(input)).rejects.toThrow(String(message))
  })
  it('propagates unexpected authentication failures', async () => {
    createUser.mockRejectedValue(new Error('Network error'))
    await expect(service.create(input)).rejects.toThrow('Network error')
  })
  it('rejects a signup response without a user', async () => {
    createUser.mockResolvedValue(Response.json({}))
    await expect(service.create(input)).rejects.toThrow('Failed to create user')
    expect(queries.assignRoleByName).not.toHaveBeenCalled()
  })
  it('registers through Better Auth and returns its session cookie', async () => {
    signUpEmail.mockResolvedValue(
      Response.json({ user: { id: user.id } }, { headers: { 'set-cookie': 'session=example' } }),
    )

    await expect(service.register(input)).resolves.toEqual({
      userId: user.id,
      setCookie: 'session=example',
    })
    expect(queries.assignRoleByName).toHaveBeenCalledWith(user.id, 'User')
  })
  it('returns paginated users', async () => {
    const page = {
      docs: [user],
      page: 1,
      limit: 10,
      totalDocs: 1,
      totalPages: 1,
      hasNextPage: false,
      hasPrevPage: false,
    }
    vi.mocked(queries.findPaginated).mockResolvedValue(page)
    await expect(service.findPaginated({ page: 1, limit: 10 })).resolves.toEqual(page)
  })
  it('returns an existing user', async () => {
    vi.mocked(queries.findById).mockResolvedValue(user)
    await expect(service.findById(user.id)).resolves.toEqual(user)
  })
  it('returns undefined for a missing user', async () => {
    await expect(service.findById('missing')).resolves.toBeUndefined()
  })
  it('updates an existing user', async () => {
    vi.mocked(queries.findById).mockResolvedValue(user)
    await expect(
      service.update(user.id, { name: 'Changed', email: user.email }),
    ).resolves.toBeUndefined()
    expect(queries.update).toHaveBeenCalledWith(user.id, { name: 'Changed', email: user.email })
    expect(queries.findByEmail).not.toHaveBeenCalled()
  })
  it('rejects updates to missing users', async () => {
    await expect(service.update('missing', { name: user.name, email: user.email })).rejects.toThrow(
      'not found',
    )
    expect(queries.update).not.toHaveBeenCalled()
  })
  it('rejects an email owned by another user', async () => {
    vi.mocked(queries.findById).mockResolvedValue(user)
    vi.mocked(queries.findByEmail).mockResolvedValue({ ...user, id: 'other' })
    await expect(
      service.update(user.id, { name: user.name, email: 'other@example.com' }),
    ).rejects.toThrow('Email already in use')
  })
  it('allows a new unused email', async () => {
    vi.mocked(queries.findById).mockResolvedValue(user)
    await expect(
      service.update(user.id, { name: user.name, email: 'new@example.com' }),
    ).resolves.toBeUndefined()
  })
  it('propagates update failures', async () => {
    vi.mocked(queries.findById).mockResolvedValue(user)
    vi.mocked(queries.update).mockRejectedValue(new Error('Database error'))
    await expect(service.update(user.id, { name: user.name, email: user.email })).rejects.toThrow(
      'Database error',
    )
  })
  it('deletes an existing user', async () => {
    vi.mocked(queries.findById).mockResolvedValue(user)
    await expect(service.deleteById(user.id)).resolves.toBeUndefined()
    expect(queries.deleteById).toHaveBeenCalledWith(user.id)
  })
  it('rejects deletion of a missing user', async () => {
    await expect(service.deleteById('missing')).rejects.toThrow('not found')
  })
  it('propagates deletion failures', async () => {
    vi.mocked(queries.findById).mockResolvedValue(user)
    vi.mocked(queries.deleteById).mockRejectedValue(new Error('Database error'))
    await expect(service.deleteById(user.id)).rejects.toThrow('Database error')
  })
  it('rejects an empty bulk deletion', async () => {
    await expect(service.deleteMany([])).rejects.toThrow('Invalid user IDs')
    expect(queries.deleteMany).not.toHaveBeenCalled()
  })
})
