# Vending Machine API

## Description

This is an API for a vending machine built using NodeJS, Express, TypeScript and SQLite3 with Prisma ORM.

For Documentation go to DOCS.md

## Install

make sure you have `node`, `npm` and `sqlite3` installed.

Clone the repository

```bash
git clone https://github.com/FlapKap/vending-machine-api
```

Navigate to the folder

```bash
cd vending-machine-api
```

Install dependencies

```bash
npm install
```

## Environment Setup

- go to `.env.example` and fill it
- rename `.env.example` to `.env`

## Database Setup

```bash
npx prisma migrate dev --name init
```

## Run

Run dev server

```bash
npm run dev
```

## Build

Build

```bash
npm run build
```

Start server

```bash
npm run start
```

Run tests

```bash
npm run test
```
