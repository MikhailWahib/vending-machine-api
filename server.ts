import express, { Request, Response } from "express"
import morgan from "morgan"
import bodyParser from "body-parser"
import dotenv from "dotenv"

dotenv.config()

const app = express()
const port = process.env.PORT || 3000

app.use(morgan("common"))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

app.listen(port, () => {
	console.log(`Server started at http://localhost:${port}`)
})
