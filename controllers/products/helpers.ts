import { db } from '../../prisma/client'
import { acceptedValues } from '../../constants'

export const findProduct = async (identifier: number | string) => {
  const where =
    typeof identifier === 'number'
      ? { id: identifier }
      : { productName: identifier }

  const product = await db.product.findUnique({ where })
  return product
}

export const findAllProducts = async () => {
  const products = await db.product.findMany()
  return products
}

export const updateProduct = async (id: number, data: Record<string, any>) => {
  const product = await db.product.update({ where: { id }, data })
  return product
}

export const deleteProduct = async (id: number) => {
  await db.product.delete({ where: { id } })
  return
}

export const checkProductOwnership = async (
  productId: number,
  userId: number
) => {
  const product = await db.product.findUnique({
    where: { id: productId },
    select: { sellerId: true },
  })
  return product?.sellerId === userId
}

export const calculateChange = (deposit: number, cost: number) => {
  let change = deposit - cost
  let changeInCoins: Record<number, number> = {}
  for (const value of acceptedValues) {
    if (change >= value) {
      changeInCoins[value] = Math.floor(change / value)
      change %= value
    }
  }
  return changeInCoins
}
