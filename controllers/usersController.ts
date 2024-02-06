import { Request, Response } from "express"
import { db } from "../prisma/client"
import { acceptedValues } from "../constants"
import { userExists, isBuyer } from "../utils"
import { Result, validationResult } from "express-validator"

export const handleGetAllUsers = async (req: Request, res: Response) => {
	try {
		const users = await db.user.findMany()

		return res.status(200).json(users)
	} catch (e) {
		console.error(`Error getting users: ${e}`)
		return res.status(500).json({ message: "Failed to get users" })
	}
}

export const handleCreateUser = async (req: Request, res: Response) => {
	try {
		const { username, password, role } = req.body

		const result: Result = validationResult(req)

		if (result.array().length > 0) {
			return res.status(400).json({
				errors: result.array(),
			})
		}

		// check if username exists
		const userExists = await db.user.findUnique({
			where: {
				username,
			},
		})

		if (userExists) {
			return res.status(400).json({
				message: "Username already exists",
			})
		}

		const user = await db.user.create({
			data: {
				username,
				password,
				role,
			},
		})

		return res.status(201).json({
			message: "User created successfully",
			user,
		})
	} catch (e) {
		console.error(`Error creating user: ${e}`)
		return res.status(500).json({ message: "Failed to create user" })
	}
}

export const handleUpdateUser = async (req: Request, res: Response) => {
	try {
		const { id } = req.params
		const { username, password, role } = req.body

		const result: Result = validationResult(req)

		if (result.array().length > 0) {
			return res.status(400).json({
				errors: result.array(),
			})
		}

		// check if username exists
		const userExists = await db.user.findUnique({
			where: {
				id: parseInt(id),
			},
		})

		if (!userExists) {
			return res.status(404).json({
				message: "User not found",
			})
		}

		// check if new username already exists
		if (username) {
			const newUsernameExists = await db.user.findUnique({
				where: {
					username,
				},
			})
			if (newUsernameExists) {
				return res.status(400).json({
					message: "Username already exists",
				})
			}
		}

		const user = await db.user.update({
			where: {
				id: parseInt(id),
			},
			data: {
				username,
				password,
				role,
			},
		})

		return res.status(201).json({
			message: "User updated successfully",
			user,
		})
	} catch (e) {
		console.error(`Error updating user: ${e}`)
		return res.status(500).json({ message: "Failed to update user" })
	}
}

export const handleDeleteUser = async (req: Request, res: Response) => {
	try {
		const { id } = req.params

		const result: Result = validationResult(req)

		if (result.array().length > 0) {
			return res.status(400).json({
				errors: result.array(),
			})
		}

		// check if username exists
		const user = await db.user.findUnique({
			where: {
				id: parseInt(id),
			},
		})

		if (!user) {
			return res.status(404).json({
				message: "User not found",
			})
		}

		await db.user.delete({
			where: {
				id: parseInt(id),
			},
		})

		return res.status(202).json({
			message: "User deleted successfully",
		})
	} catch (e) {
		console.error(`Error deleting user: ${e}`)
		res.status(500).json({ message: "Failed to delete user" })
	}
}

export const handleDeposit = async (req: Request, res: Response) => {
	try {
		const { id } = req.params
		const { deposit } = req.body

		const result: Result = validationResult(req)

		if (result.array().length > 0) {
			return res.status(400).json({
				errors: result.array(),
			})
		}

		if (!acceptedValues.includes(deposit)) {
			return res.status(400).json({
				message: "Invalid deposit amount",
			})
		}

		if (!(await userExists(id))) {
			return res.status(404).json({
				message: "User not found",
			})
		}

		// check if user is a seller
		if (!(await isBuyer(id))) {
			return res.status(401).json({
				message: "User is not a buyer",
			})
		}

		const updatedUser = await db.user.update({
			where: {
				id: parseInt(id),
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
