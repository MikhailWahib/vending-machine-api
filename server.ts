// TODO: fix error handling
// TODO: Add reset endpoint and its validation and tests
// TODO: add cors
// TODO: add swagger
// TODO: add interface for request body
// TODO: use express json parser instead of body-parser
import { createServer } from "./utils/createServer"

const app = createServer()

const port = process.env.PORT || 3000

app.get("/", (req, res) => {
	res.send("Hello World!")
})

app.listen(port, () => {
	console.log(`Server started at http://localhost:${port}`)
})

export default app
