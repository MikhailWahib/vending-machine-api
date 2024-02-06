import { Request, Response } from "express"
import { db } from "../prisma/client"
import { userExists } from "../utils"
import { isSeller } from "../helpers/productsHelpers"
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

export const handleCreateProduct = async (req: Request, res: Response) => {
	try {
		const { productName, amountAvailable, cost, sellerId } = req.body

		const result: Result = validationResult(req)

		if (result.array().length > 0) {
			return res.status(400).json({
				errors: result.array(),
			})
		}

		const productExists = await db.product.findUnique({
			where: {
				productName,
			},
		})

		// check if product exists
		if (productExists) {
			return res.status(400).json({
				message: "Product with this name already exists",
			})
		}

		// check if user exists
		if (!(await userExists(sellerId))) {
			return res.status(404).json({
				message: "User not found",
			})
		}

		// check if user is a seller
		if (!(await isSeller(sellerId))) {
			return res.status(401).json({
				message: "This user is not allowed to add products",
			})
		}

		const product = await db.product.create({
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
		const { productName, amountAvailable, cost, sellerId } = req.body
		// let name

		// if (productName) {
		// 	name = productName.toLowerCase()
		// }

		const result: Result = validationResult(req)

		if (result.array().length > 0) {
			return res.status(400).json({
				errors: result.array(),
			})
		}

		// check if product exists
		const product = await db.product.findUnique({
			where: {
				id: parseInt(id),
			},
		})

		if (!product) {
			return res.status(404).json({
				message: "Product not found",
			})
		}

		// check if new product name already exists
		if (productName) {
			const newProductNameExists = await db.product.findUnique({
				where: {
					productName,
				},
			})

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
				sellerId,
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
		// TODO: add authorization
		const { id } = req.params

		const result: Result = validationResult(req)

		if (result.array().length > 0) {
			return res.status(400).json({
				errors: result.array(),
			})
		}

		// check if product exists
		const product = await db.product.findUnique({
			where: {
				id: parseInt(id),
			},
		})

		if (!product) {
			return res.status(404).json({
				message: "Product not found",
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
		const { userId, amount } = req.body

		const result: Result = validationResult(req)

		if (result.array().length > 0) {
			return res.status(400).json({
				errors: result.array(),
			})
		}

		// check if product exists
		const product = await db.product.findUnique({
			where: {
				id: parseInt(id),
			},
		})

		if (!product) {
			return res.status(404).json({
				message: "Product not found",
			})
		}

		// check if user exists
		const user = await db.user.findUnique({
			where: {
				id: parseInt(userId),
			},
		})

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
				message: "Product is not available",
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
					id: parseInt(userId),
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
