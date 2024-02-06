import { Router } from "express"
import {
	handleGetAllUsers,
	handleCreateUser,
	handleUpdateUser,
	handleDeleteUser,
} from "../controllers/usersController"

const router = Router()

router.route("/").get(handleGetAllUsers).post(handleCreateUser)
router.route("/:id").put(handleUpdateUser).delete(handleDeleteUser)

export default router
