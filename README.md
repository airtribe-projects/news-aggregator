# News Aggregator API

A RESTful API for a personalized news aggregator, built with **Node.js**,
**Express.js**, **bcrypt**, and **JWT**. Users register, log in, set news
preferences, and fetch articles matched to those preferences from an external
news provider.

Assignment 2 — Airtribe Backend Engineering Launchpad.

### Features

- **User registration** with bcrypt-hashed passwords (never stored or returned in plain text)
- **Token-based login** issuing a signed JWT
- **Authentication middleware** protecting every private route via `Authorization: Bearer <token>`
- **User preferences** stored against the user record, readable and updatable
- **External news integration** using axios, with articles filtered by the user's preferences
- **In-memory caching** so repeated requests do not burn the provider's rate limit
- **Keyword search** across the provider's catalogue, independent of preferences
- **Read and favourite lists** kept per user
- **Periodic background cache refresh** so cached articles stay current
- **Input validation** on every request body, reporting all problems at once
- **Centralised error handling** with consistent JSON responses and correct status codes
- **Layered structure** — routes, controllers, middlewares, models, services, config

### Tech stack

| | |
| --- | --- |
| Runtime | Node.js (>= 18) |
| Framework | Express.js 4 |
| Password hashing | bcrypt (10 salt rounds) |
| Tokens | jsonwebtoken (HS256) |
| HTTP client | axios |
| Config | dotenv |
| Storage | In-memory (no database) |
| Testing | tap + supertest |

---

## Setup instructions

**Prerequisites:** Node.js 18 or higher. Check with `node -v`.

**1. Clone the repository**

```bash
git clone <your-fork-url>
cd news-aggregator
```

**2. Install dependencies**

```bash
npm install
```

**3. Configure environment variables**

```bash
cp .env.example .env
```

Then open `.env` and set the values:

| Variable | Required | Default | Description |
| -------- | -------- | ------- | ----------- |
| `PORT` | no | `3000` | Port the server listens on |
| `JWT_SECRET` | **yes** in production | dev fallback | Secret used to sign tokens |
| `JWT_EXPIRES_IN` | no | `1h` | Token lifetime |
| `NEWS_API_URL` | no | NewsAPI `/v2/everything` | News provider endpoint |
| `NEWS_API_KEY` | for live news | empty | Your news provider API key |
| `NEWS_LANGUAGE` | no | `en` | Article language |
| `NEWS_PAGE_SIZE` | no | `20` | Articles requested per call |
| `NEWS_CACHE_TTL_MS` | no | `300000` | Cache lifetime (5 minutes) |
| `NEWS_REFRESH_INTERVAL_MS` | no | `600000` | Background cache refresh interval (10 minutes) |

Get a free API key at [newsapi.org/register](https://newsapi.org/register).
`.env` is gitignored — never commit your key.

**4. Start the server**

```bash
npm start
```

```
Server is listening on 3000
```

**5. Verify it is running**

```bash
curl http://localhost:3000
```

**Available scripts**

| Command | Description |
| ------- | ----------- |
| `npm start` | Start the server |
| `npm test` | Run the automated test suite |

---

## Authentication flow

1. `POST /users/signup` — the password is hashed with bcrypt and the user is stored.
2. `POST /users/login` — the submitted password is compared against the stored
   hash with `bcrypt.compare`. On success a JWT is signed and returned.
3. Every protected request sends that token:
   `Authorization: Bearer <token>`
4. The auth middleware verifies the signature, then **re-loads the user from the
   store** by the id in the token payload. A valid signature only proves the
   token was not forged — it does not prove the account still exists.

Tokens expire after `JWT_EXPIRES_IN` (1 hour by default). An expired token
returns `401` with `"Token has expired"`, distinct from `"Invalid token"`, so a
client knows to log in again rather than treating it as bad credentials.

---

## API reference

Base URL: `http://localhost:3000`

All requests and responses are JSON. Bodies require the
`Content-Type: application/json` header.

| Method | Endpoint | Auth | Description | Success |
| ------ | -------- | ---- | ----------- | ------- |
| `GET` | `/` | — | Service info | `200` |
| `POST` | `/users/signup` | — | Register a new user | `200` |
| `POST` | `/users/login` | — | Log in, receive a JWT | `200` |
| `GET` | `/users/preferences` | ✅ | Read the current user's preferences | `200` |
| `PUT` | `/users/preferences` | ✅ | Replace the current user's preferences | `200` |
| `GET` | `/news` | ✅ | Fetch news matching those preferences | `200` |
| `GET` | `/news/search/:keyword` | ✅ | Search articles by keyword | `200` |
| `POST` | `/news/:id/read` | ✅ | Mark an article as read | `200` |
| `POST` | `/news/:id/favorite` | ✅ | Mark an article as a favourite | `200` |
| `GET` | `/news/read` | ✅ | List articles marked as read | `200` |
| `GET` | `/news/favorites` | ✅ | List articles marked as favourite | `200` |

**Route aliases.** The brief names these endpoints `/register`, `/login`, and
`/preferences`, while the supplied test suite calls `/users/signup`,
`/users/login`, and `/users/preferences`. Both sets are mounted and behave
identically, so either naming works.

---

### `POST /users/signup`

Alias: `POST /register`

Registers a user. `name`, `email`, and `password` are required; `preferences` is
optional and defaults to `[]`.

```bash
curl -X POST http://localhost:3000/users/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Clark Kent","email":"clark@superman.com","password":"Krypt()n8","preferences":["movies","comics"]}'
```

**`200 OK`**

```json
{
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "name": "Clark Kent",
    "email": "clark@superman.com",
    "preferences": ["movies", "comics"],
    "createdAt": "2026-09-04T07:50:44.987Z"
  }
}
```

The password hash is never included in any response.

`400` invalid payload · `409` email already registered

---

### `POST /users/login`

Alias: `POST /login`

```bash
curl -X POST http://localhost:3000/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"clark@superman.com","password":"Krypt()n8"}'
```

**`200 OK`**

```json
{ "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." }
```

`400` missing email or password · `401` wrong password or unknown email

Both failure cases return the same message, `"Invalid email or password"`.
Distinguishing them would let an attacker discover which email addresses have
accounts.

---

### `GET /users/preferences`

Alias: `GET /preferences` · **Requires authentication**

```bash
curl http://localhost:3000/users/preferences \
  -H "Authorization: Bearer $TOKEN"
```

**`200 OK`**

```json
{ "preferences": ["movies", "comics"] }
```

`401` missing, malformed, invalid, or expired token

---

### `PUT /users/preferences`

Alias: `PUT /preferences` · **Requires authentication**

Replaces the preferences array.

```bash
curl -X PUT http://localhost:3000/users/preferences \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"preferences":["movies","comics","games"]}'
```

**`200 OK`**

```json
{
  "message": "Preferences updated successfully",
  "preferences": ["movies", "comics", "games"]
}
```

`400` `preferences` missing, not an array, or containing empty strings · `401` no valid token

---

### `GET /news`

**Requires authentication**

Fetches articles from the news provider using the logged-in user's preferences
as the search query. Preferences are joined with `OR`, so `["movies","comics"]`
becomes the query `movies OR comics`.

```bash
curl http://localhost:3000/news \
  -H "Authorization: Bearer $TOKEN"
```

**`200 OK`**

```json
{
  "news": [
    {
      "id": "c188fa748269dbf8",
      "title": "Space mirrors could ruin astronomy — and your eyes",
      "description": "Solar energy, at any time of day or night...",
      "url": "https://www.theverge.com/...",
      "source": "The Verge",
      "author": "Georgina Torbet",
      "publishedAt": "2026-08-07T19:26:39Z"
    }
  ],
  "count": 10,
  "preferences": ["technology", "space"],
  "source": "api"
}
```

The `source` field reports where the response came from:

| Value | Meaning |
| ----- | ------- |
| `api` | Freshly fetched from the provider |
| `cache` | Served from the local cache |
| `unconfigured` | No `NEWS_API_KEY` set, so an empty list is returned |

`401` no valid token · `502` provider error · `504` provider timeout

---

### `GET /news/search/:keyword`

**Requires authentication**

Searches the provider by keyword, ignoring the user's stored preferences. Results
are cached under the keyword, so repeating a search is free.

```bash
curl http://localhost:3000/news/search/bitcoin \
  -H "Authorization: Bearer $TOKEN"
```

**`200 OK`**

```json
{
  "keyword": "bitcoin",
  "news": [ { "id": "...", "title": "Why Bitcoin's Price Is Spiking This Week", "...": "..." } ],
  "count": 20,
  "source": "api"
}
```

Multi-word searches work URL-encoded — `/news/search/artificial%20intelligence`.

`400` empty keyword · `401` no valid token · `502` / `504` provider failure

---

### `POST /news/:id/read`

**Requires authentication**

Marks an article as read for the current user. `:id` is the `id` from a previous
`/news` or `/news/search` response.

```bash
curl -X POST http://localhost:3000/news/beffc8d33ac123e3/read \
  -H "Authorization: Bearer $TOKEN"
```

**`200 OK`**

```json
{
  "message": "Article marked as read",
  "article": { "id": "beffc8d33ac123e3", "title": "...", "...": "..." },
  "count": 1
}
```

The operation is **idempotent** — marking the same article twice does not
duplicate it, and the response says `"Article was already marked as read"`.

`401` no valid token · `404` no article with that id has been fetched yet

---

### `POST /news/:id/favorite`

**Requires authentication**

Identical to the read endpoint, but writes to the favourites list.

```bash
curl -X POST http://localhost:3000/news/beffc8d33ac123e3/favorite \
  -H "Authorization: Bearer $TOKEN"
```

`200` marked · `401` no valid token · `404` unknown article id

---

### `GET /news/read`

**Requires authentication**

```bash
curl http://localhost:3000/news/read -H "Authorization: Bearer $TOKEN"
```

**`200 OK`**

```json
{
  "news": [ { "id": "...", "title": "...", "markedAt": "2026-09-04T08:20:11.402Z" } ],
  "count": 2
}
```

Each saved article carries a `markedAt` timestamp. The full article is stored,
not just its id, so the list stays readable after the cache has expired.

---

### `GET /news/favorites`

**Requires authentication**

Same shape as `/news/read`, for favourites.

```bash
curl http://localhost:3000/news/favorites -H "Authorization: Bearer $TOKEN"
```

Read and favourite lists are stored on the user record, so they are private to
each user.

---

## Caching

Responses are cached in memory, keyed by the query string built from the user's
preferences, for `NEWS_CACHE_TTL_MS` (5 minutes by default).

This matters because the free tiers of every listed provider are small — NewsAPI
allows 100 requests per day. Without caching, a page that polls `/news` would
exhaust the daily quota in minutes. Because the cache key is the query rather
than the user, two users sharing preferences also share a cached result.

Changing preferences changes the query, which misses the cache and triggers a
fresh fetch — so updated preferences take effect immediately rather than after
the TTL expires.

Cache reads and writes are `async`, so the store can later be swapped for
something out-of-process (Redis, for instance) without changing any caller.

### Periodic background refresh

Every `NEWS_REFRESH_INTERVAL_MS` (10 minutes by default) a background task
re-fetches every query currently in the cache and replaces the stored articles.
This simulates a live aggregator: readers are always served from cache, so they
never wait on the provider, but the cached content keeps moving.

The refresh only starts when the server is run directly (`npm start`), never
when the app is imported by a test. The interval is also `unref`-ed, so it can
never keep the Node process alive on its own. Set
`NEWS_REFRESH_INTERVAL_MS=0` to disable it.

---

## Validation rules

Validation runs as middleware before controllers, so handlers only ever see
well-formed input. All problems are reported at once rather than failing on the
first.

**Signup**

- `name` — required, non-empty string
- `email` — required, non-empty, must match a basic email pattern; stored lowercased
- `password` — required, non-empty, minimum 6 characters
- `preferences` — optional; if present must be an array of non-empty strings

**Login**

- `email` and `password` — both required

**Preferences**

- `preferences` — required, must be an array of non-empty strings

---

## Error handling

Every error passes through a single error-handling middleware, so responses have
a consistent shape:

```json
{
  "error": "Invalid signup payload",
  "details": [
    "email must be a valid email address",
    "password must be at least 6 characters long"
  ]
}
```

`details` is present only for validation errors.

| Status | When |
| ------ | ---- |
| `400` | Failed validation, or malformed JSON in the request body |
| `401` | Bad credentials, or a missing / malformed / invalid / expired token |
| `404` | Route does not exist |
| `409` | Email already registered |
| `502` | The news provider failed or rejected our key |
| `504` | The news provider timed out |
| `500` | Unexpected server error (logged in full, never leaked to the client) |

A provider failure is reported as `502`, not passed through as its own status. If
the provider rejects **our** API key with a `401`, that is a server
misconfiguration — surfacing it as a `401` would wrongly suggest the user's own
token was the problem.

Internal `500` messages are logged server-side but replaced with a generic
string in the response, since stack traces and file paths should not be exposed.

---

## Project structure

```
.
├── app.js                          # Express setup, middleware, route mounting
├── config/
│   └── index.js                    # Environment configuration
├── routes/
│   ├── userRoutes.js               # /users/* routes
│   ├── authRoutes.js               # /register, /login, /preferences aliases
│   └── newsRoutes.js               # /news route
├── controllers/
│   ├── userController.js           # signup, login, preferences
│   └── newsController.js           # news retrieval
├── middlewares/
│   ├── auth.js                     # JWT verification
│   ├── validateUser.js             # Body validation
│   └── errorHandler.js             # 404 + central error handling
├── models/
│   └── userModel.js                # In-memory user store
├── services/
│   └── newsService.js              # External API integration, caching, refresh
└── test/
    └── server.test.js              # tap + supertest suite
```

Each layer has one job: routes declare the surface, middleware guards it,
controllers handle requests, the model owns user data, and the service talks to
the outside world.

---

## How to test the API

### 1. Automated test suite

No running server or API key is needed — supertest starts the app itself.

```bash
npm test
```

```
1..10
# { total: 15, pass: 15 }
```

All 10 test cases pass (15 assertions), covering signup, login, preferences,
news, and the failure path for each.

### 2. Testing with curl

Start the server (`npm start`), then from a second terminal:

```bash
# Register
curl -X POST http://localhost:3000/users/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Clark Kent","email":"clark@superman.com","password":"Krypt()n8","preferences":["technology","space"]}'

# Log in and capture the token
TOKEN=$(curl -s -X POST http://localhost:3000/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"clark@superman.com","password":"Krypt()n8"}' \
  | node -e "let d='';process.stdin.on('data',c=>d+=c).on('end',()=>console.log(JSON.parse(d).token))")

# Read preferences
curl http://localhost:3000/users/preferences -H "Authorization: Bearer $TOKEN"

# Update preferences
curl -X PUT http://localhost:3000/users/preferences \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"preferences":["movies","comics","games"]}'

# Fetch news
curl http://localhost:3000/news -H "Authorization: Bearer $TOKEN"

# Search by keyword
curl http://localhost:3000/news/search/bitcoin -H "Authorization: Bearer $TOKEN"

# Mark an article as read (use an id from a /news response)
curl -X POST http://localhost:3000/news/<article-id>/read -H "Authorization: Bearer $TOKEN"

# Mark an article as a favourite
curl -X POST http://localhost:3000/news/<article-id>/favorite -H "Authorization: Bearer $TOKEN"

# List read and favourite articles
curl http://localhost:3000/news/read -H "Authorization: Bearer $TOKEN"
curl http://localhost:3000/news/favorites -H "Authorization: Bearer $TOKEN"
```

**Error cases** — add `-i` to see status codes:

```bash
# 400 - missing email
curl -i -X POST http://localhost:3000/users/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Clark","password":"Krypt()n8"}'

# 401 - wrong password
curl -i -X POST http://localhost:3000/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"clark@superman.com","password":"wrongpassword"}'

# 401 - no token
curl -i http://localhost:3000/users/preferences

# 401 - invalid token
curl -i http://localhost:3000/news -H "Authorization: Bearer not.a.real.token"

# 409 - duplicate email
curl -i -X POST http://localhost:3000/users/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Clark","email":"clark@superman.com","password":"Krypt()n8"}'
```

**Expected results**

| Request | Status | Response |
| ------- | ------ | -------- |
| `POST /users/signup` valid | `200` | User object, no password |
| `POST /users/signup` missing email | `400` | `{"error":"Invalid signup payload","details":[...]}` |
| `POST /users/signup` duplicate email | `409` | `{"error":"An account with this email already exists"}` |
| `POST /users/login` valid | `200` | `{"token":"..."}` |
| `POST /users/login` wrong password | `401` | `{"error":"Invalid email or password"}` |
| `GET /users/preferences` + token | `200` | `{"preferences":[...]}` |
| `GET /users/preferences` no token | `401` | `{"error":"Authorization header must be..."}` |
| `PUT /users/preferences` valid | `200` | Updated preferences |
| `PUT /users/preferences` not an array | `400` | `{"error":"Invalid preferences payload","details":[...]}` |
| `GET /news` + token | `200` | `{"news":[...],"count":N,"source":"api"}` |
| `GET /news` no token | `401` | `{"error":"Authorization header must be..."}` |
| `GET /news/search/bitcoin` | `200` | `{"keyword":"bitcoin","news":[...],"count":N}` |
| `POST /news/:id/read` valid id | `200` | `{"message":"Article marked as read",...}` |
| `POST /news/:id/read` twice | `200` | `{"message":"Article was already marked as read",...}` |
| `POST /news/:id/read` unknown id | `404` | `{"error":"No article with id ... has been fetched yet"}` |
| `GET /news/read` | `200` | `{"news":[...],"count":N}` |
| `GET /news/favorites` | `200` | `{"news":[...],"count":N}` |
| Unknown route | `404` | `{"error":"Route not found: ..."}` |

### 3. Testing with Postman

1. Start the server with `npm start`.
2. **Register** — `POST http://localhost:3000/users/signup`. Open **Body** →
   **raw** → **JSON** and paste:

   ```json
   {
     "name": "Clark Kent",
     "email": "clark@superman.com",
     "password": "Krypt()n8",
     "preferences": ["technology", "space"]
   }
   ```

3. **Log in** — `POST http://localhost:3000/users/login` with the email and
   password. Copy the `token` from the response.
4. **Authorize the protected requests** — for `/users/preferences` and `/news`,
   open the **Authorization** tab, choose type **Bearer Token**, and paste the
   token. (Equivalently, add a header `Authorization: Bearer <token>`.)
5. **Read preferences** — `GET http://localhost:3000/users/preferences`.
6. **Update preferences** — `PUT http://localhost:3000/users/preferences` with
   `{"preferences":["movies","comics","games"]}`, then repeat step 5 to confirm
   the change persisted.
7. **Fetch news** — `GET http://localhost:3000/news`. Send it twice and watch
   `source` change from `api` to `cache`.
8. **Search** — `GET http://localhost:3000/news/search/bitcoin`.
9. **Mark an article** — copy an `id` from the news response, then
   `POST http://localhost:3000/news/<id>/read` and
   `POST http://localhost:3000/news/<id>/favorite`. No body is needed.
10. **Check the lists** — `GET http://localhost:3000/news/read` and
    `GET http://localhost:3000/news/favorites`.

To confirm the auth middleware, remove the Authorization header from any
protected request and verify a `401` comes back.

---

## Notes and limitations

- **Storage is in memory.** Users and preferences live in a plain array, so all
  data resets when the server restarts. No database is required by the brief.
- **`JWT_SECRET` has a development fallback.** The test suite runs without a
  `.env` file, so a hard failure on a missing secret would fail every test.
  Always set a real secret via `.env` in any real deployment.
- **`GET /news` returns an empty list when no API key is configured**, rather
  than erroring, so the suite passes in a clean checkout. Once a key is set,
  genuine provider failures do surface as `502` / `504`.
- **Read and favourite lists are per user and in memory**, so they reset with the
  server, like all other data.
- **NewsAPI's free tier returns fewer articles than requested** and serves them
  on a 24-hour delay. Requesting `pageSize=20` typically yields around 10
  articles. This is a provider restriction, not a bug.
