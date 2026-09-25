// Все профили и оба задания переключаются внутри index.html.
// Информация об участниках находится в data.js.

const tabsEl = document.getElementById("tabs");
const panelEl = document.getElementById("panel");
const task1El = document.getElementById("task-1");
const task2El = document.getElementById("task-2");
const tabDefinitions = [
  ...people.map((person, index) => ({ key: `person-${index}`, label: person.name, panel: "panel" })),
  { key: "task1", label: "Задание 1", panel: "task-1" },
  { key: "task2", label: "Задание 2", panel: "task-2" }
];

document.getElementById("people-count").textContent = `${people.length} участника`;

function renderProfile(personIndex) {
  const p = people[personIndex];

  if (!p) {
    panelEl.innerHTML = '<div class="not-found page-enter"><h1>Резюме не найдено</h1><p>Вернитесь к списку участников и выберите профиль.</p><a class="back-link" href="index.html">← Все участники</a></div>';
  } else {
    document.title = `${p.name} — резюме`;

    const isAmankos = p.name.includes("Аманқос") || p.name.includes("Аманкос");
    panelEl.innerHTML = `
      <section class="profile-hero page-enter">
        <div class="profile-photo-wrap"><img class="avatar" src="${p.photo}" alt="Фото: ${p.name}"></div>
        <div class="profile-intro">
          <span class="eyebrow">РЕЗЮМЕ УЧАСТНИКА</span>
          <h1>${p.name}</h1>
          <p class="profile-role">${p.role}</p>
          <a class="contact-button" href="mailto:${p.email}">Написать письмо <span aria-hidden="true">↗</span></a>
        </div>
      </section>
      <div class="profile-content">
        <section class="profile-section reveal"><span class="section-number">01</span><div><h2>Опыт работы</h2><p>${p.experience}</p></div></section>
        <section class="profile-section reveal"><span class="section-number">02</span><div><h2>Образование</h2><p>${p.education}</p></div></section>
        <section class="profile-section reveal"><span class="section-number">03</span><div><h2>Навыки</h2><div class="skills">${p.skills.map(s => `<span>${s}</span>`).join("")}</div></div></section>
        <section class="profile-section reveal"><span class="section-number">04</span><div><h2>Контакты</h2><div class="contact-list"><a href="mailto:${p.email}">${p.email}</a><a href="tel:${p.phone.replace(/[^+\d]/g, "")}">${p.phone}</a></div></div></section>
      </div>
      ${isAmankos ? '<div class="special-action reveal"><button class="yuhu-btn" onclick="yuhuBoom()">🎉 Юху</button></div>' : ''}
    `;
  }
  panelEl.querySelectorAll(".reveal").forEach((item) => item.classList.add("is-visible"));
}

tabDefinitions.forEach((definition, index) => {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "tab";
  button.id = `tab-${definition.key}`;
  button.dataset.key = definition.key;
  button.setAttribute("role", "tab");
  button.setAttribute("aria-controls", definition.panel);
  button.setAttribute("aria-selected", "false");
  button.tabIndex = -1;
  button.innerHTML = `<span class="tab-number">${String(index + 1).padStart(2, "0")}</span><span>${definition.label}</span>`;
  tabsEl.appendChild(button);
});

function keyFromUrl() {
  const params = new URLSearchParams(location.search);
  const person = params.get("person");
  if (person !== null && /^\d+$/.test(person) && people[Number(person)]) {
    return `person-${Number(person)}`;
  }
  if (params.get("view") === "task2") return "task2";
  if (params.get("view") === "task1" || params.get("view") === "tasks") return "task1";
  return tabDefinitions[0].key;
}

function selectTab(key, updateUrl = false) {
  const selected = tabDefinitions.find((definition) => definition.key === key) || tabDefinitions[0];
  const isProfile = selected.key.startsWith("person-");

  panelEl.hidden = !isProfile;
  task1El.hidden = selected.key !== "task1";
  task2El.hidden = selected.key !== "task2";

  if (isProfile) {
    const personIndex = Number(selected.key.slice("person-".length));
    panelEl.setAttribute("aria-labelledby", `tab-${selected.key}`);
    renderProfile(personIndex);
  } else {
    document.title = `${selected.label} — Наша команда`;
  }

  tabsEl.querySelectorAll('[role="tab"]').forEach((button) => {
    const active = button.dataset.key === selected.key;
    button.setAttribute("aria-selected", String(active));
    button.tabIndex = active ? 0 : -1;
  });

  const newDiv = document.querySelector(".new-div");
  if (newDiv) newDiv.hidden = selected.key !== "task1";

  if (updateUrl) {
    const url = new URL("index.html", location.href);
    if (isProfile) url.searchParams.set("person", selected.key.slice("person-".length));
    else url.searchParams.set("view", selected.key);
    history.pushState(null, "", url);
  }
}

tabsEl.addEventListener("click", (event) => {
  const button = event.target.closest('[role="tab"]');
  if (button) selectTab(button.dataset.key, true);
});

tabsEl.addEventListener("keydown", (event) => {
  const buttons = [...tabsEl.querySelectorAll('[role="tab"]')];
  const currentIndex = buttons.indexOf(document.activeElement);
  if (currentIndex < 0) return;

  let nextIndex;
  if (event.key === "ArrowRight") nextIndex = (currentIndex + 1) % buttons.length;
  else if (event.key === "ArrowLeft") nextIndex = (currentIndex - 1 + buttons.length) % buttons.length;
  else if (event.key === "Home") nextIndex = 0;
  else if (event.key === "End") nextIndex = buttons.length - 1;
  else return;

  event.preventDefault();
  buttons[nextIndex].focus();
  selectTab(buttons[nextIndex].dataset.key, true);
});

window.addEventListener("popstate", () => selectTab(keyFromUrl()));
selectTab(keyFromUrl());

// ==========================================
// 🤡 СЕКРЕТНАЯ КНОПКА АМАНКОСА 🤡
// ==========================================
function yuhuBoom() {
  // Звук взрыва
  const boom = new Audio("data:audio/wav;base64,UklGRl9vT19teleQBAABAAEARKwAAIhYAQACABAAZGF0YQ==");
  // Используем Web Audio API для генерации звука взрыва
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    // Белый шум = взрыв
    const duration = 1.5;
    const sampleRate = ctx.sampleRate;
    const buffer = ctx.createBuffer(1, sampleRate * duration, sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      // Затухающий шум
      const t = i / sampleRate;
      data[i] = (Math.random() * 2 - 1) * Math.exp(-t * 4) * 1.5;
    }
    // Низкий бас
    for (let i = 0; i < data.length; i++) {
      const t = i / sampleRate;
      data[i] += Math.sin(t * 80 * Math.PI * 2) * Math.exp(-t * 3) * 0.8;
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    source.start();
  } catch(e) {}

  // Создаём оверлей
  const overlay = document.createElement("div");
  overlay.className = "boom-overlay";
  overlay.innerHTML = `
    <div class="boom-flash"></div>
    <div class="boom-text">АМАНКОС УНДЫС ГУС</div>
    <div class="boom-clowns" id="boomClowns"></div>
  `;
  document.body.appendChild(overlay);

  // Спавним клоунов 🤡
  const clownsEl = document.getElementById("boomClowns");
  const emojis = ["🤡", "🤡", "💥", "🤡", "🔥", "🤡", "💀", "🤡", "🎪", "🤡"];
  let clownCount = 0;
  const clownInterval = setInterval(() => {
    for (let j = 0; j < 5; j++) {
      const clown = document.createElement("div");
      clown.className = "boom-clown";
      clown.textContent = emojis[Math.floor(Math.random() * emojis.length)];
      clown.style.left = Math.random() * 100 + "vw";
      clown.style.top = Math.random() * 100 + "vh";
      clown.style.fontSize = (30 + Math.random() * 60) + "px";
      clown.style.animationDuration = (0.5 + Math.random() * 1.5) + "s";
      clown.style.animationDelay = Math.random() * 0.3 + "s";
      clownsEl.appendChild(clown);
    }
    clownCount++;
    if (clownCount > 15) clearInterval(clownInterval);
  }, 200);

  // Тряска экрана
  document.body.classList.add("shake");
  setTimeout(() => document.body.classList.remove("shake"), 1000);

  // Убрать через 4 секунды
  setTimeout(() => {
    overlay.classList.add("boom-fade");
    setTimeout(() => overlay.remove(), 1000);
  }, 4000);
}
