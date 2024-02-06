import { Request, Response } from "express"
import { db } from "../prisma/client"

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
		const { username, password, deposit, role } = req.body

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
				deposit,
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
		const { username, password, deposit, role } = req.body

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

		const user = await db.user.update({
			where: {
				id: parseInt(id),
			},
			data: {
				username,
				password,
				deposit,
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
