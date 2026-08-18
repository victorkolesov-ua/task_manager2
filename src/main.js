import './style.css';

const STORAGE_PATH = '/api/tasks';

const app = document.querySelector('#app');

let tasks = [];
let editingTaskId = null;

app.innerHTML = `
  <div class="task-manager">
    <header class="app-header">
      <div>
        <p class="eyebrow">Task Manager</p>
        <h1>Менеджер задач</h1>
      </div>
    </header>

    <section class="panel">
      <h2>Додати нову задачу</h2>
      <form id="task-form" class="task-form">
        <div class="field-group">
          <label for="task-description">Опис задачі</label>
          <textarea id="task-description" name="description" rows="3" placeholder="Наприклад: Підготувати презентацію до зустрічі" required></textarea>
        </div>

        <div class="field-group">
          <label for="task-datetime">Заплановані дата та час виконання</label>
          <input id="task-datetime" name="scheduledAt" type="datetime-local" required />
        </div>

        <div class="form-actions">
          <button id="submit-task-btn" type="submit" class="primary-btn">Додати задачу</button>
          <button id="cancel-edit-btn" type="button" class="secondary-btn hidden">Скасувати</button>
        </div>
      </form>
    </section>

    <section class="panel table-panel">
      <div class="panel-header">
        <h2>Список задач</h2>
        <button id="clear-all-btn" type="button" class="danger-btn">Очистити все</button>
      </div>

      <div class="toolbar">
        <div class="toolbar-field search-field">
          <label for="search-input">Пошук за описом</label>
          <input id="search-input" type="search" placeholder="Введіть текст..." />
        </div>

        <div class="toolbar-field filter-field">
          <label for="status-filter">Фільтр по виконанню</label>
          <select id="status-filter">
            <option value="all">Усі</option>
            <option value="active">Активні</option>
            <option value="completed">Виконані</option>
          </select>
        </div>
      </div>

      <div class="stats">
        <div class="stat-card">
          <span>Активні</span>
          <strong id="active-count">0</strong>
        </div>
        <div class="stat-card">
          <span>Виконані</span>
          <strong id="completed-count">0</strong>
        </div>
      </div>

      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Опис задачі</th>
              <th>Заплановано</th>
              <th>Виконано</th>
              <th>Дії</th>
            </tr>
          </thead>
          <tbody id="tasks-body"></tbody>
        </table>
      </div>
    </section>
  </div>
`;

const form = document.querySelector('#task-form');
const descriptionInput = document.querySelector('#task-description');
const scheduledAtInput = document.querySelector('#task-datetime');
const submitTaskButton = document.querySelector('#submit-task-btn');
const cancelEditButton = document.querySelector('#cancel-edit-btn');
const searchInput = document.querySelector('#search-input');
const statusFilter = document.querySelector('#status-filter');
const tasksBody = document.querySelector('#tasks-body');
const clearAllButton = document.querySelector('#clear-all-btn');
const activeCount = document.querySelector('#active-count');
const completedCount = document.querySelector('#completed-count');

async function loadTasks() {
  try {
    const response = await fetch(STORAGE_PATH, { cache: 'no-store' });
    if (!response.ok) {
      tasks = [];
      return;
    }

    const parsedTasks = await response.json();
    tasks = Array.isArray(parsedTasks) ? parsedTasks : [];
  } catch (error) {
    console.error('Помилка читання задач з сервера:', error);
    tasks = [];
  }
}

async function saveTasks() {
  const payload = JSON.stringify(tasks, null, 2);

  try {
    const response = await fetch(STORAGE_PATH, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: payload
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
  } catch (error) {
    console.error('Помилка збереження задач на сервері:', error);
  }
}

function createId() {
  if (window.crypto && typeof window.crypto.randomUUID === 'function') {
    return window.crypto.randomUUID();
  }

  return `task-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function escapeHtml(value = '') {
  return String(value).replace(/[&<>"']/g, (symbol) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  }[symbol]));
}

function formatDate(value) {
  if (!value) {
    return '—';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('uk-UA', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

function updateStats() {
  const activeTasks = tasks.filter((task) => !task.completed).length;
  const completedTasks = tasks.filter((task) => task.completed).length;

  activeCount.textContent = String(activeTasks);
  completedCount.textContent = String(completedTasks);
}

function getFilteredTasks() {
  const searchTerm = searchInput.value.trim().toLowerCase();
  const filterValue = statusFilter.value;

  return tasks.filter((task) => {
    const matchesSearch = task.description.toLowerCase().includes(searchTerm);
    const matchesFilter =
      filterValue === 'all' ||
      (filterValue === 'active' && !task.completed) ||
      (filterValue === 'completed' && task.completed);

    return matchesSearch && matchesFilter;
  });
}

function renderTasks() {
  const visibleTasks = getFilteredTasks();

  if (!visibleTasks.length) {
    tasksBody.innerHTML = `
      <tr class="empty-row">
        <td colspan="4">Немає задач за вашим запитом.</td>
      </tr>
    `;
    return;
  }

  tasksBody.innerHTML = visibleTasks
    .map(
      (task) => `
        <tr>
          <td class="description-cell">${escapeHtml(task.description)}</td>
          <td>${formatDate(task.scheduledAt)}</td>
          <td class="checkbox-cell">
            <label class="toggle-wrapper">
              <input
                type="checkbox"
                data-action="toggle-complete"
                data-id="${task.id}"
                ${task.completed ? 'checked' : ''}
              />
            </label>
          </td>
          <td class="actions-cell">
            <button type="button" class="secondary-btn" data-action="edit-task" data-id="${task.id}">Редагувати</button>
            <button type="button" class="danger-btn" data-action="delete-task" data-id="${task.id}">Видалити</button>
          </td>
        </tr>
      `,
    )
    .join('');
}

function renderApp() {
  updateStats();
  renderTasks();
}

function resetFormState() {
  editingTaskId = null;
  submitTaskButton.textContent = 'Додати задачу';
  cancelEditButton.classList.add('hidden');
  form.reset();
}

function startEditing(taskId) {
  const task = tasks.find((item) => item.id === taskId);
  if (!task) {
    return;
  }

  editingTaskId = taskId;
  descriptionInput.value = task.description;
  scheduledAtInput.value = task.scheduledAt;
  submitTaskButton.textContent = 'Зберегти зміни';
  cancelEditButton.classList.remove('hidden');
  descriptionInput.focus();
}

form.addEventListener('submit', (event) => {
  event.preventDefault();

  const description = descriptionInput.value.trim();
  const scheduledAt = scheduledAtInput.value;

  if (!description || !scheduledAt) {
    return;
  }

  if (editingTaskId) {
    const taskToEdit = tasks.find((task) => task.id === editingTaskId);
    if (taskToEdit) {
      taskToEdit.description = description;
      taskToEdit.scheduledAt = scheduledAt;
    }
  } else {
    tasks.unshift({
      id: createId(),
      description,
      scheduledAt,
      completed: false
    });
  }

  saveTasks();
  resetFormState();
  renderApp();
});

searchInput.addEventListener('input', renderTasks);
statusFilter.addEventListener('change', renderTasks);

clearAllButton.addEventListener('click', () => {
  if (!tasks.length) {
    return;
  }

  const isConfirmed = window.confirm('Видалити всі задачі?');
  if (!isConfirmed) {
    return;
  }

  tasks = [];
  saveTasks();
  resetFormState();
  renderApp();
});

tasksBody.addEventListener('click', (event) => {
  const actionButton = event.target.closest('button[data-action]');
  if (!actionButton) {
    return;
  }

  const { action, id } = actionButton.dataset;

  if (action === 'delete-task') {
    tasks = tasks.filter((task) => task.id !== id);
    saveTasks();

    if (editingTaskId === id) {
      resetFormState();
    }

    renderApp();
  }

  if (action === 'edit-task') {
    startEditing(id);
  }
});

tasksBody.addEventListener('change', (event) => {
  const checkbox = event.target.closest('input[data-action="toggle-complete"]');
  if (!checkbox) {
    return;
  }

  const task = tasks.find((item) => item.id === checkbox.dataset.id);
  if (!task) {
    return;
  }

  task.completed = checkbox.checked;
  saveTasks();
  renderApp();
});

cancelEditButton.addEventListener('click', () => {
  resetFormState();
});

loadTasks().then(() => {
  renderApp();
});
