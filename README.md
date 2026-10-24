# News Aggregator API

Express API for user signup/login, news preferences, and articles from [NewsAPI.org](https://newsapi.org). Users are stored in MongoDB. Passwords are hashed with bcrypt. Protected routes use a JWT. Fetched news is cached in memory (lru-cache) for 6 hours and refreshed in the background on the same interval.

## Requirements

- Node.js 18 or later
- MongoDB running at `mongodb://127.0.0.1:27017`
- A NewsAPI.org API key

## Installation

```bash
npm install
```

Create a `.env` file in the project root:

```
JWT_SECRET=your_jwt_secret
NEWS_API_KEY=your_newsapi_key
MONGODB_URI=mongodb://127.0.0.1:27017/news_app
```

Start the server (port 3000):

```bash
node app.js
```

Run tests (MongoDB must be running):

```bash
npm test
```

Protected routes need:

```
Authorization: Bearer <token>
```

The token comes from `POST /users/login`.

## API

### POST /users/signup

Register a user.

```json
{
  "name": "Clark Kent",
  "email": "clark@superman.com",
  "password": "Krypt()n8",
  "preferences": ["movies", "comics"]
}
```

Password must be 8–72 characters. Email must be a valid address.

### POST /users/login

```json
{
  "email": "clark@superman.com",
  "password": "Krypt()n8"
}
```

Returns `{ "token": "..." }`.

### GET /users/preferences

Returns `{ "preferences": ["movies", "comics"] }`. Auth required.

### PUT /users/preferences

```json
{
  "preferences": ["movies", "comics", "games"]
}
```

Auth required.

### GET /news

News for the logged-in user's preferences. Auth required. Response: `{ "news": [ ... ] }`. Results are cached for 6 hours per preference set.

### GET /news/search/:keyword

Search cached news by keyword. Auth required.

### POST /news/:id/read

Mark an article as read. Auth required.

### POST /news/:id/favorite

Mark an article as a favorite. Auth required.

### GET /news/read

Read articles for the current user. Auth required.

### GET /news/favorites

Favorite articles for the current user. Auth required.

## Status codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 400 | Invalid input or JSON |
| 401 | Missing/invalid token or bad login |
| 404 | Unknown route or article |
| 409 | Email already registered |
| 502 | News API failure |
