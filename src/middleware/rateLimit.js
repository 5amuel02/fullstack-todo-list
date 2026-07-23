// A minimal fixed-window rate limiter - no external dependency needed for
// an app this size. Not distributed-safe (in-memory only), which is fine
// for a single-process demo API; a real multi-instance deployment would
// back this with Redis instead.
function rateLimit({ windowMs = 60_000, max = 100 } = {}) {
    const hits = new Map();

    return function rateLimitMiddleware(req, res, next) {
        const key = req.ip;
        const now = Date.now();
        const entry = hits.get(key);

        if (!entry || now - entry.start > windowMs) {
            hits.set(key, { start: now, count: 1 });
            return next();
        }

        entry.count += 1;
        if (entry.count > max) {
            return res.status(429).json({ message: 'Too many requests, slow down' });
        }
        next();
    };
}

module.exports = rateLimit;
