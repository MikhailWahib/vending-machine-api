# Vending Machine API

## Description

This is an API for a vending machine built using NodeJS, Express, TypeScript and SQLite3 with Prisma ORM.

For Documentation go to https://github.com/MikhailWahib/vending-machine-api/blob/main/DOCS.md

## Install

make sure you have `node`, `pnpm` or `npm`, and `sqlite3` installed.

Clone the repository

```bash
git clone https://github.com/MikhailWahib/vending-machine-api
```

Navigate to the folder

```bash
cd vending-machine-api
```

Install dependencies

```bash
pnpm install
```

## Environment Setup

- create `.env` file
- copy `.env.example` content to `.env` and fill the required vars

## Database Setup

```bash
pnpx prisma migrate dev --name init
```

## Run

Run dev server

```bash
pnpm run dev
```

## Build

Build

```bash
pnpm run build
```

Start server

```bash
pnpm run start
```

## Testing

### Setup

- create `.env.test` file
- copy `.env.test.example` content to `.env.test` and fill the required vars

### Run tests

```bash
pnpm test
```
