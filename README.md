# News Aggregator API

A simple REST API where users can sign up, log in, save their news preferences, and get news articles based on those preferences.

Built with Node.js, Express, MongoDB, axios, bcrypt (password hashing), jsonwebtoken (JWT login tokens) and [NewsAPI](https://newsapi.org).

## Setup

1. Install packages:
   ```
   npm install
   ```
2. Copy `.env.example` to `.env` and fill in the values:
   ```
   JWT_SECRET=any_long_random_string
   NEWS_API_KEY=your_newsapi_key_here
   MONGODB_URI=your_mongodb_connection_string
   ```
   Get a free API key at https://newsapi.org/register.
3. Start the server:
   ```
   node app.js
   ```
4. Run the tests:
   ```
   npm test
   ```

## Endpoints

| Method | URL                 | Auth needed | Body                                          |
|--------|---------------------|-------------|-----------------------------------------------|
| POST   | /users/signup       | No          | `{ name, email, password, preferences: [] }`  |
| POST   | /users/login        | No          | `{ email, password }` → returns `{ token }`   |
| GET    | /users/preferences  | Yes         | –                                             |
| PUT    | /users/preferences  | Yes         | `{ preferences: [] }`                         |
| GET    | /news               | Yes         | –                                             |
| GET    | /news/search/:keyword | Yes       | –                                             |
| POST   | /news/:id/read      | Yes         | –                                             |
| POST   | /news/:id/favorite  | Yes         | –                                             |
| GET    | /news/read          | Yes         | –                                             |
| GET    | /news/favorites     | Yes         | –                                             |

The `id` for read/favorite comes from the `id` field of an article returned by `GET /news` or `GET /news/search/:keyword`.

### Validation

- Signup: name, email and password are required and must be text, the email must be valid, and the password must be at least 8 characters.
- Preferences must be an array of strings, e.g. `["movies", "comics"]`.

### Caching

News results are cached in memory by search query, so repeating a search doesn't call NewsAPI again. Every 15 minutes the cached results are refreshed in the background.

For routes that need auth, send the token in the header:
```
Authorization: Bearer <token>
```

## Notes

- Users are stored in MongoDB, in the `users` collection of the `newsAggregator` database.
- Passwords are hashed with bcrypt before they are saved.
- The tests sign up `clark@superman.com`. Delete that user from the `users` collection before running `npm test` again, or the signup test fails with "User already exists".
