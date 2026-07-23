const { pool } = require('../config/db');

// Data-access layer: every SQL statement lives here. Controllers never see
// SQL directly, so swapping MySQL for another store later only touches
// this file.
const TodoModel = {
    async findAll({ completed } = {}) {
        if (completed === undefined) {
            const [rows] = await pool.query('SELECT * FROM todos ORDER BY created_at DESC');
            return rows;
        }
        const [rows] = await pool.query(
            'SELECT * FROM todos WHERE completed = ? ORDER BY created_at DESC',
            [completed]
        );
        return rows;
    },

    async findById(id) {
        const [rows] = await pool.query('SELECT * FROM todos WHERE id = ?', [id]);
        return rows[0] || null;
    },

    async create(text) {
        const [result] = await pool.query(
            'INSERT INTO todos (text, completed) VALUES (?, ?)',
            [text, false]
        );
        return this.findById(result.insertId);
    },

    async updateCompleted(id, completed) {
        const [result] = await pool.query(
            'UPDATE todos SET completed = ? WHERE id = ?',
            [completed, id]
        );
        if (result.affectedRows === 0) return null;
        return this.findById(id);
    },

    async remove(id) {
        const [result] = await pool.query('DELETE FROM todos WHERE id = ?', [id]);
        return result.affectedRows > 0;
    },

    async stats() {
        const [rows] = await pool.query(
            'SELECT COUNT(*) AS total, SUM(completed) AS completed FROM todos'
        );
        const total = rows[0].total;
        const completed = Number(rows[0].completed) || 0;
        return { total, completed, remaining: total - completed };
    },
};

module.exports = TodoModel;
