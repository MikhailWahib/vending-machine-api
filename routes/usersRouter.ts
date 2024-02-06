import { Router } from "express"
import {
	handleGetAllUsers,
	handleCreateUser,
	handleUpdateUser,
	handleDeleteUser,
	handleDeposit,
} from "../controllers/usersController"
import {
	createUserValidation,
	deleteUserValidation,
	depositValidation,
	updateUserValidation,
} from "../validation/userValidation"

const router = Router()

router
	.route("/")
	.get(handleGetAllUsers)
	.post(createUserValidation, handleCreateUser)
router
	.route("/:id")
	.put(updateUserValidation, handleUpdateUser)
	.delete(deleteUserValidation, handleDeleteUser)
router.put("/:id/deposit", depositValidation, handleDeposit)

export default router
