const apiBase = "https://dummyjson.com";
const list = document.getElementById("product-list");
const listMessage = document.getElementById("product-message");
const requestStatus = document.getElementById("request-status");
const responsePreview = document.getElementById("response-preview");
const form = document.getElementById("product-form");
const titleInput = document.getElementById("product-title");
const priceInput = document.getElementById("product-price");
const saveButton = document.getElementById("save-product");
const cancelButton = document.getElementById("cancel-edit");
const loadButton = document.getElementById("load-products");

let products = [];
let nextKey = 1;
let editKey = null;
let busy = false;

function showResponse(method, path, status, data) {
  requestStatus.textContent = `${method} ${path} → ${status}`;
  responsePreview.textContent = JSON.stringify(data, null, 2);
}

async function sendRequest(method, path, body) {
  if (busy) return null;
  busy = true;
  saveButton.disabled = true;
  loadButton.disabled = true;
  requestStatus.textContent = `${method} ${path} → отправка…`;
  try {
    const options = { method };
    if (body) {
      options.headers = { "Content-Type": "application/json" };
      options.body = JSON.stringify(body);
    }
    const response = await fetch(`${apiBase}${path}`, options);
    const data = await response.json();
    showResponse(method, path, `${response.status} ${response.statusText}`.trim(), data);
    if (!response.ok) throw new Error(data.message || `HTTP ${response.status}`);
    return data;
  } catch (error) {
    if (!requestStatus.textContent.includes("→ ") || requestStatus.textContent.endsWith("отправка…")) {
      showResponse(method, path, "ошибка сети", { error: error.message });
    }
    listMessage.textContent = `Не удалось выполнить запрос: ${error.message}`;
    return null;
  } finally {
    busy = false;
    saveButton.disabled = false;
    loadButton.disabled = false;
  }
}

function renderProducts() {
  list.replaceChildren();
  for (const product of products) {
    const item = document.createElement("article");
    item.className = "product-item";
    const imageWrap = document.createElement("div");
    imageWrap.className = "product-image-wrap";
    const image = document.createElement("img");
    image.className = "product-image";
    image.src = product.thumbnail || "product-placeholder.svg";
    image.alt = product.thumbnail ? `Изображение товара: ${product.title}` : "Изображение товара отсутствует";
    image.loading = "lazy";
    image.addEventListener("error", () => {
      image.onerror = null;
      image.src = "product-placeholder.svg";
      image.alt = "Изображение товара отсутствует";
    }, { once: true });
    imageWrap.appendChild(image);
    const info = document.createElement("div");
    info.className = "product-info";
    const name = document.createElement("strong");
    name.textContent = product.title;
    const price = document.createElement("span");
    price.className = "product-price";
    price.textContent = `$${product.price.toFixed(2)}`;
    info.append(name, price);
    if (product.local) {
      const note = document.createElement("small");
      note.textContent = "Только на этой странице";
      info.appendChild(note);
    }

    const actions = document.createElement("div");
    actions.className = "product-actions";
    const edit = document.createElement("button");
    edit.type = "button";
    edit.dataset.action = "edit";
    edit.dataset.key = product.key;
    edit.textContent = "Изменить";
    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "delete-button";
    remove.dataset.action = "delete";
    remove.dataset.key = product.key;
    remove.textContent = "Удалить";
    actions.append(edit, remove);
    item.append(imageWrap, info, actions);
    list.appendChild(item);
  }
  if (!products.length) listMessage.textContent = "Список пуст. Создайте товар или загрузите товары снова.";
}

function resetForm() {
  editKey = null;
  form.reset();
  document.getElementById("form-title").textContent = "Создать товар";
  saveButton.textContent = "Создать через POST";
  cancelButton.hidden = true;
}

async function loadProducts() {
  listMessage.textContent = "Загрузка товаров…";
  const data = await sendRequest("GET", "/products?limit=8&select=title,price,thumbnail");
  if (!data) return;
  products = data.products.map((product) => ({
    key: String(nextKey++), id: product.id, title: product.title,
    price: Number(product.price), thumbnail: product.thumbnail, local: false
  }));
  resetForm();
  listMessage.textContent = `Загружено ${products.length} товаров. Выберите действие или создайте новый.`;
  renderProducts();
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (busy) return;
  const title = titleInput.value.trim();
  const price = Number(priceInput.value);
  if (!title || !Number.isFinite(price) || price <= 0) {
    listMessage.textContent = "Укажите название и цену больше нуля.";
    return;
  }

  if (editKey === null) {
    const data = await sendRequest("POST", "/products/add", { title, price });
    if (!data) return;
    products.unshift({ key: String(nextKey++), id: data.id, title, price, thumbnail: null, local: true });
    listMessage.textContent = "Товар создан через POST. DummyJSON не хранит его на сервере.";
  } else {
    const product = products.find((item) => item.key === editKey);
    if (!product) return;
    if (product.local) {
      product.title = title;
      product.price = price;
      showResponse("PATCH", "локальный товар", "без сетевого запроса", { title, price, note: "DummyJSON не сохраняет созданные товары" });
      listMessage.textContent = "Созданный товар изменён на этой странице.";
    } else {
      const data = await sendRequest("PATCH", `/products/${product.id}`, { title, price });
      if (!data) return;
      product.title = title;
      product.price = price;
      listMessage.textContent = "Товар изменён через PATCH. DummyJSON не хранит это изменение на сервере.";
    }
  }
  resetForm();
  renderProducts();
});

list.addEventListener("click", async (event) => {
  const button = event.target.closest("button[data-action]");
  if (!button || busy) return;
  const product = products.find((item) => item.key === button.dataset.key);
  if (!product) return;
  if (button.dataset.action === "edit") {
    editKey = product.key;
    titleInput.value = product.title;
    priceInput.value = product.price;
    document.getElementById("form-title").textContent = "Изменить товар";
    saveButton.textContent = product.local ? "Изменить на странице" : "Сохранить через PATCH";
    cancelButton.hidden = false;
    titleInput.focus();
    return;
  }

  if (product.local) {
    showResponse("DELETE", "локальный товар", "без сетевого запроса", { id: product.id, isDeleted: true, note: "DummyJSON не сохраняет созданные товары" });
  } else {
    const data = await sendRequest("DELETE", `/products/${product.id}`);
    if (!data) return;
  }
  products = products.filter((item) => item.key !== product.key);
  if (editKey === product.key) resetForm();
  listMessage.textContent = "Товар удалён из списка на этой странице.";
  renderProducts();
});

cancelButton.addEventListener("click", resetForm);
loadButton.addEventListener("click", loadProducts);

document.getElementById("http-quiz").addEventListener("submit", (event) => {
  event.preventDefault();
  const answers = { q1: "GET", q2: "PATCH", q3: "4xx", q4: "server" };
  const chosen = new FormData(event.currentTarget);
  const score = Object.entries(answers).filter(([name, answer]) => chosen.get(name) === answer).length;
  document.getElementById("quiz-result").textContent = `Правильных ответов: ${score} из 4.${score < 4 ? " Проверьте методы и категории выше." : " Отлично!"}`;
});

loadProducts();
