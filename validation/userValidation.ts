import { body, cookie, param } from "express-validator"
import { acceptedValues } from "../constants"

export const getCurrentUserValidation = [
	cookie("jwt")
		.exists()
		.withMessage("Invalid token")
		.isJWT()
		.withMessage("Invalid token"),
]

export const authUserValidation = [
	body("username")
		.exists()
		.withMessage("Username is required")
		.isString()
		.isLength({ min: 4, max: 20 })
		.withMessage("Username must be between 4 and 20 characters")
		.toLowerCase(),
]

export const logoutValidation = [
	cookie("jwt")
		.exists()
		.withMessage("Invalid token")
		.isJWT()
		.withMessage("Invalid token"),
]

export const createUserValidation = [
	body("username")
		.exists()
		.withMessage("Username is required")
		.isString()
		.isLength({ min: 4, max: 20 })
		.withMessage("Username must be between 4 and 20 characters")
		.toLowerCase(),

	body("password")
		.exists()
		.withMessage("Password is required")
		.isLength({ min: 6 })
		.withMessage("Password must be at least 6 characters long"),

	body("role")
		.optional()
		.isString()
		.isIn(["buyer", "seller"])
		.withMessage("Invalid role"),
]

export const updateUserValidation = [
	body("username")
		.optional()
		.isString()
		.withMessage("Username must be a string")
		.isLength({ min: 4, max: 20 })
		.withMessage("Username must be between 4 and 20 characters")
		.toLowerCase(),

	body("password")
		.optional()
		.isString()
		.withMessage("Password must be a string")
		.isLength({ min: 6 })
		.withMessage("Password must be at least 8 characters long"),

	body("role")
		.optional()
		.isString()
		.isIn(["buyer", "seller"])
		.withMessage("Invalid role"),

	cookie("jwt")
		.exists()
		.withMessage("Invalid token")
		.isJWT()
		.withMessage("Invalid token"),
]

export const deleteUserValidation = [
	cookie("jwt")
		.exists()
		.withMessage("Invalid token")
		.isJWT()
		.withMessage("Invalid token"),
]

export const depositValidation = [
	body("deposit")
		.isInt({ min: 5 })
		.withMessage("Deposit must be an integer and at least 5")
		.isIn(acceptedValues)
		.withMessage("Invalid deposit amount"),

	cookie("jwt")
		.exists()
		.withMessage("Invalid token")
		.isJWT()
		.withMessage("Invalid token"),
]
