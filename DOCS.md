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
	"id": "string",
	"username": "string",
	"role": "string",
	"deposit": number
}
```

- ### GET /api/v1/users/current

gets current user

response:

```json
{
	"id": "string",
	"username": "string",
	"role": "string",
	"deposit": number
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
	"deposit": number
}

// jwt token sent in cookie
```

- ### POST /api/v1/users/logout

logs out user

response:

```json
{
	"message": "string"
}
```

- ### PUT /api/v1/users/deposit

deposits money

body:

```json
{
	"amount": number
}
```

response:

```json
{
	"message": "string",
	"deposit": number
}
```

### PUT /api/v1/users/reset

resets user deposit

response:

```json
{
	"message": "string",
	"deposit": number
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
        "cost": number,
        "amountAvailable": number,
        "sellerId": number
	}
]
```

### POST /api/v1/products

creates new product

body:

```json
{
    "productName": "string",
    "cost": number,
    "amountAvailable": number,
}
```

response:

```json
{
    "message": "string",
    "product": {
        "id": "string",
        "productName": "string",
        "cost": number,
        "amountAvailable": number,
        "sellerId": number
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
        "cost": number,
        "amountAvailable": number,
        "sellerId": number
    }

```

### PUT /api/v1/products/:id

updates product

body:

```json
{
    "productName": "string",
    "cost": number,
    "amountAvailable": number,
}
```
