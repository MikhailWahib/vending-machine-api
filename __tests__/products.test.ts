import request from 'supertest'
import { createServer } from '../utils/createServer'
import { db } from '../prisma/client'

const app = createServer()

describe('Product API', () => {
  let sellerToken: string
  let buyerToken: string
  let productId: number

  beforeAll(async () => {
    await db.$connect()
    await db.user.deleteMany()
    await db.product.deleteMany()

    // Create a seller
    const sellerResponse = await request(app)
      .post('/api/v1/users')
      .send({ username: 'seller1', password: 'password', role: 'seller' })
    const sellerLoginResponse = await request(app)
      .post('/api/v1/users/auth')
      .send({ username: 'seller1', password: 'password' })
    sellerToken = sellerLoginResponse.headers['set-cookie'][0]

    // Create a buyer
    const buyerResponse = await request(app)
      .post('/api/v1/users')
      .send({ username: 'buyer1', password: 'password', role: 'buyer' })
    const buyerLoginResponse = await request(app)
      .post('/api/v1/users/auth')
      .send({ username: 'buyer1', password: 'password' })
    buyerToken = buyerLoginResponse.headers['set-cookie'][0]

    // Create a second seller used in some tests (ensure it exists regardless of test order)
    await request(app)
      .post('/api/v1/users')
      .send({ username: 'seller2', password: 'password', role: 'seller' })

    // Add deposit for buyer
    const res = await request(app)
      .put(`/api/v1/users/${buyerResponse.body.user.id}/deposit`)
      .set('Cookie', buyerToken)
      .send({ amount: 100 })
  })

  afterAll(async () => {
    await db.$disconnect()
  })

  describe('POST /products', () => {
    it('should create a new product', async () => {
      const response = await request(app)
        .post('/api/v1/products')
        .set('Cookie', sellerToken)
        .send({
          productName: 'testproduct',
          amountAvailable: 10,
          cost: 5,
        })

      expect(response.status).toBe(201)
      expect(response.body.message).toBe('Product created successfully')
      expect(response.body.product).toBeDefined()
      productId = response.body.product.id
    })

    it('should not allow non-sellers to create a product', async () => {
      const response = await request(app)
        .post('/api/v1/products')
        .set('Cookie', buyerToken)
        .send({
          productName: 'BuyerProduct',
          amountAvailable: 10,
          cost: 5,
        })

      expect(response.status).toBe(401)
    })
  })

  describe('GET /products', () => {
    it('should get all products', async () => {
      const response = await request(app).get('/api/v1/products')

      expect(response.status).toBe(200)
      expect(Array.isArray(response.body)).toBeTruthy()
      expect(response.body.length).toBeGreaterThan(0)
    })
  })

  describe('GET /products/:id', () => {
    it('should get a specific product', async () => {
      const response = await request(app).get(`/api/v1/products/${productId}`)

      expect(response.status).toBe(200)
      expect(response.body.productName).toBe('testproduct')
    })

    it('should return 404 for non-existent product', async () => {
      const response = await request(app).get('/api/v1/products/9999')

      expect(response.status).toBe(404)
    })
  })

  describe('PUT /products/:id', () => {
    it('should update a product', async () => {
      const response = await request(app)
        .put(`/api/v1/products/${productId}`)
        .set('Cookie', sellerToken)
        .send({
          productName: 'updatedproduct',
          amountAvailable: 15,
          cost: 5,
        })

      expect(response.status).toBe(200)
      expect(response.body.message).toBe('Product updated successfully')
      expect(response.body.updatedProduct.productName).toBe('updatedproduct')
      expect(response.body.updatedProduct.amountAvailable).toBe(15)
    })

    it('should not allow non-owners to update a product', async () => {
      const seller2LoginResponse = await request(app)
        .post('/api/v1/users/auth')
        .send({ username: 'seller2', password: 'password' })
      const seller2Token = seller2LoginResponse.headers['set-cookie'][0]

      const response = await request(app)
        .put(`/api/v1/products/${productId}`)
        .set('Cookie', seller2Token)
        .send({
          productName: 'UnauthorizedUpdate',
        })

      expect(response.status).toBe(401)
    })
  })

  describe('POST /products/:id/buy', () => {
    it('should allow a buyer to purchase a product', async () => {
      const response = await request(app)
        .post(`/api/v1/products/${productId}/buy`)
        .set('Cookie', buyerToken)
        .send({
          amount: 2,
        })

      expect(response.status).toBe(200)
      expect(response.body.message).toBe('Product purchased successfully')
      expect(response.body.totalSpent).toBe(10)
    })

    it('should not allow purchase with insufficient funds', async () => {
      const response = await request(app)
        .post(`/api/v1/products/${productId}/buy`)
        .set('Cookie', buyerToken)
        .send({
          amount: 100,
        })

      expect(response.status).toBe(400)
      expect(response.body.message).toBe('Insufficient balance')
    })

    it('should not allow sellers to buy products', async () => {
      const response = await request(app)
        .post(`/api/v1/products/${productId}/buy`)
        .set('Cookie', sellerToken)
        .send({
          amount: 1,
        })

      expect(response.status).toBe(401)
    })
  })

  describe('DELETE /products/:id', () => {
    it('should delete a product', async () => {
      const response = await request(app)
        .delete(`/api/v1/products/${productId}`)
        .set('Cookie', sellerToken)

      expect(response.status).toBe(200)
      expect(response.body.message).toBe('Product deleted successfully')
    })

    it('should not allow non-owners to delete a product', async () => {
      // Create a new product
      const newProductResponse = await request(app)
        .post('/api/v1/products')
        .set('Cookie', sellerToken)
        .send({
          productName: 'ProductToDelete',
          amountAvailable: 10,
          cost: 5,
        })
      const newProductId = newProductResponse.body.product.id

      // Try to delete with a different seller
      const seller2LoginResponse = await request(app)
        .post('/api/v1/users/auth')
        .send({ username: 'seller2', password: 'password' })
      const seller2Token = seller2LoginResponse.headers['set-cookie'][0]

      const response = await request(app)
        .delete(`/api/v1/products/${newProductId}`)
        .set('Cookie', seller2Token)

      expect(response.status).toBe(401)
    })
  })
})
