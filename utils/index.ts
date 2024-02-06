import { db } from "../prisma/client"

export const userExists = async (id: string) => {
	try {
		const user = await db.user.findUnique({
			where: {
				id: parseInt(id),
			},
		})

		return user
	} catch (e) {
		console.log(`Error finding user: ${e}`)
	}
}

export const isBuyer = async (id: string) => {
	try {
		const user = await db.user.findUnique({
			where: {
				id: parseInt(id),
			},
		})

		return user?.role === "buyer"
	} catch (e) {
		console.log(`Error finding user: ${e}`)
	}
}
