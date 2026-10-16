// Задания 6–8: задачи DummyJSON, авторы, фильтры и сортировка.
const todoApi = "https://dummyjson.com";
const todoState = { todos: [], users: new Map(), nextLocalId: -1, activeUserId: null };
const boards = [...document.querySelectorAll(".todo-app")];
const userDialog = document.getElementById("user-details-dialog");
const profilePane = document.getElementById("user-details-content");
const modalList = document.getElementById("modal-task-list");
const modalCount = document.getElementById("modal-task-count");

async function requestJson(path, options) {
  const response = await fetch(`${todoApi}${path}`, options);
  if (!response.ok) throw new Error(response.status === 404 ? "Пользователь или задача не найдены." : `Ошибка сервера: ${response.status}`);
  return response.json();
}

function message(board, text) { board.querySelector(".todo-message").textContent = text; }

function buildBoards() {
  boards.forEach((board) => {
    const mode = board.dataset.mode;
    board.innerHTML = `
      <div class="todo-panel">
        ${mode === "lookup" ? `<form class="todo-lookup"><label for="todo-user-id">ID пользователя (пусто — все)</label><div class="todo-lookup-row"><input id="todo-user-id" type="number" min="1" step="1" placeholder="Например, 5"><button type="submit">GET</button><button class="todo-clear" type="button">Все</button></div></form>` : ""}
        ${mode === "filter" ? `<div class="todo-search"><label>Текст задачи <input class="todo-text-search" type="search" placeholder="Поиск по задаче"></label><label>Автор <input class="todo-author-search" type="search" placeholder="Ник или имя"></label></div>` : ""}
        <div class="todo-toolbar">
          <label>Состояние <select class="todo-status"><option value="all">Все задачи</option><option value="open">Не выполнены</option><option value="done">Выполнены</option></select></label>
          <label>Сортировать <select class="todo-sort"><option value="id">По ID</option><option value="title">По задаче</option><option value="author">По профилю</option><option value="status">По выполнению</option></select></label>
          <label>Порядок <select class="todo-order"><option value="asc">По возрастанию</option><option value="desc">По убыванию</option></select></label>
          <button class="todo-add" type="button" aria-label="Добавить задачу" title="Добавить задачу">+</button>
        </div>
        <div class="todo-composer" hidden></div>
        <p class="todo-message" role="status" aria-live="polite"></p>
        <p class="todo-count" role="status">Загрузка задач…</p>
        <div class="todo-list"></div>
        <button class="todo-more" type="button" hidden>Показать ещё 20</button>
      </div>`;
    board.dataset.visibleCount = "20";
    board.addEventListener("submit", handleBoardSubmit);
    board.addEventListener("click", handleBoardClick);
    board.addEventListener("change", handleBoardChange);
    board.addEventListener("input", (event) => {
      if (event.target.matches(".todo-text-search, .todo-author-search")) { board.dataset.visibleCount = "20"; renderBoard(board); }
    });
  });
}

function authorOf(todo) { return todoState.users.get(todo.userId); }

function sortedTodos(items, field, order) {
  const collator = new Intl.Collator("ru", { sensitivity: "base", numeric: true });
  const direction = order === "desc" ? -1 : 1;
  return [...items].sort((a, b) => {
    let result;
    if (field === "title") result = collator.compare(a.todo, b.todo);
    else if (field === "author") result = collator.compare(authorOf(a)?.username || "", authorOf(b)?.username || "");
    else if (field === "status") result = Number(a.completed) - Number(b.completed);
    else result = a.id - b.id;
    return direction * (result || a.id - b.id);
  });
}

function todoRow(todo, inModal = false) {
  const row = document.createElement("div");
  row.className = `todo-row${todo.completed ? " is-done" : ""}`;
  row.dataset.todoId = String(todo.id);
  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.className = "todo-check";
  checkbox.checked = todo.completed;
  checkbox.setAttribute("aria-label", `Задача выполнена: ${todo.todo}`);
  const title = document.createElement("span");
  title.className = "todo-title";
  title.textContent = todo.todo;
  row.append(checkbox, title);
  if (!inModal) {
    const author = authorOf(todo);
    const profile = document.createElement("button");
    profile.type = "button";
    profile.className = "todo-author";
    profile.dataset.userId = String(todo.userId);
    if (author?.image) {
      const image = document.createElement("img");
      image.src = author.image;
      image.alt = "";
      profile.appendChild(image);
    }
    const nickname = document.createElement("span");
    nickname.textContent = author ? `@${author.username}` : `ID ${todo.userId}`;
    profile.appendChild(nickname);
    profile.setAttribute("aria-label", `Профиль автора ${nickname.textContent}`);
    row.appendChild(profile);
  }
  const remove = document.createElement("button");
  remove.type = "button";
  remove.className = "todo-remove";
  remove.textContent = "×";
  remove.setAttribute("aria-label", `Удалить задачу: ${todo.todo}`);
  row.appendChild(remove);
  return row;
}

function renderBoard(board) {
  let items = todoState.todos;
  if (board.dataset.mode === "lookup" && board.dataset.userId) items = items.filter((todo) => todo.userId === Number(board.dataset.userId));
  if (board.dataset.mode === "filter") {
    const titleQuery = board.querySelector(".todo-text-search").value.trim().toLocaleLowerCase();
    const authorQuery = board.querySelector(".todo-author-search").value.trim().toLocaleLowerCase();
    items = items.filter((todo) => {
      const author = authorOf(todo);
      const authorText = `${author?.username || ""} ${author?.firstName || ""} ${author?.lastName || ""}`.toLocaleLowerCase();
      return todo.todo.toLocaleLowerCase().includes(titleQuery) && authorText.includes(authorQuery);
    });
  }
  const status = board.querySelector(".todo-status").value;
  if (status !== "all") items = items.filter((todo) => todo.completed === (status === "done"));
  items = sortedTodos(items, board.querySelector(".todo-sort").value, board.querySelector(".todo-order").value);
  const visible = items.slice(0, Number(board.dataset.visibleCount));
  board.querySelector(".todo-list").replaceChildren(...visible.map((todo) => todoRow(todo)));
  board.querySelector(".todo-count").textContent = `Задач: ${items.length}, выполнено: ${items.filter((todo) => todo.completed).length}, показано: ${visible.length}`;
  board.querySelector(".todo-more").hidden = visible.length >= items.length;
}

function renderAll() {
  boards.forEach(renderBoard);
  if (userDialog.open) renderModalTasks();
}

async function handleBoardSubmit(event) {
  if (!event.target.matches(".todo-lookup")) return;
  event.preventDefault();
  const board = event.currentTarget;
  const raw = board.querySelector("#todo-user-id").value.trim();
  if (!raw) {
    delete board.dataset.userId;
    message(board, "Показаны задачи всех авторов.");
    renderBoard(board);
    return;
  }
  const id = Number(raw);
  if (!Number.isSafeInteger(id) || id < 1) { message(board, "Введите положительный целый ID."); return; }
  message(board, `GET /users/${id} и /todos/user/${id} — загрузка…`);
  try {
    const [user] = await Promise.all([requestJson(`/users/${id}`), requestJson(`/todos/user/${id}`)]);
    todoState.users.set(user.id, user);
    board.dataset.userId = String(id);
    board.dataset.visibleCount = "20";
    message(board, `Найден автор @${user.username}. Нажмите на ник справа, чтобы открыть профиль.`);
    renderAll();
  } catch (error) { message(board, error.message); }
}

function handleBoardClick(event) {
  const board = event.currentTarget;
  const target = event.target;
  if (target.closest(".todo-clear")) {
    delete board.dataset.userId;
    board.querySelector("#todo-user-id").value = "";
    message(board, "Показаны задачи всех авторов.");
    renderBoard(board);
  } else if (target.closest(".todo-more")) {
    board.dataset.visibleCount = String(Number(board.dataset.visibleCount) + 20);
    renderBoard(board);
  } else if (target.closest(".todo-add")) {
    toggleComposer(board.querySelector(".todo-composer"), Number(board.dataset.userId) || null);
  } else if (target.closest(".todo-author")) {
    openUser(Number(target.closest(".todo-author").dataset.userId));
  } else if (target.closest(".todo-remove")) {
    removeTodo(Number(target.closest(".todo-row").dataset.todoId), board);
  }
}

function handleBoardChange(event) {
  const board = event.currentTarget;
  if (event.target.matches(".todo-check")) changeCompleted(Number(event.target.closest(".todo-row").dataset.todoId), event.target.checked, board);
  else if (event.target.matches(".todo-status, .todo-sort, .todo-order")) { board.dataset.visibleCount = "20"; renderBoard(board); }
}

function toggleComposer(container, userId = null) {
  if (!container.hidden) { container.hidden = true; container.replaceChildren(); return; }
  const form = document.createElement("form");
  form.className = "todo-add-form";
  const input = document.createElement("input");
  input.type = "text";
  input.maxLength = 140;
  input.required = true;
  input.placeholder = "Название новой задачи";
  input.setAttribute("aria-label", "Название новой задачи");
  const select = document.createElement("select");
  select.setAttribute("aria-label", "Автор задачи");
  const authors = [...todoState.users.values()].filter((user) => todoState.todos.some((todo) => todo.userId === user.id));
  authors.forEach((user) => {
    const option = document.createElement("option");
    option.value = String(user.id);
    option.textContent = `@${user.username}`;
    select.appendChild(option);
  });
  if (userId) { select.value = String(userId); select.hidden = true; }
  const submit = document.createElement("button");
  submit.type = "submit";
  submit.textContent = "Добавить";
  form.append(input, select, submit);
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const text = input.value.trim();
    const authorId = Number(select.value);
    if (!text || !authorId) return;
    submit.disabled = true;
    try {
      await requestJson("/todos/add", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ todo: text, completed: false, userId: authorId }) });
      todoState.todos.unshift({ id: todoState.nextLocalId--, todo: text, completed: false, userId: authorId, local: true });
      container.hidden = true;
      container.replaceChildren();
      renderAll();
    } catch (error) {
      submit.disabled = false;
      alert(`Не удалось добавить задачу. ${error.message}`);
    }
  });
  container.replaceChildren(form);
  container.hidden = false;
  input.focus();
}

async function changeCompleted(id, completed, board) {
  const todo = todoState.todos.find((item) => item.id === id);
  if (!todo) return;
  try {
    if (!todo.local) await requestJson(`/todos/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ completed }) });
    todo.completed = completed;
    renderAll();
  } catch (error) {
    renderAll();
    if (board) message(board, `Не удалось изменить задачу. ${error.message}`);
    else alert(`Не удалось изменить задачу. ${error.message}`);
  }
}

async function removeTodo(id, board) {
  const todo = todoState.todos.find((item) => item.id === id);
  if (!todo) return;
  try {
    if (!todo.local) await requestJson(`/todos/${id}`, { method: "DELETE" });
    todoState.todos = todoState.todos.filter((item) => item.id !== id);
    renderAll();
  } catch (error) {
    if (board) message(board, `Не удалось удалить задачу. ${error.message}`);
    else alert(`Не удалось удалить задачу. ${error.message}`);
  }
}

function detailRow(list, label, value) {
  if (value === undefined || value === null || value === "") return;
  const dt = document.createElement("dt");
  dt.textContent = label;
  const dd = document.createElement("dd");
  dd.textContent = String(value);
  list.append(dt, dd);
}

function renderProfile(user) {
  const avatar = document.createElement("img");
  avatar.src = user.image;
  avatar.alt = "";
  avatar.className = "user-profile-avatar";
  const nickname = document.createElement("h2");
  nickname.textContent = `@${user.username}`;
  const name = document.createElement("p");
  name.className = "user-real-name";
  name.textContent = `${user.firstName} ${user.lastName}`;
  const details = document.createElement("dl");
  details.className = "user-profile-details";
  detailRow(details, "Возраст", user.age);
  detailRow(details, "Пол", user.gender);
  detailRow(details, "Email", user.email);
  detailRow(details, "Телефон", user.phone);
  detailRow(details, "Дата рождения", user.birthDate);
  detailRow(details, "Группа крови", user.bloodGroup);
  detailRow(details, "Рост / вес", user.height && user.weight ? `${user.height} см / ${user.weight} кг` : "");
  detailRow(details, "Цвет глаз", user.eyeColor);
  detailRow(details, "Волосы", [user.hair?.color, user.hair?.type].filter(Boolean).join(", "));
  detailRow(details, "Адрес", [user.address?.address, user.address?.city, user.address?.state, user.address?.country, user.address?.postalCode].filter(Boolean).join(", "));
  detailRow(details, "Университет", user.university);
  detailRow(details, "Компания", user.company?.name);
  detailRow(details, "Отдел", user.company?.department);
  detailRow(details, "Должность", user.company?.title);
  detailRow(details, "Роль", user.role);
  profilePane.replaceChildren(avatar, nickname, name, details);
}

function renderModalTasks() {
  if (!todoState.activeUserId) return;
  const all = todoState.todos.filter((todo) => todo.userId === todoState.activeUserId);
  const status = document.getElementById("modal-task-status").value;
  const filtered = status === "all" ? all : all.filter((todo) => todo.completed === (status === "done"));
  const sorted = sortedTodos(filtered, document.getElementById("modal-task-sort").value, "asc");
  modalCount.textContent = `Всего: ${all.length}, выполнено: ${all.filter((todo) => todo.completed).length}, показано: ${sorted.length}`;
  modalList.replaceChildren(...sorted.map((todo) => todoRow(todo, true)));
}

async function openUser(id) {
  todoState.activeUserId = id;
  profilePane.textContent = "Загрузка профиля…";
  document.getElementById("modal-task-status").value = "all";
  document.getElementById("modal-task-sort").value = "id";
  const composer = document.getElementById("modal-task-composer");
  composer.hidden = true;
  composer.replaceChildren();
  userDialog.showModal();
  renderModalTasks();
  try {
    const user = await requestJson(`/users/${id}`);
    todoState.users.set(user.id, user);
    if (userDialog.open && todoState.activeUserId === id) renderProfile(user);
  } catch (error) { profilePane.textContent = error.message; }
}

document.getElementById("close-user-details").addEventListener("click", () => userDialog.close());
userDialog.addEventListener("click", (event) => { if (event.target === userDialog) userDialog.close(); });
document.getElementById("modal-task-status").addEventListener("change", renderModalTasks);
document.getElementById("modal-task-sort").addEventListener("change", renderModalTasks);
document.getElementById("modal-add-task").addEventListener("click", () => toggleComposer(document.getElementById("modal-task-composer"), todoState.activeUserId));
modalList.addEventListener("change", (event) => {
  if (event.target.matches(".todo-check")) changeCompleted(Number(event.target.closest(".todo-row").dataset.todoId), event.target.checked);
});
modalList.addEventListener("click", (event) => {
  if (event.target.closest(".todo-remove")) removeTodo(Number(event.target.closest(".todo-row").dataset.todoId));
});

async function loadTodoData() {
  try {
    const [todoData, userData] = await Promise.all([
      requestJson("/todos?limit=0"),
      requestJson("/users?limit=0&select=id,username,firstName,lastName,image")
    ]);
    if (!Array.isArray(todoData.todos) || !Array.isArray(userData.users)) throw new Error("Неверный ответ API.");
    todoState.todos = todoData.todos;
    todoState.users = new Map(userData.users.map((user) => [user.id, user]));
    renderAll();
  } catch (error) {
    boards.forEach((board) => {
      board.querySelector(".todo-count").textContent = "Не удалось загрузить задачи.";
      message(board, error.message);
    });
  }
}

buildBoards();
loadTodoData();
