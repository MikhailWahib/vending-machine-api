import { Request, Response } from "express"
import { db } from "../prisma/client"
import { acceptedValues } from "../constants"

export const handleBuy = async (req: Request, res: Response) => {
	try {
		const { userId, productId, amount } = req.body

		// check if product exists
		const product = await db.product.findUnique({
			where: {
				id: parseInt(productId),
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
					id: parseInt(productId),
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
