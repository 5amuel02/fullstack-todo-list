const TodoModel = require('../models/todoModel');

const TodoController = {
    async list(req, res, next) {
        try {
            const { completed } = req.query;
            const filter = {};
            if (completed === 'true') filter.completed = true;
            if (completed === 'false') filter.completed = false;

            const todos = await TodoModel.findAll(filter);
            res.json(todos);
        } catch (err) {
            next(err);
        }
    },

    async create(req, res, next) {
        try {
            const todo = await TodoModel.create(req.body.text.trim());
            res.status(201).json(todo);
        } catch (err) {
            next(err);
        }
    },

    async updateCompleted(req, res, next) {
        try {
            const { id } = req.params;
            const todo = await TodoModel.updateCompleted(id, !!req.body.completed);
            if (!todo) {
                return res.status(404).json({ message: 'Todo not found' });
            }
            res.json(todo);
        } catch (err) {
            next(err);
        }
    },

    async remove(req, res, next) {
        try {
            const { id } = req.params;
            const deleted = await TodoModel.remove(id);
            if (!deleted) {
                return res.status(404).json({ message: 'Todo not found' });
            }
            res.json({ message: 'Todo deleted' });
        } catch (err) {
            next(err);
        }
    },

    async stats(req, res, next) {
        try {
            const stats = await TodoModel.stats();
            res.json(stats);
        } catch (err) {
            next(err);
        }
    },
};

module.exports = TodoController;
