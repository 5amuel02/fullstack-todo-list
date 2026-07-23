# Full-Stack To-Do List

[![CI](https://github.com/5amuel02/fullstack-todo-list/actions/workflows/ci.yml/badge.svg)](https://github.com/5amuel02/fullstack-todo-list/actions/workflows/ci.yml)

A small full-stack to-do list — a layered Express + MySQL REST API on the backend, vanilla HTML/CSS/JS on the frontend. No framework, no build step, just the fundamentals wired together correctly, with automated tests and CI.

## Features

- Create, complete/uncomplete, and delete tasks
- Filter by status (`GET /todos?completed=true|false`) and an aggregate `GET /todos/stats`
- Completed tasks are struck through and visually distinct
- Empty state and a "can't reach the server" message if the API is down
- Input validation (empty / over-length text, non-numeric ids) with proper `400` responses
- Centralized error handling — MySQL error details never leak to the client
- Security headers (`helmet`), request logging (`morgan`), and a simple in-memory rate limiter
- `GET /health` liveness endpoint that reports database connectivity

## Tech stack

**Backend:** Node.js, Express, MySQL (via `mysql2` connection pool), `helmet`, `morgan`, `dotenv`
**Frontend:** Vanilla HTML/CSS/JS — no framework, talks to the API with `fetch`, served by the same Express server
**Testing:** Jest + Supertest (19 tests, model/DB mocked so they run without a database)

## Project structure

```
├── server.js                     # entry point — loads env, starts the HTTP server
├── src/
│   ├── app.js                    # Express app factory (middleware + routes + static)
│   ├── config/db.js              # MySQL connection pool + health check
│   ├── routes/todoRoutes.js      # route table
│   ├── controllers/todoController.js  # request/response handling
│   ├── models/todoModel.js       # data-access layer — all SQL lives here
│   └── middleware/               # validation, error handling, rate limiting
├── public/                       # frontend, served statically by Express
│   ├── index.html
│   ├── style.css
│   └── app.js
├── tests/todos.test.js           # API tests (Jest + Supertest)
├── schema.sql                    # database schema
├── .env.example                  # config template (copy to .env, which is gitignored)
└── .github/workflows/ci.yml      # runs the test suite on push / PR
```

The app is split into layers so responsibilities stay separate: routes point at controllers, controllers call models, and models are the only place that touches SQL. Swapping the datastore later means changing one file.

## Running it yourself

**1. Database**
```bash
mysql -u root < schema.sql
```
This creates the `todolist` database and `todos` table.

**2. App**
```bash
npm install
cp .env.example .env    # edit if your MySQL user/password differ from root/(blank)
npm start                # or: npm run dev (auto-restart on changes)
```
The server runs on `http://localhost:5000` and serves **both** the API and the
frontend — just open that URL in a browser. No separate static server needed.

## Tests

```bash
npm test
```
The suite mocks the model and DB layers, so it runs anywhere without a live
MySQL instance. The same command runs in CI (Node 18/20/22) on every push and
pull request.

## API

| Method   | Route              | Description                                  |
| -------- | ------------------ | -------------------------------------------- |
| `GET`    | `/todos`           | List todos (optional `?completed=true|false`)|
| `GET`    | `/todos/stats`     | Aggregate counts (total / completed / remaining) |
| `POST`   | `/todos`           | Create a todo (`{ "text": "..." }`)          |
| `PATCH`  | `/todos/:id`       | Toggle completed (`{ "completed": true }`)   |
| `DELETE` | `/todos/:id`       | Delete a todo                                |
| `GET`    | `/health`          | Liveness + database connectivity             |

## Notes

This started as a small practice project and was refactored into a properly
layered application: the single `server.js` was split into an app factory with
routes / controllers / models / middleware, the frontend moved into `public/`
so one `npm start` serves the whole app, a connection pool replaced the single
MySQL connection, and security/logging middleware plus a `/health` check were
added. Along the way a port-parsing bug was fixed where a stray `PORT`
environment variable silently overrode the intended default (`process.env.PORT
|| 5000` treats the string `"0"` as truthy — fixed with `Number(process.env.PORT)
|| 5000`), and the whole API is now covered by an automated test suite that runs
in CI.
