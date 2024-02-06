import { db } from "../prisma/client"

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
