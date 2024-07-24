import { Request, Response, NextFunction } from 'express'
import { Result, validationResult } from 'express-validator'

export const validate = (req: Request, res: Response, next: NextFunction) => {
  const result: Result = validationResult(req)
  if (result.array().length > 0) {
    return res.status(400).json({
      errors: result.array(),
    })
  }
  next()
}
