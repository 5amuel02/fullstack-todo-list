# Full-Stack To-Do List

A small full-stack to-do list — Express + MySQL REST API on the backend, vanilla HTML/CSS/JS on the frontend. No framework, no build step, just the fundamentals wired together correctly.

## Features

- Create, complete/uncomplete, and delete tasks
- Completed tasks are struck through and visually distinct
- Empty state and a "can't reach the server" message if the API is down
- Input validation (rejects empty tasks) with a proper 400 response
- REST API: `GET /todos`, `POST /todos`, `PATCH /todos/:id`, `DELETE /todos/:id`

## Tech stack

**Backend:** Node.js, Express, MySQL (via `mysql2`), `dotenv` for config
**Frontend:** Vanilla HTML/CSS/JS — no framework, talks to the API with `fetch`

## Running it yourself

**1. Database**
```bash
mysql -u root < schema.sql
```
This creates the `todolist` database and `todos` table.

**2. Backend**
```bash
npm install
cp .env.example .env    # edit if your MySQL user/password differ from root/(blank)
npm start                # or: npm run dev (auto-restart on changes)
```
Server runs on `http://localhost:5000`.

**3. Frontend**

Open `index.html` directly in a browser, or serve it with any static server:
```bash
npx serve .
```

## Project structure

```
├── index.html      # UI shell
├── style.css        # styling
├── app.js            # frontend logic — talks to the API via fetch
├── server.js         # Express API + MySQL queries
├── schema.sql        # database schema
└── .env.example       # config template (copy to .env, which is gitignored)
```

## Notes

This started as a small practice project and was cleaned up for publishing: added `package.json` (there wasn't one), moved DB credentials out of the source and into a gitignored `.env`, added the `PATCH /todos/:id` endpoint (the `completed` column existed in the schema but the original frontend never exposed a way to toggle it), and fixed a port-parsing bug where a stray `PORT` environment variable on the host machine silently overrode the intended default (`process.env.PORT || 5000` treats the string `"0"` as truthy, so it never fell through — fixed with `Number(process.env.PORT) || 5000`).

Tested end-to-end locally: schema created, all four endpoints exercised via curl, and the UI verified in a real browser against a running server.
