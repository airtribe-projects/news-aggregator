# News Aggregator API

REST API built with Express and MongoDB. Users sign up, log in with JWT, save news preferences, and get personalised news from [NewsAPI](https://newsapi.org).

## Setup

Requires Node.js 18+ and a MongoDB instance.

```bash
npm install
```

Create a `.env` file in the project root:

```
MONGODB_URI=mongodb://localhost:27017/news-aggregator
PORT=3000
NEWSAPI_API_KEY=your_newsapi_key
JWT_SECRET_KEY=a_long_random_secret
```

Run:

```bash
npm run dev    # starts with node --watch
npm test       # runs test/server.test.js with tap
```

Testing notes:

- The tests sign up `clark@superman.com`. Delete that user from the DB before re-running, or the signup and preferences tests fail.
- `tap@18` hangs on Node 24 ("no tests found"). Run tests on Node 18 or 20.

## Project structure

```
app.js            Express app, routes, DB connect then listen
controllers/      Request handlers (users, preferences, news)
middlewares/      JWT auth middleware
models/           Mongoose schemas (User, News)
routes/           Route definitions
utils/            DB connection, input validators, in-memory cache
```

## API

Protected routes need the header `Authorization: Bearer <token>`.

| Method | Route                | Auth | Description                    |
| ------ | -------------------- | ---- | ------------------------------ |
| POST   | `/users/signup`      | No   | Register a user                |
| POST   | `/users/login`       | No   | Log in, returns a JWT          |
| GET    | `/users/preferences` | Yes  | Get the user's preferences     |
| PUT    | `/users/preferences` | Yes  | Replace the user's preferences |
| GET    | `/news`              | Yes  | News based on preferences      |

## Design decisions

- **Auth:** passwords hashed with bcrypt, stateless JWT (`{ id }` payload, 1h expiry). The middleware puts the user id on `req.user`.
- **Validation:** shared helpers in `utils/validators.js`. Email is stored trimmed and lowercased.
- **Duplicate email:** caught from MongoDB's unique index (error `11000`) and returned as `409 Conflict`.
- **NewsAPI key:** sent in the `x-api-key` header, not the URL, so it doesn't show up in logs. Upstream errors log only status and body, never the request config.
- **Caching:** `GET /news` results are kept in an in-memory `Map` for 10 minutes. The key is the preferences lowercased, sorted and joined, so `["Films","comics"]` and `["comics","films"]` share one entry. Users with the same preferences share it too, and changing preferences gives a new key. Stale entries are deleted when read. Only successful responses are cached.
