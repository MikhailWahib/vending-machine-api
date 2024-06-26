# API Documentation

## ENDPOINTS

- ### POST /api/v1/users

Creates a new user

body:

```json
{
	"username": "string",
	"password": "string",
	"role": "string"
}
```

response:

```json
{
	"message": "string",
	"user": {
		"id": "string",
		"username": "string",
		"role": "string",
		"deposit": "number"
	}
}
```

- ### POST /api/v1/users/auth

authenticates user

body:

```json
{
	"username": "string",
	"password": "string"
}
```

response:

```json
{
	"id": "string",
	"username": "string",
	"role": "string",
	"deposit": "number"
}

// jwt token sent in cookie
```

- ### GET /api/v1/users/current

gets current user

response:

```json
{
	"id": "string",
	"username": "string",
	"role": "string",
	"deposit": "number"
}
```

- ### POST /api/v1/users/logout

logs out user

response:

```json
{
	"message": "string"
}
```

- ### PUT /api/v1/users/{id}

updates user

body:

```json
{
	// optional fields
	"username": "string",
	"password": "string",
	"role": "string"
}
```

response:

```json
{
	"message": "string",
	"user": {
		"id": "string",
		"username": "string",
		"role": "string",
		"deposit": "number"
	}
}
```

- ### DELETE /api/v1/users/{id}

deletes user

response:

```json
{
	"message": "string"
}
```

- ### PUT /api/v1/users/{id}/deposit

deposits money

body:

```json
{
	"amount": "number" // should be a value in [5, 10, 20, 50, 100]
}
```

response:

```json
{
	"message": "string",
	"deposit": "number"
}
```

### PUT /api/v1/users/{id}/reset

resets user deposit

response:

```json
{
	"message": "string",
	"deposit": "number"
}
```

### GET /api/v1/products

gets all products

response:

```json
[
	{
		"id": "string",
		"productName": "string",
	        "cost": "number",
	        "amountAvailable": "number",
	        "sellerId": "number"
	}
]
```

### POST /api/v1/products

creates new product

body:

```json
{
    "productName": "string",
    "cost": "number", // cost should be a multiple of 5
    "amountAvailable": "number",
}
```

response:

```json
{
    "message": "string",
    "product": {
        "id": "string",
        "productName": "string",
        "cost": "number",
        "amountAvailable": "number",
        "sellerId": "number"
    }
}
```

### GET /api/v1/products/:id

gets product

response:

```json

    {
        "id": "string",
        "productName": "string",
        "cost": "number",
        "amountAvailable": "number",
        "sellerId": "number"
    }

```

### PUT /api/v1/products/:id

updates product

body:

```json
{
	// optional fields
    "productName": "string",
    "cost": "number",
    "amountAvailable": "number",
}
```

response:

```json
{
	"message": "string",
	"product": {
		"id": "string",
		"productName": "string",
		"cost": "number",
		"amountAvailable": "number",
		"sellerId": "number"
	}
}
```

### DELETE /api/v1/products/:id

deletes product

response:

```json
{
	"message": "string"
}
```

### POST /api/v1/products/:id/buy

buys product

body:

```json
{
	"amount": "number"
}
```

response:

```json
{
	"message": "string",
	"product": {
		"id": "string",
		"productName": "string",
		"cost": "number",
		"amountAvailable": "number",
		"sellerId": "number"
	},
	// return user change in coins
	"change": [
		"5": "number"
		"10": "number"
		"20": "number"
		"50": "number"
		"100": "number"
	]
}
```
