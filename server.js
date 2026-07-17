require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
// Number(...) first: a stray PORT=0 in the shell environment is a truthy
// string ("0") but a falsy number, so plain `process.env.PORT || 5000`
// would silently bind to port 0 instead of falling back.
const port = Number(process.env.PORT) || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MySQL connection (credentials come from .env — see .env.example)
const db = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'todolist'
});

db.connect(err => {
    if (err) {
        console.error('Error connecting to MySQL:', err.message);
        console.error('Have you run schema.sql and set up your .env file? See README.md.');
        return;
    }
    console.log('Connected to MySQL');
});

// Routes
app.get('/todos', (req, res) => {
    db.query('SELECT * FROM todos ORDER BY created_at DESC', (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Error retrieving todos', error: err.message });
        }
        res.json(results);
    });
});

app.post('/todos', (req, res) => {
    const text = (req.body.text || '').trim();
    if (!text) {
        return res.status(400).json({ message: 'Task text is required' });
    }
    db.query('INSERT INTO todos (text, completed) VALUES (?, ?)', [text, false], (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Error adding todo', error: err.message });
        }
        res.status(201).json({ id: results.insertId, text, completed: false });
    });
});

// Toggle a todo's completed state
app.patch('/todos/:id', (req, res) => {
    const { id } = req.params;
    const { completed } = req.body;
    db.query('UPDATE todos SET completed = ? WHERE id = ?', [!!completed, id], (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Error updating todo', error: err.message });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'Todo not found' });
        }
        res.json({ id: Number(id), completed: !!completed });
    });
});

app.delete('/todos/:id', (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM todos WHERE id = ?', [id], (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Error deleting todo', error: err.message });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'Todo not found' });
        }
        res.json({ message: 'Todo deleted' });
    });
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
