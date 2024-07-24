import { Request, Response } from 'express'
import { db } from '../../prisma/client'
import { handleError, validateInput, performTransaction } from '../helpers'
import {
  findAllProducts,
  calculateChange,
  checkProductOwnership,
  findProduct,
  updateProduct,
  deleteProduct,
} from './helpers'

import { checkUserRole, findUser, checkUserExists } from '../users/helpers'

export const handleGetAllProducts = async (req: Request, res: Response) => {
  try {
    const products = await findAllProducts()
    return res.status(200).json(products)
  } catch (e) {
    return handleError(res, 500, `Error getting products: ${e}`)
  }
}

export const handleGetProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const product = await findProduct(id)

    if (!product) {
      return handleError(res, 404, 'Product not found')
    }

    return res.status(200).json(product)
  } catch (e) {
    return handleError(res, 500, `Error getting product: ${e}`)
  }
}

export const handleCreateProduct = async (req: Request, res: Response) => {
  try {
    const sellerId = req.userId
    if (!sellerId) return

    const { productName, amountAvailable, cost } = req.body

    const productExists = await findProduct(productName)
    if (productExists) {
      return handleError(res, 400, 'Product with this name already exists')
    }

    const userExists = await checkUserExists(sellerId)
    if (!userExists) {
      return handleError(res, 404, 'User not found')
    }

    const isSeller = await checkUserRole(sellerId, 'seller')
    if (!isSeller) {
      return handleError(res, 401, 'User is not a seller')
    }

    const product = await db.product.create({
      data: { productName, amountAvailable, cost, sellerId },
    })

    return res
      .status(201)
      .json({ message: 'Product created successfully', product })
  } catch (e) {
    return handleError(res, 500, `Error adding product: ${e}`)
  }
}

export const handleUpdateProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const sellerId = req.userId
    if (!sellerId || id) return

    const { productName, amountAvailable, cost } = req.body

    const product = await findProduct(parseInt(id))
    if (!product) {
      return handleError(res, 404, 'Product not found')
    }

    const isSeller = await checkUserRole(sellerId, 'seller')
    if (!isSeller) {
      return handleError(res, 401, 'User is not a seller')
    }

    const isOwner = await checkProductOwnership(parseInt(id), sellerId)
    if (!isOwner) {
      return handleError(res, 401, 'You are not the owner of this product')
    }

    if (productName) {
      const newProductNameExists = await findProduct(productName)
      if (newProductNameExists) {
        return handleError(res, 400, 'Product name already exists')
      }
    }

    const updatedProduct = await updateProduct(parseInt(id), {
      productName,
      amountAvailable,
      cost,
    })

    return res
      .status(200)
      .json({ message: 'Product updated successfully', updatedProduct })
  } catch (e) {
    return handleError(res, 500, `Error updating product: ${e}`)
  }
}

export const handleDeleteProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const sellerId = req.userId
    if (!sellerId || id) return

    const isSeller = await checkUserRole(sellerId, 'seller')
    if (!isSeller) {
      return handleError(res, 401, 'User is not a seller')
    }

    const product = await findProduct(id)
    if (!product) {
      return handleError(res, 404, 'Product not found')
    }

    const isOwner = await checkProductOwnership(parseInt(id), sellerId)
    if (!isOwner) {
      return handleError(res, 401, 'You are not the owner of this product')
    }

    await deleteProduct(parseInt(id))

    return res.status(200).json({ message: 'Product deleted successfully' })
  } catch (e) {
    return handleError(res, 500, `Error deleting product: ${e}`)
  }
}

export const handleBuy = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { amount } = req.body
    const userId = req.userId
    if (!userId || id) return

    const isBuyer = await checkUserRole(userId, 'buyer')
    if (!isBuyer) {
      return handleError(res, 401, 'User is not a buyer')
    }

    const [product, user] = await Promise.all([
      findProduct(parseInt(id)),
      findUser(userId),
    ])

    if (!product) return handleError(res, 404, 'Product not found')
    if (!user) return handleError(res, 404, 'User not found')

    if (product.cost * amount > user.deposit!) {
      return handleError(res, 400, 'Insufficient balance')
    }

    if (product.amountAvailable === 0) {
      return handleError(res, 400, 'Product is out of stock')
    }

    if (amount > product.amountAvailable) {
      return handleError(res, 400, 'Requested amount is not available')
    }

    const [updatedProduct, updatedUser] = await performTransaction([
      db.product.update({
        where: { id: parseInt(id) },
        data: { amountAvailable: { decrement: amount } },
      }),
      db.user.update({
        where: { id: userId },
        data: { deposit: { decrement: product.cost * amount } },
      }),
    ])

    const changeInCoins = calculateChange(
      user.deposit!,
      updatedProduct.cost * amount
    )

    return res.status(200).json({
      message: 'Product purchased successfully',
      products: `${updatedProduct.productName} x ${amount}`,
      totalSpent: updatedProduct.cost * amount,
      change: changeInCoins,
    })
  } catch (e) {
    return handleError(res, 500, `Error buying: ${e}`)
  }
}
