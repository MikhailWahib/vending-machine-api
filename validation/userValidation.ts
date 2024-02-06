import { body, param } from "express-validator"
import { acceptedValues } from "../constants"

export const createUserValidation = [
	body("username")
		.exists()
		.withMessage("Username is required")
		.isString()
		.isLength({ min: 6, max: 20 })
		.withMessage("Username must be between 6 and 20 characters")
		.toLowerCase(),

	body("password")
		.exists()
		.withMessage("Password is required")
		.isLength({ min: 6 })
		.withMessage("Password must be at least 8 characters long"),

	// maybe empty
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
		.isLength({ min: 6, max: 20 })
		.withMessage("Username must be between 6 and 20 characters")
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
]

export const deleteUserValidation = [
	param("id")
		.exists()
		.withMessage("User ID is required")
		.toInt()
		.isInt()
		.withMessage("User ID must be an integer"),
]

export const depositValidation = [
	param("id")
		.exists()
		.withMessage("User ID is required")
		.toInt()
		.isInt()
		.withMessage("User ID must be an integer"),

	body("deposit")
		.isInt()
		.withMessage("Deposit must be an integer")
		.isIn(acceptedValues)
		.withMessage("Invalid deposit amount"),
]
