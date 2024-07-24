import { Request, Response } from 'express'
import { db } from '../../prisma/client'
import { signToken } from '../../utils/signToken'
import { handleError } from '../helpers'
import {
  findUser,
  checkUserExists,
  formatUserResponse,
  checkUserRole,
} from './helpers'

export const handleAuthUser = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body
    const user = await findUser(username)

    if (!user) {
      return handleError(res, 404, 'User not found')
    }

    const isPasswordValid = await db.user.comparePassword(
      password,
      user.password
    )
    if (!isPasswordValid) {
      return handleError(res, 401, 'Invalid password')
    }

    signToken(user.id, res)
    return res.status(200).json(formatUserResponse(user))
  } catch (e) {
    return handleError(res, 500, `Error authenticating user: ${e}`)
  }
}

export const handleLogout = async (req: Request, res: Response) => {
  try {
    res.clearCookie('jwt')
    return res.status(200).json({ message: 'Logged out successfully' })
  } catch (e) {
    return handleError(res, 500, `Error logging out: ${e}`)
  }
}

export const handleGetCurrentUser = async (req: Request, res: Response) => {
  try {
    const user = await findUser(req.userId!)
    if (!user) {
      return handleError(res, 404, 'User not found')
    }
    return res.status(200).json(formatUserResponse(user))
  } catch (e) {
    return handleError(res, 500, `Error getting user: ${e}`)
  }
}

export const handleCreateUser = async (req: Request, res: Response) => {
  try {
    const { username, password, role } = req.body

    const userExists = await findUser(username)
    if (userExists) {
      return handleError(res, 400, 'Username already exists')
    }

    const hashedPassword = await db.user.hashPassword(password)
    const user = await db.user.create({
      data: { username, password: hashedPassword, role },
    })

    return res.status(201).json({
      message: 'User created successfully',
      user: formatUserResponse(user),
    })
  } catch (e) {
    return handleError(res, 500, `Error creating user: ${e}`)
  }
}

export const handleUpdateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { username, password, role } = req.body

    const userExists = await checkUserExists(parseInt(id))
    if (!userExists) {
      return handleError(res, 404, 'User not found')
    }

    if (username) {
      const newUsernameExists = await findUser(username)
      if (newUsernameExists) {
        return handleError(res, 400, 'Username already exists')
      }
    }

    let hashedPassword: string | undefined
    if (password) {
      hashedPassword = await db.user.hashPassword(password)
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
    return handleError(res, 500, `Error updating user: ${e}`)
  }
}

export const handleDeleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const userExists = await checkUserExists(parseInt(id))
    if (!userExists) {
      return handleError(res, 404, 'User not found')
    }

    await db.user.delete({ where: { id: parseInt(id) } })
    res.clearCookie('token')

    return res.status(200).json({ message: 'User deleted successfully' })
  } catch (e) {
    return handleError(res, 500, `Error deleting user: ${e}`)
  }
}

export const handleDeposit = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { deposit } = req.body

    const user = await findUser(parseInt(id))
    if (!user) {
      return handleError(res, 404, 'User not found')
    }

    const isBuyer = await checkUserRole(parseInt(id), 'buyer')
    if (!isBuyer) {
      return handleError(res, 401, 'User is not a buyer')
    }

    const updatedUser = await db.user.update({
      where: { id: parseInt(id) },
      data: { deposit: { increment: deposit } },
    })

    return res.status(200).json({
      message: `Deposited +${deposit} successfully`,
      Balance: updatedUser.deposit,
    })
  } catch (e) {
    return handleError(res, 500, `Error depositing: ${e}`)
  }
}

export const handleReset = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const user = await findUser(parseInt(id))
    if (!user) {
      return handleError(res, 404, 'User not found')
    }

    const isBuyer = await checkUserRole(parseInt(id), 'buyer')
    if (!isBuyer) {
      return handleError(res, 401, 'User is not a buyer')
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
    return handleError(res, 500, `Error resetting deposit: ${e}`)
  }
}
