import { Request, Response } from 'express'
import { db } from '../../prisma/client'
import { signToken, comparePassword, hashPassword } from '../../utils/auth'
import {
  findUser,
  checkUserExists,
  formatUserResponse,
  checkUserRole,
} from './helpers'

const sendError = (
  res: Response,
  status: number,
  message: string,
  err?: unknown,
  meta?: Record<string, unknown>
) => {
  console.error(`[usersController] ${message}`, { err, ...meta })
  return res.status(status).json({ message })
}

export const handleAuthUser = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body
    const user = await findUser(username)

    if (!user) {
      return sendError(res, 404, 'User not found', undefined, {
        action: 'handleAuthUser',
        username,
      })
    }

    const isPasswordValid = await comparePassword(
      password,
      user.password
    )
    if (!isPasswordValid) {
      return sendError(res, 401, 'Invalid password', undefined, {
        action: 'handleAuthUser',
        username,
      })
    }

    signToken(user.id, res)
    return res.status(200).json(formatUserResponse(user))
  } catch (e) {
    return sendError(res, 500, 'Internal server error', e, {
      action: 'handleAuthUser',
    })
  }
}

export const handleLogout = async (req: Request, res: Response) => {
  try {
    res.clearCookie('jwt')
    return res.status(200).json({ message: 'Logged out successfully' })
  } catch (e) {
    return sendError(res, 500, 'Internal server error', e, {
      action: 'handleLogout',
    })
  }
}

export const handleGetCurrentUser = async (req: Request, res: Response) => {
  try {
    const user = await findUser(req.userId!)
    if (!user) {
      return sendError(res, 404, 'User not found', undefined, {
        action: 'handleGetCurrentUser',
        userId: req.userId,
      })
    }
    return res.status(200).json(formatUserResponse(user))
  } catch (e) {
    return sendError(res, 500, 'Internal server error', e, {
      action: 'handleGetCurrentUser',
    })
  }
}

export const handleCreateUser = async (req: Request, res: Response) => {
  try {
    const { username, password, role } = req.body

    const userExists = await findUser(username)
    if (userExists) {
      return sendError(res, 400, 'Username already exists', undefined, {
        action: 'handleCreateUser',
        username,
      })
    }

    const hashedPassword = await hashPassword(password)
    const user = await db.user.create({
      data: { username, password: hashedPassword, role },
    })

    return res.status(201).json({
      message: 'User created successfully',
      user: formatUserResponse(user),
    })
  } catch (e) {
    return sendError(res, 500, 'Internal server error', e, {
      action: 'handleCreateUser',
    })
  }
}

export const handleUpdateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const userIdParam = parseInt(id)

    if (!req.userId || req.userId !== userIdParam) {
      return sendError(res, 401, 'Unauthorized', undefined, {
        action: 'handleUpdateUser',
        userIdParam,
      })
    }
    const { username, password, role } = req.body

    const userExists = await checkUserExists(parseInt(id))
    if (!userExists) {
      return sendError(res, 404, 'User not found', undefined, {
        action: 'handleUpdateUser',
        userIdParam,
      })
    }

    if (username) {
      const newUsernameExists = await findUser(username)
      if (newUsernameExists) {
        return sendError(res, 400, 'Username already exists', undefined, {
          action: 'handleUpdateUser',
          username,
        })
      }
    }

    let hashedPassword: string | undefined
    if (password) {
      hashedPassword = await hashPassword(password)
    }

    const user = await db.user.update({
      where: { id: parseInt(id) },
      data: { username, password: hashedPassword, role },
    })

    return res.status(200).json({
      message: 'User updated successfully',
      user: formatUserResponse(user),
    })
  } catch (e) {
    return sendError(res, 500, 'Internal server error', e, {
      action: 'handleUpdateUser',
    })
  }
}

export const handleDeleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const userIdParam = parseInt(id)

    if (!req.userId || req.userId !== userIdParam) {
      return sendError(res, 401, 'Unauthorized', undefined, {
        action: 'handleDeleteUser',
        userIdParam,
      })
    }

    const userExists = await checkUserExists(parseInt(id))
    if (!userExists) {
      return sendError(res, 404, 'User not found', undefined, {
        action: 'handleDeleteUser',
        userIdParam,
      })
    }

    await db.user.delete({ where: { id: parseInt(id) } })
    res.clearCookie('jwt')

    return res.status(200).json({ message: 'User deleted successfully' })
  } catch (e) {
    return sendError(res, 500, 'Internal server error', e, {
      action: 'handleDeleteUser',
    })
  }
}

export const handleDeposit = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { amount } = req.body
    const userIdParam = parseInt(id)

    if (!req.userId || req.userId !== userIdParam) {
      return sendError(res, 401, 'Unauthorized', undefined, {
        action: 'handleDeposit',
        userIdParam,
      })
    }

    const user = await findUser(parseInt(id))
    if (!user) {
      return sendError(res, 404, 'User not found', undefined, {
        action: 'handleDeposit',
        userIdParam,
      })
    }

    const isBuyer = await checkUserRole(parseInt(id), 'buyer')
    if (!isBuyer) {
      return sendError(res, 401, 'User is not a buyer', undefined, {
        action: 'handleDeposit',
        userIdParam,
      })
    }

    const updatedUser = await db.user.update({
      where: { id: parseInt(id) },
      data: { deposit: { increment: amount } },
    })

    return res.status(200).json({
      message: `Deposited +${amount} successfully`,
      Balance: updatedUser.deposit,
    })
  } catch (e) {
    return sendError(res, 500, 'Internal server error', e, {
      action: 'handleDeposit',
    })
  }
}

export const handleReset = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const userIdParam = parseInt(id)

    if (!req.userId || req.userId !== userIdParam) {
      return sendError(res, 401, 'Unauthorized', undefined, {
        action: 'handleReset',
        userIdParam,
      })
    }

    const user = await findUser(parseInt(id))
    if (!user) {
      return sendError(res, 404, 'User not found', undefined, {
        action: 'handleReset',
        userIdParam,
      })
    }

    const isBuyer = await checkUserRole(parseInt(id), 'buyer')
    if (!isBuyer) {
      return sendError(res, 401, 'User is not a buyer', undefined, {
        action: 'handleReset',
        userIdParam,
      })
    }

    const updatedUser = await db.user.update({
      where: { id: parseInt(id) },
      data: { deposit: 0 },
    })

    return res.status(200).json({
      message: 'User reset successfully',
      Balance: updatedUser.deposit,
    })
  } catch (e) {
    return sendError(res, 500, 'Internal server error', e, {
      action: 'handleReset',
    })
  }
}
