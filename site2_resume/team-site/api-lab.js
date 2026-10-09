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
const editorDialog = document.getElementById("product-editor-dialog");
const detailsDialog = document.getElementById("product-details-dialog");
const closeDetailsButton = document.getElementById("close-product-details");
const reviewList = document.getElementById("product-review-list");

const demoReviews = [
  { name: "Данияр", rating: 5, text: "Понравилось качество. Всё соответствует описанию, покупкой доволен." },
  { name: "Алина", rating: 4, text: "Хороший товар за свою цену. Пользоваться удобно, впечатления приятные." },
  { name: "Руслан", rating: 5, text: "Выбрал по описанию и не пожалел. Отличный вариант, рекомендую." },
  { name: "Мария", rating: 4, text: "В целом всё понравилось. Выглядит аккуратно, ожидания оправдались." },
  { name: "Тимур", rating: 5, text: "Приятно удивлён. Хорошее сочетание цены и качества." },
  { name: "Алексей", rating: 4, text: "Удобная вещь, описание помогло с выбором. Поставлю четыре звезды." }
];

let products = [];
let nextKey = 1;
let editKey = null;
let busy = false;

async function sendRequest(method, path, body) {
  if (busy) return null;
  busy = true;
  saveButton.disabled = true;
  addButton.disabled = true;
  cancelButton.disabled = true;
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
    if (editorDialog.open) {
      formError.textContent = `Не удалось сохранить товар: ${error.message}`;
      formError.hidden = false;
    }
    return null;
  } finally {
    busy = false;
    saveButton.disabled = false;
    addButton.disabled = false;
    cancelButton.disabled = false;
  }
}

function releaseImage(product) {
  if (product?.blobUrl) URL.revokeObjectURL(product.blobUrl);
}

function syncModalScroll() {
  document.body.classList.toggle("product-modal-open", editorDialog.open || detailsDialog.open);
}

function openProductDetails(product) {
  const productIndex = Number(product.key) - 1;
  document.getElementById("product-details-title").textContent = product.title;
  document.getElementById("product-details-price").textContent = `$${product.price.toFixed(2)}`;
  document.getElementById("product-details-description").textContent = product.description || "Описание не указано.";
  const image = document.getElementById("product-details-image");
  image.src = product.thumbnail || getDefaultProductImage(productIndex);
  image.alt = `Изображение карточки: ${product.title}`;
  reviewList.replaceChildren();
  for (let index = 0; index < 3; index++) {
    const review = demoReviews[(productIndex + index) % demoReviews.length];
    const item = document.createElement("article");
    item.className = "product-review";
    const avatar = document.createElement("img");
    avatar.className = "review-avatar";
    avatar.src = getDefaultProductImage(productIndex + index + 1);
    avatar.alt = `Аватар Шрека — ${review.name}`;
    const content = document.createElement("div");
    const name = document.createElement("strong");
    name.textContent = review.name;
    const rating = document.createElement("span");
    rating.className = "review-rating";
    rating.textContent = "★".repeat(review.rating) + "☆".repeat(5 - review.rating);
    rating.setAttribute("aria-label", `Оценка: ${review.rating} из 5`);
    const text = document.createElement("p");
    text.textContent = review.text;
    content.append(name, rating, text);
    item.append(avatar, content);
    reviewList.appendChild(item);
  }
  detailsDialog.showModal();
  syncModalScroll();
}

function closeProductDetails() {
  detailsDialog.close();
  syncModalScroll();
}

function closeOnBackdrop(event, dialog, close) {
  if (event.target !== dialog) return;
  const bounds = dialog.getBoundingClientRect();
  if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) close();
}

function renderProducts() {
  list.replaceChildren();
  for (const product of products) {
    const item = document.createElement("article");
    item.className = "product-item";
    item.dataset.key = product.key;

    const preview = document.createElement("button");
    preview.type = "button";
    preview.className = "product-preview";
    preview.dataset.action = "details";
    preview.dataset.key = product.key;
    preview.setAttribute("aria-label", `Подробнее о товаре: ${product.title}`);
    preview.setAttribute("aria-haspopup", "dialog");

    const imageWrap = document.createElement("span");
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

    const info = document.createElement("span");
    info.className = "product-info";
    const name = document.createElement("strong");
    name.textContent = product.title;
    const price = document.createElement("span");
    price.className = "product-price";
    price.textContent = `$${product.price.toFixed(2)}`;
    const description = document.createElement("span");
    description.className = "product-description";
    description.textContent = product.description || "Описание не указано.";
    const hint = document.createElement("span");
    hint.className = "product-details-hint";
    hint.textContent = "Подробнее и отзывы ↗";
    info.append(name, price, description, hint);
    preview.append(imageWrap, info);

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
    item.append(preview, actions);
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
  editorDialog.showModal();
  syncModalScroll();
  titleInput.focus({ preventScroll: true });
}

function closeEditor() {
  if (busy) return;
  editorDialog.close();
  syncModalScroll();
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
closeDetailsButton.addEventListener("click", closeProductDetails);
editorDialog.addEventListener("click", (event) => closeOnBackdrop(event, editorDialog, closeEditor));
detailsDialog.addEventListener("click", (event) => closeOnBackdrop(event, detailsDialog, closeProductDetails));
editorDialog.addEventListener("cancel", (event) => {
  if (busy) event.preventDefault();
});
editorDialog.addEventListener("close", () => {
  form.reset();
  formError.hidden = true;
  editKey = null;
  syncModalScroll();
});
detailsDialog.addEventListener("close", syncModalScroll);
document.getElementById("product-details-image").addEventListener("error", (event) => {
  if (event.target.getAttribute("src") !== "product-placeholder.svg") event.target.src = "product-placeholder.svg";
});

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
  if (button.dataset.action === "details") {
    openProductDetails(product);
    return;
  }
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
