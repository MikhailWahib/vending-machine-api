import { PrismaClient } from "@prisma/client"
import bcrypt from "bcrypt"

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
			async hashPassword(password: string) {
				const salt = await bcrypt.genSalt(10)
				return await bcrypt.hash(password, salt)
			},
			async comparePassword(password: string, hash: string) {
				return await bcrypt.compare(password, hash)
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
