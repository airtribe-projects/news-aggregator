# News Aggregator API

A RESTful API for a personalized news aggregator, built with Node.js and Express.

Users sign up, log in to get a JWT, save their news preferences (like `movies` or `comics`), and get news articles matching those preferences from [NewsAPI](https://newsapi.org). They can also search news, and mark articles as read or favorite.

## Features

- User registration and login (passwords hashed with bcrypt, JWT authentication)
- Get and update news preferences (protected routes)
- News based on the user's preferences, fetched from NewsAPI with axios
- Search news by keyword
- Mark articles as read / favorite, and list them
- Caching of news results, refreshed in the background every hour
- Input validation and JSON error responses for every error

## Tech stack

- Node.js (20 or later), Express 5
- bcrypt, jsonwebtoken, axios, dotenv
- Data is stored in a local JSON file (`data/users.json`), no database needed
- tap + supertest for tests, nodemon for development

## Getting started

### 1. Install

```bash
git clone <repo-url>
cd news-aggregator-bel-23
npm install
```

### 2. Set up environment variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env        # macOS / Linux / Git Bash
copy .env.example .env      # Windows cmd
```

Then fill in the values:

| Variable | Description |
|---|---|
| `PORT` | Port the server runs on (default `3000`) |
| `JWT_SECRET` | Secret used to sign tokens. Use a long random string, e.g. `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `NEWS_API_KEY` | Your key from [newsapi.org](https://newsapi.org/register) (free plan: 100 requests/day) |

The server won't start if `JWT_SECRET` or `NEWS_API_KEY` is missing.

### 3. Run

```bash
npm run dev     # with nodemon, restarts on file changes
npm start       # plain node
```

The server runs on `http://localhost:3000`. `data/users.json` is created automatically on first run.

## Testing

```bash
npm test
```

This first resets `data/users.json` (so the signup test can run again), then runs the tests in `test/server.test.js`. Note that the `GET /news` test calls the real NewsAPI, so it needs a valid `NEWS_API_KEY`.

The endpoints can also be tested manually with Postman or curl, see the API documentation below.

## Project structure

```
├── app.js                    # wiring: middleware, routes, error handlers, server start
├── controller/               # business logic (no req/res)
│   ├── userController.js
│   └── newsController.js
├── models/                   # data access
│   ├── userModel.js          # reads/writes data/users.json
│   └── newsModel.js          # calls NewsAPI + cache
├── routes/                   # HTTP layer
│   ├── userRoutes.js         # /users (public)
│   ├── preferencesRoutes.js  # /users/preferences (protected)
│   └── newsRoutes.js         # /news (protected)
├── middleware/
│   ├── authMiddleware.js     # verifies the JWT
│   ├── validateUserMiddleware.js
│   ├── validateNewsMiddleware.js
│   ├── loggerMiddleware.js
│   └── errorMiddleware.js    # 404 + error handler
├── utils/createError.js
├── data/                     # users.json lives here (gitignored)
└── test/server.test.js
```

## API documentation

Base URL: `http://localhost:3000`

Protected routes need the token from login in the `Authorization` header:

```
Authorization: Bearer <token>
```

### Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/users/signup` | No | Register a new user |
| POST | `/users/register` | No | Same as `/users/signup` |
| POST | `/users/login` | No | Log in and get a token |
| GET | `/users/preferences` | Yes | Get the user's preferences |
| PUT | `/users/preferences` | Yes | Update the user's preferences |
| GET | `/news` | Yes | News based on the user's preferences |
| GET | `/news/search/:keyword` | Yes | Search news by keyword |
| POST | `/news/:id/read` | Yes | Mark an article as read |
| POST | `/news/:id/favorite` | Yes | Mark an article as favorite |
| GET | `/news/read` | Yes | Get read articles |
| GET | `/news/favorites` | Yes | Get favorite articles |

### POST /users/signup

Request body:

```json
{
  "name": "Clark Kent",
  "email": "clark@superman.com",
  "password": "Krypt()n8",
  "preferences": ["movies", "comics"]
}
```

- `name`, `email`, `password` are required strings
- `email` must be a valid email. Emails are not case sensitive (`Clark@Superman.com` is the same account)
- `password` must be at least 8 characters
- `preferences` is optional, an array of strings

Response `200`:

```json
{ "message": "User registered successfully" }
```

Errors: `400` for missing/invalid fields or an email that is already registered.

### POST /users/login

Request body:

```json
{ "email": "clark@superman.com", "password": "Krypt()n8" }
```

Response `200`:

```json
{ "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." }
```

The token is valid for 1 hour.

Errors: `400` for missing fields, `401` for a wrong email or password (same message for both).

### GET /users/preferences

Response `200`:

```json
{ "preferences": ["movies", "comics"] }
```

### PUT /users/preferences

Replaces the preferences. Request body:

```json
{ "preferences": ["movies", "comics", "games"] }
```

Response `200`:

```json
{ "message": "Preferences updated", "preferences": ["movies", "comics", "games"] }
```

Errors: `400` if `preferences` is missing or not an array of strings.

### GET /news

Returns up to 20 recent articles matching any of the user's preferences. If the user has no preferences, `news` is an empty array.

Response `200`:

```json
{
  "news": [
    {
      "id": "4f784ba542c15265",
      "title": "Article title",
      "description": "Short description",
      "url": "https://example.com/article",
      "source": "Source name",
      "publishedAt": "2026-10-23T12:30:15Z"
    }
  ]
}
```

NewsAPI articles don't have ids, so `id` is made from the article's URL. The same article always gets the same id.

### GET /news/search/:keyword

Example: `GET /news/search/bitcoin`. Same response format as `GET /news`.

Errors: `400` if the keyword is longer than 100 characters.

### POST /news/:id/read and POST /news/:id/favorite

Use an `id` from a `GET /news` or search result. No request body needed.

Response `200`:

```json
{
  "message": "Article marked as read",
  "article": { "id": "4f784ba542c15265", "title": "Article title", "...": "..." }
}
```

Marking the same article twice doesn't add it twice.

Errors: `400` for an invalid id format, `404` if the article isn't in recent results (get news or search first).

### GET /news/read and GET /news/favorites

Response `200`:

```json
{ "news": [ { "id": "4f784ba542c15265", "title": "Article title", "...": "..." } ] }
```

Saved articles are stored with the user, so they stay even after the cache is cleared.

### Errors

All errors are JSON with a `message`:

```json
{ "message": "Missing required fields: email" }
```

| Status | When |
|---|---|
| `400` | Invalid input: missing fields, wrong data types, invalid JSON |
| `401` | Missing, invalid or expired token, or wrong login details |
| `404` | Unknown route, user not found, article not found |
| `500` | Unexpected server error |
| `502` | NewsAPI returned an error |
| `503` | NewsAPI is unreachable or the daily limit is reached |

## Caching

- News results are cached in memory for 1 hour per search, so repeated requests don't use up the NewsAPI limit.
- Every hour the server refreshes cached searches in the background. Searches nobody used for 3 hours are removed, so they stop using the API limit.
- If NewsAPI fails and there is an older cached copy, that copy is returned instead of an error.
- The cache is in memory, so it's empty after a restart.

## Notes

- The assignment steps mention `/register`, `/login` and `/preferences`, while the provided tests use `/users/signup`, `/users/login` and `/users/preferences`. The routes follow the tests, and `/users/register` is also available.
- On the free NewsAPI plan, articles are delayed by about 24 hours.
