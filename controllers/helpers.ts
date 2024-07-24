import { Request, Response, NextFunction } from 'express'
import { Result, validationResult } from 'express-validator'
import { db } from '../prisma/client'
import { acceptedValues } from '../constants'

export const handleError = (res: Response, status: number, message: string) => {
  console.error(`Error: ${message}`)
  return res.status(status).json({ message })
}

export const validateInput = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const result: Result = validationResult(req)
  if (result.array().length > 0) {
    return res.status(400).json({ errors: result.array() })
  }
  next()
}

// export const checkAuthorization = (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   const { id } = req.params
//   if (parseInt(id) !== req.userId) {
//     return res.status(401).json({ message: 'Unauthorized' })
//   }
//   next()
// }

// Transaction helper
export const performTransaction = async (updates: any[]) => {
  return await db.$transaction(updates)
}
