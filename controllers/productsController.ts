import { Request, Response } from "express"
import { db } from "../prisma/client"
import { acceptedValues } from "../constants"
import { Result, validationResult } from "express-validator"

export const handleGetAllProducts = async (req: Request, res: Response) => {
	try {
		const products = await db.product.findMany()

		return res.status(200).json(products)
	} catch (e) {
		console.log(`Error getting products: ${e}`)
		return res.status(500).json({ message: "Failed to get products" })
	}
}

export const handleGetProduct = async (req: Request, res: Response) => {
	try {
		const { id } = req.params

		const productExists = await db.product.idExists(parseInt(id))

		if (!productExists) {
			return res.status(404).json({
				message: "Product not found",
			})
		}

		const product = await db.product.findUnique({
			where: {
				id: parseInt(id),
			},
		})

		return res.status(200).json(product)
	} catch (e) {
		console.log(`Error getting product: ${e}`)
		return res.status(500).json({ message: "Failed to get product" })
	}
}

export const handleCreateProduct = async (req: Request, res: Response) => {
	try {
		const sellerId = req.userId
		const { productName, amountAvailable, cost } = req.body

		const result: Result = validationResult(req)

		if (result.array().length > 0) {
			return res.status(400).json({
				errors: result.array(),
			})
		}

		const productExists = await db.product.nameExists(productName)

		// check if product exists
		if (productExists) {
			return res.status(400).json({
				message: "Product with this name already exists",
			})
		}

		// check if user exists
		const userExists = await db.user.exists(sellerId)

		if (!userExists) {
			return res.status(404).json({
				message: "User not found",
			})
		}

		// check if user is a seller
		const userRole = await db.user.role(sellerId)

		if (userRole !== "seller") {
			return res.status(401).json({
				message: "User is not a seller",
			})
		}

		const product = await db.product.create({
			// @ts-ignore
			data: {
				productName,
				amountAvailable,
				cost,
				sellerId,
			},
		})

		return res.status(201).json({
			message: "Product created successfully",
			product,
		})
	} catch (e) {
		console.log(`Error adding product: ${e}`)
		return res.status(500).json({ message: "Failed to add product" })
	}
}

export const handleUpdateProduct = async (req: Request, res: Response) => {
	try {
		const { id } = req.params
		const sellerId = req.userId
		const { productName, amountAvailable, cost } = req.body

		const result: Result = validationResult(req)

		if (result.array().length > 0) {
			return res.status(400).json({
				errors: result.array(),
			})
		}

		// check if product exists
		const product = await db.product.idExists(parseInt(id))

		if (!product) {
			return res.status(404).json({
				message: "Product not found",
			})
		}

		// check if user is a seller
		const userRole = await db.user.role(sellerId)

		if (userRole !== "seller") {
			return res.status(401).json({
				message: "User is not a seller",
			})
		}

		// check if the seller is the owner of the product
		const isOwner = await db.product.isOwner(parseInt(id), sellerId)

		if (!isOwner) {
			return res.status(401).json({
				message: "You are not the owner of this product",
			})
		}

		// check if new product name already exists
		if (productName) {
			const newProductNameExists = await db.product.nameExists(productName)

			if (newProductNameExists) {
				return res.status(400).json({
					message: "Product name already exists",
				})
			}
		}

		const updatedProduct = await db.product.update({
			where: {
				id: parseInt(id),
			},
			data: {
				productName,
				amountAvailable,
				cost,
			},
		})

		return res.status(200).json({
			message: "Product updated successfully",
			updatedProduct,
		})
	} catch (e) {
		console.log(`Error updating product: ${e}`)
		return res.status(500).json({ message: "Failed to update product" })
	}
}

export const handleDeleteProduct = async (req: Request, res: Response) => {
	try {
		const { id } = req.params
		const sellerId = req.userId

		const result: Result = validationResult(req)

		if (result.array().length > 0) {
			return res.status(400).json({
				errors: result.array(),
			})
		}

		// check if user is a seller
		const userRole = await db.user.role(sellerId)

		if (userRole !== "seller") {
			return res.status(401).json({
				message: "User is not a seller",
			})
		}

		// check if product exists
		const product = await db.product.idExists(parseInt(id))

		if (!product) {
			return res.status(404).json({
				message: "Product not found",
			})
		}

		// check if the seller is the owner of the product
		const isOwner = await db.product.isOwner(parseInt(id), sellerId)

		if (!isOwner) {
			return res.status(401).json({
				message: "You are not the owner of this product",
			})
		}

		await db.product.delete({
			where: {
				id: parseInt(id),
			},
		})

		return res.status(200).json({
			message: "Product deleted successfully",
		})
	} catch (e) {
		return console.log(`Error deleting product: ${e}`)
	}
}

export const handleBuy = async (req: Request, res: Response) => {
	try {
		const { id } = req.params
		const { amount } = req.body
		const userId = req.userId

		const result: Result = validationResult(req)

		if (result.array().length > 0) {
			return res.status(400).json({
				errors: result.array(),
			})
		}

		// check if user is a buyer
		const userRole = await db.user.role(userId)

		if (userRole !== "buyer") {
			return res.status(401).json({
				message: "User is not a buyer",
			})
		}

		const product = await db.product.findUnique({
			where: {
				id: parseInt(id),
			},
		})

		// check if product exists
		if (!product) {
			return res.status(404).json({
				message: "Product not found",
			})
		}

		const user = await db.user.findUnique({
			where: {
				id: userId,
			},
		})

		// check if user exists
		if (!user) {
			return res.status(404).json({
				message: "User not found",
			})
		}

		// check if user has enough money
		if (product.cost * amount > user.deposit!) {
			return res.status(400).json({
				message: "Insufficient balance",
			})
		}

		// check if product is available
		if (product.amountAvailable === 0) {
			return res.status(400).json({
				message: "Product is out of stock",
			})
		}

		// check if requested amount is available
		if (amount > product.amountAvailable) {
			return res.status(400).json({
				message: "Requested amount is not available",
			})
		}

		const [updatedProduct, updatedUser] = await db.$transaction([
			db.product.update({
				where: {
					id: parseInt(id),
				},
				data: {
					amountAvailable: {
						decrement: amount,
					},
				},
			}),
			db.user.update({
				where: {
					id: userId,
				},
				data: {
					deposit: {
						decrement: product.cost * amount,
					},
				},
			}),
		])

		// calculate change
		let userChange = user.deposit! - updatedProduct.cost * amount
		let userChangeInCoins: Record<number, number> = {}

		for (let i = 0; i < acceptedValues.length; i++) {
			if (userChange >= acceptedValues[i]) {
				userChangeInCoins[acceptedValues[i]] = Math.floor(
					userChange / acceptedValues[i]
				)
				userChange = userChange % acceptedValues[i]
			}
		}

		return res.status(200).json({
			message: "Product purchased successfully",
			products: `${updatedProduct.productName} x ${amount}`,
			totalSpent: updatedProduct.cost * amount,
			change: userChangeInCoins,
		})
	} catch (e) {
		console.log(`Error buying: ${e}`)
		return res.status(500).json({ message: "Failed to buy" })
	}
}
