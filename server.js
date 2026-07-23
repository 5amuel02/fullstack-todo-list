require('dotenv').config();
const createApp = require('./src/app');

// Number(...) first: a stray PORT env var elsewhere on the host is a
// truthy string ("0") but a falsy number, so a plain `process.env.PORT ||
// 5000` fallback can silently bind to port 0 instead of the intended
// default.
const port = Number(process.env.PORT) || 5000;

const app = createApp();

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
