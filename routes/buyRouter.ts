import { Router } from "express"
import { handleBuy } from "../controllers/buyController"

const router = Router()

router.post("/", handleBuy)

export default router
