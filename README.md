# Personalized News Aggregator API

A RESTful API built with **Node.js, Express.js, and MongoDB** that allows users to register, log in securely, manage their news preferences, and retrieve personalized news articles using the [NewsAPI](https://newsapi.org/).

## Features

- **User Registration:** Register users with name, email, password, and optional news preferences.
- **Input Validation:** Validate email format and enforce password length requirements.
- **Secure Password Storage:** Hash passwords using bcrypt before storing them in MongoDB.
- **JWT Authentication:** Authenticate users using JSON Web Tokens.
- **Preference Management:** Retrieve and update a user's preferred news topics.
- **Personalized News:** Fetch news articles based on the authenticated user's saved preferences.
- **Duplicate Removal:** Remove duplicate articles using their URLs.
- **Error Handling:** Handle missing users, invalid authentication, and external API errors.

## Tech Stack

- **Runtime:** Node.js
- **Backend Framework:** Express.js
- **Database:** MongoDB with Mongoose
- **Authentication:** JSON Web Tokens (JWT)
- **Password Hashing:** bcrypt
- **External API:** NewsAPI
- **Configuration:** dotenv

## Project Structure

```text
news-aggregator/
├── controllers/
│   ├── userController.js
│   └── newsController.js
├── middleware/
│   └── authMiddleware.js
├── models/
│   └── User.js
├── routes/
│   ├── userRoutes.js
│   └── newsRoutes.js
├── .env
├── .gitignore
├── app.js
├── package.json
└── README.md
```

## Prerequisites

Before running the project, ensure you have:

- Node.js installed
- npm installed
- A MongoDB database, such as MongoDB Atlas
- A NewsAPI API key from [newsapi.org](https://newsapi.org/)

## Installation and Setup

### 1. Clone the repository

```bash
git clone <https://github.com/kshr08/news-aggregator>
cd news-aggregator
```

### 2. Install dependencies

```bash
npm install
```

The project uses Express, Mongoose, bcrypt, jsonwebtoken, and dotenv.

### 3. Configure environment variables

Create a `.env` file in the project root:

```env
PORT=3000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secure_random_secret
NEWS_API_KEY=your_newsapi_key
```

Replace the placeholder values with your actual credentials. Keep these values private and never commit your `.env` file.

### 4. Start the server

If your `package.json` has a start script, run:

```bash
npm start
```

Otherwise, start the application directly:

```bash
node app.js
```

The server starts after a successful MongoDB connection. By default, the application uses port `3000`.

## API Endpoints

All endpoints return JSON responses.

| Method | Endpoint | Authentication | Description |
|---|---|---|---|
| POST | `/users/signup` | Not required | Register a new user |
| POST | `/users/login` | Not required | Authenticate a user and receive a JWT |
| GET | `/users/preferences` | Required | Retrieve saved preferences |
| PUT | `/users/preferences` | Required | Update saved preferences |
| GET | `/news` | Required | Retrieve personalized news articles |

### Authentication

For protected endpoints, include the JWT returned by the login endpoint in the request header:

```http
Authorization: Bearer <your_jwt_token>
```

Requests without a valid token receive a `401 Unauthorized` response.

## API Usage Examples

### 1. Register a user

**Request**

```http
POST /users/signup
Content-Type: application/json
```

```json
{
  "name": "Clark Kent",
  "email": "clark@example.com",
  "password": "Krypt0nPass!",
  "preferences": ["technology", "science"]
}
```

**Successful response**

```json
{
  "message": "User created successfully"
}
```

The password is hashed before the user record is saved.

### 2. Log in

**Request**

```http
POST /users/login
Content-Type: application/json
```

```json
{
  "email": "clark@example.com",
  "password": "Krypt0nPass!"
}
```

**Successful response**

```json
{
  "message": "User logged in successfully",
  "token": "<your_jwt_token>"
}
```

Use the returned token for authenticated requests.

### 3. Retrieve news preferences

**Request**

```http
GET /users/preferences
Authorization: Bearer <your_jwt_token>
```

**Example response**

```json
{
  "message": "Preferences retrieved successfully",
  "preferences": ["technology", "science"]
}
```

### 4. Update news preferences

**Request**

```http
PUT /users/preferences
Authorization: Bearer <your_jwt_token>
Content-Type: application/json
```

```json
{
  "preferences": ["technology", "business"]
}
```

**Example response**

```json
{
  "message": "Preferences updated successfully",
  "preferences": ["technology", "business"]
}
```

### 5. Retrieve personalized news

**Request**

```http
GET /news
Authorization: Bearer <your_jwt_token>
```

The API retrieves the authenticated user's saved preferences, requests articles from NewsAPI for each preference, selects the article title, description, and URL, and removes duplicate URLs.

**Example response**

```json
{
  "news": [
    {
      "title": "Example Technology News",
      "description": "An example article description.",
      "url": "https://example.com/article"
    }
  ]
}
```

The returned articles depend on the saved preferences and the results available from NewsAPI.

## Error Handling

The API uses HTTP status codes to indicate the outcome of requests.

| Status code | Meaning |
|---|---|
| `200 OK` | Request completed successfully |
| `400 Bad Request` | Required fields or input validation failed |
| `401 Unauthorized` | Missing or invalid authentication token, or invalid login credentials |
| `404 Not Found` | Requested user does not exist |
| `409 Conflict` | User with the provided email already exists |
| `500 Internal Server Error` | Unexpected server-side or external API failure |

## Security Considerations

- Passwords are hashed using bcrypt rather than stored in plain text.
- JWTs are used to protect authenticated endpoints.
- Sensitive configuration is stored in environment variables.
- The NewsAPI key is sent in the `X-Api-Key` request header.
- The `.env` file should be excluded from version control.

Recommended `.gitignore` entries:

```gitignore
node_modules/
.env
```

## Future Improvements

- Add automated tests for all API endpoints.
- Improve external API error handling and rate-limit responses.
- Add pagination and sorting for news articles.
- Support more advanced topic filtering and language preferences.
- Add request validation middleware and structured logging.
- Add API documentation using Swagger/OpenAPI.

## License

Add a license appropriate for your project before distributing it publicly.
