import { Router } from "express"
import { handleDeposit } from "../controllers/depositController"

const router = Router()

router.put("/:userId", handleDeposit)

export default router
