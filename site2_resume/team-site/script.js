// Логика вкладок. Обычно этот файл менять не нужно —
// вся редактируемая информация находится в data.js

const tabsEl = document.getElementById("tabs");
const panelEl = document.getElementById("panel");

// Строим кнопки-вкладки на основе массива people из data.js
people.forEach((p, i) => {
  const btn = document.createElement("button");
  btn.className = "tab" + (i === 0 ? " active" : "");
  btn.innerHTML = `<span class="num">${i}</span>${p.name}`;
  btn.onclick = () => openPerson(i);
  tabsEl.appendChild(btn);
});

function openPerson(i) {
  const p = people[i];

  // подсветка активной вкладки
  document.querySelectorAll(".tab").forEach((btn, idx) => {
    btn.classList.toggle("active", idx === i);
  });

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
  `;
  panelEl.style.display = "block";
}
