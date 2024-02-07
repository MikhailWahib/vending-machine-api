import { Router } from "express"
import {
	handleGetCurrentUser,
	handleCreateUser,
	handleUpdateUser,
	handleDeleteUser,
	handleDeposit,
	handleAuthUser,
	handleLogout,
} from "../controllers/usersController"
import {
	authUserValidation,
	createUserValidation,
	deleteUserValidation,
	depositValidation,
	logoutValidation,
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
router.post("/logout", logoutValidation, handleLogout)

router.put("/deposit", protect, depositValidation, handleDeposit)

export default router
