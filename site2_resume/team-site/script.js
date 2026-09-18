// Логика вкладок. Обычно этот файл менять не нужно —
// вся редактируемая информация находится в data.js

const tabsEl = document.getElementById("tabs");
const panelEl = document.getElementById("panel");

// Строим кнопки-вкладки на основе массива people из data.js
people.forEach((p, i) => {
  const btn = document.createElement("button");
  btn.className = "tab" + (i === 0 ? " active" : "");
  btn.innerHTML = `<img class="tab-photo" src="${p.photo}" alt="${p.name}"><span class="tab-info"><span class="tab-name">${p.name}</span><span class="tab-role">${p.role}</span></span>`;
  btn.onclick = () => openPerson(i);
  tabsEl.appendChild(btn);
});

function openPerson(i) {
  const p = people[i];

  // подсветка активной вкладки
  document.querySelectorAll(".tab").forEach((btn, idx) => {
    btn.classList.toggle("active", idx === i);
  });

  // Проверяем, это ли Аманкос
  const isAmankos = p.name.includes("Аманқос") || p.name.includes("Аманкос");

  // заполняем и показываем панель с резюме
  panelEl.innerHTML = `
    <div class="head">
      <img class="avatar" src="${p.photo}" alt="Фото: ${p.name}">
      <div>
        <h2>${p.name}</h2>
        <p>${p.role}</p>
      </div>
    </div>
    <div class="section">
      <h3>Образование</h3>
      <p>${p.education}</p>
    </div>
    <div class="section">
      <h3>Опыт работы</h3>
      <p>${p.experience}</p>
    </div>
    <div class="section">
      <h3>Навыки</h3>
      <div class="skills">${p.skills.map(s => `<span>${s}</span>`).join("")}</div>
    </div>
    <div class="section">
      <h3>Контакты</h3>
      <p>Email: ${p.email}</p>
      <p>Телефон: ${p.phone}</p>
    </div>
    ${isAmankos ? '<button class="yuhu-btn" onclick="yuhuBoom()">🎉 Юху</button>' : ''}
  `;
  panelEl.style.display = "block";
}

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
