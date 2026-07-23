// Centralized error handler: every controller calls next(err) on failure
// instead of formatting its own 500 response, so error shape stays
// consistent and MySQL error details never leak to the client.
function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
    console.error(err);

    if (err.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ message: 'Duplicate entry' });
    }

    const status = err.status || 500;
    const message = status === 500 ? 'Internal server error' : err.message;
    res.status(status).json({ message });
}

function notFoundHandler(req, res) {
    res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
}

module.exports = { errorHandler, notFoundHandler };
