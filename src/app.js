const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const todoRoutes = require('./routes/todoRoutes');
const rateLimit = require('./middleware/rateLimit');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const { checkConnection } = require('./config/db');

function createApp() {
    const app = express();

    app.use(helmet({
        // Keeps the plain <link>/<script> tags in public/index.html working
        // without inlining anything or relaxing CSP further than necessary.
        contentSecurityPolicy: {
            directives: {
                ...helmet.contentSecurityPolicy.getDefaultDirectives(),
                'script-src': ["'self'"],
                'style-src': ["'self'"],
            },
        },
    }));
    app.use(cors());
    app.use(express.json());
    if (process.env.NODE_ENV !== 'test') {
        app.use(morgan('dev'));
    }
    app.use(rateLimit({ windowMs: 60_000, max: 100 }));

    app.get('/health', async (req, res) => {
        try {
            await checkConnection();
            res.json({ status: 'ok', database: 'connected' });
        } catch (err) {
            res.status(503).json({ status: 'degraded', database: 'unreachable' });
        }
    });

    app.use(todoRoutes);

    // Serves the frontend from the same server/port as the API, so
    // `npm start` alone is enough to run the whole app - no second static
    // file server needed.
    app.use(express.static(path.join(__dirname, '..', 'public')));

    app.use(notFoundHandler);
    app.use(errorHandler);

    return app;
}

module.exports = createApp;
