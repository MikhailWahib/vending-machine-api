import { body, cookie, param } from "express-validator"
import { acceptedValues } from "../constants"

export const getProductValidation = [
	param("id")
		.exists()
		.toInt()
		.isInt({ min: 0 })
		.withMessage("Product ID must be an integer"),
]

export const createProductValidation = [
	body("productName")
		.exists()
		.withMessage("Product name is required")
		.isString()
		.withMessage("Product name must be a string")
		.isLength({ min: 2, max: 40 })
		.withMessage("Product name must be between 2 and 40 characters")
		.toLowerCase(),

	body("amountAvailable")
		.exists()
		.withMessage("Amount available is required")
		.isInt({ min: 0 })
		.withMessage("Amount available must be an integer"),
	body("cost")
		.exists()
		.withMessage("Cost is required")
		.isInt({ min: 5 })
		.withMessage("Cost must be an integer and at least 5")
		.custom((value) => {
			return value % 5 === 0
		})
		.withMessage("Cost must be a multiple of 5"),

	cookie("jwt")
		.exists()
		.withMessage("Invalid token")
		.isJWT()
		.withMessage("Invalid token"),
]

export const updateProductValidation = [
	param("id")
		.exists()
		.toInt()
		.isInt({ min: 0 })
		.withMessage("Product ID must be an integer"),

	body("productName")
		.optional()
		.isString()
		.withMessage("Product name must be a string")
		.isLength({ min: 2, max: 40 })
		.withMessage("Product name must be between 2 and 40 characters")
		.toLowerCase(),

	body("amountAvailable")
		.optional()
		.isInt({ min: 0 })
		.withMessage("Amount available must be an integer"),

	body("cost")
		.optional()
		.isInt({ min: 5 })
		.withMessage("Cost must be an integer and at least 5")
		.custom((value) => {
			return value % 5 === 0
		})
		.withMessage("Cost must be a multiple of 5"),

	cookie("jwt")
		.exists()
		.withMessage("Invalid token")
		.isJWT()
		.withMessage("Invalid token"),
]

export const deleteProductValidation = [
	param("id")
		.exists()
		.withMessage("Product ID is required")
		.toInt()
		.isInt({ min: 0 })
		.withMessage("Product ID must be an integer"),

	cookie("jwt")
		.exists()
		.withMessage("Invalid token")
		.isJWT()
		.withMessage("Invalid token"),
]

export const buyValidation = [
	param("id")
		.exists()
		.withMessage("Product ID is required")
		.toInt()
		.isInt({ min: 0 })
		.withMessage("Product ID must be an integer"),

	body("amount")
		.exists()
		.withMessage("Amount is required")
		.isInt({ min: 1 })
		.withMessage("Amount must be an integer"),

	cookie("jwt")
		.exists()
		.withMessage("Invalid token")
		.isJWT()
		.withMessage("Invalid token"),
]
