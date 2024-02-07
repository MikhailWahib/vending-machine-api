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

router.post("/", createUserValidation, handleCreateUser)

router.post("/auth", authUserValidation, handleAuthUser)
router.post("/logout", handleLogout)

router
	.route("/:id")
	.put(protect, updateUserValidation, updateUserValidation, handleUpdateUser)
	.delete(protect, deleteUserValidation, deleteUserValidation, handleDeleteUser)

router.get("/current", protect, handleGetCurrentUser)

router.put("/:id/deposit", protect, depositValidation, handleDeposit)

router.put("/:id/reset", protect, handleReset)

export default router
