// Список участников и отдельные страницы резюме.
// Информация о людях находится в data.js.

const tabsEl = document.getElementById("tabs");
const panelEl = document.getElementById("panel");

if (tabsEl) {
  document.getElementById("people-count").textContent = `${people.length} участника`;
  people.forEach((p, i) => {
    const link = document.createElement("a");
    link.className = "tab";
    link.href = `profile.html?person=${i}`;
    link.target = "_blank";
    link.rel = "noopener";
    link.innerHTML = `<div class="card-photo-wrap"><img class="tab-photo" src="${p.photo}" alt="" loading="lazy"></div><div class="tab-info"><span class="tab-role">${p.role}</span><span class="tab-name">${p.name}</span><span class="tab-action">Посмотреть резюме <span aria-hidden="true">↗</span></span></div>`;
    tabsEl.appendChild(link);
  });
}

if (panelEl) {
  const personParam = new URLSearchParams(location.search).get("person");
  const personIndex = personParam === null ? -1 : Number(personParam);
  const p = Number.isInteger(personIndex) ? people[personIndex] : undefined;

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
}

const revealItems = document.querySelectorAll(".reveal");
if ("IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -24px 0px" });
  revealItems.forEach(item => observer.observe(item));
} else {
  revealItems.forEach(item => item.classList.add("is-visible"));
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
