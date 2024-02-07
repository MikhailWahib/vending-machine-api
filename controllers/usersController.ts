import { Request, Response } from "express"
import { db } from "../prisma/client"
import { getUserRole } from "../utils"
import { Result, validationResult } from "express-validator"
import { signToken } from "../utils/signToken"

export const handleAuthUser = async (req: Request, res: Response) => {
	try {
		const { username, password } = req.body

		const result: Result = validationResult(req)

		if (result.array().length > 0) {
			return res.status(400).json({
				errors: result.array(),
			})
		}

		const user = await db.user.findUnique({
			where: {
				username,
			},
		})

		if (!user) {
			return res.status(404).json({
				message: "User not found",
			})
		}

		if (user.password !== password) {
			return res.status(401).json({
				message: "Invalid credentials",
			})
		}

		signToken(user.id, res)

		return res.status(200).json({
			id: user.id,
			username: user.username,
			role: user.role,
			deposit: user.deposit,
		})
	} catch (e) {
		console.error(`Error authenticating user: ${e}`)
		return res.status(500).json({ message: "Failed to authenticate user" })
	}
}

export const handleLogout = async (req: Request, res: Response) => {
	try {
		res.clearCookie("jwt")
		return res.status(200).json({ message: "Logged out successfully" })
	} catch (e) {
		console.error(`Error logging out: ${e}`)
		return res.status(500).json({ message: "Failed to log out" })
	}
}

export const handleGetCurrentUser = async (req: Request, res: Response) => {
	try {
		const id = req.userId

		const user = await db.user.findUnique({
			where: {
				id,
			},
		})

		return res.status(200).json(user)
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
		const id = req.userId
		const { username, password, role } = req.body

		const result: Result = validationResult(req)

		if (result.array().length > 0) {
			return res.status(400).json({
				errors: result.array(),
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
				id,
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
		const id = req.userId

		const result: Result = validationResult(req)

		if (result.array().length > 0) {
			return res.status(400).json({
				errors: result.array(),
			})
		}

		// check if username exists
		const user = await db.user.findUnique({
			where: {
				id,
			},
		})

		if (!user) {
			return res.status(404).json({
				message: "User not found",
			})
		}

		await db.user.delete({
			where: {
				id,
			},
		})

		res.clearCookie("token")

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
		const id = req.userId
		const { deposit } = req.body

		const result: Result = validationResult(req)

		if (result.array().length > 0) {
			return res.status(400).json({
				errors: result.array(),
			})
		}

		// check if user is a seller
		const role = await getUserRole(id)

		if (role !== "seller") {
			return res.status(401).json({
				message: "User is not a seller",
			})
		}

		const updatedUser = await db.user.update({
			where: {
				id,
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
