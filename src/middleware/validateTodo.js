// Validates the body of POST /todos before it ever reaches the controller,
// so the controller can assume req.body.text is a non-empty, length-bounded
// string.
function validateCreateTodo(req, res, next) {
    const { text } = req.body;

    if (typeof text !== 'string' || text.trim().length === 0) {
        return res.status(400).json({ message: 'Task text is required' });
    }
    if (text.trim().length > 255) {
        return res.status(400).json({ message: 'Task text must be 255 characters or fewer' });
    }
    next();
}

function validateId(req, res, next) {
    const { id } = req.params;
    if (!/^\d+$/.test(id)) {
        return res.status(400).json({ message: 'Invalid todo id' });
    }
    next();
}

module.exports = { validateCreateTodo, validateId };
