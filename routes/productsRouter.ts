import { Router } from "express"
import {
	handleGetProduct,
	handleGetAllProducts,
	handleCreateProduct,
	handleUpdateProduct,
	handleDeleteProduct,
	handleBuy,
} from "../controllers/productsController"
import {
	buyValidation,
	createProductValidation,
	deleteProductValidation,
	getProductValidation,
	updateProductValidation,
} from "../validation/productsValidation"
import { protect } from "../middlewares/protect"

const router = Router()

router
	.route("/")
	.get(handleGetAllProducts)
	.post(protect, createProductValidation, handleCreateProduct)

router
	.route("/:id")
	.get(getProductValidation, handleGetProduct)
	.put(protect, updateProductValidation, handleUpdateProduct)
	.delete(protect, deleteProductValidation, handleDeleteProduct)

router.post("/buy/:id", protect, buyValidation, handleBuy)

export default router
