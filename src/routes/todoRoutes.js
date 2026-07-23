const express = require('express');
const TodoController = require('../controllers/todoController');
const { validateCreateTodo, validateId } = require('../middleware/validateTodo');

const router = express.Router();

router.get('/todos', TodoController.list);
router.get('/todos/stats', TodoController.stats);
router.post('/todos', validateCreateTodo, TodoController.create);
router.patch('/todos/:id', validateId, TodoController.updateCompleted);
router.delete('/todos/:id', validateId, TodoController.remove);

module.exports = router;
