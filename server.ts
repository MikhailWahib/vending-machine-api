import { createServer } from "./utils/createServer"

const app = createServer()

const port = process.env.PORT || 3000

app.get("/", (req, res) => {
	res.send(
		"<p>For API documentation, go to <a target='_blank' href='https://github.com/MikhailWahib/vending-machine-api/blob/main/DOCS.md'>DOCS</a></p>"
	)
})

app.listen(port, () => {
	console.log(`Server started at http://localhost:${port}`)
})
