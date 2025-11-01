import { Request, Response } from 'express'
import { db } from '../../prisma/client'
import {
  findAllProducts,
  calculateChange,
  checkProductOwnership,
  findProduct,
  updateProduct,
  deleteProduct,
} from './helpers'

import { checkUserRole, findUser, checkUserExists } from '../users/helpers'

const sendError = (
  res: Response,
  status: number,
  message: string,
  err?: unknown,
  meta?: Record<string, unknown>
) => {
  console.error(`[productsController] ${message}`, { err, ...meta })
  return res.status(status).json({ message })
}

export const handleGetAllProducts = async (req: Request, res: Response) => {
  try {
    const products = await findAllProducts()
    return res.status(200).json(products)
  } catch (e) {
    return sendError(res, 500, 'Internal server error', e, {
      action: 'handleGetAllProducts',
    })
  }
}

export const handleGetProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const product = await findProduct(id)

    if (!product) {
      return sendError(res, 404, 'Product not found', undefined, {
        action: 'handleGetProduct',
        productId: id,
      })
    }

    return res.status(200).json(product)
  } catch (e) {
    return sendError(res, 500, 'Internal server error', e, {
      action: 'handleGetProduct',
    })
  }
}

export const handleCreateProduct = async (req: Request, res: Response) => {
  try {
    const sellerId = req.userId
    if (!sellerId)
      return sendError(res, 400, 'Invalid request: No user ID provided', undefined, {
        action: 'handleCreateProduct',
      })

    const { productName, amountAvailable, cost } = req.body

    const productExists = await findProduct(productName)
    if (productExists) {
      return sendError(res, 400, 'Product with this name already exists', undefined, {
        action: 'handleCreateProduct',
        productName,
      })
    }

    const userExists = await checkUserExists(sellerId)
    if (!userExists) {
      return sendError(res, 404, 'User not found', undefined, {
        action: 'handleCreateProduct',
        sellerId,
      })
    }

    const isSeller = await checkUserRole(sellerId, 'seller')
    if (!isSeller) {
      return sendError(res, 401, 'User is not a seller', undefined, {
        action: 'handleCreateProduct',
        sellerId,
      })
    }

    const product = await db.product.create({
      data: { productName, amountAvailable, cost, sellerId },
    })

    return res
      .status(201)
      .json({ message: 'Product created successfully', product })
  } catch (e) {
    return sendError(res, 500, 'Internal server error', e, {
      action: 'handleCreateProduct',
    })
  }
}

export const handleUpdateProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const sellerId = req.userId
    if (!sellerId || !id)
      return sendError(res, 400, 'Invalid request', undefined, {
        action: 'handleUpdateProduct',
      })

    const { productName, amountAvailable, cost } = req.body

    const product = await findProduct(parseInt(id))
    if (!product) {
      return sendError(res, 404, 'Product not found', undefined, {
        action: 'handleUpdateProduct',
        productId: id,
      })
    }

    const isSeller = await checkUserRole(sellerId, 'seller')
    if (!isSeller) {
      return sendError(res, 401, 'User is not a seller', undefined, {
        action: 'handleUpdateProduct',
        sellerId,
      })
    }

    const isOwner = await checkProductOwnership(parseInt(id), sellerId)
    if (!isOwner) {
      return sendError(res, 401, 'You are not the owner of this product', undefined, {
        action: 'handleUpdateProduct',
        productId: id,
        sellerId,
      })
    }

    if (productName) {
      const newProductNameExists = await findProduct(productName)
      if (newProductNameExists) {
        return sendError(res, 400, 'Product name already exists', undefined, {
          action: 'handleUpdateProduct',
          productName,
        })
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
    return sendError(res, 500, 'Internal server error', e, {
      action: 'handleUpdateProduct',
    })
  }
}

export const handleDeleteProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const sellerId = req.userId
    if (!sellerId || !id)
      return sendError(res, 400, 'Invalid request', undefined, {
        action: 'handleDeleteProduct',
      })

    const isSeller = await checkUserRole(sellerId, 'seller')
    if (!isSeller) {
      return sendError(res, 401, 'User is not a seller', undefined, {
        action: 'handleDeleteProduct',
        sellerId,
      })
    }

    const product = await findProduct(id)
    if (!product) {
      return sendError(res, 404, 'Product not found', undefined, {
        action: 'handleDeleteProduct',
        productId: id,
      })
    }

    const isOwner = await checkProductOwnership(parseInt(id), sellerId)
    if (!isOwner) {
      return sendError(res, 401, 'You are not the owner of this product', undefined, {
        action: 'handleDeleteProduct',
        productId: id,
        sellerId,
      })
    }

    await deleteProduct(parseInt(id))

    return res.status(200).json({ message: 'Product deleted successfully' })
  } catch (e) {
    return sendError(res, 500, 'Internal server error', e, {
      action: 'handleDeleteProduct',
    })
  }
}

export const handleBuy = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { amount } = req.body
    const userId = req.userId
    if (!userId || !id) {
      return sendError(res, 400, 'Invalid request', undefined, {
        action: 'handleBuy',
      })
    }

    const isBuyer = await checkUserRole(userId, 'buyer')
    if (!isBuyer) {
      return sendError(res, 401, 'User is not a buyer', undefined, {
        action: 'handleBuy',
        userId,
      })
    }

    const productId = parseInt(id)

    const [product, user] = await Promise.all([
      findProduct(productId),
      findUser(userId),
    ])

    if (!product)
      return sendError(res, 404, 'Product not found', undefined, {
        action: 'handleBuy',
        productId,
      })
    if (!user)
      return sendError(res, 404, 'User not found', undefined, {
        action: 'handleBuy',
        userId,
      })

    if (product.cost * amount > user.deposit!) {
      return sendError(res, 400, 'Insufficient balance', undefined, {
        action: 'handleBuy',
        productId,
        userId,
      })
    }

    if (product.amountAvailable === 0) {
      return sendError(res, 400, 'Product is out of stock', undefined, {
        action: 'handleBuy',
        productId,
      })
    }

    if (amount > product.amountAvailable) {
      return sendError(res, 400, 'Requested amount is not available', undefined, {
        action: 'handleBuy',
        productId,
        requestedAmount: amount,
      })
    }

    const [updatedProduct, _] = await db.$transaction([
      db.product.update({
        where: { id: productId },
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
    return sendError(res, 500, 'Internal server error', e, {
      action: 'handleBuy',
    })
  }
}
