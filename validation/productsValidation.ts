import { body, cookie, param } from "express-validator"
import { acceptedValues } from "../constants"
import { handleBuy } from "../controllers/productsController"

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
		.isInt()
		.withMessage("Amount available must be an integer"),
	body("cost")
		.exists()
		.withMessage("Cost is required")
		.isInt()
		.withMessage("Cost must be an integer")
		.isIn(acceptedValues)
		.withMessage("Invalid cost value"),

	// cookie("jwt")
	// 	.exists()
	// 	.withMessage("Invalid token")
	// 	.isJWT()
	// 	.withMessage("Invalid token"),
]

export const updateProductValidation = [
	param("id")
		.exists()
		.toInt()
		.isInt()
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
		.isInt()
		.withMessage("Amount available must be an integer"),

	body("cost")
		.optional()
		.isInt()
		.withMessage("Cost must be an integer")
		.isIn(acceptedValues)
		.withMessage("Invalid cost value"),

	// cookie("jwt")
	// 	.exists()
	// 	.withMessage("Invalid token")
	// 	.isJWT()
	// 	.withMessage("Invalid token"),
]

export const deleteProductValidation = [
	param("id")
		.exists()
		.withMessage("Product ID is required")
		.toInt()
		.isInt()
		.withMessage("Product ID must be an integer"),

	// cookie("jwt")
	// 	.exists()
	// 	.withMessage("Invalid token")
	// 	.isJWT()
	// 	.withMessage("Invalid token"),
]

export const buyValidation = [
	param("id")
		.exists()
		.withMessage("Product ID is required")
		.toInt()
		.isInt()
		.withMessage("Product ID must be an integer"),

	body("userId")
		.exists()
		.withMessage("User ID is required")
		.toInt()
		.isInt()
		.withMessage("User ID must be an integer"),

	body("amount")
		.exists()
		.withMessage("Amount is required")
		.isInt()
		.withMessage("Amount must be an integer")
		.isIn(acceptedValues)
		.withMessage("Invalid amount value"),

	// cookie("jwt")
	// 	.exists()
	// 	.withMessage("Invalid token")
	// 	.isJWT()
	// 	.withMessage("Invalid token"),
]
