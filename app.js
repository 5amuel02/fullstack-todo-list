const apiUrl = 'http://localhost:5000/todos';

const todoList = document.getElementById('todoList');
const todoInput = document.getElementById('todoInput');
const emptyState = document.getElementById('emptyState');

async function fetchTodos() {
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error('Request failed');
        const todos = await response.json();
        renderTodos(todos);
    } catch (err) {
        todoList.innerHTML = '';
        emptyState.textContent = "Can't reach the server. Is it running? (npm start)";
        emptyState.style.display = 'block';
    }
}

function renderTodos(todos) {
    todoList.innerHTML = '';
    emptyState.style.display = todos.length === 0 ? 'block' : 'none';
    if (todos.length === 0) {
        emptyState.textContent = 'No tasks yet — add one above.';
    }

    todos.forEach(todo => {
        const li = document.createElement('li');
        li.className = todo.completed ? 'completed' : '';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = !!todo.completed;
        checkbox.addEventListener('change', () => toggleTodo(todo.id, checkbox.checked));

        const span = document.createElement('span');
        span.textContent = todo.text;
        span.className = 'todo-text';

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.className = 'delete-btn';
        deleteButton.addEventListener('click', () => deleteTodo(todo.id));

        li.appendChild(checkbox);
        li.appendChild(span);
        li.appendChild(deleteButton);
        todoList.appendChild(li);
    });
}

async function addTodo() {
    const text = todoInput.value.trim();
    if (!text) return;

    await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
    });
    todoInput.value = '';
    fetchTodos();
}

async function toggleTodo(id, completed) {
    await fetch(`${apiUrl}/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed })
    });
    fetchTodos();
}

async function deleteTodo(id) {
    await fetch(`${apiUrl}/${id}`, { method: 'DELETE' });
    fetchTodos();
}

document.getElementById('addButton').addEventListener('click', addTodo);
todoInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') addTodo();
});

// Initial fetch
fetchTodos();
