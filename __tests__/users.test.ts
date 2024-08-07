import request from 'supertest'
import { createServer } from '../utils/createServer'
import { db } from '../prisma/client'
import { signToken } from '../utils/signToken'

const app = createServer()

beforeAll(async () => {
  await db.$connect()
  await db.user.deleteMany()
})

afterAll(async () => {
  // await db.user.deleteMany()
  await db.$disconnect()
})

describe('User API', () => {
  const randomBuyerUsername = `buyeruser${Math.floor(Math.random() * 1000)}`
  const randomSellerUsername = `selleruser${Math.floor(Math.random() * 1000)}`
  let buyerId: number

  let token: string

  describe('POST /users', () => {
    it('should create a new buyer user', async () => {
      const response = await request(app).post('/api/v1/users').send({
        username: randomBuyerUsername,
        password: 'testpassword',
      })
      expect(response.status).toBe(201)
      expect(response.body.user.role).toBe('buyer')
    })

    it('should create a new seller user', async () => {
      const response = await request(app).post('/api/v1/users').send({
        username: randomSellerUsername,
        password: 'testpassword',
        role: 'seller',
      })
      expect(response.status).toBe(201)
      expect(response.body.user.role).toBe('seller')
    })

    it('should not create a user with an existing username', async () => {
      const response = await request(app).post('/api/v1/users').send({
        username: randomBuyerUsername,
        password: 'testpassword',
      })
      expect(response.status).toBe(400)
    })

    it('should not create a user with an invalid role', async () => {
      const response = await request(app).post('/api/v1/users').send({
        username: randomSellerUsername,
        password: 'testpassword',
        role: 'invalid',
      })
      expect(response.status).toBe(400)
    })

    it('should not create a user with an invalid password', async () => {
      const response = await request(app).post('/api/v1/users').send({
        username: randomSellerUsername,
        password: 'short',
        role: 'seller',
      })
      expect(response.status).toBe(400)
    })

    it('should not create a user with an invalid username', async () => {
      const response = await request(app).post('/api/v1/users').send({
        username: 'sc',
        password: 'testpassword',
        role: 'seller',
      })
      expect(response.status).toBe(400)
    })
  })

  describe('POST /users/auth', () => {
    it('should authenticate a user', async () => {
      const response = await request(app).post('/api/v1/users/auth').send({
        username: randomBuyerUsername,
        password: 'testpassword',
      })
      expect(response.status).toBe(200)
      expect(response.body.username).toBe(randomBuyerUsername)
      expect(response.body.role).toBe('buyer')
      expect(response.headers['set-cookie']).toBeTruthy()

      token = response.headers['set-cookie'][0]
      buyerId = response.body.id
    })

    it('should not authenticate a user with an invalid password', async () => {
      const response = await request(app).post('/api/v1/users/auth').send({
        username: randomBuyerUsername,
        password: 'wrongpassword',
      })
      expect(response.status).toBe(401)
    })

    it('should not authenticate a user with an invalid username', async () => {
      const response = await request(app).post('/api/v1/users/auth').send({
        username: 'wronguser',
        password: 'testpassword',
      })
      expect(response.status).toBe(404)
    })
  })

  describe('PUT /users/{id}/deposit', () => {
    it("should deposit to a user's account", async () => {
      const response = await request(app)
        .put(`/api/v1/users/${buyerId}/deposit`)
        .set('Cookie', token)
        .send({
          amount: 10,
        })
      expect(response.status).toBe(200)
    })

    it("should not deposit to a user's account with an invalid deposit", async () => {
      const response = await request(app)
        .put(`/api/v1/users/${buyerId}/deposit`)
        .set('Cookie', token)
        .send({
          amount: 12,
        })
      expect(response.status).toBe(400)
    })
  })

  describe('PUT /users/{id}', () => {
    it("should update a user's username", async () => {
      const response = await request(app)
        .put('/api/v1/users/' + buyerId)
        .set('Cookie', token)
        .send({
          username: randomBuyerUsername + '1',
        })
      expect(response.status).toBe(200)
      expect(response.body.user.role).toBe('buyer')
    })

    it("should update user's password", async () => {
      const response = await request(app)
        .put('/api/v1/users/' + buyerId)
        .set('Cookie', token)
        .send({
          password: 'newpassword1',
        })
      expect(response.status).toBe(200)
      expect(response.body.user.role).toBe('buyer')
    })

    it("should update a user's role", async () => {
      const response = await request(app)
        .put('/api/v1/users/' + buyerId)
        .set('Cookie', token)
        .send({
          role: 'seller',
        })
      expect(response.status).toBe(200)
      expect(response.body.user.role).toBe('seller')
    })
  })

  describe('POST /users/auth', () => {
    it('should authenticate after updating a user', async () => {
      const response = await request(app)
        .post('/api/v1/users/auth')
        .send({
          username: randomBuyerUsername + '1',
          password: 'newpassword1',
        })
      expect(response.status).toBe(200)
      expect(response.headers['set-cookie']).toBeTruthy()

      token = response.headers['set-cookie'][0]
      buyerId = response.body.id
    })
  })

  describe('PUT /users/{id}/deposit', () => {
    it("should not deposit to a user's account after updating a user's role to seller", async () => {
      const response = await request(app)
        .put(`/api/v1/users/${buyerId}/deposit`)
        .set('Cookie', token)
        .send({
          amount: 10,
        })
      expect(response.status).toBe(401)
    })
  })

  describe('POST /users/logout', () => {
    it('should logout a user', async () => {
      const response = await request(app)
        .post('/api/v1/users/logout')
        .set('Cookie', token)
      expect(response.status).toBe(200)
    })
  })

  describe('DELETE /users/{id}', () => {
    it('should delete a user', async () => {
      const response = await request(app)
        .delete('/api/v1/users/' + buyerId)
        .set('Cookie', token)
      expect(response.status).toBe(200)
    })
  })
})
