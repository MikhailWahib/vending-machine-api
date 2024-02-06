import express, { Request, Response } from "express"
import morgan from "morgan"
import bodyParser from "body-parser"
import dotenv from "dotenv"
import userRouter from "./routes/usersRouter"
import productRouter from "./routes/productsRouter"
import depositRouter from "./routes/depositRouter"

dotenv.config()

const app = express()
const port = process.env.PORT || 3000

// Middlewares
app.use(morgan("common"))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

// Routes
app.use("/users", userRouter)
app.use("/products", productRouter)
app.use("/deposit", depositRouter)

app.get("/", async (req: Request, res: Response) => {
	res.json({ message: "Hello" })
})

app.listen(port, () => {
	console.log(`Server started at http://localhost:${port}`)
})
