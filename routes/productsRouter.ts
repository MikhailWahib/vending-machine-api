import { Router } from "express"
import {
	handleGetAllProducts,
	handleCreateProduct,
	handleUpdateProduct,
	handleDeleteProduct,
	handleBuy,
} from "../controllers/productsController"

const router = Router()

router.route("/").get(handleGetAllProducts).post(handleCreateProduct)
router.route("/:id").put(handleUpdateProduct).delete(handleDeleteProduct)
router.post("/:id/buy", handleBuy)

export default router
