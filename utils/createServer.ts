import bodyParser from "body-parser"
import cookieParser from "cookie-parser"
import express from "express"
import morgan from "morgan"
import dotenv from "dotenv"
import usersRouter from "../routes/usersRouter"
import productsRouter from "../routes/productsRouter"

export const createServer = () => {
	const app = express()

	dotenv.config()

	const port = process.env.PORT || 3000

	// Middlewares
	app.use(bodyParser.json())
	app.use(bodyParser.urlencoded({ extended: false }))
	app.use(cookieParser())
	app.use(morgan("common"))

	// Routes
	app.use("/users", usersRouter)
	app.use("/products", productsRouter)

	return app
}
