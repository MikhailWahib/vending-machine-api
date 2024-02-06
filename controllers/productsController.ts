import { Request, Response } from "express"
import { db } from "../prisma/client"
import { isSeller, userExists } from "../helpers/productsHelpers"

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
		const name = productName.toLowerCase()

		const productExists = await db.product.findUnique({
			where: {
				productName: name,
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
				productName: name,
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

export const handleDeleteProduct = async (req: Request, res: Response) => {
	try {
		const { id } = req.params

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

		return res.status(202).json({
			message: "Product deleted successfully",
		})
	} catch (e) {
		console.log(`Error deleting product: ${e}`)
		return res.status(500).json({ message: "Failed to delete product" })
	}
}

export const handleUpdateProduct = async (req: Request, res: Response) => {
	try {
		const { id } = req.params
		const { productName, amountAvailable, cost, sellerId } = req.body
		const name = productName.toLowerCase()

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
		const newProductNameExists = await db.product.findUnique({
			where: {
				productName: name,
			},
		})

		if (newProductNameExists) {
			return res.status(400).json({
				message: "Product name already exists",
			})
		}

		const updatedProduct = await db.product.update({
			where: {
				id: parseInt(id),
			},
			data: {
				productName: name,
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
