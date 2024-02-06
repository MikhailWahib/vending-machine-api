import { Request, Response } from "express"
import { db } from "../prisma/client"
import { isBuyer, userExists } from "../utils"

export const handleDeposit = async (req: Request, res: Response) => {
	try {
		const { userId } = req.params
		const { deposit } = req.body

		const acceptedDeposits = [5, 10, 20, 50, 100]

		if (!acceptedDeposits.includes(deposit)) {
			return res.status(400).json({
				message: "Invalid deposit amount",
			})
		}

		if (!(await userExists(userId))) {
			return res.status(404).json({
				message: "User not found",
			})
		}

		// check if user is a seller
		if (!(await isBuyer(userId))) {
			return res.status(401).json({
				message: "User is not a buyer",
			})
		}

		const updatedUser = await db.user.update({
			where: {
				id: parseInt(userId),
			},
			data: {
				deposit: {
					increment: deposit,
				},
			},
		})
		return res.status(200).json({
			message: `Deposited +${deposit} successfully`,
			Balance: updatedUser.deposit,
		})
	} catch (e) {
		console.error(`Error depositing: ${e}`)
		return res.status(500).json({ message: "Failed to deposit" })
	}
}
