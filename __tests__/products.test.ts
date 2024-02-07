import request from "supertest"
import { PrismaClient } from "@prisma/client"
import { createServer } from "../utils/createServer"

const app = createServer()

const randomProductName = `product${Math.floor(Math.random() * 1000)}`
const randomUsername = `testuser${Math.floor(Math.random() * 1000)}`

let sellerToken: string
let sellerId: number
let productId: number

let server: any

beforeAll(async () => {
	const prisma = new PrismaClient()
	await prisma.$connect()

	await request(app).post("/users").send({
		username: randomUsername,
		password: "testpassword",
		role: "seller",
	})

	const loginResponse = await request(app).post("/users/auth").send({
		username: randomUsername,
		password: "testpassword",
	})

	sellerToken = loginResponse.headers["set-cookie"][0]
	sellerId = loginResponse.body.id
})

afterAll(async () => {
	const prisma = new PrismaClient()
	await prisma.$disconnect()
})

describe("Product Controller", () => {
	it("should create a new product", async () => {
		const response = await request(app)
			.post("/products")
			.set("Cookie", sellerToken)
			.send({
				productName: randomProductName,
				cost: 15,
				amountAvailable: 1000,
				sellerId: sellerId,
			})
		expect(response.status).toBe(201)
		productId = response.body.product.id
	})

	it("should not create a product with an invalid name", async () => {
		const response = await request(app)
			.post("/products")
			.set("Cookie", sellerToken)
			.send({
				productName: "p",
				cost: 20,
				amountAvailable: 10,
				sellerId: sellerId,
			})
		expect(response.status).toBe(400)
	})

	it("should not create a product with an invalid cost", async () => {
		const response = await request(app)
			.post("/products")
			.set("Cookie", sellerToken)
			.send({
				productName: randomProductName,
				cost: 25,
				amountAvailable: 10,
				sellerId: sellerId,
			})
		expect(response.status).toBe(400)
	})

	it("should get all products without auth", async () => {
		const response = await request(app).get("/products")
		expect(response.status).toBe(200)
	})

	it("should get a product", async () => {
		const response = await request(app).get(`/products/${productId}`)
		expect(response.status).toBe(200)
		expect(response.body.productName).toBe(randomProductName)
	})

	it("should not get a product that does not exist", async () => {
		const response = await request(app).get(`/products/${productId}123`)
		expect(response.status).toBe(404)
	})

	it("should get all products", async () => {
		const response = await request(app).get("/products")
		expect(response.status).toBe(200)
		expect(response.body.length).toBeGreaterThan(0)
	})

	it("should update a product", async () => {
		const response = await request(app)
			.put(`/products/${productId}`)
			.set("Cookie", sellerToken)
			.send({
				productName: randomProductName + "123",
				cost: 25,
			})
		expect(response.status).toBe(200)
	})

	it("should not update a product that does not exist", async () => {
		const response = await request(app)
			.put(`/products/${productId}123`)
			.set("Cookie", sellerToken)
			.send({
				productName: randomProductName + "1",
				cost: 25,
			})
		expect(response.status).toBe(404)
	})

	// Register and login a new seller
	const newSellerUsername = `seller${Math.floor(Math.random() * 1000)}`
	let newSellerId: number
	let newSellerToken: string

	it("should update the product owner", async () => {
		await request(app).post("/users").send({
			username: newSellerUsername,
			password: "testpassword",
			role: "seller",
		})

		const loginResponse = await request(app).post("/users/auth").send({
			username: newSellerUsername,
			password: "testpassword",
		})

		newSellerToken = loginResponse.headers["set-cookie"][0]
		newSellerId = loginResponse.body.id

		const response = await request(app)
			.put(`/products/${productId}`)
			.set("Cookie", sellerToken)
			.send({
				sellerId: newSellerId,
			})
		expect(response.status).toBe(200)
	})

	it("should not update the product if the seller is not the owner", async () => {
		const response = await request(app)
			.put(`/products/${productId}`)
			.set("Cookie", newSellerToken)
			.send({
				productName: randomProductName + "11",
			})
		expect(response.status).toBe(401)
	})

	it("should not delete a product that does not exist", async () => {
		const response = await request(app)
			.delete(`/products/${productId}123`)
			.set("Cookie", sellerToken)
		expect(response.status).toBe(404)
	})

	it("should not delete product if the seller is not the owner", async () => {
		const response = await request(app)
			.delete(`/products/${productId}`)
			.set("Cookie", newSellerToken)
		expect(response.status).toBe(401)
	})

	const buyerUsername = `buyer${Math.floor(Math.random() * 1000)}`
	let buyerToken: string
	it("should buy a product", async () => {
		//create a buyer user
		await request(app).post("/users").send({
			username: buyerUsername,
			password: "testpassword",
			role: "buyer",
		})

		const loginResponse = await request(app).post("/users/auth").send({
			username: buyerUsername,
			password: "testpassword",
		})

		buyerToken = loginResponse.headers["set-cookie"][0]

		//deposit money
		await request(app).put(`/users/deposit`).set("Cookie", buyerToken).send({
			deposit: 100,
		})

		const response = await request(app)
			.post(`/products/buy/${productId}`)
			.set("Cookie", buyerToken)
			.send({
				amount: 1,
			})
		expect(response.status).toBe(200)
	})

	it("should not buy a product that does not exist", async () => {
		const response = await request(app)
			.post(`/products/buy/${productId}123`)
			.set("Cookie", buyerToken)
			.send({
				amount: 1,
			})
		expect(response.status).toBe(404)
	})

	it("should not buy more than the available amount", async () => {
		const response = await request(app)
			.post(`/products/buy/${productId}`)
			.set("Cookie", buyerToken)
			.send({
				amount: 11000,
			})
		expect(response.status).toBe(400)
	})

	it("should not buy less than 1", async () => {
		const response = await request(app)
			.post(`/products/buy/${productId}`)
			.set("Cookie", buyerToken)
			.send({
				amount: 0,
			})
		expect(response.status).toBe(400)
	})

	it("should not buy if the user is not a buyer", async () => {
		const response = await request(app)
			.post(`/products/buy/${productId}`)
			.set("Cookie", sellerToken)
			.send({
				amount: 1,
			})
		expect(response.status).toBe(401)
	})

	it("should not buy if the user is not logged in", async () => {
		const response = await request(app)
			.post(`/products/buy/${productId}`)
			.send({
				amount: 1,
			})
		expect(response.status).toBe(401)
	})

	it("should not buy if the user has insufficient funds", async () => {
		const response = await request(app)
			.post(`/products/buy/${productId}`)
			.set("Cookie", buyerToken)
			.send({
				amount: 100,
			})
		expect(response.status).toBe(400)
	})

	it("should not buy if the product is out of stock", async () => {
		// make the product out of stock
		const updateResponse = await request(app)
			.put(`/products/${productId}`)
			.set("Cookie", sellerToken)
			.send({
				amountAvailable: 0,
			})

		const response = await request(app)
			.post(`/products/buy/${productId}`)
			.set("Cookie", buyerToken)
			.send({
				amount: 1,
			})

		expect(response.status).toBe(400)
		expect(response.body.message).toBeDefined()
	})

	it("should delete a product", async () => {
		const response = await request(app)
			.delete(`/products/${productId}`)
			.set("Cookie", sellerToken)
		expect(response.status).toBe(200)
	})
})
