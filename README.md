# Personalized News Aggregator API

This is a backend project I built as part of **Airtribe Assignment 2** using Node.js and Express.js.

The main purpose of this application is to allow users to create an account, log in, select their favorite news topics, and get news articles based on their preferences.

For example, if a user selects movies, comics, and games, the application fetches news related to those topics using NewsAPI.

## Technologies Used

- **Node.js and Express.js** – To build the REST APIs.
- **bcrypt** – To securely hash user passwords.
- **JWT (JSON Web Token)** – To authenticate users and protect APIs.
- **Axios** – To fetch articles from an external news API.
- **NewsAPI** – To get the latest available news articles.
- **dotenv** – To manage environment variables.
- **Tap and Supertest** – To test the APIs.

## Features Implemented

1. **User Signup:** Users can register with their name, email, password, and news preferences. Passwords are hashed before storing them.

2. **User Login:** Registered users can log in using their email and password. After successful login, the API generates a JWT token.

3. **Get Preferences:** Logged-in users can view their saved news preferences.

4. **Update Preferences:** Users can update their preferences whenever they want.

5. **Personalized News:** The application fetches news articles based on the topics selected by the logged-in user.

6. **Authentication and Validation:** Protected APIs require a valid JWT token. Basic input validation and error handling are also implemented.

## Project Structure

```text
news-aggregator/
├── src/
│   ├── controllers/
│   │   ├── userController.js
│   │   └── newsController.js
│   ├── services/
│   │   ├── userService.js
│   │   └── newsService.js
│   ├── routes/
│   │   ├── userRoutes.js
│   │   └── newsRoutes.js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   └── errorMiddleware.js
│   ├── validators/
│   │   └── userValidator.js
│   └── data/
│       └── userStore.js
├── test/
│   └── server.test.js
├── app.js
├── server.js
├── package.json
└── README.md
```

I have kept the code in separate folders so it is easier to understand and maintain. Routes handle the endpoints, controllers handle requests and responses, services contain the business logic, and middleware handles authentication and errors.

## How to Run the Project

### 1. Install Dependencies

Clone the repository, open the project folder, and run:

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the project root and add:

```env
PORT=3000
JWT_SECRET=your_secure_jwt_secret
JWT_EXPIRES_IN=1h
NEWS_API_KEY=your_newsapi_key
```

You can get a NewsAPI key from https://newsapi.org/.

Make sure you use your own API key and JWT secret. Do not push the `.env` file to GitHub.

### 3. Start the Server

```bash
npm start
```

The application will run at:

```text
http://localhost:3000
```

## API Endpoints

### 1. Register User

**POST** `/users/signup`

This API is used to create a new user account.

Request body:

```json
{
  "name": "Clark Kent",
  "email": "clark@superman.com",
  "password": "Krypt()n8",
  "preferences": ["movies", "comics"]
}
```

On successful registration, the API returns the user's details without exposing the password.

### 2. Login User

**POST** `/users/login`

This API allows registered users to log in.

Request body:

```json
{
  "email": "clark@superman.com",
  "password": "Krypt()n8"
}
```

After successful login, the API returns a JWT token.

```json
{
  "message": "Login successful",
  "token": "your_jwt_token"
}
```

This token is required to access protected APIs.

### 3. Get User Preferences

**GET** `/users/preferences`

This API returns the preferences saved by the logged-in user.

Authorization: Bearer Token

Example response:

```json
{
  "preferences": ["movies", "comics"]
}
```

### 4. Update User Preferences

**PUT** `/users/preferences`

This API allows users to change their news preferences.

Authorization: Bearer Token

Request body:

```json
{
  "preferences": ["movies", "comics", "games"]
}
```

Example response:

```json
{
  "message": "Preferences updated successfully",
  "preferences": ["movies", "comics", "games"]
}
```

### 5. Get Personalized News

**GET** `/news`

This API fetches articles based on the logged-in user's saved preferences.

Authorization: Bearer Token

Example response structure:

```json
{
  "news": [
    {
      "title": "Example news article",
      "description": "Article description",
      "url": "https://example.com/article"
    }
  ]
}
```

The actual articles depend on the results returned by NewsAPI.

## How Authentication Works

When a user logs in, the application checks their email and password.

If the credentials are correct, a JWT token is generated. The user must send this token when accessing protected APIs.

In Postman, select **Authorization → Bearer Token** and paste the token received from login.

If the token is missing, invalid, or expired, the API returns `401 Unauthorized`.

## Testing

I tested the APIs using Postman and the existing automated tests provided with the assignment.

To run the automated tests:

```bash
npm test
```

### Test Results

All 15 test assertions passed successfully.

```text
Asserts: 15 pass 0 fail 15 of 15 complete
Suites: 1 pass 0 fail 1 of 1 complete
```

The tests cover user registration, login, preferences, news retrieval, and authentication checks.

## Error Handling

I have added basic validation and centralized error handling to return meaningful responses when something goes wrong.

Some common status codes used in the application are:

| Status | Meaning |
|---|---|
| 200 | Request completed successfully |
| 400 | Invalid or missing input |
| 401 | Invalid credentials or authentication token |
| 404 | User or endpoint not found |
| 409 | User already registered |
| 500 | Internal server error |
| 502 | Error while fetching external news |

## Current Limitations

For this assignment, user data is stored in memory instead of a database. This means registered users and their preferences are cleared whenever the server restarts.

The news feature also depends on the external NewsAPI service, so a valid API key and network connection are required.

In the future, I can improve the application by adding a database, news caching, pagination, and more detailed automated tests.

## Conclusion

Through this assignment, I worked on building REST APIs with Node.js and Express.js, implementing authentication using bcrypt and JWT, managing user preferences, and integrating an external news API.

I also followed a layered folder structure to keep the code organized and easier to maintain.

**Assignment:** Airtribe Assignment 2 – Personalized News Aggregator REST API