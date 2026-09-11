/* ----------------------------------------------------------
   Вкладки
---------------------------------------------------------- */
const tabs = document.querySelectorAll(".tabs__item");
const panels = document.querySelectorAll(".panel");

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    const target = tab.dataset.tab;

    tabs.forEach((t) => {
      t.classList.toggle("is-active", t === tab);
      t.setAttribute("aria-selected", t === tab ? "true" : "false");
    });

    panels.forEach((panel) => {
      panel.classList.toggle("is-active", panel.id === `panel-${target}`);
    });
  });
});

/* ----------------------------------------------------------
   Список дел
---------------------------------------------------------- */
const TODO_KEY = "desk.todos";

const todoForm = document.getElementById("todo-form");
const todoInput = document.getElementById("todo-input");
const todoList = document.getElementById("todo-list");
const todoEmpty = document.getElementById("todo-empty");
const todoFooter = document.getElementById("todo-footer");
const todoCount = document.getElementById("todo-count");
const todoClearDone = document.getElementById("todo-clear-done");

function loadTodos() {
  try {
    return JSON.parse(localStorage.getItem(TODO_KEY)) || [];
  } catch {
    return [];
  }
}

function saveTodos(todos) {
  localStorage.setItem(TODO_KEY, JSON.stringify(todos));
}

function renderTodos() {
  const todos = loadTodos();

  todoList.innerHTML = "";

  todos.forEach((todo) => {
    const li = document.createElement("li");
    li.className = "todo-item" + (todo.done ? " is-done" : "");

    const check = document.createElement("button");
    check.className = "todo-item__check";
    check.type = "button";
    check.setAttribute("aria-label", todo.done ? "Отметить как невыполненное" : "Отметить как выполненное");
    check.addEventListener("click", () => toggleTodo(todo.id));

    const text = document.createElement("span");
    text.className = "todo-item__text";
    text.textContent = todo.text;

    const remove = document.createElement("button");
    remove.className = "todo-item__remove";
    remove.type = "button";
    remove.textContent = "×";
    remove.setAttribute("aria-label", "Удалить дело");
    remove.addEventListener("click", () => removeTodo(todo.id));

    li.append(check, text, remove);
    todoList.appendChild(li);
  });

  const hasTodos = todos.length > 0;
  todoEmpty.hidden = hasTodos;
  todoFooter.hidden = !hasTodos;

  const remaining = todos.filter((t) => !t.done).length;
  todoCount.textContent = `${remaining} из ${todos.length} осталось`;
}

function addTodo(text) {
  const todos = loadTodos();
  todos.push({ id: crypto.randomUUID(), text, done: false });
  saveTodos(todos);
  renderTodos();
}

function toggleTodo(id) {
  const todos = loadTodos().map((t) =>
    t.id === id ? { ...t, done: !t.done } : t
  );
  saveTodos(todos);
  renderTodos();
}

function removeTodo(id) {
  const todos = loadTodos().filter((t) => t.id !== id);
  saveTodos(todos);
  renderTodos();
}

todoForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const value = todoInput.value.trim();
  if (!value) return;
  addTodo(value);
  todoInput.value = "";
  todoInput.focus();
});

todoClearDone.addEventListener("click", () => {
  const todos = loadTodos().filter((t) => !t.done);
  saveTodos(todos);
  renderTodos();
});

renderTodos();

/* ----------------------------------------------------------
   Заметки
---------------------------------------------------------- */
const NOTES_KEY = "desk.notes";

const notesArea = document.getElementById("notes-area");
const notesStatus = document.getElementById("notes-status");
const notesClear = document.getElementById("notes-clear");

let notesSaveTimeout = null;

notesArea.value = localStorage.getItem(NOTES_KEY) || "";

notesArea.addEventListener("input", () => {
  notesStatus.textContent = "Сохранение…";
  clearTimeout(notesSaveTimeout);
  notesSaveTimeout = setTimeout(() => {
    localStorage.setItem(NOTES_KEY, notesArea.value);
    notesStatus.textContent = "Сохранено";
  }, 400);
});

notesClear.addEventListener("click", () => {
  notesArea.value = "";
  localStorage.removeItem(NOTES_KEY);
  notesStatus.textContent = "Сохранено";
  notesArea.focus();
});

/* ----------------------------------------------------------
   Таймер фокуса
---------------------------------------------------------- */
const timerDisplay = document.getElementById("timer-display");
const timerToggle = document.getElementById("timer-toggle");
const timerReset = document.getElementById("timer-reset");
const timerNote = document.getElementById("timer-note");
const lengthChips = document.querySelectorAll("#timer-lengths .chip");

let totalSeconds = 25 * 60;
let secondsLeft = totalSeconds;
let intervalId = null;
let isRunning = false;

function formatTime(seconds) {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = Math.floor(seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

function renderTimer() {
  timerDisplay.textContent = formatTime(secondsLeft);
}

function startTimer() {
  isRunning = true;
  timerToggle.textContent = "Пауза";
  timerNote.textContent = "Отрезок идёт — можно свернуть вкладку и вернуться позже.";

  intervalId = setInterval(() => {
    secondsLeft -= 1;
    renderTimer();

    if (secondsLeft <= 0) {
      pauseTimer();
      timerNote.textContent = "Время вышло. Хороший момент сделать паузу.";
    }
  }, 1000);
}

function pauseTimer() {
  isRunning = false;
  clearInterval(intervalId);
  timerToggle.textContent = "Продолжить";
}

function resetTimer() {
  pauseTimer();
  secondsLeft = totalSeconds;
  renderTimer();
  timerToggle.textContent = "Начать";
  timerNote.textContent = "Один спокойный отрезок времени — без уведомлений и лишнего шума.";
}

timerToggle.addEventListener("click", () => {
  if (secondsLeft <= 0) resetTimer();
  isRunning ? pauseTimer() : startTimer();
});

timerReset.addEventListener("click", resetTimer);

lengthChips.forEach((chip) => {
  chip.addEventListener("click", () => {
    lengthChips.forEach((c) => c.classList.toggle("is-active", c === chip));
    totalSeconds = Number(chip.dataset.minutes) * 60;
    resetTimer();
  });
});

renderTimer();
