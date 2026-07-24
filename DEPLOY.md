# Deploying the To-Do List

This app is a Node/Express API **plus a MySQL database**. Because Render doesn't
offer managed MySQL, the recommended host is **[Railway](https://railway.app)**,
which provisions both in one project. (Any host works via the included
[`Dockerfile`](Dockerfile) — you just need to point it at a MySQL instance.)

## Railway (recommended)

1. **Create the project** — Railway → *New Project* → *Deploy from GitHub repo* →
   select `fullstack-todo-list`. It builds from the `Dockerfile` automatically.
2. **Add the database** — in the same project: *New* → *Database* → *Add MySQL*.
3. **Wire the app to the database** — open the web service → *Variables*, and add
   (referencing the MySQL service's variables):

   | App variable  | Value                          |
   | ------------- | ------------------------------ |
   | `DB_HOST`     | `${{MySQL.MYSQLHOST}}`         |
   | `DB_PORT`     | `${{MySQL.MYSQLPORT}}`         |
   | `DB_USER`     | `${{MySQL.MYSQLUSER}}`         |
   | `DB_PASSWORD` | `${{MySQL.MYSQLPASSWORD}}`     |
   | `DB_NAME`     | `${{MySQL.MYSQLDATABASE}}`     |

   `PORT` is injected by Railway automatically — no need to set it.
4. **Create the table** — run the schema once against the new database. From the
   MySQL service's *Connect* tab, copy the `mysql` command and pipe the schema:
   ```bash
   mysql -h <host> -P <port> -u <user> -p<password> <database> < schema.sql
   ```
   (or paste the contents of [`schema.sql`](schema.sql) into any MySQL client).
5. **Done** — open the web service's generated domain. `GET /health` should report
   `{ "status": "ok", "database": "connected" }`, and the UI is served at `/`.

## Run it locally with Docker

```bash
docker build -t todo .
docker run -p 5000:5000 \
  -e DB_HOST=host.docker.internal -e DB_USER=root -e DB_PASSWORD= -e DB_NAME=todolist \
  todo
# open http://localhost:5000
```

## Notes

- The app reads `DB_HOST` / `DB_PORT` / `DB_USER` / `DB_PASSWORD` / `DB_NAME` and `PORT`
  from the environment; nothing is hard-coded (`.env` is gitignored, see `.env.example`).
- `GET /health` is a real liveness probe (checks the DB) — point the host's health check at it.
- The test suite mocks the DB, so CI stays green without a live database.
