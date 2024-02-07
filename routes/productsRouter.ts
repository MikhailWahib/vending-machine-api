import { Router } from "express"
import {
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
	.put(protect, updateProductValidation, handleUpdateProduct)
	.delete(protect, deleteProductValidation, handleDeleteProduct)

// router.get("/:id/buy", (req, res) => res.json({ msg: req.params.id }))
router.post("/:id/buy", protect, buyValidation, handleBuy)

export default router
