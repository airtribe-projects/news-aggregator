# News Aggregator API

A RESTful API for a personalized news aggregator built with **Node.js**, **Express**, **TypeScript**, **bcrypt** and **JWT**. Users register, log in, save their news preferences, and get articles fetched from [GNews](https://gnews.io) based on those preferences.

## Features

- User registration and login with hashed passwords (bcrypt)
- Token-based authentication (JWT) on all protected routes
- Per-user news preferences
- Personalized news from the GNews API, fetched with axios
- Input validation that rejects missing, mistyped and unknown fields
- Consistent JSON error responses
- In-memory caching of news results with a configurable TTL
- Background cache refresh for recently requested queries
- Mark articles as read or favorite, and list them
- Keyword search across news

## Tech Stack

| Purpose | Tool |
| --- | --- |
| Runtime | Node.js 18+ |
| Language | TypeScript 5 |
| Framework | Express 4 |
| Password hashing | bcrypt |
| Auth tokens | jsonwebtoken |
| HTTP client | axios |
| Config | dotenv |
| Tests | tap + supertest (provided by the organisation) |

## Project Structure

```
news-aggregator-api/
├── app.ts                       # Re-exports the Express app for the tests
├── tsconfig.json
├── src/
│   ├── app.ts                   # Express app setup (no listen)
│   ├── server.ts                # Starts the server and the cache refresh
│   ├── config/
│   │   └── env.ts               # Environment variables
│   ├── consts/
│   │   ├── news.consts.ts
│   │   └── user.consts.ts
│   ├── controllers/
│   │   ├── news.controller.ts
│   │   └── user.controller.ts
│   ├── db/
│   │   ├── articleStore.ts      # Article lookup, read and favorite state
│   │   └── userStore.ts         # In-memory user store
│   ├── enums/
│   │   └── server.enums.ts      # Response status and HTTP status codes
│   ├── interfaces/
│   │   ├── news.interface.ts
│   │   └── user.interface.ts
│   ├── middlewares/
│   │   ├── auth.ts              # JWT verification
│   │   ├── errorHandler.ts
│   │   └── notFound.ts
│   ├── routes/
│   │   ├── index.ts             # Mounts all route groups
│   │   ├── news.routes.ts
│   │   └── user.routes.ts
│   ├── services/
│   │   ├── cache.service.ts     # In-memory cache with TTL
│   │   └── news.service.ts      # GNews integration
│   ├── utils/
│   │   ├── appError.ts
│   │   └── asyncHandler.ts
│   └── validators/
│       ├── news.validator.ts
│       └── user.validator.ts
└── test/
    └── server.test.js           # Provided test suite, do not modify
```

## Getting Started

### Prerequisites

- Node.js 18 or later
- A free API key from [GNews](https://gnews.io)

### Installation

```bash
npm install
```

### Environment Variables

Create a `.env` file in the project root (see `.env.example`). It is git-ignored.

```
PORT=3000
JWT_SECRET=your_secret_here
JWT_EXPIRES_IN=1h
NEWS_API_KEY=your_gnews_api_key
CACHE_TTL_SECONDS=600
CACHE_REFRESH_SECONDS=600
```

`CACHE_REFRESH_SECONDS` is how often the background job refreshes recently requested queries. Set it to `0` to turn the refresh off. Keep it at or above the TTL to stay inside the GNews free-tier limits (100 requests a day, one per second).

### Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Run the server with tsx in watch mode |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run the compiled server |
| `npm run typecheck` | Type-check without emitting |
| `npm test` | Run the provided tap test suite |

`npm test` compiles TypeScript on the fly, so no build is needed first. The `/news` tests call the real GNews API, so `NEWS_API_KEY` must be set.

## API

Protected routes need the header `Authorization: Bearer <jwt>`. The organisation's test suite calls the `/users/...` paths, while the written task names `/register`, `/login` and `/preferences`. Both are served by the same handlers.

### Auth

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| POST | `/users/signup` (alias `/register`) | No | Register a new user |
| POST | `/users/login` (alias `/login`) | No | Log in and receive a JWT |

Signup body:

```json
{
  "name": "Atul Shaw",
  "email": "atul@example.com",
  "password": "StrongPass123",
  "preferences": ["technology", "business"]
}
```

Signup response:

```json
{
  "status": "success",
  "user": {
    "id": 1,
    "name": "Atul Shaw",
    "email": "atul@example.com",
    "preferences": ["technology", "business"],
    "createdAt": "2026-10-22T10:00:00.000Z"
  }
}
```

Login body:

```json
{ "email": "atul@example.com", "password": "StrongPass123" }
```

Login response:

```json
{ "status": "success", "token": "<jwt>" }
```

### Preferences

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| GET | `/users/preferences` (alias `/preferences`) | Bearer token | Get the user's preferences |
| PUT | `/users/preferences` (alias `/preferences`) | Bearer token | Replace the user's preferences |

PUT body:

```json
{ "preferences": ["sports", "technology"] }
```

Response:

```json
{ "status": "success", "preferences": ["sports", "technology"] }
```

### News

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| GET | `/news` | Bearer token | Fetch news matching the user's preferences |

Optional query parameters: `language` (2 letters, default `en`) and `limit` (1 to 10, default 10). Any other parameter returns 400. The same parameters work on `/news/search/:keyword`.

Response:

```json
{
  "status": "success",
  "news": [
    {
      "id": "3f2a9c1b7d4e8a60",
      "title": "Headline",
      "description": "Summary",
      "url": "https://example.com/article",
      "image": "https://example.com/image.jpg",
      "publishedAt": "2026-10-22T09:30:00Z",
      "source": "Example News"
    }
  ]
}
```

### Read, favorites and search

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| POST | `/news/:id/read` | Bearer token | Mark an article as read |
| POST | `/news/:id/favorite` | Bearer token | Mark an article as a favorite |
| GET | `/news/read` | Bearer token | List the user read articles |
| GET | `/news/favorites` | Bearer token | List the user favorite articles |
| GET | `/news/search/:keyword` | Bearer token | Search news by keyword |

`:id` is the `id` field of an article returned by `/news` or `/news/search/:keyword`. A malformed id returns 400, and an id the server has not returned returns 404. Marking an article twice is allowed. The marking endpoints return `{ "status": "success", "article": { ... } }`, and the list endpoints return `{ "status": "success", "news": [ ... ] }`.

### Errors

Every error uses the same shape:

```json
{ "status": "error", "error": "email must be a valid email address" }
```

| Code | Meaning |
| --- | --- |
| 200 | Success |
| 400 | Invalid or missing input, unknown field, or malformed JSON |
| 401 | Missing, invalid or expired token, or wrong credentials |
| 404 | Route or article not found |
| 409 | Email already registered |
| 429 | News provider rate limit reached |
| 500 | Server error or news service not configured |
| 502 | News provider failed or rejected the credentials |

## How It Works

1. **Signup:** the input is validated, the password is hashed with bcrypt and the user is stored.
2. **Login:** the password is compared with the stored hash and a JWT is returned. A wrong password and an unknown email give the same 401.
3. **Auth middleware:** it reads the `Authorization` header, verifies the JWT and confirms the user still exists.
4. **Preferences:** read or replace the authenticated user's preferences.
5. **News:** the user's preferences become a GNews search query (`"movies" OR "comics"`). With no preferences, top headlines are returned. Results are cached by query, language and limit.

## Caching

Successful news responses are cached in memory for `CACHE_TTL_SECONDS`. Repeat requests within that window are served from the cache, which keeps usage under GNews's free-tier limit. Errors are never cached.

A background job refreshes cached queries that were requested within the last refresh interval, so active queries stay warm and idle ones expire. The job starts from `src/server.ts` only, so it never runs during tests.

## Design Decisions

- **Module-level store.** `src/db/userStore.ts` keeps its data in a private module variable and exports plain functions. A module is already a singleton in Node, so no class or static instance is needed.
- **Copies in, copies out.** The store never returns its internal objects or array, so callers cannot mutate state by accident.
- **Whitelisted fields.** `createUser` copies only `name`, `email`, `passwordHash` and `preferences` from its input, and generates `id` and `createdAt` itself. Callers cannot inject an id or extra properties.
- **Normalised emails.** Emails are lowercased on create and on lookup.
- **Strict validation.** Request bodies and query strings reject unknown fields instead of ignoring them.
- **Real types.** Shared types live in `src/interfaces` as TypeScript files.
- **Mongoose-shaped store.** The store exposes `findByEmail`, `findById`, `createUser` and `updateUserPreferences`, so replacing it with a database later means replacing one file.
- **Errors are thrown, not sent.** `createError(status, message)` builds an error flagged `isOperational`. Validators, controllers and middleware throw it, and the error middleware turns it into a JSON response. Anything without the flag becomes a generic 500, so internal messages never reach the client.
- **Functions over classes for errors.** `createError` and the `isHttpError` type guard replace an error class.
- **`asyncHandler` wrapper.** Express 4 does not catch rejected promises, so async controllers are wrapped and rejections are forwarded to the error middleware.
- **Provider errors are masked.** Failures from GNews become a generic 502 or 429, so the API key and upstream details never reach the client.
- **Stable article ids.** Each article id is a hash of its URL, since GNews provides none.
- **Article snapshots.** Read and favorite lists keep a copy of the article when it is marked, so they survive cache expiry.
- **App and server split.** `src/app.ts` builds the app without listening, and `src/server.ts` starts it and the refresh job. The tests import the app without binding a port.

## Author

Atul Shaw
