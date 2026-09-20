# Socially

Socially is a full-stack social media platform built with React, TypeScript, Express, MongoDB, and Socket.IO. It includes authentication, profiles, posts, comments, likes, follows, search, notifications, messaging, and a following feed.

## Features

- User registration, login, password reset, and JWT authentication
- User profiles with avatars, bios, followers, and following
- Create, edit, and delete posts with image uploads
- Like and unlike posts
- Create, edit, and delete comments with author permissions
- Following feed
- Follow suggestions based on mutual connections and follow-back opportunities
- User and post search with debounced user previews
- Real-time notifications and messaging with Socket.IO
- Conversation unread counts and activity ordering
- Light and dark themes
- Swagger API documentation

## Stack

- Frontend: React 19, TypeScript, Vite, React Router
- Backend: Node.js, Express 5, TypeScript, Mongoose
- Database: MongoDB
- Real-time: Socket.IO
- Security: Helmet, CORS, rate limiting, bcrypt, JWT

## Requirements

- Node.js 20 or newer
- npm
- MongoDB, either a local instance or MongoDB Atlas

## Quick Start

1. Clone the repository and enter the project directory.

2. Install the root dependency and both application dependency sets:

```bash
npm install
npm run install:all
```

3. Create the backend environment file:

```bash
copy back-end\.env.example back-end\.env
```

On macOS or Linux:

```bash
cp back-end/.env.example back-end/.env
```

Set `MONGO_URI` and `JWT_SECRET` in `back-end/.env`.

4. Create the frontend environment file if you need a custom API URL:

```bash
copy front-end\.env.example front-end\.env
```

The default frontend API URL is `http://localhost:5000/api`, so this step is optional for local development.

5. Start both applications from the repository root:

```bash
npm run dev
```

The frontend runs at `http://localhost:5173` and the backend runs at `http://localhost:5000`.

## Deploy Frontend on Render

Create a new **Static Site** in Render using the same repository.

Use these settings:

| Setting | Value |
| --- | --- |
| Root Directory | `front-end` |
| Build Command | `npm install && npm run build` |
| Publish Directory | `dist` |

Add this frontend environment variable in Render:

```text
VITE_API_URL=https://socially-fc2x.onrender.com/api
```

Add this rewrite in the Render Static Site settings so direct links such as `/profile/name` and `/messages` work:

| Source | Destination | Action |
| --- | --- | --- |
| `/*` | `/index.html` | Rewrite |

After Render gives the frontend its public URL, update the backend Web Service environment variable:

```text
CLIENT_URL=https://your-frontend-name.onrender.com
```

This allows Socket.IO connections from the deployed frontend. Trigger a backend redeploy after changing `CLIENT_URL`.

## Environment Variables

### Backend

| Variable     | Required | Description                               |
| ------------ | -------- | ----------------------------------------- |
| `MONGO_URI`  | Yes      | MongoDB connection string                 |
| `JWT_SECRET` | Yes      | Secret used to sign authentication tokens |
| `PORT`       | No       | Backend port, defaults to `5000`          |
| `CLIENT_URL` | No       | Allowed frontend origin for Socket.IO     |

### Frontend

| Variable       | Required | Description                                           |
| -------------- | -------- | ----------------------------------------------------- |
| `VITE_API_URL` | No       | API base URL, defaults to `http://localhost:5000/api` |

## Useful Commands

Run from the repository root:

```bash
npm run dev       # Start frontend and backend together
npm run build     # Build the frontend
npm run lint      # Run the frontend linter
npm run install:all # Install nested application dependencies
```

Run application-specific commands:

```bash
npm run dev --prefix back-end
npm run dev --prefix front-end
npm run build --prefix front-end
npm run lint --prefix front-end
```

## API Documentation

When the backend is running, Swagger UI is available at:

`http://localhost:5000/api-docs`

The REST API is mounted under `/api`.

## Project Structure

```text
.
├── back-end/
│   ├── src/
│   │   ├── config/        MongoDB connection
│   │   ├── controllers/   Request handlers
│   │   ├── middleware/    Auth, errors, and uploads
│   │   ├── models/        Mongoose models
│   │   ├── routes/        Express routes
│   │   ├── services/      Backend services
│   │   └── sockets/       Socket.IO setup
│   └── uploads/            Uploaded avatars and post images
├── front-end/
│   └── src/
│       ├── components/    Reusable UI components
│       ├── layout/        Application layouts
│       ├── pages/         Route-level screens
│       ├── router/        React Router configuration
│       ├── services/      API clients
│       └── store/         Shared state location
└── package.json            Root development scripts
```

## Notes

- Keep `.env` files local and never commit secrets.
- The backend creates upload directories as needed.
- MongoDB must be reachable before the backend can start.
- The project is under active development; the feature checklist in `req.md` records planned work as well as completed work.

## License

No license has been specified yet.
