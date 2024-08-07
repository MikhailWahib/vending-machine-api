import cookieParser from 'cookie-parser'
import express from 'express'
import morgan from 'morgan'
import dotenv from 'dotenv'
import usersRouter from '../routes/usersRouter'
import productsRouter from '../routes/productsRouter'
import cors from 'cors'

export const createServer = () => {
  const app = express()

  dotenv.config()

  // Middlewares
  app.use(express.json())
  app.use(cookieParser())
  app.use(morgan('common'))
  app.use(
    cors({
      credentials: true,
      origin: process.env.FRONTEND_URL,
    })
  )

  // Routes
  app.use('/api/v1/users', usersRouter)
  app.use('/api/v1/products', productsRouter)

  return app
}
