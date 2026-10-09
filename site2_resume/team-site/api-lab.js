const apiBase = "https://dummyjson.com";
const defaultProductImages = [
  "product-photo.jpg",
  ...Array.from({ length: 11 }, (_, index) => `photos/shrek/shrek-${String(index + 2).padStart(2, "0")}.jpg`)
];

function getDefaultProductImage(index) {
  return defaultProductImages[index % defaultProductImages.length];
}
const list = document.getElementById("product-list");
const listMessage = document.getElementById("product-message");
const form = document.getElementById("product-form");
const addButton = document.getElementById("open-product-form");
const titleInput = document.getElementById("product-title");
const priceInput = document.getElementById("product-price");
const descriptionInput = document.getElementById("product-description");
const imageUrlInput = document.getElementById("product-image-url");
const imageFileInput = document.getElementById("product-image-file");
const saveButton = document.getElementById("save-product");
const cancelButton = document.getElementById("cancel-edit");
const formError = document.getElementById("product-form-error");

let products = [];
let nextKey = 1;
let editKey = null;
let busy = false;

async function sendRequest(method, path, body) {
  if (busy) return null;
  busy = true;
  saveButton.disabled = true;
  addButton.disabled = true;
  try {
    const options = { method };
    if (body) {
      options.headers = { "Content-Type": "application/json" };
      options.body = JSON.stringify(body);
    }
    const response = await fetch(`${apiBase}${path}`, options);
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || `HTTP ${response.status}`);
    return data;
  } catch (error) {
    listMessage.textContent = `Не удалось выполнить действие: ${error.message}`;
    return null;
  } finally {
    busy = false;
    saveButton.disabled = false;
    addButton.disabled = false;
  }
}

function releaseImage(product) {
  if (product?.blobUrl) URL.revokeObjectURL(product.blobUrl);
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
    image.src = product.thumbnail || getDefaultProductImage(Number(product.key) - 1);
    image.alt = `Изображение карточки: ${product.title}`;
    image.loading = "lazy";
    image.addEventListener("error", () => {
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
    const description = document.createElement("p");
    description.className = "product-description";
    description.textContent = product.description || "Описание не указано.";
    info.append(name, price, description);

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
  if (!products.length) listMessage.textContent = "Пока нет товаров. Добавьте первый товар.";
}

function openEditor(product = null) {
  if (busy) return;
  form.reset();
  formError.hidden = true;
  editKey = product?.key || null;
  document.getElementById("form-title").textContent = product ? "Изменить товар" : "Добавить товар";
  saveButton.textContent = product ? "Сохранить изменения" : "Добавить товар";
  if (product) {
    titleInput.value = product.title;
    priceInput.value = product.price;
    descriptionInput.value = product.description;
    if (product.thumbnail && !defaultProductImages.includes(product.thumbnail) && !product.blobUrl) imageUrlInput.value = product.thumbnail;
  }
  form.hidden = false;
  form.scrollIntoView({ behavior: "smooth", block: "start" });
  titleInput.focus({ preventScroll: true });
}

function closeEditor() {
  form.hidden = true;
  form.reset();
  formError.hidden = true;
  editKey = null;
}

async function loadProducts() {
  listMessage.textContent = "Загрузка товаров…";
  const data = await sendRequest("GET", "/products?limit=12&select=title,price,thumbnail,description");
  if (!data) return;
  products.forEach(releaseImage);
  products = data.products.map((product, index) => ({
    key: String(nextKey++), id: product.id, title: product.title,
    price: Number(product.price), description: product.description,
    thumbnail: getDefaultProductImage(index), blobUrl: null, local: false
  }));
  listMessage.textContent = `Показано ${products.length} товаров.`;
  renderProducts();
}

addButton.addEventListener("click", () => openEditor());
cancelButton.addEventListener("click", closeEditor);

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (busy) return;
  const title = titleInput.value.trim();
  const price = Number(priceInput.value);
  const description = descriptionInput.value.trim();
  const imageUrl = imageUrlInput.value.trim();
  const imageFile = imageFileInput.files[0];
  const product = products.find((item) => item.key === editKey);

  if (!title || !description || !Number.isFinite(price) || price <= 0) {
    formError.textContent = "Заполните название, описание и цену больше нуля.";
    formError.hidden = false;
    return;
  }
  if (imageFile && (!imageFile.type.startsWith("image/") || imageFile.size > 10 * 1024 * 1024)) {
    formError.textContent = "Выберите картинку размером до 10 МБ.";
    formError.hidden = false;
    return;
  }
  formError.hidden = true;

  const body = { title, price, description };
  if (imageUrl && !imageFile) body.thumbnail = imageUrl;
  if (product && !product.local) {
    const data = await sendRequest("PATCH", `/products/${product.id}`, body);
    if (!data) return;
  } else if (!product) {
    const data = await sendRequest("POST", "/products/add", body);
    if (!data) return;
    const key = String(nextKey++);
    products.unshift({ key, id: data.id, title, price, description, thumbnail: getDefaultProductImage(Number(key) - 1), blobUrl: null, local: true });
  }

  const target = product || products[0];
  target.title = title;
  target.price = price;
  target.description = description;
  if (imageFile || imageUrl) {
    releaseImage(target);
    target.blobUrl = imageFile ? URL.createObjectURL(imageFile) : null;
    target.thumbnail = target.blobUrl || imageUrl;
  }
  closeEditor();
  listMessage.textContent = product ? "Товар изменён." : "Товар добавлен.";
  renderProducts();
});

list.addEventListener("click", async (event) => {
  const button = event.target.closest("button[data-action]");
  if (!button || busy) return;
  const product = products.find((item) => item.key === button.dataset.key);
  if (!product) return;
  if (button.dataset.action === "edit") {
    openEditor(product);
    return;
  }
  if (!product.local) {
    const data = await sendRequest("DELETE", `/products/${product.id}`);
    if (!data) return;
  }
  releaseImage(product);
  products = products.filter((item) => item.key !== product.key);
  if (editKey === product.key) closeEditor();
  listMessage.textContent = "Товар удалён.";
  renderProducts();
});

loadProducts();
