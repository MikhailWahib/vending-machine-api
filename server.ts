import { createServer } from "./utils/createServer"

const app = createServer()

const port = process.env.PORT || 3000

app.get("/", (req, res) => {
	res.json({
		message: "Hello World!",
	})
})

app.listen(port, () => {
	console.log(`Server started at http://localhost:${port}`)
})
