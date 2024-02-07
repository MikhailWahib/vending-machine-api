import { Request, Response } from "express"
import { db } from "../prisma/client"
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

		const isPasswordValid = await db.user.comparePassword(
			password,
			user.password
		)

		if (!isPasswordValid) {
			return res.status(401).json({
				message: "Invalid password",
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
	}
}

export const handleLogout = async (req: Request, res: Response) => {
	try {
		res.clearCookie("jwt")
		return res.status(200).json({ message: "Logged out successfully" })
	} catch (e) {
		console.error(`Error logging out: ${e}`)
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

		return res.status(200).json({
			id: user!.id,
			username: user!.username,
			role: user!.role,
			deposit: user!.deposit,
		})
	} catch (e) {
		console.error(`Error getting users: ${e}`)
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

		const hashedPassword = await db.user.hashPassword(password)

		const user = await db.user.create({
			data: {
				username,
				password: hashedPassword,
				role,
			},
		})

		return res.status(201).json({
			message: "User created successfully",
			user: {
				id: user.id,
				username: user.username,
				role: user.role,
				deposit: user.deposit,
			},
		})
	} catch (e) {
		console.error(`Error creating user: ${e}`)
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

		let hashedPassword: string | undefined
		if (password) {
			const hashed = await db.user.hashPassword(password)
			hashedPassword = hashed
		}

		const user = await db.user.update({
			where: {
				id,
			},
			data: {
				username,
				password: hashedPassword,
				role,
			},
		})

		return res.status(201).json({
			message: "User updated successfully",
			user,
		})
	} catch (e) {
		console.error(`Error updating user: ${e}`)
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

		return res.status(200).json({
			message: "User deleted successfully",
		})
	} catch (e) {
		console.error(`Error deleting user: ${e}`)
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
		const role = await db.user.role(id)

		if (role !== "buyer") {
			return res.status(401).json({
				message: "User is not a buyer",
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
		return res.status(201).json({
			message: `Deposited +${deposit} successfully`,
			Balance: updatedUser.deposit,
		})
	} catch (e) {
		console.error(`Error depositing: ${e}`)
	}
}

export const handleReset = async (req: Request, res: Response) => {
	try {
		const id = req.userId

		const result: Result = validationResult(req)

		if (result.array().length > 0) {
			console.log("hi")
			return res.status(400).json({
				errors: result.array(),
			})
		}

		// check if user is a buyer
		const role = await db.user.role(id)

		if (role !== "buyer") {
			return res.status(401).json({
				message: "User is not a buyer",
			})
		}

		const updatedUser = await db.user.update({
			where: {
				id,
			},
			data: {
				deposit: 0,
			},
		})

		return res.status(201).json({
			message: "User reset successfully",
			Balance: updatedUser.deposit,
		})
	} catch (e) {
		console.error(`Error depositing: ${e}`)
	}
}
