import { db } from "../prisma/client"

export const userExists = async (id: number) => {
	try {
		const user = await db.user.findUnique({
			where: {
				id,
			},
		})

		return user ? true : false
	} catch (e) {
		console.log(`Error finding user: ${e}`)
	}
}

export const isSeller = async (id: number) => {
	try {
		const user = await db.user.findUnique({
			where: {
				id,
			},
		})

		return user?.role === "seller"
	} catch (e) {
		console.log(`Error finding user: ${e}`)
	}
}
