import { PrismaClient } from "@prisma/client"

export const db = new PrismaClient().$extends({
	model: {
		user: {
			async exists(id?: number) {
				const user = await db.user.findUnique({
					where: {
						id,
					},
				})
				return !!user
			},
			async role(id?: number) {
				const user = await db.user.findUnique({
					where: {
						id,
					},
				})
				return user?.role
			},
		},
		product: {
			async nameExists(productName: string) {
				const product = await db.product.findUnique({
					where: {
						productName,
					},
				})
				return !!product
			},
			async idExists(id?: number) {
				const product = await db.product.findUnique({
					where: {
						id,
					},
				})
				return !!product
			},
		},
	},
})
