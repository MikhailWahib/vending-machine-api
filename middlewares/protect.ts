import { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken"

declare global {
	namespace Express {
		interface Request {
			userId?: number
		}
	}
}

export const protect = (req: Request, res: Response, next: NextFunction) => {
	const { JWT_SECRET } = process.env

	if (!JWT_SECRET) {
		console.error('JWT_SECRET is not defined')
		return res.status(500).json({ message: 'Server misconfiguration' })
	}

	try {
		const token = req.cookies.jwt

		if (!token) {
			return res.status(401).json({ message: "Unauthorized" })
		}

		const decoded = jwt.verify(token, JWT_SECRET!) as { id: number }

		if (!decoded) {
			return res.status(401).json({ message: "Invalid token" })
		}

		req.userId = decoded.id

		next()
	} catch (err) {
		return res.status(401).json({ message: "Invalid token" })
	}
}
