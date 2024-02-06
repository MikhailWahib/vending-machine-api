import { Request, Response } from "express"
import { db } from "../prisma/client"

export const handleCreateProduct = async (req: Request, res: Response) => {
	try {
		const { productName, amountAvailable, cost, sellerId } = req.body

		const product = await db.product.create({
			data: {
				productName,
				amountAvailable,
				cost,
				sellerId,
			},
		})

		if (!product) {
			return res.status(500).json({
				message: "Failed to create product",
			})
		}

		return res.status(201).json({
			message: "Product created successfully",
			product,
		})
	} catch (e) {
		return console.log(`Error adding product: ${e}`)
	}
}
