import express, { Request, Response } from "express"
import morgan from "morgan"
import bodyParser from "body-parser"
import dotenv from "dotenv"
import userRouter from "./routes/usersRouter"
import productRouter from "./routes/productsRouter"
import depositRouter from "./routes/depositRouter"
import buyRouter from "./routes/buyRouter"

dotenv.config()

const app = express()
const port = process.env.PORT || 3000

// Middlewares
app.use(morgan("common"))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

// Routes
// TODO: add Validation
// TODO: make the deposit endpoint for users
// TODO: make the buy endpoint for products
app.use("/users", userRouter)
app.use("/products", productRouter)
app.use("/deposit", depositRouter)
app.use("/buy", buyRouter)

app.get("/", async (req: Request, res: Response) => {
	res.json({ message: "Hello" })
})

app.listen(port, () => {
	console.log(`Server started at http://localhost:${port}`)
})
