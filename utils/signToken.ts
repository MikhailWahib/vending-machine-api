import { Response } from "express"
import jwt from "jsonwebtoken"

export const signToken = (id: number, res: Response) => {
	const { NODE_ENV, JWT_SECRET } = process.env

	if (!process.env.JWT_SECRET) {
		throw new Error("JWT secret is not defined.")
	}

	const token = jwt.sign({ id }, JWT_SECRET!, {
		expiresIn: "30d",
	})

	return res.cookie("jwt", token, {
		httpOnly: true,
		sameSite: NODE_ENV === "production" ? "none" : "lax",
		secure: NODE_ENV === "production",
		maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
	})
}
