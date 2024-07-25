import { Router } from 'express'
import {
  handleGetProduct,
  handleGetAllProducts,
  handleCreateProduct,
  handleUpdateProduct,
  handleDeleteProduct,
  handleBuy,
} from '../controllers/products/productsController'
import {
  buyValidation,
  createProductValidation,
  deleteProductValidation,
  getProductValidation,
  updateProductValidation,
} from '../validation/productsValidation'
import { protect } from '../middlewares/protect'
import { validate } from '../middlewares/validate'

const router = Router()

router
  .route('/')
  .get(handleGetAllProducts)
  .post(protect, createProductValidation, validate, handleCreateProduct)

router
  .route('/:id')
  .get(getProductValidation, validate, handleGetProduct)
  .put(protect, updateProductValidation, validate, handleUpdateProduct)
  .delete(protect, deleteProductValidation, validate, handleDeleteProduct)

router.post('/:id/buy', protect, buyValidation, validate, handleBuy)

export default router
