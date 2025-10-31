import { PrismaClient, Prisma } from '@prisma/client'

export const db = new PrismaClient().$extends({
  model: {
    user: {
      async exists(id?: number) {
        if (id === undefined) return false

        const context = Prisma.getExtensionContext(this)
        const user = await context.findUnique({
          where: { id },
        })
        return !!user
      },
    },
    product: {
      async nameExists(productName: string) {
        const context = Prisma.getExtensionContext(this)
        const product = await context.findUnique({
          where: { productName },
        })
        return !!product
      },
      async idExists(id?: number) {
        if (id === undefined) return false

        const context = Prisma.getExtensionContext(this)
        const product = await context.findUnique({
          where: { id },
        })
        return !!product
      },
      async isOwner(id?: number, sellerId?: number) {
        if (id === undefined || sellerId === undefined) return false

        const context = Prisma.getExtensionContext(this)
        const product = await context.findUnique({
          where: { id },
        })
        return product?.sellerId === sellerId
      },
    },
  },
})
