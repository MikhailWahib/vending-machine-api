import { Router } from 'express'
import {
  handleGetCurrentUser,
  handleCreateUser,
  handleUpdateUser,
  handleDeleteUser,
  handleDeposit,
  handleAuthUser,
  handleLogout,
  handleReset,
} from '../controllers/users/usersController'
import {
  authUserValidation,
  createUserValidation,
  deleteUserValidation,
  depositValidation,
  updateUserValidation,
} from '../validation/userValidation'
import { protect } from '../middlewares/protect'
import { validate } from '../middlewares/validate'

const router = Router()

// routes that don't require authentication
router.post('/', createUserValidation, validate, handleCreateUser)
router.post('/auth', authUserValidation, validate, handleAuthUser)
router.post('/logout', handleLogout)

// routes that require authentication
router
  .route('/:id')
  .put(protect, updateUserValidation, validate, handleUpdateUser)
  .delete(protect, deleteUserValidation, validate, handleDeleteUser)

router.get('/current', protect, handleGetCurrentUser)

router.put('/:id/deposit', protect, depositValidation, validate, handleDeposit)
router.put('/:id/reset', protect, handleReset)

export default router
