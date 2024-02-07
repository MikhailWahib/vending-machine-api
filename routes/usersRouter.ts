import { Router } from "express"
import {
	handleGetCurrentUser,
	handleCreateUser,
	handleUpdateUser,
	handleDeleteUser,
	handleDeposit,
	handleAuthUser,
	handleLogout,
	handleReset,
} from "../controllers/usersController"
import {
	authUserValidation,
	createUserValidation,
	deleteUserValidation,
	depositValidation,
	updateUserValidation,
} from "../validation/userValidation"
import { protect } from "../middlewares/protect"

const router = Router()

router
	.route("/")
	.get(protect, handleGetCurrentUser)
	.post(createUserValidation, handleCreateUser)
	.put(protect, updateUserValidation, handleUpdateUser)
	.delete(protect, deleteUserValidation, handleDeleteUser)

router.post("/auth", authUserValidation, handleAuthUser)
router.post("/logout", handleLogout)

router.put("/deposit", protect, depositValidation, handleDeposit)

router.put("/reset", protect, handleReset)

export default router
