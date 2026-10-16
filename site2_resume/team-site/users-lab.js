// Задания 6–8: GET по ID, фильтр и сортировка пользователей DummyJSON.
const usersApi = "https://dummyjson.com/users";
const usersState = { all: [], filterCount: 24, sortCount: 24 };
const idForm = document.getElementById("user-id-form");
const idInput = document.getElementById("user-id-input");
const idStatus = document.getElementById("user-id-status");
const idResult = document.getElementById("user-id-result");
const searchInput = document.getElementById("user-search");
const genderInput = document.getElementById("user-gender");
const filterStatus = document.getElementById("user-filter-status");
const filterResult = document.getElementById("user-filter-result");
const sortField = document.getElementById("user-sort-field");
const sortOrder = document.getElementById("user-sort-order");
const sortStatus = document.getElementById("user-sort-status");
const sortResult = document.getElementById("user-sort-result");
const userDialog = document.getElementById("user-details-dialog");
const userDetails = document.getElementById("user-details-content");

async function getJson(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(response.status === 404 ? "Пользователь не найден." : `Ошибка сервера: ${response.status}`);
  return response.json();
}

function userCard(user) {
  const card = document.createElement("article");
  card.className = "user-card";

  const image = document.createElement("img");
  image.src = user.image;
  image.alt = "";
  image.loading = "lazy";
  card.appendChild(image);

  const content = document.createElement("div");
  const number = document.createElement("span");
  number.className = "user-card-id";
  number.textContent = `ID ${user.id}`;
  const name = document.createElement("h3");
  name.textContent = `${user.firstName} ${user.lastName}`;
  const nickname = document.createElement("button");
  nickname.type = "button";
  nickname.className = "user-nickname";
  nickname.dataset.userId = String(user.id);
  nickname.textContent = `@${user.username}`;
  nickname.setAttribute("aria-label", `Открыть сведения о ${user.username}`);
  const meta = document.createElement("p");
  meta.textContent = `${user.age} лет · ${user.gender === "female" ? "женщина" : "мужчина"}`;
  content.append(number, name, nickname, meta);
  card.appendChild(content);
  return card;
}

function renderCards(container, users, count, status) {
  container.replaceChildren();
  const visible = users.slice(0, count);
  const fragment = document.createDocumentFragment();
  visible.forEach((user) => fragment.appendChild(userCard(user)));
  container.appendChild(fragment);
  status.textContent = users.length ? `Найдено: ${users.length}. Показано: ${visible.length}.` : "Ничего не найдено. Попробуйте изменить условия.";
  if (visible.length < users.length) {
    const more = document.createElement("button");
    more.type = "button";
    more.className = "users-more";
    more.textContent = "Показать ещё 24";
    more.addEventListener("click", () => {
      if (container === filterResult) usersState.filterCount += 24;
      else usersState.sortCount += 24;
      container === filterResult ? renderFiltered() : renderSorted();
    });
    container.appendChild(more);
  }
}

function renderFiltered() {
  const query = searchInput.value.trim().toLocaleLowerCase();
  const gender = genderInput.value;
  const result = usersState.all.filter((user) => {
    const text = `${user.firstName} ${user.lastName} ${user.username}`.toLocaleLowerCase();
    return text.includes(query) && (gender === "all" || user.gender === gender);
  });
  renderCards(filterResult, result, usersState.filterCount, filterStatus);
}

function renderSorted() {
  const field = sortField.value;
  const direction = sortOrder.value === "asc" ? 1 : -1;
  const collator = new Intl.Collator("ru", { sensitivity: "base", numeric: true });
  const result = [...usersState.all].sort((a, b) => {
    const comparison = typeof a[field] === "number" ? a[field] - b[field] : collator.compare(a[field], b[field]);
    return direction * (comparison || a.id - b.id);
  });
  renderCards(sortResult, result, usersState.sortCount, sortStatus);
}

async function loadUsers() {
  try {
    const data = await getJson(`${usersApi}?limit=0&select=id,firstName,lastName,username,age,gender,image`);
    if (!Array.isArray(data.users)) throw new Error("Не удалось прочитать список пользователей.");
    usersState.all = data.users;
    renderFiltered();
    renderSorted();
  } catch (error) {
    filterStatus.textContent = `Не удалось загрузить пользователей. ${error.message}`;
    sortStatus.textContent = `Не удалось загрузить пользователей. ${error.message}`;
  }
}

idForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const id = Number(idInput.value);
  if (!Number.isSafeInteger(id) || id < 1) {
    idStatus.textContent = "Введите положительный целый ID.";
    idResult.replaceChildren();
    return;
  }
  idStatus.textContent = `GET ${usersApi}/${id} — загрузка…`;
  idResult.replaceChildren();
  try {
    const user = await getJson(`${usersApi}/${id}`);
    idResult.appendChild(userCard(user));
    idStatus.textContent = `GET ${usersApi}/${id} — пользователь найден. Нажмите на ник.`;
  } catch (error) {
    idStatus.textContent = error.message;
  }
});

searchInput.addEventListener("input", () => { usersState.filterCount = 24; renderFiltered(); });
genderInput.addEventListener("change", () => { usersState.filterCount = 24; renderFiltered(); });
document.getElementById("user-filter-reset").addEventListener("click", () => {
  searchInput.value = "";
  genderInput.value = "all";
  usersState.filterCount = 24;
  renderFiltered();
});
sortField.addEventListener("change", () => { usersState.sortCount = 24; renderSorted(); });
sortOrder.addEventListener("change", () => { usersState.sortCount = 24; renderSorted(); });

function addDetail(list, label, value) {
  if (value === undefined || value === null || value === "") return;
  const item = document.createElement("div");
  const term = document.createElement("dt");
  term.textContent = label;
  const description = document.createElement("dd");
  description.textContent = String(value);
  item.append(term, description);
  list.appendChild(item);
}

function renderUserDetails(user) {
  const heading = document.createElement("div");
  heading.className = "user-detail-heading";
  const image = document.createElement("img");
  image.src = user.image;
  image.alt = "";
  const titleBlock = document.createElement("div");
  const title = document.createElement("h2");
  title.id = "user-details-title";
  title.textContent = `${user.firstName} ${user.lastName}`;
  const nickname = document.createElement("p");
  nickname.textContent = `@${user.username} · ID ${user.id}`;
  titleBlock.append(title, nickname);
  heading.append(image, titleBlock);

  const list = document.createElement("dl");
  list.className = "user-detail-list";
  addDetail(list, "Возраст", user.age ? `${user.age} лет` : null);
  addDetail(list, "Пол", user.gender === "female" ? "Женщина" : user.gender === "male" ? "Мужчина" : user.gender);
  addDetail(list, "Дата рождения", user.birthDate);
  addDetail(list, "Email", user.email);
  addDetail(list, "Телефон", user.phone);
  addDetail(list, "Адрес", [user.address?.address, user.address?.city, user.address?.state, user.address?.country].filter(Boolean).join(", "));
  addDetail(list, "Университет", user.university);
  addDetail(list, "Компания", user.company?.name);
  addDetail(list, "Должность", user.company?.title);
  addDetail(list, "Отдел", user.company?.department);
  addDetail(list, "Рост", user.height ? `${user.height} см` : null);
  addDetail(list, "Цвет глаз", user.eyeColor);
  userDetails.replaceChildren(heading, list);
}

document.querySelectorAll("#user-id-result, #user-filter-result, #user-sort-result").forEach((container) => {
  container.addEventListener("click", async (event) => {
    const button = event.target.closest("[data-user-id]");
    if (!button) return;
    userDetails.textContent = "Загрузка подробностей…";
    userDialog.showModal();
    try {
      const user = await getJson(`${usersApi}/${button.dataset.userId}`);
      renderUserDetails(user);
    } catch (error) {
      userDetails.textContent = error.message;
    }
  });
});
document.getElementById("close-user-details").addEventListener("click", () => userDialog.close());
userDialog.addEventListener("click", (event) => { if (event.target === userDialog) userDialog.close(); });

loadUsers();
