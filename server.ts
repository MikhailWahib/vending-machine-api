// TODO: add interface for request body
// TODO: fix error handling
// TODO: add cors
// TODO: tests
// TODO: use express json parser instead of body-parser
import express, { Request, Response } from "express"
import morgan from "morgan"
import bodyParser from "body-parser"
import cookieParser from "cookie-parser"
import dotenv from "dotenv"
import userRouter from "./routes/usersRouter"
import productRouter from "./routes/productsRouter"

dotenv.config()

const app = express()
const port = process.env.PORT || 3000

// Middlewares
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(morgan("common"))

// Routes
app.use("/users", userRouter)
app.use("/products", productRouter)

app.get("/", async (req: Request, res: Response) => {
	res.json({ message: "Hello" })
})

app.listen(port, () => {
	console.log(`Server started at http://localhost:${port}`)
})
