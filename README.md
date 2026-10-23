# News Aggregator API

A Node.js and Express REST API for user accounts, news preferences, and personalized news. The application uses MongoDB through Mongoose, JSON Web Tokens (JWT) for protected endpoints, and is designed to retrieve news from [NewsAPI.org](https://newsapi.org/).

> **Implementation status:** User signup, login, and preference routes are present in the current `master` branch. The news routes/controller are still incomplete and the news router is currently commented out in `app.js`. The news endpoints below describe the intended API contract; they will not work until the news implementation is completed and the router is mounted.

## Contents

- [Features](#features)
- [Technology stack](#technology-stack)
- [Prerequisites](#prerequisites)
- [Installation and configuration](#installation-and-configuration)
- [Run the application](#run-the-application)
- [Run tests](#run-tests)
- [API documentation](#api-documentation)
- [Pagination format](#pagination-format)
- [Project structure](#project-structure)
- [Security and development notes](#security-and-development-notes)

## Features

### Available in the current code

- User signup and login
- JWT-protected endpoints
- Retrieve saved user preferences
- Update saved user preferences
- Express request logging and JSON request parsing

### Planned / in progress

- Personalized news feed based on each user's preferences
- Fetch news from NewsAPI.org
- Paginated feeds and keyword search
- Mark articles as read or favorite
- Retrieve a user's read and favorite articles

## Technology stack

- **Runtime:** Node.js 18 or later
- **Web framework:** Express 4
- **Database and ODM:** MongoDB and Mongoose
- **Authentication:** JSON Web Token (JWT)
- **Password hashing:** bcrypt
- **External news provider:** NewsAPI.org
- **Testing:** TAP and Supertest

## Prerequisites

1. Install [Node.js 18 or later](https://nodejs.org/).
2. Install and run [MongoDB Community Server](https://www.mongodb.com/try/download/community), or use a MongoDB connection string you can access.
3. Obtain an API key from [NewsAPI.org](https://newsapi.org/) when working on the news integration.

Check the installed Node.js and npm versions:

```bash
node --version
npm --version
```

## Installation and configuration

### 1. Clone the repository

```bash
git clone https://github.com/anuljain23/news-aggregator.git
cd news-aggregator
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the project root. Do not commit this file.

```env
PORT=3000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=replace_this_with_a_long_random_secret
NEWS_API_KEY=your_newsapi_key
```

- `PORT`: port used by the API; defaults to `3000`.
- `MONGODB_URI`: MongoDB connection string used by the running application.
- `JWT_SECRET`: secret used to sign and verify JWTs.
- `NEWS_API_KEY`: NewsAPI.org key for the news integration. News features are still in progress in the current branch.

The current `.gitignore` excludes `.env` and `.env.test`. Keep real credentials out of source control.

### 4. Configure the test database

Create a `.env.test` file in the project root:

```env
MONGODB_TEST_URI=your_mongodb_test_uri
```

Use a dedicated database whose name ends in `test` (for example, `news_aggregator_test`). The test setup checks this suffix and deletes documents from collections in that test database before running tests. **Never point `MONGODB_TEST_URI` at a development or production database.**

## Run the application

Start the development server with Nodemon:

```bash
npm run dev
```

When MongoDB connects successfully, the server listens on port `3000` by default (or the port set in `PORT`).

Check the health endpoint in a browser or with curl:

```bash
curl http://localhost:3000/
```

Expected response:

```json
{
  "status": "Ok",
  "message": "Server is working"
}
```

Stop the server with `Ctrl+C`.

## Run tests

Run the test suite:

```bash
npm test
or
npm run test
```

The current test command uses TAP, loads `test-support/mongo-setup.cjs`, and runs files matching `test/*.js` serially. The tests connect to the MongoDB database specified by `MONGODB_TEST_URI` in `.env.test`.

Tests use a real test database in the current branch; they are **not** fully database-mocked. Make sure MongoDB is running and that `.env.test` points to the dedicated test database before running them.

## API documentation

Base URL for local development:

```text
http://localhost:3000
```

Unless indicated otherwise, JSON request bodies should use the `Content-Type: application/json` header. Protected routes require the JWT returned by login:

```http
Authorization: Bearer <JWT_TOKEN>
```

### User endpoints

| Method | Endpoint | Authentication | Description |
| --- | --- | --- | --- |
| `POST` | `/users/signup` | No | Register a new user |
| `POST` | `/users/login` | No | Authenticate a user and return a JWT |
| `GET` | `/users/preferences` | Yes | Get the authenticated user's saved preferences |
| `PUT` | `/users/preferences` | Yes | Replace the authenticated user's preferences |

#### Sign up — `POST /users/signup`

Request:

```json
{
  "name": "Clark Kent",
  "email": "clark@example.com",
  "password": "replace-with-a-strong-password",
  "preferences": ["technology", "science"]
}
```

The `name`, `email`, and `password` fields are required. A missing required field returns HTTP `400`; a duplicate email is intended to return HTTP `409`.

#### Log in — `POST /users/login`

Request:

```json
{
  "email": "clark@example.com",
  "password": "replace-with-a-strong-password"
}
```

Successful response:

```json
{
  "token": "<JWT_TOKEN>"
}
```

Use this token as a Bearer token for protected endpoints. Invalid credentials return HTTP `401`.

#### Get preferences — `GET /users/preferences`

Headers:

```http
Authorization: Bearer <JWT_TOKEN>
```

Successful response:

```json
{
  "preferences": ["technology", "science"]
}
```

#### Update preferences — `PUT /users/preferences`

Request:

```json
{
  "preferences": ["technology", "science", "business"]
}
```

The `preferences` field must be an array of strings. Successful response:

```json
{
  "preferences": ["technology", "science", "business"]
}
```

### News endpoints — planned API contract

The endpoints in this section are the intended interface for the news features requested for this project. They are **not active in the current `master` branch** because the news controller is incomplete and `newsRoutes` is not mounted in `app.js`.

| Method | Endpoint | Authentication | Intended behavior |
| --- | --- | --- | --- |
| `GET` | `/news?page=1` | Yes | Fetch up to 20 articles based on saved preferences |
| `POST` | `/news/:id/read` | Yes | Mark a stored article as read |
| `POST` | `/news/:id/favorite` | Yes | Mark a stored article as a favorite |
| `GET` | `/news/read?page=1` | Yes | List the user's read articles |
| `GET` | `/news/favorites?page=1` | Yes | List the user's favorite articles |
| `GET` | `/news/search/:keyword?page=1` | Yes | Search articles by keyword |

Planned behavior:
- News is fetched from NewsAPI.org based on the current user's saved preferences.
- Feed and search requests return 20 articles per page.
- Read and favorite status is stored in MongoDB per user.
- For article actions, `:id` is expected to be the MongoDB article ID returned by the news feed, rather than a NewsAPI URL.
- The news router must be mounted with `app.use('/news', newsRoutes)` and the route paths in the router must be relative to that prefix.

## Pagination format

News list endpoints are intended to accept a positive integer `page` query parameter. Feed and search pages use a page size of 20. For example:

```http
GET /news?page=2
```

A paginated response is expected to include article data and pagination metadata similar to:

```json
{
  "articles": [],
  "pagination": {
    "page": 2,
    "pageSize": 20,
    "totalResults": 125,
    "totalPages": 7
  }
}
```

This shape documents the planned news response; actual news response fields should be confirmed when the news controller is completed.

## Project structure

```text
news-aggregator/
├── controller/
│   ├── news.controller.js
│   └── user.controller.js
├── middleware/
│   ├── auth.middleware.js
│   └── logger.js
├── model/
│   └── user.model.js
├── routes/
│   ├── news.routes.js
│   └── user.routes.js
├── test/
│   └── server.test.js
├── test-support/
│   └── mongo-setup.cjs
├── utils/
│   ├── constants.js
│   └── response.js
├── app.js
├── server.js
├── package.json
└── README.md
```

## Security and development notes

- Do not commit `.env`, `.env.test`, JWT secrets, database credentials, or NewsAPI keys.
- Use a separate database for automated tests. The test setup deletes data from the database named by `MONGODB_TEST_URI`.
- Store passwords as bcrypt hashes; do not return password hashes in API responses.
- NewsAPI usage and rate limits depend on your NewsAPI plan.
- Before releasing the news functionality, complete the controller, add the news model, mount the news router, and add tests for pagination, search, read/favorite state, API errors, and authentication.
