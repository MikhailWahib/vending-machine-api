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

const router = Router()

router
	.route("/")
	.get(handleGetAllProducts)
	.post(createProductValidation, handleCreateProduct)

router
	.route("/:id")
	.put(updateProductValidation, handleUpdateProduct)
	.delete(deleteProductValidation, handleDeleteProduct)

// router.get("/:id/buy", (req, res) => res.json({ msg: req.params.id }))
router.post("/:id/buy", buyValidation, handleBuy)

export default router
