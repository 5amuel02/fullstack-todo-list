process.env.NODE_ENV = 'test';

jest.mock('../src/models/todoModel');
jest.mock('../src/config/db', () => ({
    checkConnection: jest.fn(),
}));

const request = require('supertest');
const createApp = require('../src/app');
const TodoModel = require('../src/models/todoModel');
const { checkConnection } = require('../src/config/db');

const app = createApp();

const sampleTodo = { id: 1, text: 'Write tests', completed: false, created_at: '2026-01-01T00:00:00.000Z' };

beforeEach(() => {
    jest.clearAllMocks();
});

describe('GET /health', () => {
    test('reports ok when the database is reachable', async () => {
        checkConnection.mockResolvedValue();
        const res = await request(app).get('/health');
        expect(res.status).toBe(200);
        expect(res.body).toEqual({ status: 'ok', database: 'connected' });
    });

    test('reports degraded when the database is unreachable', async () => {
        checkConnection.mockRejectedValue(new Error('connection refused'));
        const res = await request(app).get('/health');
        expect(res.status).toBe(503);
        expect(res.body.status).toBe('degraded');
    });
});

describe('GET /todos', () => {
    test('returns all todos', async () => {
        TodoModel.findAll.mockResolvedValue([sampleTodo]);
        const res = await request(app).get('/todos');
        expect(res.status).toBe(200);
        expect(res.body).toEqual([sampleTodo]);
        expect(TodoModel.findAll).toHaveBeenCalledWith({});
    });

    test('filters by completed=true', async () => {
        TodoModel.findAll.mockResolvedValue([]);
        await request(app).get('/todos?completed=true');
        expect(TodoModel.findAll).toHaveBeenCalledWith({ completed: true });
    });

    test('filters by completed=false', async () => {
        TodoModel.findAll.mockResolvedValue([]);
        await request(app).get('/todos?completed=false');
        expect(TodoModel.findAll).toHaveBeenCalledWith({ completed: false });
    });

    test('returns 500 with a generic message if the model throws', async () => {
        TodoModel.findAll.mockRejectedValue(new Error('MySQL exploded with a stack trace'));
        const res = await request(app).get('/todos');
        expect(res.status).toBe(500);
        expect(res.body.message).toBe('Internal server error');
        expect(JSON.stringify(res.body)).not.toMatch(/MySQL exploded/);
    });
});

describe('POST /todos', () => {
    test('creates a todo with valid text', async () => {
        TodoModel.create.mockResolvedValue(sampleTodo);
        const res = await request(app).post('/todos').send({ text: 'Write tests' });
        expect(res.status).toBe(201);
        expect(res.body).toEqual(sampleTodo);
        expect(TodoModel.create).toHaveBeenCalledWith('Write tests');
    });

    test('trims whitespace before saving', async () => {
        TodoModel.create.mockResolvedValue(sampleTodo);
        await request(app).post('/todos').send({ text: '  Write tests  ' });
        expect(TodoModel.create).toHaveBeenCalledWith('Write tests');
    });

    test('rejects empty text with 400', async () => {
        const res = await request(app).post('/todos').send({ text: '   ' });
        expect(res.status).toBe(400);
        expect(TodoModel.create).not.toHaveBeenCalled();
    });

    test('rejects missing text with 400', async () => {
        const res = await request(app).post('/todos').send({});
        expect(res.status).toBe(400);
    });

    test('rejects text over 255 characters with 400', async () => {
        const res = await request(app).post('/todos').send({ text: 'a'.repeat(256) });
        expect(res.status).toBe(400);
        expect(TodoModel.create).not.toHaveBeenCalled();
    });
});

describe('PATCH /todos/:id', () => {
    test('toggles completed state', async () => {
        TodoModel.updateCompleted.mockResolvedValue({ ...sampleTodo, completed: true });
        const res = await request(app).patch('/todos/1').send({ completed: true });
        expect(res.status).toBe(200);
        expect(res.body.completed).toBe(true);
        expect(TodoModel.updateCompleted).toHaveBeenCalledWith('1', true);
    });

    test('returns 404 for a todo that does not exist', async () => {
        TodoModel.updateCompleted.mockResolvedValue(null);
        const res = await request(app).patch('/todos/999').send({ completed: true });
        expect(res.status).toBe(404);
    });

    test('rejects a non-numeric id with 400', async () => {
        const res = await request(app).patch('/todos/not-a-number').send({ completed: true });
        expect(res.status).toBe(400);
        expect(TodoModel.updateCompleted).not.toHaveBeenCalled();
    });
});

describe('DELETE /todos/:id', () => {
    test('deletes an existing todo', async () => {
        TodoModel.remove.mockResolvedValue(true);
        const res = await request(app).delete('/todos/1');
        expect(res.status).toBe(200);
        expect(res.body.message).toBe('Todo deleted');
    });

    test('returns 404 for a todo that does not exist', async () => {
        TodoModel.remove.mockResolvedValue(false);
        const res = await request(app).delete('/todos/999');
        expect(res.status).toBe(404);
    });

    test('rejects a non-numeric id with 400', async () => {
        const res = await request(app).delete('/todos/not-a-number');
        expect(res.status).toBe(400);
    });
});

describe('GET /todos/stats', () => {
    test('returns aggregate counts', async () => {
        TodoModel.stats.mockResolvedValue({ total: 5, completed: 2, remaining: 3 });
        const res = await request(app).get('/todos/stats');
        expect(res.status).toBe(200);
        expect(res.body).toEqual({ total: 5, completed: 2, remaining: 3 });
    });
});

describe('unknown routes', () => {
    test('returns 404 with a descriptive message', async () => {
        const res = await request(app).get('/nope');
        expect(res.status).toBe(404);
        expect(res.body.message).toMatch(/GET \/nope/);
    });
});
